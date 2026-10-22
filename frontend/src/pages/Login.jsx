import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  firebaseRegister,
  firebaseLogin,
  firebaseGoogleSignIn
} from "../firebase";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../api";

function Login() {
  const navigate = useNavigate();
  const { syncWithBackend } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ── Email / Password submit (Hybrid: Firebase with MongoDB fallback) ──
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;
    const cleanName = name.trim();

    try {
      let fbUser = null;
      let firebaseWorked = false;

      // 1. First attempt via Firebase Auth
      try {
        if (isRegister) {
          fbUser = await firebaseRegister(cleanName, cleanEmail, cleanPassword);
        } else {
          fbUser = await firebaseLogin(cleanEmail, cleanPassword);
        }
        firebaseWorked = Boolean(fbUser);
      } catch (fbErr) {
        console.warn("[Auth] Firebase attempt info:", fbErr.code || fbErr.message);
      }

      // 2. If Firebase succeeded, sync with backend & navigate
      if (firebaseWorked && fbUser) {
        await syncWithBackend(fbUser);
        setSuccess(isRegister ? "Account created successfully!" : "Login successful!");
        navigate("/dashboard", { replace: true });
        return;
      }

      // 3. Fallback: Directly authenticate against MongoDB backend
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const body = isRegister
        ? { name: cleanName, email: cleanEmail, password: cleanPassword }
        : { email: cleanEmail, password: cleanPassword };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Incorrect email or password. Please verify your credentials.");
      }

      // Save token and user in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("auth-changed"));

      setSuccess(isRegister ? "Account created successfully!" : "Login successful!");
      navigate("/dashboard", { replace: true });

    } catch (err) {
      console.error("[Auth] Login error:", err);
      setError(mapFirebaseError(err.code) || err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  // ── Google Sign-In ─────────────────────────────────────────────
  async function handleGoogleSignIn() {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const fbUser = await firebaseGoogleSignIn();
      await syncWithBackend(fbUser);
      setSuccess("Signed in with Google!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(mapFirebaseError(err.code) || err.message || "Google sign-in failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setIsRegister((prev) => !prev);
    setError("");
    setSuccess("");
  }

  return (
    <section className="auth-page">
      <div className="login-card">
        <div className="page-heading" style={{ marginBottom: "25px" }}>
          <p>🌱 CROP DOCTOR</p>
          <h1>{isRegister ? "Create Farmer Account" : "Welcome Back"}</h1>
          <span>
            {isRegister
              ? "Join Crop Doctor to scan crops, view diagnostics, and track field history."
              : "Login to access your personal AI scans, diagnostics, and expert inquiries."}
          </span>
        </div>

        {error && (
          <div className="auth-error-msg" role="alert">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="auth-success-msg" role="status">
            ✅ {success}
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          type="button"
          className="google-signin-btn"
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: "100%",
            padding: "13px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            background: "#ffffff",
            border: "2px solid #e2e8f0",
            borderRadius: "12px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "14.5px",
            fontWeight: "700",
            color: "#334155",
            transition: "all 0.2s"
          }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          {loading ? "Please wait..." : `${isRegister ? "Sign up" : "Sign in"} with Google`}
        </button>

        <div style={{ textAlign: "center", color: "#94a3b8", marginBottom: "16px", fontSize: "13px", fontWeight: "600" }}>
          — or use email —
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="e.g. farmer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder={isRegister ? "At least 8 characters" : "Enter your account password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={isRegister ? 8 : undefined}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading
              ? "Authenticating..."
              : isRegister
                ? "✨ Create Farmer Account"
                : "🔐 Access Farm Dashboard"}
          </button>
        </form>

        <div className="auth-toggle-row">
          <span>{isRegister ? "Already have an account? " : "Don't have an account? "}</span>
          <button
            type="button"
            onClick={toggleMode}
            disabled={loading}
            className="toggle-auth-btn"
          >
            {isRegister ? "Login here" : "Create an account"}
          </button>
        </div>

        <div className="auth-back-link">
          <Link to="/">← Back to Home</Link>
        </div>
      </div>
    </section>
  );
}

// ── Friendly error codes ─────────────
function mapFirebaseError(code) {
  const map = {
    "auth/email-already-in-use": "This email is already registered. Try logging in instead.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password must be at least 8 characters.",
    "auth/user-not-found": "No account found with this email. Please check your email or create an account.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/too-many-requests": "Too many failed attempts. Please try again in a few minutes.",
    "auth/network-request-failed": "Network error. Please check your internet connection.",
    "auth/popup-blocked": "Popup was blocked. Please allow popups for Google sign-in.",
    "auth/invalid-credential": "Incorrect email or password."
  };
  return map[code] || null;
}

export default Login;
