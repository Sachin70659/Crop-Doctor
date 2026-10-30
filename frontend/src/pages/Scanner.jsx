import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import { useLanguage } from "../context/LanguageContext";

const CROP_OPTIONS = [
  { value: "auto", labelEn: "🔍 Auto-Detect Crop with AI (Recommended)", labelHi: "🔍 एआई द्वारा फसल स्वयं पहचानें (अनुशंसित)" },
  { value: "Mango", labelEn: "🥭 Mango (Aam)", labelHi: "🥭 आम (Mango)" },
  { value: "Tomato", labelEn: "🍅 Tomato (Tamatar)", labelHi: "🍅 टमाटर (Tomato)" },
  { value: "Rice", labelEn: "🌾 Rice / Paddy (Dhan)", labelHi: "🌾 धान / चावल (Paddy)" },
  { value: "Wheat", labelEn: "🌾 Wheat (Gehun)", labelHi: "🌾 गेहूं (Wheat)" },
  { value: "Potato", labelEn: "🥔 Potato (Aaloo)", labelHi: "🥔 आलू (Potato)" },
  { value: "Chilli", labelEn: "🌶️ Chilli (Mirch)", labelHi: "🌶️ मिर्च (Chilli)" },
  { value: "Cotton", labelEn: "🪴 Cotton (Kapas)", labelHi: "🪴 कपास (Cotton)" },
  { value: "Sugarcane", labelEn: "🎋 Sugarcane (Ganna)", labelHi: "🎋 गन्ना (Sugarcane)" },
  { value: "Banana", labelEn: "🍌 Banana (Kela)", labelHi: "🍌 केला (Banana)" },
  { value: "Maize", labelEn: "🌽 Maize / Corn (Makka)", labelHi: "🌽 मक्का (Maize)" },
  { value: "Mustard", labelEn: "🌼 Mustard (Sarson)", labelHi: "🌼 सरसों (Mustard)" },
  { value: "Apple", labelEn: "🍏 Apple (Seb)", labelHi: "🍏 सेब (Apple)" },
  { value: "Guava", labelEn: "🍈 Guava (Amrood)", labelHi: "🍈 अमरूद (Guava)" },
  { value: "Papaya", labelEn: "🍈 Papaya (Papita)", labelHi: "🍈 पपीता (Papaya)" },
  { value: "Onion", labelEn: "🧅 Onion (Pyaz)", labelHi: "🧅 प्याज (Onion)" },
  { value: "Other", labelEn: "🌿 Other Crop / Plant", labelHi: "🌿 अन्य फसल / पौधा" }
];

