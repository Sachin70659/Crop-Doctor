import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";

function Expert() {
  const storedUser = (() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const token = localStorage.getItem("token");

  const [name, setName] = useState(() => storedUser?.name || "");
  const [crop, setCrop] = useState("");
  const [problem, setProblem] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pastRequests, setPastRequests] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    async function fetchInitialRequests() {
      try {
        const data = await apiRequest("/api/expert/mine");
        if (isMounted && Array.isArray(data)) {
          setPastRequests(data);
        }
      } catch {
        // Background fetch fallback
      }
    }

    fetchInitialRequests();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const refreshRequests = async () => {
    if (!token) return;
    setLoadingHistory(true);
    try {
      const data = await apiRequest("/api/expert/mine");
      if (Array.isArray(data)) {
        setPastRequests(data);
      }
    } catch {
      // Background fetch fallback
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setError("Please log in before submitting your agricultural problem.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await apiRequest("/api/expert", {
        method: "POST",
        body: JSON.stringify({ name, crop, problem }),
      });

      setMessage(res.message || "Your inquiry has been submitted to our agricultural specialists.");
      setProblem("");
      refreshRequests();
    } catch (err) {
      setError(err.message || "Could not submit your consultation request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="content-page">
      <div className="page-heading">
        <p>AGRICULTURE SUPPORT</p>
        <h1>Ask an Agricultural Expert</h1>
        <span>
          Describe your crop symptoms or soil issues and receive tailored scientific guidance.
        </span>
      </div>

      {!token && (
        <div className="auth-alert-banner" style={{ maxWidth: "650px", margin: "0 auto 25px auto" }}>
          <span>ℹ️ You are browsing in guest mode. </span>
          <Link to="/login">Log in to your account</Link> to submit problems and receive responses.
        </div>
      )}

      <form className="expert-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="expert-name">Your Full Name</label>
          <input
            id="expert-name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="expert-crop">Crop Name / Variety</label>
          <input
            id="expert-crop"
            type="text"
            placeholder="e.g. Wheat (PBW 343), Tomato (Hybrid), Rice (Basmati)"
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="expert-problem">Problem Description & Symptoms</label>
          <textarea
            id="expert-problem"
            placeholder="Describe what you notice: leaf discoloration, stunted growth, wilting, soil condition, or pest attack..."
            rows={5}
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading} className="primary-btn" style={{ width: "100%", border: "none" }}>
          {loading ? "Submitting Inquiry..." : "✉️ Submit Problem to Expert"}
        </button>

        {message && (
          <div className="expert-success-msg" role="status">
            ✅ {message}
          </div>
        )}

        {error && (
          <div className="expert-error-msg" role="alert">
            ⚠️ {error}
          </div>
        )}
      </form>

      {token && (
        <div className="expert-history-container">
          <div className="expert-history-header">
            <h2>Your Expert Inquiries ({pastRequests.length})</h2>
            <button
              type="button"
              className="refresh-btn"
              onClick={refreshRequests}
              disabled={loadingHistory}
            >
              🔄 {loadingHistory ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {pastRequests.length === 0 ? (
            <p className="no-inquiries-text">You haven't submitted any expert inquiries yet.</p>
          ) : (
            <div className="inquiries-list">
              {pastRequests.map((req) => (
                <div key={req._id} className="inquiry-card">
                  <div className="inquiry-header">
                    <div>
                      <strong>🌱 {req.crop}</strong>
                      <span className="inquiry-date">
                        {req.createdAt
                          ? new Date(req.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })
                          : ""}
                      </span>
                    </div>
                    <span className={`status-pill ${req.status || "pending"}`}>
                      {req.status === "completed" || req.status === "resolved"
                        ? "Resolved"
                        : "Review Pending"}
                    </span>
                  </div>
                  <p className="inquiry-problem">"{req.problem}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default Expert;
