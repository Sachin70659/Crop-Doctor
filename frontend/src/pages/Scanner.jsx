import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";

const CROP_OPTIONS = [
  { value: "auto", label: "🔍 Auto-Detect Crop with AI (Recommended)" },
  { value: "Mango", label: "🥭 Mango (Aam)" },
  { value: "Tomato", label: "🍅 Tomato (Tamatar)" },
  { value: "Rice", label: "🌾 Rice / Paddy (Dhan)" },
  { value: "Wheat", label: "🌾 Wheat (Gehun)" },
  { value: "Potato", label: "🥔 Potato (Aaloo)" },
  { value: "Chilli", label: "🌶️ Chilli (Mirch)" },
  { value: "Cotton", label: "🪴 Cotton (Kapas)" },
  { value: "Sugarcane", label: "🎋 Sugarcane (Ganna)" },
  { value: "Banana", label: "🍌 Banana (Kela)" },
  { value: "Maize", label: "🌽 Maize / Corn (Makka)" },
  { value: "Mustard", label: "🌼 Mustard (Sarson)" },
  { value: "Apple", label: "🍏 Apple (Seb)" },
  { value: "Guava", label: "🍈 Guava (Amrood)" },
  { value: "Papaya", label: "🍈 Papaya (Papita)" },
  { value: "Onion", label: "🧅 Onion (Pyaz)" },
  { value: "Other", label: "🌿 Other Crop / Plant" }
];

function Scanner() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState("auto");
  const [customCrop, setCustomCrop] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

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
    };
  }, [preview]);

  const processFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, or WebP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be smaller than 10 MB.");
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

  const handleAnalyze = async () => {
    if (!token) {
      setError("Please log in first to diagnose crops and save scan records to your dashboard.");
      return;
    }

    if (!image) {
      setError("Please select or capture a crop leaf image before analyzing.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const form = new FormData();
      form.append("image", image);

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
      setError(err.message || "Could not analyze the crop image. Please verify backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="scanner-page">
      <div className="page-heading">
        <p>AI VISION CROP DIAGNOSIS</p>
        <h1>Crop Disease Scanner</h1>
        <span>
          Upload a clear photo of an affected plant leaf to detect exact plant species, diagnose diseases, and view certified agronomic cure protocols.
        </span>
      </div>

      {!token && (
        <div className="auth-alert-banner">
          <span>ℹ️ You are browsing in guest mode. </span>
          <Link to="/login">Log in or create an account</Link> to run scans and view diagnosis history.
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
          🌱 Specify Crop / Plant (Optional):
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
              {c.label}
            </option>
          ))}
        </select>

        {selectedCrop === "Other" && (
          <input
            type="text"
            placeholder="Enter crop name (e.g. Mustard, Guava, Papaya)..."
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
              <h2>Upload Crop Leaf Image</h2>
              <p>Drag & drop or click to choose (JPG, PNG, WebP up to 10 MB)</p>

              <label className="upload-btn">
                Choose Image File
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImage}
                  hidden
                />
              </label>
            </>
          ) : (
            <>
              <img
                src={preview}
                alt="Crop leaf preview"
                className="crop-preview"
              />

              <div className="upload-preview-actions">
                <label className="change-btn">
                  🔄 Change Image
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
                  onClick={() => {
                    if (preview) URL.revokeObjectURL(preview);
                    setImage(null);
                    setPreview(null);
                    setResult(null);
                    setError("");
                  }}
                >
                  ✕ Clear
                </button>
              </div>
            </>
          )}
        </div>

        {/* Diagnosis Column */}
        <div className="analysis-box">
          <h2>🔬 Diagnosis & Treatment Protocol</h2>

          {loading && (
            <div className="result-placeholder">
              <span style={{ fontSize: "50px", display: "block", marginBottom: "14px" }}>🔬</span>
              <p><strong>Analyzing leaf pathology and morphology...</strong></p>
              <p style={{ fontSize: "13px", marginTop: "8px", color: "#64748b" }}>
                Inspecting leaf texture, chlorosis borders, and lesion patterns with AI...
              </p>
            </div>
          )}

          {!loading && !result && (
            <div className="result-placeholder">
              <span style={{ fontSize: "50px", display: "block", marginBottom: "14px" }}>🌿</span>
              <p><strong>Your crop diagnosis will appear here.</strong></p>
              <p style={{ fontSize: "13px", marginTop: "8px", color: "#64748b" }}>
                Select an image on the left and click "Analyze Crop Leaf" below.
              </p>
            </div>
          )}

          {!loading && result && (
            <div className="result-box">
              <div className="result-header-row">
                <div>
                  <span className="result-crop-label">Identified Crop: {result.crop}</span>
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
                    {result.confidence}% Match
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
                  <strong>🔍 Detected Symptoms:</strong>
                  <ul>
                    {result.symptoms.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.precautions && result.precautions.length > 0 && (
                <div className="result-section precautions">
                  <strong>⚠️ Immediate Urgent Precautions:</strong>
                  <ul>
                    {result.precautions.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.treatment && result.treatment.length > 0 && (
                <div className="result-section treatment" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                  <strong style={{ color: "#15803d" }}>💊 Chemical / Organic Treatment:</strong>
                  <ul>
                    {result.treatment.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.prevention && result.prevention.length > 0 && (
                <div className="result-section prevention">
                  <strong>🛡️ Long-term Field Prevention:</strong>
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
                  <span>Diagnostic Engine: <strong>{result.analysedBy}</strong></span>
                  {result.isLiveAi && <span style={{ color: "#15803d", fontWeight: "700" }}>● Live AI Vision</span>}
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
          {loading ? "Analyzing Leaf with AI..." : "🔬 Analyze Crop Leaf Now"}
        </button>
      </div>
    </section>
  );
}

export default Scanner;
