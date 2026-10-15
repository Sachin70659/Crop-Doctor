import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";

function getCropIcon(cropName = "") {
  const name = cropName.toLowerCase();
  if (name.includes("tomato")) return "🍅";
  if (name.includes("rice")) return "🌾";
  if (name.includes("wheat")) return "🌾";
  if (name.includes("potato")) return "🥔";
  if (name.includes("corn") || name.includes("maize")) return "🌽";
  if (name.includes("mustard")) return "🌼";
  return "🌱";
}

function Dashboard() {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("token")));
  const [error, setError] = useState("");

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
    if (!authToken) {
      return;
    }

    let isMounted = true;
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
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [authToken]);

  if (!authToken) {
    return (
      <section className="dashboard">
        <div className="dashboard-header">
          <p>FARMER DASHBOARD</p>
          <h1>Access Your Farm Portal 👨‍🌾</h1>
        </div>

        <div className="dashboard-auth-notice">
          <div className="dashboard-notice-icon">🔐</div>
          <h2>Please Log In</h2>
          <p>
            Log in to view your scan history, disease diagnosis statistics, and
            expert consultations.
          </p>
          <Link to="/login" className="primary-btn" style={{ marginTop: "15px" }}>
            Go to Login
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
    <section className="dashboard">
      <div className="dashboard-header">
        <p>FARMER DASHBOARD</p>
        <h1>Welcome, {currentUser?.name || "Farmer"} 👨‍🌾</h1>
      </div>

      {loading && (
        <div className="dashboard-loading">
          <p>Loading your farm statistics and scan history...</p>
        </div>
      )}

      {error && (
        <div className="dashboard-error">
          <p>{error}</p>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <span>📷</span>
              <h3>Total Scans</h3>
              <strong>{stats.totalScans}</strong>
            </div>

            <div className="dashboard-card">
              <span>✅</span>
              <h3>Completed</h3>
              <strong>{stats.completedScans}</strong>
            </div>

            <div className="dashboard-card">
              <span>🔍</span>
              <h3>Needs Review</h3>
              <strong>{stats.pendingScans}</strong>
            </div>

            <div className="dashboard-card">
              <span>👨‍🔬</span>
              <h3>Expert Inquiries</h3>
              <strong>{stats.expertRequests}</strong>
            </div>
          </div>

          <div className="recent-scans">
            <div className="recent-scans-header">
              <h2>Recent Crop Scans</h2>
              <Link to="/scanner" className="new-scan-link">
                + New Scan
              </Link>
            </div>

            {recentScans.length === 0 ? (
              <div className="empty-scans">
                <p>No crop scans found in your account yet.</p>
                <Link to="/scanner" className="primary-btn" style={{ marginTop: "10px" }}>
                  📷 Run First Crop Diagnosis
                </Link>
              </div>
            ) : (
              recentScans.map((scan) => (
                <div className="scan-row" key={scan._id}>
                  <span>{getCropIcon(scan.crop)}</span>
                  <div>
                    <strong>{scan.crop}</strong>
                    <p>{scan.disease}</p>
                    <small style={{ color: "#8a968e" }}>
                      {scan.createdAt
                        ? new Date(scan.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Recent"}
                    </small>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        fontWeight: "bold",
                        color: scan.confidence >= 60 ? "#218c46" : "#e67e22",
                      }}
                    >
                      {scan.confidence}%
                    </span>
                    <br />
                    <small
                      style={{
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        backgroundColor:
                          scan.status === "completed" ? "#eaf6ea" : "#fef4e8",
                        color:
                          scan.status === "completed" ? "#218c46" : "#d35400",
                      }}
                    >
                      {scan.status === "completed" ? "Completed" : "Review"}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default Dashboard;