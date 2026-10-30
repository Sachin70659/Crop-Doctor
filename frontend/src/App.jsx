import { Routes, Route, Navigate, Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Scanner from "./pages/Scanner";
import Crops from "./pages/Crops";
import Diseases from "./pages/Diseases";
import Weather from "./pages/Weather";
import Expert from "./pages/Expert";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Shop from "./pages/Shop";
import Admin from "./pages/Admin";

/**
 * Route guard that strictly restricts /admin access to users with role === 'admin'.
 */
function AdminRoute({ children }) {
  const { user, token, loading } = useAuth();

  if (loading && !token) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px" }}>
        <div style={{ fontSize: "36px", marginBottom: "16px" }}>⏳</div>
        <h3>Checking administrative access...</h3>
      </div>
    );
  }

  if (!token && !user) {
    return <Navigate to="/login" replace />;
  }

  if (user && user.role !== "admin") {
    return (
      <section className="admin-portal-page" style={{ padding: "80px 20px", display: "flex", justifyContent: "center" }}>
        <div
          className="admin-access-denied-card"
          style={{
            maxWidth: "540px",
            textAlign: "center",
            padding: "45px 32px",
            background: "#ffffff",
            borderRadius: "20px",
            border: "1px solid #fed7aa",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)"
          }}
        >
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>🛡️🚫</div>
          <span style={{ fontSize: "11px", fontWeight: "800", letterSpacing: "0.08em", color: "#c2410c", textTransform: "uppercase" }}>
            Restricted Admin Area
          </span>
          <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#0f2e1b", margin: "10px 0 14px" }}>
            Administrator Privileges Required
          </h2>
          <p style={{ color: "#64748b", lineHeight: "1.6", fontSize: "14.5px", marginBottom: "26px" }}>
            You are signed in as <strong>{user.name || user.email}</strong> with a standard <strong>Normal User</strong> role. The Admin Portal is reserved for administrators to manage users, site crops, scans, and consultations.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              to="/dashboard"
              style={{
                background: "#15803d",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "12px",
                fontWeight: "700",
                textDecoration: "none"
              }}
            >
              Go to Farmer Dashboard
            </Link>
            <Link
              to="/"
              style={{
                background: "#f1f5f9",
                color: "#334155",
                padding: "12px 24px",
                borderRadius: "12px",
                fontWeight: "700",
                textDecoration: "none"
              }}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return children;
}

function App() {
  return (
    <>
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/crops" element={<Crops />} />
          <Route path="/diseases" element={<Diseases />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/expert" element={<Expert />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/shop" element={<Shop />} />

          {/* Protected Admin Portal */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />

          {/* 404 Page */}
          <Route
            path="*"
            element={
              <div className="p-10 text-center" style={{ padding: "80px 20px" }}>
                <h1 style={{ fontSize: "32px", fontWeight: "800", color: "#15803d" }}>
                  404 - Page Not Found
                </h1>
                <p style={{ marginTop: "8px", color: "#64748b" }}>
                  The page you are looking for does not exist.
                </p>
                <a
                  href="/"
                  style={{
                    display: "inline-block",
                    marginTop: "16px",
                    color: "#15803d",
                    fontWeight: "700",
                    textDecoration: "underline"
                  }}
                >
                  ← Back to Home
                </a>
              </div>
            }
          />
        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default App;
