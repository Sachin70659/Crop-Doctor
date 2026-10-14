
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import { InferenceClient } from "@huggingface/inference";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:")
    ) {
      return callback(null, true);
    }
    const allowed = [process.env.CLIENT_URL].filter(Boolean);
    if (allowed.includes(origin)) return callback(null, true);
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: "2mb" }));

// =========================================================
// LLM PROVIDER DETECTION
// =========================================================

function isValidKey(val, placeholder) {
  return Boolean(
    val &&
    val.trim() &&
    val !== placeholder &&
    !val.includes("your_") &&
    val.length > 10
  );
}

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const LLM_MODEL = process.env.LLM_MODEL || "gemini-1.5-flash";

const isGeminiConfigured = isValidKey(GEMINI_KEY, "your_gemini_api_key_here");
const isOpenAIConfigured = isValidKey(OPENAI_KEY, "your_openai_api_key_here");

const geminiClient = isGeminiConfigured ? new GoogleGenerativeAI(GEMINI_KEY) : null;
const openaiClient = isOpenAIConfigured ? new OpenAI({ apiKey: OPENAI_KEY }) : null;

// HuggingFace fallback classifier
const isHfConfigured = isValidKey(process.env.HF_TOKEN, "hf_your_private_token_here");
const hf = isHfConfigured ? new InferenceClient(process.env.HF_TOKEN) : null;

const activeLLMProvider = isGeminiConfigured
  ? "gemini"
  : isOpenAIConfigured
    ? "openai"
    : isHfConfigured
      ? "huggingface"
      : "demo";

console.log(`[AI] Active provider: ${activeLLMProvider.toUpperCase()}`);

// =========================================================
// DATABASE MODELS
// =========================================================

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { type: String, required: true }
}, { timestamps: true });

const cropSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  season: String,
  icon: String,
  description: String,
  soil: String,
  duration: String
}, { timestamps: true });

const scanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  crop: { type: String, default: "Unknown" },
  disease: { type: String, default: "Needs review" },
  confidence: { type: Number, default: 0 },
  severity: { type: String, default: "Moderate" },
  status: {
    type: String,
    enum: ["completed", "needs_review"],
    default: "needs_review"
  },
  symptoms: [String],
  precautions: [String],
  treatment: [String],
  prevention: [String],
  note: String,
  aiProvider: { type: String, default: "demo" },
  originalFilename: String
}, { timestamps: true });

const expertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  name: { type: String, required: true },
  crop: { type: String, required: true },
  problem: { type: String, required: true },
  status: { type: String, default: "pending" }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Crop = mongoose.model("Crop", cropSchema);
const Scan = mongoose.model("Scan", scanSchema);
const ExpertRequest = mongoose.model("ExpertRequest", expertSchema);

// =========================================================
// STARTER CROP DATA
// =========================================================

const starterCrops = [
  { name: "Wheat",   season: "Rabi",     icon: "🌾", description: "A major cereal crop grown in the cool season.",          soil: "Well-drained loamy soil",         duration: "110–140 days" },
  { name: "Rice",    season: "Kharif",   icon: "🌾", description: "A cereal crop requiring suitable water management.",      soil: "Suitable loamy or clayey soil",   duration: "105–150 days" },
  { name: "Tomato",  season: "Multiple", icon: "🍅", description: "A vegetable crop grown in suitable local seasons.",       soil: "Well-drained loamy soil",         duration: "70–90 days after transplanting" },
  { name: "Potato",  season: "Rabi",     icon: "🥔", description: "A tuber crop commonly grown in cool conditions.",        soil: "Loose, well-drained soil",        duration: "90–120 days" },
  { name: "Maize",   season: "Kharif",   icon: "🌽", description: "A cereal crop used for food, fodder and industry.",      soil: "Well-drained fertile soil",       duration: "85–110 days" },
  { name: "Mustard", season: "Rabi",     icon: "🌼", description: "An important oilseed crop grown in the cool season.",   soil: "Well-drained loamy soil",         duration: "105–130 days" }
];

