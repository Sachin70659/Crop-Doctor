import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { firebaseGoogleSignIn } from "../firebase";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { syncWithBackend } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ── 1-Click Google Sign-In ──────────────────────────────────────
  async function handleGoogleSignIn() {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const fbUser = await firebaseGoogleSignIn();
      await syncWithBackend(fbUser);
      setSuccess("Successfully signed in with Google!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("[Google Auth Error]:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled. Please click the button below to sign in.");
      } else if (err.code === "auth/popup-blocked") {
        setError("Browser popup was blocked. Please allow popups for this site and try again.");
      } else if (err.code === "auth/network-request-failed") {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(err.message || "Google sign-in could not be completed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="login-card" style={{ maxWidth: "460px", padding: "45px 35px", textAlign: "center" }}>
        {/* Brand Header */}
        <div className="brand-logo" style={{ justifyContent: "center", marginBottom: "20px" }}>
          <div className="brand-icon-wrapper" style={{ width: "48px", height: "48px" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
              <path d="M12 12v10" />
            </svg>
          </div>
        </div>

        <div className="page-heading" style={{ marginBottom: "28px" }}>
          <p style={{ color: "#15803d", fontWeight: "800", fontSize: "12px", letterSpacing: "0.08em" }}>
            FARMER ACCESS PORTAL
          </p>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f2e1b", margin: "6px 0 10px" }}>
            Sign In with Google
          </h1>
          <span style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>
            Access your AI plant scans, disease treatment plans, and agronomist consultations with one click.
          </span>
        </div>

        {error && (
          <div className="auth-error-msg" role="alert" style={{ textAlign: "left", marginBottom: "20px" }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="auth-success-msg" role="status" style={{ textAlign: "left", marginBottom: "20px" }}>
            ✅ {success}
          </div>
        )}

        {/* Big Prominent Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: "100%",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px",
            background: "#ffffff",
            border: "2px solid #bbf7d0",
            borderRadius: "14px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "700",
            color: "#0f2e1b",
            boxShadow: "0 4px 16px rgba(21, 128, 61, 0.08)",
            transition: "all 0.25s ease",
            opacity: loading ? 0.7 : 1
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.borderColor = "#15803d";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(21, 128, 61, 0.16)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#bbf7d0";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(21, 128, 61, 0.08)";
          }}
        >
          <svg width="24" height="24" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <span>{loading ? "Signing in with Google..." : "Continue with Google"}</span>
        </button>

        {/* Feature Highlights */}
        <div style={{
          marginTop: "30px",
          paddingTop: "24px",
          borderTop: "1px solid #f1f5f2",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          textAlign: "left"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#475569" }}>
            <span style={{ color: "#15803d", fontWeight: "900" }}>✓</span>
            <span>One-click instant authentication (no password to remember)</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#475569" }}>
            <span style={{ color: "#15803d", fontWeight: "900" }}>✓</span>
            <span>Auto-syncs all AI leaf disease diagnoses to MongoDB Atlas</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#475569" }}>
            <span style={{ color: "#15803d", fontWeight: "900" }}>✓</span>
            <span>Enterprise-grade security powered by Google Firebase</span>
          </div>
        </div>

        <div className="auth-back-link" style={{ marginTop: "28px" }}>
          <Link to="/" style={{ color: "#15803d", fontWeight: "700" }}>← Back to Home</Link>
        </div>
      </div>
    </section>
  );
}

export default Login;
