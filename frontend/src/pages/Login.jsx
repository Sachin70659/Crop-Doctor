import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

function Login() {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const endpoint = isRegister
        ? "/api/auth/register"
        : "/api/auth/login";

      const body = isRegister
        ? { name, email, password }
        : { email, password };

      const data = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(body)
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("auth-changed"));

      setSuccess(
        isRegister
          ? "Account created successfully!"
          : "Login successful!"
      );

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setIsRegister((current) => !current);
    setError("");
    setSuccess("");
  }

  return (
    <section className="auth-page">
      <div className="login-card">
        <div className="page-heading" style={{ marginBottom: "25px" }}>
          <p>🌱 CROP DOCTOR</p>

          <h1>
            {isRegister ? "Create Farmer Account" : "Welcome Back"}
          </h1>

          <span>
            {isRegister
              ? "Join Crop Doctor to scan crops and save field history."
              : "Login to access your AI scans and expert consultations."}
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
              placeholder={
                isRegister
                  ? "At least 8 characters"
                  : "Enter your account password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                isRegister ? "new-password" : "current-password"
              }
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
              ? "Please wait..."
              : isRegister
                ? "✨ Create Account"
                : "🔐 Login to Account"}
          </button>
        </form>

        <div className="auth-toggle-row">
          <span>
            {isRegister
              ? "Already have an account? "
              : "Don't have an account? "}
          </span>
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

export default Login;
