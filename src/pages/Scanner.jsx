import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";

function Scanner() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
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
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be smaller than 5 MB.");
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
    // Reset file input value so selecting the same file triggers onChange
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
          Upload a clear photo of an affected plant leaf to detect diseases, assess severity, and view agronomic treatment steps.
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

      <div className="scanner-container">
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

              <p>Drag & drop or select an image (JPG, PNG, WebP &lt; 5 MB)</p>

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

        <div className="analysis-box">
          <h2>🔬 Diagnosis & Treatment</h2>

          {loading && (
            <div className="result-placeholder">
              <span>🔬</span>
              <p>Analyzing leaf morphology and lesion patterns with AI... please wait.</p>
            </div>
          )}

          {!loading && !result && (
            <div className="result-placeholder">
              <span>🌿</span>
              <p>Your crop diagnosis, confidence score, and management guidance will appear here.</p>
            </div>
          )}

          {!loading && result && (
            <div className="result-box">
              <div className="result-header-row">
                <div>
                  <span className="result-crop-label">{result.crop}</span>
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

              {result.symptoms && (
                <div className="result-section symptoms">
                  <strong>🔍 Detected Symptoms:</strong>
                  {Array.isArray(result.symptoms) ? (
                    <ul>
                      {result.symptoms.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{result.symptoms}</p>
                  )}
                </div>
              )}

              {result.precautions?.length > 0 && (
                <div className="result-section precautions">
                  <strong>🚨 Immediate Precautions:</strong>
                  <ul>
                    {result.precautions.map((pr, i) => (
                      <li key={i}>{pr}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.treatment?.length > 0 && (
                <div className="result-section treatment">
                  <strong>💊 Recommended Treatment & Action:</strong>
                  <ul>
                    {result.treatment.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.prevention?.length > 0 && (
                <div className="result-section prevention">
                  <strong>🛡️ Long-term Farm Prevention:</strong>
                  <ul>
                    {result.prevention.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.disclaimer && (
                <p className="scan-disclaimer">{result.disclaimer}</p>
              )}

              {result.analysedBy && (
                <p className="scan-analysed-by">
                  🤖 Analysed by: <strong>{result.analysedBy}</strong>
                </p>
              )}
            </div>
          )}

          <button
            type="button"
            className="analyze-btn"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? "Analyzing Leaf Image..." : "🔬 Run Disease Analysis"}
          </button>
        </div>
      </div>
    </section>
  );
}

export default Scanner;
