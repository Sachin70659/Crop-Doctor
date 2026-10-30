import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import { useLanguage } from "../context/LanguageContext";

function Expert() {
  const { isHindi, t } = useLanguage();

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
      setError(isHindi ? "समस्या भेजने से पहले कृपया लॉगिन करें।" : "Please log in before submitting your agricultural problem.");
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

      setMessage(
        res.message ||
        (isHindi
          ? "आपकी समस्या कृषि विशेषज्ञों को सफलतापूर्वक भेज दी गई है।"
          : "Your inquiry has been submitted to our agricultural specialists.")
      );
      setProblem("");
      refreshRequests();
    } catch (err) {
      setError(err.message || (isHindi ? "समस्या भेजने में असमर्थ।" : "Could not submit your consultation request."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="content-page">
      <div className="page-heading">
        <p>{t("expert.badge", "AGRICULTURE SUPPORT")}</p>
        <h1>{t("expert.title", "Ask an Agricultural Expert")}</h1>
        <span>
          {t("expert.subtitle", "Describe your crop symptoms or soil issues and receive tailored scientific guidance.")}
        </span>
      </div>

      {!token && (
        <div className="auth-alert-banner" style={{ maxWidth: "650px", margin: "0 auto 25px auto" }}>
          <span>{isHindi ? "ℹ️ आप अतिथि (Guest) मोड में हैं। " : "ℹ️ You are browsing in guest mode. "}</span>
          <Link to="/login">{isHindi ? "अपने खाते में लॉगिन करें" : "Log in to your account"}</Link>{" "}
          {isHindi ? "ताकि आप समस्या भेज सकें और विशेषज्ञों का उत्तर प्राप्त कर सकें।" : "to submit problems and receive responses."}
        </div>
      )}

      <form className="expert-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="expert-name">{isHindi ? "आपका पूरा नाम" : "Your Full Name"}</label>
          <input
            id="expert-name"
            type="text"
            placeholder={isHindi ? "अपना नाम लिखें" : "Enter your name"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="expert-crop">{isHindi ? "फसल / किस्म का नाम" : "Crop Name / Variety"}</label>
          <input
            id="expert-crop"
            type="text"
            placeholder={isHindi ? "उदा. गेहूं (PBW 343), टमाटर (संकर), धान (बासमती)" : "e.g. Wheat (PBW 343), Tomato (Hybrid), Rice (Basmati)"}
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="expert-problem">{isHindi ? "समस्या व लक्षणों का विवरण" : "Problem Description & Symptoms"}</label>
          <textarea
            id="expert-problem"
            placeholder={isHindi ? "पत्तियों के धब्बे, पौधा सूखना, कीड़ों का हमला, या मिट्टी के बारे में बताएं..." : "Describe what you notice: leaf discoloration, stunted growth, wilting, soil condition, or pest attack..."}
            rows={5}
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading} className="primary-btn" style={{ width: "100%", border: "none" }}>
          {loading
            ? (isHindi ? "समस्या भेजी जा रही है..." : "Submitting Inquiry...")
            : (isHindi ? "✉️ कृषि विशेषज्ञ को भेजें" : "✉️ Submit Problem to Expert")}
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
            <h2>{isHindi ? `आपकी भेजी गई समस्याएं (${pastRequests.length})` : `Your Expert Inquiries (${pastRequests.length})`}</h2>
            <button
              type="button"
              className="refresh-btn"
              onClick={refreshRequests}
              disabled={loadingHistory}
            >
              🔄 {loadingHistory ? (isHindi ? "अपडेट हो रहा है..." : "Refreshing...") : (isHindi ? "रिफ्रेश करें" : "Refresh")}
            </button>
          </div>

          {pastRequests.length === 0 ? (
            <p className="no-inquiries-text">
              {isHindi ? "आपने अभी तक कोई समस्या नहीं भेजी है।" : "You haven't submitted any expert inquiries yet."}
            </p>
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
                        ? (isHindi ? "समाधान प्राप्त" : "Resolved")
                        : (isHindi ? "विशेषज्ञ समीक्षा जारी" : "Review Pending")}
                    </span>
                  </div>
                  <p className="inquiry-problem">&quot;{req.problem}&quot;</p>
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