function Scanner() {
  const { language, isHindi, t } = useLanguage();

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState("auto");
  const [customCrop, setCustomCrop] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  // Live Camera States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState("environment"); // "environment" (rear) or "user" (front)
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const nativeCameraInputRef = useRef(null);

  const [token, setToken] = useState(() => localStorage.getItem("token"));

  useEffect(() => {
    const handleAuth = () => {
      setToken(localStorage.getItem("token"));
    };
    window.addEventListener("auth-changed", handleAuth);
    window.addEventListener("storage", handleAuth);
    return () => {
      window.removeEventListener("auth-changed", handleAuth);
      window.removeEventListener("storage", handleAuth);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [preview]);

  const processFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(isHindi ? "कृपया मान्य फ़ोटो फ़ाइल (JPG, PNG, या WebP) चुनें।" : "Please select a valid image file (JPG, PNG, or WebP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(isHindi ? "फ़ोटो का आकार 10 MB से कम होना चाहिए।" : "Image size must be smaller than 10 MB.");
      return;
    }
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError("");
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // ── Camera Control Functions ──────────────────────────────────
  const startCamera = async (facing = cameraFacing) => {
    setCameraError("");
    setCameraLoading(true);
    setIsCameraActive(true);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraLoading(false);
    } catch (err) {
      console.warn("Direct camera access failed, trying fallback:", err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          await videoRef.current.play();
        }
        setCameraLoading(false);
      } catch (fallbackErr) {
        console.error("Camera permission or hardware error:", fallbackErr);
        setCameraLoading(false);
        setCameraError(
          isHindi
            ? "कैमरा खोलने में असमर्थ। कृपया ब्राउज़र सेटिंग्स में कैमरा अनुमति दें।"
            : "Camera permission denied or camera unavailable. Please grant permission or upload from gallery."
        );
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setCameraLoading(false);
    setCameraError("");
  };

  const toggleFacing = () => {
    const nextFacing = cameraFacing === "environment" ? "user" : "environment";
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const file = new File([blob], `crop-leaf-${Date.now()}.jpg`, {
            type: "image/jpeg",
            lastModified: Date.now()
          });
          processFile(file);
          stopCamera();
        },
        "image/jpeg",
        0.92
      );
    } catch (err) {
      console.error("Failed to capture snapshot:", err);
      setError(isHindi ? "कैमरे से फ़ोटो लेने में समस्या आई।" : "Failed to capture snapshot from camera.");
      stopCamera();
    }
  };

  const clearSelection = () => {
    if (preview) URL.revokeObjectURL(preview);
    setImage(null);
    setPreview(null);
    setResult(null);
    setError("");
  };

  const handleAnalyze = async () => {
    if (!token) {
      setError(
        isHindi
          ? "फसल रोग निदान और परिणाम सहेजने के लिए कृपया पहले लॉगिन करें।"
          : "Please log in first to diagnose crops and save scan records to your dashboard."
      );
      return;
    }

    if (!image) {
      setError(
        isHindi
          ? "कृपया पहले पौधे की पत्ती की फ़ोटो चुनें या कैमरे से खींचें।"
          : "Please select or capture a crop leaf image before analyzing."
      );
      return;
    }

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const form = new FormData();
      form.append("image", image);
      form.append("language", language);

      const effectiveCrop = selectedCrop === "Other" && customCrop.trim()
        ? customCrop.trim()
        : selectedCrop;

      if (effectiveCrop && effectiveCrop !== "auto") {
        form.append("cropHint", effectiveCrop);
      }

      const data = await apiRequest("/api/scan", {
        method: "POST",
        body: form,
      });

      setResult(data);
    } catch (err) {
      setError(err.message || (isHindi ? "फ़ोटो की जांच पूरी नहीं हो सकी। कृपया पुनः प्रयास करें।" : "Could not analyze the crop image. Please verify backend connection."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="scanner-page">
      <div className="page-heading">
        <p>{t("scanner.badge", "AI COMPUTER VISION")}</p>
        <h1>{t("scanner.title", "AI Crop Disease Scanner")}</h1>
        <span>
          {t("scanner.subtitle", "Upload or capture a photo of an unhealthy leaf to detect diseases, get treatment protocols, and prevent harvest loss.")}
        </span>
      </div>

      {!token && (
        <div className="auth-alert-banner">
          <span>{isHindi ? "ℹ️ आप अतिथि (Guest) मोड में हैं। " : "ℹ️ You are browsing in guest mode. "}</span>
          <Link to="/login">{isHindi ? "लॉगिन करें या नया खाता बनाएं" : "Log in or create an account"}</Link>{" "}
          {isHindi ? "ताकि आप फसल जांच सकें और इतिहास देख सकें।" : "to run scans and view diagnosis history."}
        </div>
      )}

      {error && (
        <div className="error-banner" role="alert">
          ⚠️ {error}
        </div>
      )}

      {/* Crop Selector Card */}
      <div style={{
        maxWidth: "600px",
        margin: "0 auto 30px",
        background: "#ffffff",
        padding: "16px 22px",
        borderRadius: "14px",
        border: "1px solid #bbf7d0",
        boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
      }}>
        <label htmlFor="cropSelect" style={{
          display: "block",
          fontSize: "13.5px",
          fontWeight: "700",
          color: "#0f2e1b",
          marginBottom: "8px"
        }}>
          🌱 {t("scanner.selectCropLabel", "Select Crop (Optional)")}:
        </label>
        <select
          id="cropSelect"
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}
          style={{
            width: "100%",
            padding: "11px 14px",
            borderRadius: "10px",
            border: "1.5px solid #d1d5db",
            fontSize: "14.5px",
            fontWeight: "600",
            color: "#1e293b",
            background: "#f8fafc",
            outline: "none",
            cursor: "pointer"
          }}
        >
          {CROP_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {isHindi ? c.labelHi : c.labelEn}
            </option>
          ))}
        </select>

        {selectedCrop === "Other" && (
          <input
            type="text"
            placeholder={isHindi ? "फसल का नाम लिखें (उदा. सरसों, अमरूद, पपीता)..." : "Enter crop name (e.g. Mustard, Guava, Papaya)..."}
            value={customCrop}
            onChange={(e) => setCustomCrop(e.target.value)}
            style={{
              width: "100%",
              marginTop: "10px",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1.5px solid #bbf7d0",
              fontSize: "14px"
            }}
          />
        )}
      </div>

      <div className="scanner-container">
        {/* Upload Column */}
        <div
          className={`upload-box ${isDragOver ? "drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!preview ? (
            <>
              <div className="upload-icon">📷</div>
              <h2>{isHindi ? "फसल की पत्ती स्कैन करें" : "Scan Your Crop Leaf"}</h2>
              <p>{isHindi ? "लाइव कैमरा से फोटो खींचें या गैलरी से फ़ोटो चुनें" : "Choose an option below to click a live photo or upload an existing image"}</p>

              {/* DUAL ACTION BUTTONS: DIRECT CAMERA SNAP & GALLERY PICK */}
              <div className="crop-photo-action-buttons">
                <button
                  type="button"
                  className="crop-direct-camera-btn"
                  onClick={() => startCamera("environment")}
                  title={isHindi ? "सीधे कैमरे से पत्ती की फ़ोटो लें" : "Open camera to click crop leaf photo directly"}
                >
                  <span className="btn-snap-icon">📸</span>
                  <div className="btn-snap-text">
                    <span className="primary-label">{isHindi ? "सीधे कैमरा से फ़ोटो खींचें" : "Click Photo with Camera"}</span>
                    <span className="secondary-label">{isHindi ? "Open Live Camera" : "सीधे कैमरा से फ़ोटो खींचें"}</span>
                  </div>
                </button>

                <label className="crop-gallery-pick-btn" title={isHindi ? "गैलरी या स्टोरेज से फ़ोटो चुनें" : "Choose from gallery or files"}>
                  <span className="btn-snap-icon">📁</span>
                  <div className="btn-snap-text">
                    <span className="primary-label">{isHindi ? "फ़ाइल या गैलरी से चुनें" : "Upload from Files"}</span>
                    <span className="secondary-label">{isHindi ? "Choose from Gallery" : "गैलरी या स्टोरेज से चुनें"}</span>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImage}
                    hidden
                  />
                </label>
              </div>

              {/* Native Mobile Camera Input Fallback */}
              <input
                ref={nativeCameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImage}
                hidden
              />

              <div className="upload-leaf-guideline">
                <span>
                  💡 <strong>{isHindi ? "किसानों के लिए सुझाव:" : "Tip for Farmers:"}</strong>{" "}
                  {isHindi
                    ? "सटीक परिणाम के लिए कैमरे को प्रभावित पत्ती से 10–15 सेमी दूर दिन की रोशनी में रखें।"
                    : "Hold camera 10–15 cm from the affected leaf under natural daylight for best accuracy."}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="preview-image-wrapper">
                <img
                  src={preview}
                  alt="Crop leaf preview"
                  className="crop-preview"
                />
                <div className="preview-image-badge">{isHindi ? "✅ पत्ती की फ़ोटो तैयार है" : "✅ Leaf Photo Ready"}</div>
              </div>

              <div className="upload-preview-actions">
                <button
                  type="button"
                  className="camera-reclick-btn"
                  onClick={() => startCamera("environment")}
                  title={isHindi ? "दोबारा कैमरा से फ़ोटो लें" : "Take another live camera shot"}
                >
                  📸 {isHindi ? "दोबारा फ़ोटो लें" : "Re-click Photo"}
                </button>

                <label className="change-btn" title={isHindi ? "दूसरी फ़ोटो चुनें" : "Choose a different image file"}>
                  📁 {isHindi ? "फ़ोटो बदलें" : "Pick File"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImage}
                    hidden
                  />
                </label>

                <button
                  type="button"
                  className="remove-btn"
                  onClick={clearSelection}
                  title={isHindi ? "हटाएं" : "Remove image"}
                >
                  ✕ {isHindi ? "हटाएं" : "Clear"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Diagnosis Column */}
        <div className="analysis-box">
          <h2>🔬 {isHindi ? "रोग निदान एवं उपचार नुस्खा" : "Diagnosis & Treatment Protocol"}</h2>

          {loading && (
            <div className="result-placeholder">
              <span style={{ fontSize: "50px", display: "block", marginBottom: "14px" }}>🔬</span>
              <p><strong>{isHindi ? "पत्ती के लक्षणों और रोग का विश्लेषण हो रहा है..." : "Analyzing leaf pathology and morphology..."}</strong></p>
              <p style={{ fontSize: "13px", marginTop: "8px", color: "#64748b" }}>
                {isHindi ? "एआई विज़न इंजन द्वारा धब्बों, फफूंद और रंग के बदलाव की जांच जारी है..." : "Inspecting leaf texture, chlorosis borders, and lesion patterns with AI..."}
              </p>
            </div>
          )}

          {!loading && !result && (
            <div className="result-placeholder">
              <span style={{ fontSize: "50px", display: "block", marginBottom: "14px" }}>🌿</span>
              <p><strong>{isHindi ? "फसल रोग का परिणाम यहाँ दिखाई देगा।" : "Your crop diagnosis will appear here."}</strong></p>
              <p style={{ fontSize: "13px", marginTop: "8px", color: "#64748b" }}>
                {isHindi
                  ? "बाईं ओर पत्ती की फ़ोटो खींचें या चुनें, फिर नीचे दिए गए 'एआई रोग परीक्षण शुरू करें' बटन पर क्लिक करें।"
                  : "Click a photo or select an image on the left, then tap \"Run AI Disease Diagnosis\"."}
              </p>
            </div>
          )}

          {!loading && result && (
            <div className="result-box">
              <div className="result-header-row">
                <div>
                  <span className="result-crop-label">{isHindi ? "पहचानी गई फसल:" : "Identified Crop:"} {result.crop}</span>
                  <h3>{result.disease}</h3>
                </div>
                <div className="result-badges">
                  {result.severity && (
                    <span
                      className={`severity-badge severity-${result.severity.toLowerCase()}`}
                    >
                      {result.severity}
                    </span>
                  )}
                  <span
                    className={`confidence-badge ${
                      result.confidence >= 60 ? "high" : "low"
                    }`}
                  >
                    {result.confidence}% {isHindi ? "सटीकता" : "Match"}
                  </span>
                </div>
              </div>

              {result.note && (
                <div className="result-note">
                  📌 {result.note}
                </div>
              )}

              {result.symptoms && result.symptoms.length > 0 && (
                <div className="result-section symptoms">
                  <strong>🔍 {isHindi ? "देखे गए मुख्य लक्षण:" : "Detected Symptoms:"}</strong>
                  <ul>
                    {result.symptoms.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.precautions && result.precautions.length > 0 && (
                <div className="result-section precautions">
                  <strong>⚠️ {isHindi ? "तत्काल आवश्यक सावधानियां:" : "Immediate Urgent Precautions:"}</strong>
                  <ul>
                    {result.precautions.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.treatment && result.treatment.length > 0 && (
                <div className="result-section treatment" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                  <strong style={{ color: "#15803d" }}>💊 {isHindi ? "रासायनिक एवं जैविक उपचार (दवाइयां):" : "Chemical / Organic Treatment:"}</strong>
                  <ul>
                    {result.treatment.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.prevention && result.prevention.length > 0 && (
                <div className="result-section prevention">
                  <strong>🛡️ {isHindi ? "भविष्य में खेत की रोकथाम:" : "Long-term Field Prevention:"}</strong>
                  <ul>
                    {result.prevention.map((pv, i) => (
                      <li key={i}>{pv}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.analysedBy && (
                <div style={{
                  fontSize: "12px",
                  color: "#64748b",
                  paddingTop: "12px",
                  borderTop: "1px solid #e2ede5",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <span>{isHindi ? "जांच तकनीक:" : "Diagnostic Engine:"} <strong>{result.analysedBy}</strong></span>
                  {result.isLiveAi && <span style={{ color: "#15803d", fontWeight: "700" }}>● {isHindi ? "लाइव एआई विज़न" : "Live AI Vision"}</span>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="scanner-actions">
        <button
          type="button"
          className="analyze-btn"
          onClick={handleAnalyze}
          disabled={loading || !image}
        >
          {loading
            ? (isHindi ? "एआई मॉडल द्वारा पत्ती की जांच हो रही है..." : "Analyzing Leaf with AI...")
            : (isHindi ? "🔬 एआई रोग परीक्षण शुरू करें" : "🔬 Run AI Disease Diagnosis")}
        </button>
      </div>

      {/* ── LIVE CAMERA VIEWFINDER MODAL ───────────────────────── */}
      {isCameraActive && (
        <div className="camera-modal-backdrop">
          <div className="camera-modal-card">
            <div className="camera-modal-header">
              <div className="camera-modal-title">
                <span className="rec-dot"></span>
                <span>{isHindi ? "लाइव कैमरा" : "Live Crop Camera"}</span>
              </div>
              <div className="camera-header-actions">
                <button
                  type="button"
                  className="camera-flip-btn"
                  onClick={toggleFacing}
                  title={isHindi ? "कैमरा बदलें" : "Switch Front/Rear Camera"}
                >
                  🔄 {isHindi ? "बदलें" : "Flip"}
                </button>
                <button
                  type="button"
                  className="camera-close-btn"
                  onClick={stopCamera}
                  title={isHindi ? "कैमरा बंद करें" : "Close Camera"}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="camera-viewfinder-container">
              {cameraLoading && (
                <div className="camera-loading-overlay">
                  <span>⏳ {isHindi ? "कैमरा शुरू हो रहा है..." : "Starting camera feed..."}</span>
                </div>
              )}

              {cameraError && (
                <div className="camera-error-overlay">
                  <p>⚠️ {cameraError}</p>
                  <button
                    type="button"
                    className="camera-retry-btn"
                    onClick={() => nativeCameraInputRef.current?.click()}
                  >
                    {isHindi ? "डिवाइस कैमरा सीधे खोलें" : "Open Device Camera Directly"}
                  </button>
                </div>
              )}

              <video
                ref={videoRef}
                playsInline
                muted
                className="camera-video-stream"
              />

              {/* Viewfinder Target Guide */}
              <div className="camera-target-reticle">
                <div className="reticle-corner top-left"></div>
                <div className="reticle-corner top-right"></div>
                <div className="reticle-corner bottom-left"></div>
                <div className="reticle-corner bottom-right"></div>
                <span className="reticle-label">{isHindi ? "🌱 प्रभावित पत्ती को यहाँ लाएं" : "🌱 Align Affected Leaf Here"}</span>
              </div>
            </div>

            <div className="camera-modal-controls">
              <button
                type="button"
                className="camera-cancel-text-btn"
                onClick={stopCamera}
              >
                {isHindi ? "रद्द करें" : "Cancel"}
              </button>

              <button
                type="button"
                className="camera-shutter-btn"
                onClick={capturePhoto}
                disabled={cameraLoading}
                title={isHindi ? "फ़ोटो खींचें" : "Click Photo"}
              >
                <div className="shutter-inner-circle"></div>
              </button>

              <button
                type="button"
                className="camera-switch-mobile-btn"
                onClick={toggleFacing}
                title={isHindi ? "कैमरा बदलें" : "Switch Camera"}
              >
                🔄
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Scanner;