async function seedCrops() {
  for (const crop of starterCrops) {
    await Crop.updateOne({ name: crop.name }, { $set: crop }, { upsert: true });
  }
}

// =========================================================
// AUTH UTILITIES
// =========================================================

function createToken(user) {
  return jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) return res.status(401).json({ error: "Please log in to continue." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("_id name email");
    if (!user) return res.status(401).json({ error: "Account not found." });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Your login has expired. Please log in again." });
  }
}

// =========================================================
// LLM VISION ANALYSIS  ← Core of this feature
// =========================================================

/**
 * The structured JSON schema we ask the LLM to return.
 * All fields are described inline so the model returns exactly
 * what the frontend needs — no extra parsing.
 */
const VISION_SYSTEM_PROMPT = `You are an expert plant pathologist and agricultural scientist with 30+ years of field experience.

When given an image of a plant / leaf / crop, you MUST:
1. Carefully examine all visual symptoms — leaf colour, spots, lesions, wilting, texture, edge patterns, overall plant condition.
2. Identify the most likely plant species / crop type.
3. Identify any visible disease, pest infestation, nutrient deficiency, or confirm if the plant looks healthy.
4. Provide a severity rating: "Healthy", "Mild", "Moderate", "Severe", or "Critical".
5. Estimate your confidence level as an integer 0–100.

IMPORTANT — Return ONLY valid JSON, no markdown fences, no extra text. Use this exact schema:

{
  "crop": "Common name of the crop (e.g. Tomato, Wheat, Rice, Unknown Plant)",
  "disease": "Name of the identified disease or issue (e.g. Early Blight, Powdery Mildew, Nitrogen Deficiency, or 'Healthy' if no disease)",
  "severity": "Healthy | Mild | Moderate | Severe | Critical",
  "confidence": <integer 0-100>,
  "is_plant": <true or false — false if the image is clearly not a plant>,
  "observed_symptoms": [
    "Precise symptom 1 visible in this specific image",
    "Precise symptom 2 visible in this specific image",
    "Precise symptom 3 (add as many as relevant)"
  ],
  "immediate_precautions": [
    "Most urgent action to take right now to stop spread",
    "Second urgent action",
    "Third urgent action"
  ],
  "treatment": [
    "Specific chemical or organic treatment step 1 with dosage/method",
    "Treatment step 2",
    "Treatment step 3"
  ],
  "long_term_prevention": [
    "Cultural or agronomic prevention practice 1",
    "Prevention practice 2",
    "Prevention practice 3"
  ],
  "expert_note": "One sentence summary: what is wrong and the single most important thing the farmer should do."
}`;

/**
 * Analyse an image buffer with Google Gemini Vision.
 */
async function analyseWithGemini(imageBuffer, mimeType) {
  const modelName = LLM_MODEL.startsWith("gemini") ? LLM_MODEL : "gemini-1.5-flash";
  const model = geminiClient.getGenerativeModel({ model: modelName });

  const imageData = {
    inlineData: {
      data: imageBuffer.toString("base64"),
      mimeType
    }
  };

  const result = await model.generateContent([VISION_SYSTEM_PROMPT, imageData]);
  const text = result.response.text().trim();
  return JSON.parse(text);
}

/**
 * Analyse an image buffer with OpenAI GPT-4 Vision.
 */
async function analyseWithOpenAI(imageBuffer, mimeType) {
  const modelName = LLM_MODEL.startsWith("gpt") ? LLM_MODEL : "gpt-4o-mini";
  const base64 = imageBuffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const response = await openaiClient.chat.completions.create({
    model: modelName,
    messages: [
      { role: "system", content: VISION_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: "Analyse this plant image and return the JSON response as instructed." },
          { type: "image_url", image_url: { url: dataUrl, detail: "high" } }
        ]
      }
    ],
    max_tokens: 1024,
    temperature: 0.2
  });

  const text = (response.choices[0]?.message?.content || "").trim();
  // Strip any accidental markdown fences
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned);
}

