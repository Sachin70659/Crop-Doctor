import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

function getCropIcon(cropName = "") {
  const name = (cropName || "").toLowerCase();
  if (name.includes("mango") || name.includes("aam")) return "🥭";
  if (name.includes("tomato") || name.includes("tamatar")) return "🍅";
  if (name.includes("rice") || name.includes("paddy") || name.includes("dhan")) return "🌾";
  if (name.includes("wheat") || name.includes("gehun")) return "🌾";
  if (name.includes("potato") || name.includes("aaloo")) return "🥔";
  if (name.includes("corn") || name.includes("maize") || name.includes("makka")) return "🌽";
  if (name.includes("mustard") || name.includes("sarson")) return "🌼";
  if (name.includes("chilli") || name.includes("mirch")) return "🌶️";
  if (name.includes("cotton") || name.includes("kapas")) return "🪴";
  if (name.includes("banana") || name.includes("kela")) return "🍌";
  return "🌱";
}

function Dashboard() {
  const { user: authUser, token: contextToken, loading: authLoading } = useAuth();
  const { isHindi, t } = useLanguage();

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
          setError(err.message || (isHindi ? "डैशबोर्ड डेटा लोड करने में असमर्थ।" : "Failed to load dashboard data."));
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
  }, [authToken, contextToken, isHindi]);

  const activeToken = authToken || contextToken || localStorage.getItem("token");

  // While Firebase is authenticating initial session
  if (authLoading && !activeToken) {
    return (
      <section className="dashboard" style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏳</div>
        <h2>{isHindi ? "किसान पोर्टल लोड हो रहा है..." : "Loading your farm portal..."}</h2>
        <p style={{ color: "#64748b", marginTop: "8px" }}>
          {isHindi ? "प्रमाणीकरण की पुष्टि की जा रही है, कृपया प्रतीक्षा करें।" : "Verifying credentials, please wait a moment."}
        </p>
      </section>
    );
  }

  // If user is truly not logged in
  if (!activeToken) {
    return (
      <section className="dashboard">
        <div className="page-heading">
          <p>{t("dashboard.badge", "FARMER DASHBOARD")}</p>
          <h1>{isHindi ? "किसान पोर्टल में प्रवेश करें 👨‍🌾" : "Access Your Farm Portal 👨‍🌾"}</h1>
          <span>
            {isHindi
              ? "अपनी फसलों के रोग स्कैन इतिहास, निदान और कृषि विशेषज्ञ की सलाह देखने के लिए लॉगिन करें।"
              : "Log in with your farmer account to view your AI crop scan history, disease diagnostics, and expert advice."}
          </span>
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
          <h2 style={{ color: "#0f2e1b", marginBottom: "8px" }}>
            {isHindi ? "लॉगिन आवश्यक है" : "Farmer Authentication Required"}
          </h2>
          <p style={{ color: "#475569", lineHeight: "1.6", marginBottom: "24px" }}>
            {isHindi
              ? "यह पोर्टल किसानों और कृषि उपयोगकर्ताओं के लिए है। आगे बढ़ने के लिए कृपया लॉगिन करें।"
              : "This portal is for registered farmers and users to monitor plant health analytics. Sign in or create a free account to continue."}
          </p>
          <Link to="/login" className="btn-primary-hero" style={{ display: "inline-flex" }}>
            {isHindi ? "किसान खाते में लॉगिन करें →" : "Sign In to Farm Account →"}
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
        <p>{isHindi ? "व्यक्तिगत कृषि विश्लेषण" : "PERSONAL FARMING ANALYTICS"}</p>
        <h1 style={{ fontSize: "32px", fontWeight: "800" }}>
          {isHindi ? `स्वागत है, ${currentUser?.name || "किसान मित्र"} 👨‍🌾` : `Welcome, ${currentUser?.name || "Farmer"} 👨‍🌾`}
        </h1>
        <span style={{ margin: "0" }}>
          {isHindi
            ? "आपके खेत के पत्ती स्कैन, रोग निदान और कृषि वैज्ञानिक परामर्श का संपूर्ण विवरण।"
            : "Real-time overview of your field scans, pathological detections, and agronomist consultations."}
        </span>
      </div>

      {dataLoading && (
        <div style={{ textAlign: "center", padding: "40px", background: "#ffffff", borderRadius: "14px", border: "1px solid #e2ede5" }}>
          <p style={{ fontWeight: "600", color: "#15803d" }}>
            {isHindi ? "नवीनतम फसल डेटा लोड हो रहा है..." : "Loading your latest farm diagnostics..."}
          </p>
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
            {isHindi ? "पुनः प्रयास करें" : "Retry"}
          </button>
        </div>
      )}

      {!dataLoading && (
        <>
          {/* Metrics Row */}
          <div className="dashboard-metrics-row">
            <div className="metric-stat-box">
              <span style={{ fontSize: "24px", display: "block", marginBottom: "8px" }}>📷</span>
              <p className="metric-stat-title">{isHindi ? "कुल पत्ती स्कैन" : "Total Leaf Scans"}</p>
              <h3 className="metric-stat-count">{stats.totalScans}</h3>
            </div>

            <div className="metric-stat-box">
              <span style={{ fontSize: "24px", display: "block", marginBottom: "8px" }}>✅</span>
              <p className="metric-stat-title">{isHindi ? "प्रमाणित निदान" : "Verified Diagnoses"}</p>
              <h3 className="metric-stat-count" style={{ color: "#15803d" }}>{stats.completedScans}</h3>
            </div>

            <div className="metric-stat-box">
              <span style={{ fontSize: "24px", display: "block", marginBottom: "8px" }}>🔍</span>
              <p className="metric-stat-title">{isHindi ? "समीक्षा लंबित" : "Needs Review"}</p>
              <h3 className="metric-stat-count" style={{ color: "#d97706" }}>{stats.pendingScans}</h3>
            </div>

            <div className="metric-stat-box">
              <span style={{ fontSize: "24px", display: "block", marginBottom: "8px" }}>👨‍🔬</span>
              <p className="metric-stat-title">{isHindi ? "विशेषज्ञ परामर्श" : "Agronomist Consults"}</p>
              <h3 className="metric-stat-count" style={{ color: "#0284c7" }}>{stats.expertRequests}</h3>
            </div>
          </div>

          {/* Quick Actions Row */}
          <div style={{ display: "flex", gap: "14px", marginBottom: "35px", flexWrap: "wrap" }}>
            <Link to="/scanner" className="btn-primary-hero" style={{ padding: "12px 24px", fontSize: "14px" }}>
              📷 {isHindi ? "नई फसल जांचें" : "New AI Crop Scan"}
            </Link>
            <Link to="/expert" className="btn-secondary-hero" style={{ padding: "12px 24px", fontSize: "14px" }}>
              👨‍🌾 {isHindi ? "कृषि विशेषज्ञ से पूछें" : "Ask Farm Expert"}
            </Link>
            <Link to="/weather" className="btn-secondary-hero" style={{ padding: "12px 24px", fontSize: "14px" }}>
              🌦️ {isHindi ? "खेत का मौसम देखें" : "Check Farm Weather"}
            </Link>
          </div>

          {/* Recent Scans Table */}
          <div className="scans-table-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f2e1b" }}>
                {isHindi ? "हालिया फसल रोग निदान रिकॉर्ड" : "Recent Crop Leaf Diagnostics"}
              </h2>
              <span style={{ fontSize: "13px", color: "#64748b" }}>
                {isHindi ? `पिछले ${recentScans.length} रिकॉर्ड` : `Showing last ${recentScans.length} records`}
              </span>
            </div>

            {recentScans.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <span style={{ fontSize: "40px", display: "block", marginBottom: "10px" }}>🌿</span>
                <h3 style={{ fontSize: "16px", color: "#1e293b", marginBottom: "6px" }}>
                  {isHindi ? "अभी तक कोई स्कैन दर्ज नहीं है" : "No crop scans recorded yet"}
                </h3>
                <p style={{ color: "#64748b", fontSize: "13.5px", marginBottom: "16px" }}>
                  {isHindi
                    ? "रोगग्रस्त या स्वस्थ पौधे की पत्ती की फोटो लें और एआई द्वारा विस्तृत जांच परिणाम देखें।"
                    : "Take a photo of any diseased or healthy plant leaf to see full pathological breakdown."}
                </p>
                <Link to="/scanner" className="btn-primary-hero" style={{ display: "inline-flex", padding: "10px 20px", fontSize: "13.5px" }}>
                  {isHindi ? "पहला स्कैन शुरू करें →" : "Start First Scan →"}
                </Link>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e2ede5", color: "#64748b", fontSize: "12px", textTransform: "uppercase" }}>
                      <th style={{ padding: "12px 14px" }}>{isHindi ? "फसल" : "Crop"}</th>
                      <th style={{ padding: "12px 14px" }}>{isHindi ? "निदान / रोग" : "Diagnosis"}</th>
                      <th style={{ padding: "12px 14px" }}>{isHindi ? "गंभीरता" : "Severity"}</th>
                      <th style={{ padding: "12px 14px" }}>{isHindi ? "सटीकता" : "Confidence"}</th>
                      <th style={{ padding: "12px 14px" }}>{isHindi ? "इंजन" : "Engine"}</th>
                      <th style={{ padding: "12px 14px" }}>{isHindi ? "तारीख" : "Date"}</th>
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
