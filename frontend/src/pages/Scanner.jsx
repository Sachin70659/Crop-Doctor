import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext";

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

  // Live Camera States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState("environment"); // "environment" (rear) or "user" (front)
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const nativeCameraInputRef = useRef(null);

  const { user: authUser, token: contextToken } = useAuth();
  const [token, setToken] = useState(() => contextToken || localStorage.getItem("token"));

  useEffect(() => {
    if (contextToken) setToken(contextToken);
  }, [contextToken]);

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
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Direct camera is not supported in this browser.");
      }

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
      console.warn("Direct webcam failed, falling back to native camera:", err.message);
      setCameraLoading(false);
      // If user denied camera permission or browser doesn't allow webcam, trigger native device camera
      if (nativeCameraInputRef.current) {
        nativeCameraInputRef.current.click();
        setIsCameraActive(false);
      } else {
        setCameraError(err.message || "Could not access device camera.");
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
      setError("Failed to capture snapshot from camera.");
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
    const activeToken = contextToken || token || localStorage.getItem("token");
    if (!activeToken) {
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
          Click a live photo or upload a picture of an affected plant leaf to detect exact plant species, diagnose diseases, and view certified agronomic cure protocols.
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
              <h2>Scan Your Crop Leaf</h2>
              <p>Choose an option below to click a live photo or upload an existing image</p>

              {/* DUAL ACTION BUTTONS: DIRECT CAMERA SNAP & GALLERY PICK */}
              <div className="crop-photo-action-buttons">
                <button
                  type="button"
                  className="crop-direct-camera-btn"
                  onClick={() => startCamera("environment")}
                  title="Open camera to click crop leaf photo directly"
                >
                  <span className="btn-snap-icon">📸</span>
                  <div className="btn-snap-text">
                    <span className="primary-label">Click Photo with Camera</span>
                    <span className="secondary-label">सीधे कैमरा से फ़ोटो खींचें</span>
                  </div>
                </button>

                <label className="crop-gallery-pick-btn" title="Choose from gallery or files">
                  <span className="btn-snap-icon">📁</span>
                  <div className="btn-snap-text">
                    <span className="primary-label">Upload from Files</span>
                    <span className="secondary-label">गैलरी या स्टोरेज से चुनें</span>
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
                <span>💡 <strong>Tip for Farmers:</strong> Hold camera 10–15 cm from the affected leaf under natural daylight for best accuracy.</span>
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
                <div className="preview-image-badge">✅ Leaf Photo Ready</div>
              </div>

              <div className="upload-preview-actions">
                <button
                  type="button"
                  className="camera-reclick-btn"
                  onClick={() => startCamera("environment")}
                  title="Take another live camera shot"
                >
                  📸 Re-click Photo
                </button>

                <label className="change-btn" title="Choose a different image file">
                  📁 Pick File
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
                  title="Remove image"
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
                Click a photo or select an image on the left, then tap &quot;Analyze Crop Leaf Now&quot;.
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

      {/* ── LIVE CAMERA VIEWFINDER MODAL ───────────────────────── */}
      {isCameraActive && (
        <div className="camera-modal-backdrop">
          <div className="camera-modal-card">
            <div className="camera-modal-header">
              <div className="camera-modal-title">
                <span className="rec-dot"></span>
                <span>Live Crop Camera</span>
              </div>
              <div className="camera-header-actions">
                <button
                  type="button"
                  className="camera-flip-btn"
                  onClick={toggleFacing}
                  title="Switch Front/Rear Camera"
                >
                  🔄 Flip
                </button>
                <button
                  type="button"
                  className="camera-close-btn"
                  onClick={stopCamera}
                  title="Close Camera"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="camera-viewfinder-container">
              {cameraLoading && (
                <div className="camera-loading-overlay">
                  <span>⏳ Starting camera feed...</span>
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
                    Open Device Camera Directly
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
                <span className="reticle-label">🌱 Align Affected Leaf Here</span>
              </div>
            </div>

            <div className="camera-modal-controls">
              <button
                type="button"
                className="camera-cancel-text-btn"
                onClick={stopCamera}
              >
                Cancel
              </button>

              <button
                type="button"
                className="camera-shutter-btn"
                onClick={capturePhoto}
                disabled={cameraLoading}
                title="Click Photo"
              >
                <div className="shutter-inner-circle"></div>
              </button>

              <button
                type="button"
                className="camera-switch-mobile-btn"
                onClick={toggleFacing}
                title="Switch Camera"
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