/**
 * Convert a HuggingFace label string into structured advice.
 * Used as a fallback when no LLM key is configured.
 */
function readableLabel(label) {
  return String(label || "")
    .replace(/___/g, " - ")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePrediction(label) {
  const raw = String(label || "");
  const parts = raw.split("___");
  const crop = parts.length > 1 ? parts[0] : "Unknown";
  const disease = parts.length > 1 ? parts.slice(1).join(" ") : raw;
  return { crop: readableLabel(crop), disease: readableLabel(disease) };
}

function adviceFor(label) {
  const v = String(label || "").toLowerCase();

  if (v.includes("healthy")) {
    return {
      severity: "Healthy",
      symptoms: ["Plant leaf appears healthy with no visible necrotic lesions or abnormal discoloration."],
      precautions: ["Keep monitoring regularly — early detection is the best protection.", "Avoid wetting the leaf canopy during evening irrigation."],
      treatment: ["No treatment required at this time.", "Maintain balanced N-P-K fertilization schedule."],
      prevention: ["Practice routine field scouting (at least twice a week).", "Maintain good plant spacing for air circulation.", "Use clean, disinfected tools."]
    };
  }
  if (v.includes("early_blight") || v.includes("early blight")) {
    return {
      severity: "Moderate",
      symptoms: ["Dark brown concentric ring ('target board') spots on older lower leaves.", "Yellow halo forming around the lesions.", "Premature defoliation of infected leaves."],
      precautions: ["Remove and bag infected lower leaves immediately — do NOT compost them.", "Avoid working in the field when leaves are wet to prevent spore spread.", "Disinfect pruning tools with 70% alcohol between plants."],
      treatment: ["Spray Mancozeb 75 WP @ 2 g/L or Chlorothalonil 75 WP @ 2 g/L at 7-day intervals.", "Copper-based fungicide (Copper Oxychloride 50 WP @ 3 g/L) is an effective organic option.", "Apply during early morning; avoid spraying in the heat of the day."],
      prevention: ["Switch to drip irrigation — never use overhead sprinklers.", "Practice 2–3 year crop rotation avoiding solanaceous family crops.", "Mulch the base of plants to prevent soil spore splash onto foliage."]
    };
  }
  if (v.includes("late_blight") || v.includes("late blight")) {
    return {
      severity: "Critical",
      symptoms: ["Irregular pale green to dark brown water-soaked blotches spreading rapidly.", "White cottony fungal growth on leaf undersides in humid conditions.", "Infected tubers show reddish-brown internal rot."],
      precautions: ["Immediately rogue and destroy all visibly infected plants — do NOT compost.", "Warn neighbouring farmers as spores spread airborne up to 10 km.", "Stop overhead irrigation completely."],
      treatment: ["Apply Metalaxyl + Mancozeb (Ridomil Gold) @ 2 g/L as a curative spray.", "Cymoxanil + Mancozeb (Curzate M8) @ 2.5 g/L for active lesion spread.", "Repeat every 5–7 days during wet weather."],
      prevention: ["Use only certified disease-free seed tubers; avoid saving seed from infected crops.", "Plant resistant varieties (e.g., Kufri Jyoti, Kufri Bahar for potato).", "Ensure excellent field drainage; avoid planting in low-lying waterlogged areas."]
    };
  }
  if (v.includes("blast") || v.includes("leaf_blast")) {
    return {
      severity: "Severe",
      symptoms: ["Spindle-shaped lesions with grayish-white centres and dark reddish-brown borders.", "Lesions coalesce under high humidity causing entire leaf to burn.", "Neck blast causes panicle to bend or snap."],
      precautions: ["Do NOT drain paddy fields completely during a blast outbreak.", "Avoid applying heavy nitrogen fertilizer during disease onset.", "Quarantine infected sections of the field."],
      treatment: ["Tricyclazole 75 WP @ 0.6 g/L applied at first lesion appearance.", "Isoprothiolane 40 EC @ 1.5 mL/L as an alternative systemic option.", "Repeat spray after 10 days if symptoms persist."],
      prevention: ["Treat seeds with Carbendazim 50 WP @ 2 g/kg before nursery sowing.", "Use blast-resistant certified varieties recommended for your region.", "Split nitrogen into 3 doses — avoid single heavy applications."]
    };
  }
  if (v.includes("mildew") || v.includes("powdery")) {
    return {
      severity: "Moderate",
      symptoms: ["White to grayish powdery fungal colonies on upper leaf surfaces and stems.", "Infected leaves curl upward, turn yellow and dry prematurely.", "Severe attack causes stunted plant growth and yield loss."],
      precautions: ["Increase plant spacing immediately to improve air flow.", "Avoid wetting leaves — switch to drip or furrow irrigation.", "Remove heavily infected leaves and burn away from the field."],
      treatment: ["Wettable Sulfur 80 WP @ 3 g/L sprayed in early morning when temperature is below 30°C.", "Propiconazole 25 EC @ 1 mL/L as a systemic fungicide for severe cases.", "Neem oil @ 5 mL/L is an effective organic alternative."],
      prevention: ["Do not plant in shaded or poorly ventilated areas.", "Avoid late evening irrigation that keeps foliage wet overnight.", "Practice crop rotation and remove plant debris after harvest."]
    };
  }
  if (v.includes("rust")) {
    return {
      severity: "Moderate",
      symptoms: ["Small reddish-brown to orange powdery pustules on both leaf surfaces.", "Premature yellowing (chlorosis) and leaf drop in heavy infections.", "Pustules release rusty spore powder when rubbed."],
      precautions: ["Avoid entering infected plots unnecessarily — clothing can carry spores.", "Apply fungicide at the earliest sign — do not wait for widespread spread.", "Harvest early if near-mature and disease is spreading rapidly."],
      treatment: ["Tebuconazole 25.9 EC @ 1 mL/L provides excellent systemic rust control.", "Propiconazole 25 EC @ 1 mL/L as an alternative.", "Mancozeb 75 WP @ 2 g/L for protective coverage."],
      prevention: ["Plant certified rust-tolerant / resistant varieties.", "Sow at the right time — avoiding warm humid periods reduces rust risk.", "Monitor crop from tillering stage and apply protective spray if rust is forecast."]
    };
  }

  // Generic fallback
  return {
    severity: "Moderate",
    symptoms: ["Unusual leaf discoloration, spots, or tissue damage observed.", "Symptoms require physical field verification for accurate diagnosis."],
    precautions: ["Isolate affected plants from healthy ones immediately.", "Avoid touching healthy plants after handling diseased material.", "Document visible symptoms with photos for expert consultation."],
    treatment: ["Consult a local agricultural extension officer for a confirmed diagnosis.", "Avoid blanket pesticide application without confirmed identification.", "If fungal disease is suspected, apply a broad-spectrum protectant fungicide such as Mancozeb 75 WP @ 2 g/L as a temporary measure."],
    prevention: ["Maintain field hygiene — remove dead plant material regularly.", "Use drip irrigation to reduce foliar moisture.", "Practice crop rotation every 2–3 seasons."]
  };
}

// =========================================================
// ROUTES
// =========================================================

app.get("/", (req, res) => {
  res.json({ message: "Crop Doctor backend is running." });
});

app.get("/api/health", (req, res) => {
  res.json({
    server: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    ai: activeLLMProvider,
    models: {
      llm: isGeminiConfigured
        ? `Gemini (${LLM_MODEL})`
        : isOpenAIConfigured
          ? `OpenAI (${LLM_MODEL})`
          : isHfConfigured
            ? `HuggingFace (${process.env.HF_MODEL})`
            : "Demo mode — no API key configured"
    }
  });
});

// ---------- AUTH ----------

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (
      typeof name !== "string" || !name.trim() ||
      typeof email !== "string" ||
      typeof password !== "string" || password.length < 8
    ) {
      return res.status(400).json({ error: "Enter your name, email and a password of at least 8 characters." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(409).json({ error: "This email is already registered." });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(password, 12)
    });

    res.status(201).json({
      message: "Account created successfully.",
      token: createToken(user),
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: "This email is already registered." });
    console.error("Register error:", error.message);
    res.status(500).json({ error: "Could not create your account." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Incorrect email or password." });
    }

    res.json({
      message: "Login successful.",
      token: createToken(user),
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ error: "Could not log in." });
  }
});

