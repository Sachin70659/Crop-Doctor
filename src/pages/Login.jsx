import { Link } from "react-router-dom";

function Login() {
  return (
    <section className="auth-page">
      <div className="login-card">
        <div className="login-logo">
          🌱
        </div>

        <h1>Welcome Back</h1>

        <p>Login to your Crop Doctor account</p>

        <form>
          <input
            type="email"
            placeholder="Email Address"
            required
          />

          <input
            type="password"
            placeholder="Password"
            required
          />

          <button type="submit">
            Login
          </button>
        </form>

        <p className="register-text">
          Don't have an account?
          <Link to="/dashboard"> Create Account</Link>
        </p>
      </div>
    </section>
  );
}

export default Login;