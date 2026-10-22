import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext";

function getCropIcon(cropName = "") {
  const name = (cropName || "").toLowerCase();
  if (name.includes("mango") || name.includes("aam")) return "🥭";
  if (name.includes("tomato")) return "🍅";
  if (name.includes("rice") || name.includes("paddy")) return "🌾";
  if (name.includes("wheat")) return "🌾";
  if (name.includes("potato")) return "🥔";
  if (name.includes("corn") || name.includes("maize")) return "🌽";
  if (name.includes("mustard")) return "🌼";
  if (name.includes("chilli")) return "🌶️";
  if (name.includes("cotton")) return "🪴";
  if (name.includes("banana")) return "🍌";
  return "🌱";
}

function Dashboard() {
  const { user: authUser, token: contextToken, loading: authLoading } = useAuth();

  const [authToken, setAuthToken] = useState(() => contextToken || localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(() => {
    if (authUser) return authUser;
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  const [data, setData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  // Sync state if context changes or storage events fire
  useEffect(() => {
    const handleAuthChange = () => {
      const t = localStorage.getItem("token");
      setAuthToken(t);
      try {
        const u = localStorage.getItem("user");
        setCurrentUser(u ? JSON.parse(u) : null);
      } catch {
        setCurrentUser(null);
      }
    };

    window.addEventListener("auth-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("auth-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  useEffect(() => {
    if (contextToken) {
      setAuthToken(contextToken);
    }
    if (authUser) {
      setCurrentUser(authUser);
    }
  }, [contextToken, authUser]);

  // Load Dashboard Data
  useEffect(() => {
    const activeToken = authToken || contextToken || localStorage.getItem("token");
    if (!activeToken) {
      setDataLoading(false);
      return;
    }

    let isMounted = true;
    setDataLoading(true);

    async function loadDashboard() {
      try {
        setError("");
        const res = await apiRequest("/api/dashboard");
        if (isMounted) {
          setData(res);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to load dashboard data.");
        }
      } finally {
        if (isMounted) {
          setDataLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [authToken, contextToken]);

  const activeToken = authToken || contextToken || localStorage.getItem("token");

  // While Firebase is authenticating initial session
  if (authLoading && !activeToken) {
    return (
      <section className="dashboard" style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏳</div>
        <h2>Loading your farm portal...</h2>
        <p style={{ color: "#64748b", marginTop: "8px" }}>Verifying credentials, please wait a moment.</p>
      </section>
    );
  }

  // If user is truly not logged in
  if (!activeToken) {
    return (
      <section className="dashboard">
        <div className="page-heading">
          <p>FARMER DASHBOARD</p>
          <h1>Access Your Farm Portal 👨‍🌾</h1>
          <span>Log in with your farmer account to view your AI crop scan history, disease diagnostics, and expert advice.</span>
        </div>

        <div className="dashboard-auth-notice" style={{
          maxWidth: "500px",
          margin: "0 auto",
          background: "#ffffff",
          borderRadius: "18px",
          border: "1px solid #bbf7d0",
          padding: "40px 30px",
          textAlign: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.04)"
        }}>
          <div style={{ fontSize: "50px", marginBottom: "14px" }}>🔐</div>
          <h2 style={{ color: "#0f2e1b", marginBottom: "8px" }}>Farmer Authentication Required</h2>
          <p style={{ color: "#475569", lineHeight: "1.6", marginBottom: "24px" }}>
            This portal is for registered farmers and users to monitor plant health analytics. Sign in or create a free account to continue.
          </p>
          <Link to="/login" className="btn-primary-hero" style={{ display: "inline-flex" }}>
            Sign In to Farm Account →
          </Link>
        </div>
      </section>
    );
  }

  const stats = data?.stats || {
    totalScans: 0,
    pendingScans: 0,
    completedScans: 0,
    expertRequests: 0,
  };

  const recentScans = data?.recentScans || [];

  return (
    <section className="dashboard" style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px 80px" }}>
      <div className="page-heading" style={{ textAlign: "left", marginBottom: "35px" }}>
        <p>PERSONAL FARMING ANALYTICS</p>
        <h1 style={{ fontSize: "32px", fontWeight: "800" }}>Welcome, {currentUser?.name || "Farmer"} 👨‍🌾</h1>
        <span style={{ margin: "0" }}>Real-time overview of your field scans, pathological detections, and agronomist consultations.</span>
      </div>

      {/* Admin Privilege Banner if user has admin role */}
      {currentUser?.role === "admin" && (
        <div
          style={{
            background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
            border: "1px solid #fde68a",
            borderRadius: "16px",
            padding: "20px 24px",
            marginBottom: "30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            boxShadow: "0 4px 16px rgba(217, 119, 6, 0.08)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ fontSize: "32px" }}>🛡️</div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <strong style={{ fontSize: "16px", color: "#92400e" }}>Administrator Account</strong>
                <span style={{ fontSize: "11px", background: "#f59e0b", color: "#ffffff", padding: "2px 8px", borderRadius: "10px", fontWeight: "800" }}>
                  ADMIN ROLE
                </span>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "13.5px", color: "#78350f" }}>
                You have system administrator access to manage users, crop catalog, farm scans, and consultations.
              </p>
            </div>
          </div>
          <Link
            to="/admin"
            style={{
              background: "#b45309",
              color: "#ffffff",
              padding: "10px 20px",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "13.5px",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 2px 8px rgba(180, 83, 9, 0.25)"
            }}
          >
            <span>Open Admin Portal</span>
            <span>→</span>
          </Link>
        </div>
      )}

      {dataLoading && (
        <div style={{ textAlign: "center", padding: "40px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2ede5" }}>
          <p style={{ fontWeight: "600", color: "#15803d" }}>Loading your latest farm diagnostics...</p>
        </div>
      )}

      {error && !dataLoading && (
        <div className="error-banner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>⚠️ {error}</span>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ fontWeight: "700", textDecoration: "underline", color: "inherit", cursor: "pointer" }}
          >
            Retry
          </button>
        </div>
      )}

      {!dataLoading && (
        <>
          {/* Metrics Row */}
          <div className="dashboard-metrics-row">
            <div className="metric-stat-box">
              <span style={{ fontSize: "24px", display: "block", marginBottom: "8px" }}>📷</span>
              <p className="metric-stat-title">Total Leaf Scans</p>
              <h3 className="metric-stat-count">{stats.totalScans}</h3>
            </div>

            <div className="metric-stat-box">
              <span style={{ fontSize: "24px", display: "block", marginBottom: "8px" }}>✅</span>
              <p className="metric-stat-title">Verified Diagnoses</p>
              <h3 className="metric-stat-count" style={{ color: "#15803d" }}>{stats.completedScans}</h3>
            </div>

            <div className="metric-stat-box">
              <span style={{ fontSize: "24px", display: "block", marginBottom: "8px" }}>🔍</span>
              <p className="metric-stat-title">Needs Review</p>
              <h3 className="metric-stat-count" style={{ color: "#d97706" }}>{stats.pendingScans}</h3>
            </div>

            <div className="metric-stat-box">
              <span style={{ fontSize: "24px", display: "block", marginBottom: "8px" }}>👨‍🔬</span>
              <p className="metric-stat-title">Agronomist Consults</p>
              <h3 className="metric-stat-count" style={{ color: "#0284c7" }}>{stats.expertRequests}</h3>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div style={{ display: "flex", gap: "14px", marginBottom: "35px", flexWrap: "wrap" }}>
            <Link to="/scanner" className="btn-primary-hero" style={{ padding: "12px 24px", fontSize: "14px" }}>
              📷 New AI Crop Scan
            </Link>
            <Link to="/expert" className="btn-secondary-hero" style={{ padding: "12px 24px", fontSize: "14px" }}>
              👨‍🌾 Ask Farm Expert
            </Link>
            <Link to="/weather" className="btn-secondary-hero" style={{ padding: "12px 24px", fontSize: "14px" }}>
              🌦️ Check Farm Weather
            </Link>
          </div>

          {/* Recent Scans Table */}
          <div className="scans-table-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f2e1b" }}>Recent Crop Leaf Diagnostics</h2>
              <span style={{ fontSize: "13px", color: "#64748b" }}>Showing last {recentScans.length} records</span>
            </div>

            {recentScans.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <span style={{ fontSize: "40px", display: "block", marginBottom: "10px" }}>🌿</span>
                <h3 style={{ fontSize: "16px", color: "#1e293b", marginBottom: "6px" }}>No crop scans recorded yet</h3>
                <p style={{ color: "#64748b", fontSize: "13.5px", marginBottom: "16px" }}>
                  Take a photo of any diseased or healthy plant leaf to see full pathological breakdown.
                </p>
                <Link to="/scanner" className="btn-primary-hero" style={{ display: "inline-flex", padding: "10px 20px", fontSize: "13.5px" }}>
                  Start First Scan →
                </Link>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e2ede5", color: "#64748b", fontSize: "12px", textTransform: "uppercase" }}>
                      <th style={{ padding: "12px 14px" }}>Crop</th>
                      <th style={{ padding: "12px 14px" }}>Diagnosis</th>
                      <th style={{ padding: "12px 14px" }}>Severity</th>
                      <th style={{ padding: "12px 14px" }}>Confidence</th>
                      <th style={{ padding: "12px 14px" }}>Engine</th>
                      <th style={{ padding: "12px 14px" }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentScans.map((scan) => (
                      <tr key={scan._id} style={{ borderBottom: "1px solid #f1f5f2" }}>
                        <td style={{ padding: "14px", fontWeight: "700", color: "#0f2e1b" }}>
                          <span style={{ marginRight: "8px", fontSize: "16px" }}>{getCropIcon(scan.crop)}</span>
                          {scan.crop}
                        </td>
                        <td style={{ padding: "14px", color: "#1e293b", fontWeight: "600" }}>
                          {scan.disease}
                        </td>
                        <td style={{ padding: "14px" }}>
                          <span className={`severity-badge severity-${(scan.severity || "moderate").toLowerCase()}`}>
                            {scan.severity || "Moderate"}
                          </span>
                        </td>
                        <td style={{ padding: "14px" }}>
                          <span className={`confidence-badge ${(scan.confidence || 0) >= 60 ? "high" : "low"}`}>
                            {scan.confidence || 70}%
                          </span>
                        </td>
                        <td style={{ padding: "14px", color: "#64748b", fontSize: "12px" }}>
                          {scan.aiProvider || "AI Vision"}
                        </td>
                        <td style={{ padding: "14px", color: "#64748b", fontSize: "12px" }}>
                          {new Date(scan.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default Dashboard;