app.get("/api/auth/me", auth, (req, res) => {
  res.json({ user: req.user });
});

// ---------- CROPS ----------

app.get("/api/crops", async (req, res) => {
  try {
    res.json(await Crop.find().sort({ name: 1 }));
  } catch (error) {
    console.error("Crops error:", error.message);
    res.status(500).json({ error: "Could not load crop information." });
  }
});

app.get("/api/crops/:id", async (req, res) => {
  try {
    const crop = mongoose.isValidObjectId(req.params.id)
      ? await Crop.findById(req.params.id)
      : await Crop.findOne({ name: { $regex: `^${req.params.id}$`, $options: "i" } });

    if (!crop) return res.status(404).json({ error: "Crop not found." });
    res.json(crop);
  } catch {
    res.status(400).json({ error: "Invalid crop identifier." });
  }
});

// ---------- IMAGE UPLOAD ----------

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB to support high-res plant photos
  fileFilter: (req, file, callback) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return callback(new Error("Upload a JPG, PNG or WebP image."));
    }
    callback(null, true);
  }
});

// =========================================================
// SCAN ENDPOINT — LLM Vision Plant Disease Analysis
// =========================================================

app.post("/api/scan", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a crop image first." });
    }

    const mimeType = req.file.mimetype;
    const imageBuffer = req.file.buffer;

    let llmResult = null;
    let usedProvider = "demo";

    // ── 1. Try Gemini Vision ────────────────────────────────────
    if (geminiClient) {
      try {
        console.log("[Gemini] Sending image for plant disease analysis...");
        llmResult = await analyseWithGemini(imageBuffer, mimeType);
        usedProvider = "gemini";
        console.log("[Gemini] Analysis complete:", llmResult.disease);
      } catch (err) {
        console.warn("[Gemini] Failed:", err.message);
      }
    }

    // ── 2. Try OpenAI Vision if Gemini failed ───────────────────
    if (!llmResult && openaiClient) {
      try {
        console.log("[OpenAI] Sending image for plant disease analysis...");
        llmResult = await analyseWithOpenAI(imageBuffer, mimeType);
        usedProvider = "openai";
        console.log("[OpenAI] Analysis complete:", llmResult.disease);
      } catch (err) {
        console.warn("[OpenAI] Failed:", err.message);
      }
    }

    // ── 3. Fall back to HuggingFace classifier ──────────────────
    if (!llmResult && hf && process.env.HF_MODEL) {
      try {
        console.log("[HuggingFace] Falling back to image classifier...");
        const predictions = await hf.imageClassification({
          data: imageBuffer,
          model: process.env.HF_MODEL
        });
        if (Array.isArray(predictions) && predictions.length > 0) {
          const top = predictions[0];
          const parsed = parsePrediction(top.label);
          const advice = adviceFor(top.label);
          llmResult = {
            crop: parsed.crop,
            disease: parsed.disease,
            severity: advice.severity,
            confidence: Math.round((top.score || 0) * 100),
            is_plant: true,
            observed_symptoms: advice.symptoms,
            immediate_precautions: advice.precautions,
            treatment: advice.treatment,
            long_term_prevention: advice.prevention,
            expert_note: `${parsed.crop} diagnosed with ${parsed.disease}. Consult your local agricultural extension officer for a confirmed on-field assessment.`
          };
          usedProvider = "huggingface";
          console.log("[HuggingFace] Classifier complete:", parsed.disease);
        }
      } catch (err) {
        console.warn("[HuggingFace] Classifier failed:", err.message);
      }
    }

    // ── 4. Demo mode — no API key configured ───────────────────
    if (!llmResult) {
      const fname = (req.file.originalname || "").toLowerCase();
      let demoLabel = "Tomato___Early_blight";
      if (fname.includes("rice") || fname.includes("blast"))          demoLabel = "Rice___Leaf_Blast";
      else if (fname.includes("wheat") || fname.includes("mildew"))   demoLabel = "Wheat___Powdery_Mildew";
      else if (fname.includes("potato") || fname.includes("late"))    demoLabel = "Potato___Late_Blight";
      else if (fname.includes("healthy") || fname.includes("clean"))  demoLabel = "Tomato___Healthy";
      else if (fname.includes("maize") || fname.includes("corn"))     demoLabel = "Maize___Common_Rust";

      const parsed = parsePrediction(demoLabel);
      const advice = adviceFor(demoLabel);
      llmResult = {
        crop: parsed.crop,
        disease: parsed.disease,
        severity: advice.severity,
        confidence: 72,
        is_plant: true,
        observed_symptoms: advice.symptoms,
        immediate_precautions: advice.precautions,
        treatment: advice.treatment,
        long_term_prevention: advice.prevention,
        expert_note: "Demo mode — add your GEMINI_API_KEY or OPENAI_API_KEY in backend/.env to enable real AI vision analysis."
      };
      usedProvider = "demo";
    }

    // ── Validate that the image is actually a plant ─────────────
    if (llmResult.is_plant === false) {
      return res.status(422).json({
        error: "The uploaded image does not appear to be a plant or crop leaf. Please upload a clear photo of a plant leaf or whole plant."
      });
    }

    // ── Normalise confidence ────────────────────────────────────
    const confidence = Math.min(100, Math.max(0, Number(llmResult.confidence) || 70));
    const isConfident = confidence >= 55;

    // ── Build provider note for the user ────────────────────────
    const providerLabels = {
      gemini: "Google Gemini Vision AI",
      openai: "OpenAI GPT-4 Vision",
      huggingface: "HuggingFace Crop Disease Classifier",
      demo: "Demo Mode (no LLM key configured)"
    };
    const analysisByLabel = providerLabels[usedProvider] || usedProvider;

    // ── Persist to MongoDB ───────────────────────────────────────
    const savedScan = await Scan.create({
      user: req.user._id,
      crop: llmResult.crop || "Unknown",
      disease: isConfident ? (llmResult.disease || "Unknown") : "Uncertain result",
      confidence,
      severity: llmResult.severity || "Moderate",
      status: isConfident ? "completed" : "needs_review",
      symptoms: llmResult.observed_symptoms || [],
      precautions: llmResult.immediate_precautions || [],
      treatment: llmResult.treatment || [],
      prevention: llmResult.long_term_prevention || [],
      note: llmResult.expert_note || "",
      aiProvider: usedProvider,
      originalFilename: req.file?.originalname || "leaf-scan.jpg"
    });

    // ── Respond to frontend ──────────────────────────────────────
    return res.json({
      scanId: savedScan._id,
      crop: savedScan.crop,
      disease: savedScan.disease,
      severity: savedScan.severity,
      confidence,
      status: savedScan.status,
      isConfident,
      symptoms: savedScan.symptoms,
      precautions: savedScan.precautions,
      treatment: savedScan.treatment,
      prevention: savedScan.prevention,
      note: savedScan.note,
      analysedBy: analysisByLabel,
      isLiveAi: usedProvider !== "demo",
      disclaimer: isConfident
        ? `Analysed by ${analysisByLabel}. Always confirm with a certified agronomist before chemical treatment.`
        : `Low confidence result from ${analysisByLabel}. Please submit this to an expert for a thorough assessment.`
    });

  } catch (error) {
    console.error("Scan error:", error.message);
    res.status(500).json({
      error: "Scan analysis failed. Please try again with a clear, well-lit plant image."
    });
  }
});

