import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { firebaseGoogleSignIn } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

function Login() {
  const navigate = useNavigate();
  const { syncWithBackend, loginWithEmail, registerWithEmail } = useAuth();
  const { isHindi, t } = useLanguage();

  const [activeTab, setActiveTab] = useState("google"); // "google" | "email"
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
      const backendUser = await syncWithBackend(fbUser);
      setSuccess(isHindi ? "Google द्वारा सफलतापूर्वक लॉगिन हो गया!" : "Successfully signed in with Google!");

      if (backendUser?.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("[Google Auth Error]:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError(isHindi ? "लॉगिन रद्द किया गया। कृपया पुनः प्रयास करें।" : "Sign-in cancelled. Please click the button below to sign in.");
      } else if (err.code === "auth/popup-blocked") {
        setError(isHindi ? "ब्राउज़र पॉपअप अवरुद्ध हो गया। कृपया अनुमति दें।" : "Browser popup was blocked. Please allow popups for this site and try again.");
      } else if (err.code === "auth/network-request-failed") {
        setError(isHindi ? "नेटवर्क त्रुटि। कृपया इंटरनेट कनेक्शन जांचें।" : "Network error. Please check your internet connection.");
      } else {
        setError(err.message || (isHindi ? "लॉगिन पूरा नहीं हो सका। कृपया पुनः प्रयास करें।" : "Google sign-in could not be completed. Please try again."));
      }
    } finally {
      setLoading(false);
    }
  }

  // ── Email & Password Authentication ─────────────────────────────
  async function handleEmailAuth(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isRegisterMode) {
        if (!name.trim()) throw new Error(isHindi ? "कृपया अपना नाम दर्ज करें।" : "Please enter your name.");
        if (!email.trim()) throw new Error(isHindi ? "कृपया अपना ईमेल दर्ज करें।" : "Please enter your email.");
        if (password.length < 8) throw new Error(isHindi ? "पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।" : "Password must be at least 8 characters.");

        const newUser = await registerWithEmail(name, email, password);
        setSuccess(isHindi ? "खाता सफलतापूर्वक बन गया!" : "Account created successfully!");
        if (newUser?.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      } else {
        if (!email.trim() || !password) throw new Error(isHindi ? "कृपया ईमेल और पासवर्ड दर्ज करें।" : "Please enter your email and password.");
        const loggedUser = await loginWithEmail(email, password);
        setSuccess(isHindi ? "स्वागत है! लॉगिन हो रहा है..." : "Welcome back! Signing you in...");
        if (loggedUser?.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }
    } catch (err) {
      setError(err.message || (isHindi ? "प्रमाणीकरण विफल रहा। कृपया अपनी जानकारी जांचें।" : "Authentication failed. Please verify your credentials."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="login-card" style={{ maxWidth: "480px", padding: "40px 32px", textAlign: "center" }}>
        {/* Brand Header */}
        <div className="brand-logo" style={{ justifyContent: "center", marginBottom: "16px" }}>
          <div className="brand-icon-wrapper" style={{ width: "48px", height: "48px" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
              <path d="M12 12v10" />
            </svg>
          </div>
        </div>

        <div className="page-heading" style={{ marginBottom: "22px" }}>
          <p style={{ color: "#15803d", fontWeight: "800", fontSize: "11px", letterSpacing: "0.08em" }}>
            {t("login.badge", "FARMER ACCESS PORTAL")}
          </p>
          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#0f2e1b", margin: "6px 0 8px" }}>
            {isRegisterMode
              ? (isHindi ? "नया किसान खाता बनाएं" : "Create Your Account")
              : (isHindi ? "अपने खाते में लॉगिन करें" : "Sign In to Your Account")}
          </h1>
          <span style={{ fontSize: "13.5px", color: "#64748b", lineHeight: "1.5" }}>
            {t("login.subtitle", "Access saved leaf scans, track field history, receive weather advisories, and get direct agronomist recommendations.")}
          </span>
        </div>

        {/* Tab Switcher: Google vs Email */}
        <div
          style={{
            display: "flex",
            background: "#f1f5f9",
            borderRadius: "12px",
            padding: "4px",
            marginBottom: "22px"
          }}
        >
          <button
            type="button"
            onClick={() => { setActiveTab("google"); setError(""); }}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "10px",
              border: "none",
              fontSize: "13.5px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: activeTab === "google" ? "#ffffff" : "transparent",
              color: activeTab === "google" ? "#0f2e1b" : "#64748b",
              boxShadow: activeTab === "google" ? "0 2px 8px rgba(0,0,0,0.06)" : "none"
            }}
          >
            Google Sign-In
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("email"); setError(""); }}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: "10px",
              border: "none",
              fontSize: "13.5px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: activeTab === "email" ? "#ffffff" : "transparent",
              color: activeTab === "email" ? "#0f2e1b" : "#64748b",
              boxShadow: activeTab === "email" ? "0 2px 8px rgba(0,0,0,0.06)" : "none"
            }}
          >
            {isHindi ? "ईमेल और पासवर्ड" : "Email & Password"}
          </button>
        </div>

        {error && (
          <div className="auth-error-msg" role="alert" style={{ textAlign: "left", marginBottom: "18px" }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="auth-success-msg" role="status" style={{ textAlign: "left", marginBottom: "18px" }}>
            ✅ {success}
          </div>
        )}

        {/* ── GOOGLE SIGN-IN TAB ── */}
        {activeTab === "google" && (
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              style={{
                width: "100%",
                padding: "15px 22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "14px",
                background: "#ffffff",
                border: "2px solid #bbf7d0",
                borderRadius: "14px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "15px",
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
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#bbf7d0";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <svg width="24" height="24" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span>{loading ? (isHindi ? "गूगल से लॉगिन हो रहा है..." : "Signing in with Google...") : (isHindi ? "Google से जारी रखें" : "Continue with Google")}</span>
            </button>
          </div>
        )}

        {/* ── EMAIL & PASSWORD TAB ── */}
        {activeTab === "email" && (
          <form onSubmit={handleEmailAuth} style={{ textAlign: "left" }}>
            {isRegisterMode && (
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  {isHindi ? "पूरा नाम" : "Full Name"}
                </label>
                <input
                  type="text"
                  placeholder={isHindi ? "अपना नाम दर्ज करें" : "e.g. Ramesh Kumar"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "11px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none"
                  }}
                  required
                />
              </div>
            )}

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                {isHindi ? "ईमेल पता" : "Email Address"}
              </label>
              <input
                type="email"
                placeholder={isHindi ? "उदा. farmer@example.com" : "e.g. farmer@example.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: "10px",
                  border: "1.5px solid #cbd5e1",
                  fontSize: "14px",
                  outline: "none"
                }}
                required
              />
            </div>

            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                {isHindi ? "पासवर्ड (कम से कम 8 अक्षर)" : "Password (min 8 characters)"}
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: "10px",
                  border: "1.5px solid #cbd5e1",
                  fontSize: "14px",
                  outline: "none"
                }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary-hero"
              style={{
                width: "100%",
                padding: "13px",
                fontSize: "15px",
                justifyContent: "center",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading
                ? (isHindi ? "कृपया प्रतीक्षा करें..." : "Processing...")
                : isRegisterMode
                ? (isHindi ? "नया किसान खाता बनाएं" : "Create Account")
                : (isHindi ? "लॉगिन करें" : "Sign In")}
            </button>

            <div style={{ textAlign: "center", marginTop: "14px" }}>
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setError("");
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#15803d",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  textDecoration: "underline"
                }}
              >
                {isRegisterMode
                  ? (isHindi ? "पहले से खाता है? यहाँ लॉगिन करें" : "Already have an account? Sign in")
                  : (isHindi ? "नया खाता चाहिए? यहाँ पंजीकरण करें" : "Need a new account? Register here")}
              </button>
            </div>
          </form>
        )}

        {/* ── ROLE INFORMATION BOX ── */}
        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "14px",
            textAlign: "left"
          }}
        >
          <div style={{ fontSize: "11.5px", fontWeight: "800", color: "#334155", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
            👥 {isHindi ? "भूमिका (Roles) जानकारी" : "Role-Based Architecture"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px", color: "#64748b", lineHeight: "1.5" }}>
            <div>
              • <strong>{isHindi ? "सामान्य उपयोगकर्ता (User):" : "Default Role:"}</strong> {isHindi ? "प्रत्येक खाता सामान्य किसान उपयोगकर्ता के रूप में पंजीकृत होता है और एआई स्कैनर व डैशबोर्ड का उपयोग कर सकता है।" : "Any account registered starts as a Normal User with access to the AI Scanner, crops, and personal dashboard."}
            </div>
            <div>
              • <strong>{isHindi ? "एडमिन भूमिका (Admin):" : "Admin Role:"}</strong> {isHindi ? "एडमिन पैनल या डेटाबेस द्वारा प्रशासनिक अधिकार दिए जा सकते हैं।" : "Can be granted directly in MongoDB (set role: \"admin\") or promoted via Admin Panel."}
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div style={{
          marginTop: "20px",
          paddingTop: "16px",
          borderTop: "1px solid #f1f5f2",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          textAlign: "left"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12.5px", color: "#475569" }}>
            <span style={{ color: "#15803d", fontWeight: "900" }}>✓</span>
            <span>{isHindi ? "एक क्लिक में तुरंत प्रमाणीकरण" : "One-click instant authentication"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12.5px", color: "#475569" }}>
            <span style={{ color: "#15803d", fontWeight: "900" }}>✓</span>
            <span>{isHindi ? "सभी फसल जांच रिकॉर्ड क्लाउड पर सुरक्षित" : "Auto-syncs all AI leaf disease diagnoses"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12.5px", color: "#d97706", fontWeight: "900" }}>
            <span style={{ color: "#d97706", fontWeight: "900" }}>✓</span>
            <span>{isHindi ? "सुरक्षित एडमिन एवं किसान पोर्टल" : "Role-based authenticated user & admin access"}</span>
          </div>
        </div>

        <div className="auth-back-link" style={{ marginTop: "22px" }}>
          <Link to="/" style={{ color: "#15803d", fontWeight: "700", fontSize: "13.5px" }}>
            {isHindi ? "← होम पर वापस जाएं" : "← Back to Home"}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Login;