// ---------- SCAN HISTORY ----------

app.get("/api/scans", auth, async (req, res) => {
  try {
    const scans = await Scan.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(scans);
  } catch (error) {
    console.error("Scan history error:", error.message);
    res.status(500).json({ error: "Could not load scan history." });
  }
});

// ---------- EXPERT REQUESTS ----------

app.post("/api/expert", auth, async (req, res) => {
  try {
    const { name, crop, problem } = req.body;
    if (
      typeof name !== "string" || !name.trim() ||
      typeof crop !== "string" || !crop.trim() ||
      typeof problem !== "string" || !problem.trim()
    ) {
      return res.status(400).json({ error: "Name, crop and problem description are required." });
    }

    const request = await ExpertRequest.create({
      user: req.user._id,
      name: name.trim(),
      crop: crop.trim(),
      problem: problem.trim()
    });

    res.status(201).json({
      message: "Expert request saved successfully.",
      requestId: request._id,
      status: request.status
    });
  } catch (error) {
    console.error("Expert request error:", error.message);
    res.status(500).json({ error: "Could not submit expert request." });
  }
});

app.get("/api/expert/mine", auth, async (req, res) => {
  try {
    const requests = await ExpertRequest.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error("Expert requests fetch error:", error.message);
    res.status(500).json({ error: "Could not load expert requests." });
  }
});

// ---------- DASHBOARD ----------

app.get("/api/dashboard", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const [totalScans, needsReview, expertRequests, recentScans] = await Promise.all([
      Scan.countDocuments({ user: userId }),
      Scan.countDocuments({ user: userId, status: "needs_review" }),
      ExpertRequest.countDocuments({ user: userId }),
      Scan.find({ user: userId }).sort({ createdAt: -1 }).limit(5)
    ]);

    res.json({
      stats: {
        totalScans,
        pendingScans: needsReview,
        completedScans: totalScans - needsReview,
        expertRequests
      },
      recentScans
    });
  } catch (error) {
    console.error("Dashboard error:", error.message);
    res.status(500).json({ error: "Could not load dashboard." });
  }
});

// ---------- ERROR HANDLING ----------

app.use((error, req, res, _next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      error: error.code === "LIMIT_FILE_SIZE"
        ? "Image must be 10 MB or smaller."
        : "Image upload failed."
    });
  }
  if (error.message?.startsWith("Upload a JPG")) {
    return res.status(400).json({ error: error.message });
  }
  console.error("Server error:", error.message);
  res.status(500).json({ error: "Unexpected server error." });
});

// ---------- START ----------

async function startServer() {
  if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    throw new Error("Set MONGO_URI and JWT_SECRET in backend/.env");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected.");

  await seedCrops();
  console.log("Starter crop data ready.");

  app.listen(PORT, () => {
    console.log(`\n🌱 Crop Doctor API  →  http://localhost:${PORT}`);
    console.log(`🤖 AI Provider     →  ${activeLLMProvider.toUpperCase()}`);
    if (activeLLMProvider === "demo") {
      console.log("⚠️  No LLM key found. Add GEMINI_API_KEY or OPENAI_API_KEY to backend/.env\n");
    } else {
      console.log(`✅ LLM Vision ready — plant images will be analysed by ${activeLLMProvider}\n`);
    }
  });
}

startServer().catch((error) => {
  console.error("Backend startup failed:", error.message);
  process.exit(1);
});
