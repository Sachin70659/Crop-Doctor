import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("overview"); // overview | users | scans | consultations | crops
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [scans, setScans] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [crops, setCrops] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Search & Filter States
  const [userSearch, setUserSearch] = useState("");
  const [scanFilterCrop, setScanFilterCrop] = useState("all");
  const [consultationFilter, setConsultationFilter] = useState("all");
  const [userRoleFilter, setUserRoleFilter] = useState("all"); // all | user | admin

  // Modals & Active Edit states
  const [selectedScanModal, setSelectedScanModal] = useState(null);
  const [selectedImageModal, setSelectedImageModal] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [cropForm, setCropForm] = useState({
    name: "",
    icon: "🌱",
    season: "Kharif & Rabi",
    soil: "Well-drained loam",
    duration: "90-120 days",
    description: ""
  });

  // Reply Drafts for Consultations
  const [replies, setReplies] = useState({});

  const token = localStorage.getItem("token");
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  })();

  // ── Load All Data ─────────────────────────────────────────────
  const loadData = async (isRefresh = false) => {
    if (!token || (currentUser && currentUser.role !== "admin")) {
      setLoading(false);
      return;
    }

    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const [statsData, usersData, scansData, consultData, cropsData] = await Promise.all([
        apiRequest("/api/admin/stats").catch(() => null),
        apiRequest("/api/admin/users").catch(() => ({ users: [] })),
        apiRequest("/api/admin/scans").catch(() => ({ scans: [] })),
        apiRequest("/api/admin/consultations").catch(() => ({ consultations: [] })),
        apiRequest("/api/admin/crops").catch(() => ({ crops: [] }))
      ]);

      if (statsData) setStats(statsData);
      if (usersData?.users) setUsers(usersData.users);
      if (scansData?.scans) setScans(scansData.scans);
      if (consultData?.consultations) setConsultations(consultData.consultations);
      if (cropsData?.crops) setCrops(cropsData.crops);

      // Initialize reply state
      if (consultData?.consultations) {
        const initReplies = {};
        consultData.consultations.forEach((c) => {
          initReplies[c._id] = c.reply || "";
        });
        setReplies(initReplies);
      }
    } catch (err) {
      setError(err.message || "Failed to load admin data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  // Flash toast notification
  const notify = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // ── User & Role Management Handlers ──────────────────────────
  const handleToggleRole = async (userId, currentRole, userName) => {
    const isSelf = currentUser && (currentUser._id === userId || currentUser.id === userId);
    const newRole = currentRole === "admin" ? "user" : "admin";

    if (isSelf && newRole !== "admin") {
      alert("You cannot remove your own administrator status.");
      return;
    }

    const actionText = newRole === "admin" ? "promote to Administrator" : "demote to Normal User";
    if (!window.confirm(`Are you sure you want to ${actionText} "${userName}"?`)) {
      return;
    }

    try {
      await apiRequest(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole })
      });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      notify(`Role updated: "${userName}" is now ${newRole === "admin" ? "an Administrator" : "a Normal User"}.`);
    } catch (err) {
      setError("Could not update role: " + err.message);
    }
  };

  const handleDeleteUser = async (id, name) => {
    const isSelf = currentUser && (currentUser._id === id || currentUser.id === id);
    if (isSelf) {
      alert("You cannot delete your own active administrator account.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user "${name}"? All their scan records will also be erased.`)) {
      return;
    }

    try {
      await apiRequest(`/api/admin/users/${id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u._id !== id));
      notify(`User "${name}" removed successfully.`);
      loadData(true);
    } catch (err) {
      setError("Could not delete user: " + err.message);
    }
  };

  // ── Scan Management Handlers ──────────────────────────────────
  const handleDeleteScan = async (id, crop) => {
    if (!window.confirm(`Delete scan record for "${crop}"?`)) return;

    try {
      await apiRequest(`/api/admin/scans/${id}`, { method: "DELETE" });
      setScans((prev) => prev.filter((s) => s._id !== id));
      notify("Scan record deleted.");
      if (selectedScanModal?._id === id) setSelectedScanModal(null);
    } catch (err) {
      setError("Could not delete scan: " + err.message);
    }
  };

  // ── Consultation Handlers ─────────────────────────────────────
  const handleUpdateConsultation = async (id, status) => {
    try {
      const reply = replies[id] || "";
      const res = await apiRequest(`/api/admin/consultations/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, reply })
      });

      setConsultations((prev) =>
        prev.map((c) => (c._id === id ? res.consultation : c))
      );
      notify("Consultation updated with agronomic solution!");
    } catch (err) {
      setError("Could not update consultation: " + err.message);
    }
  };

  const handleDeleteConsultation = async (id) => {
    if (!window.confirm("Delete this farmer consultation query?")) return;

    try {
      await apiRequest(`/api/admin/consultations/${id}`, { method: "DELETE" });
      setConsultations((prev) => prev.filter((c) => c._id !== id));
      notify("Consultation deleted.");
    } catch (err) {
      setError("Could not delete consultation: " + err.message);
    }
  };

  // ── Crop Management Handlers ──────────────────────────────────
  const handleSaveCrop = async (e) => {
    e.preventDefault();
    if (!cropForm.name.trim()) {
      alert("Crop name is required.");
      return;
    }

    try {
      if (editingCrop) {
        const res = await apiRequest(`/api/admin/crops/${editingCrop._id}`, {
          method: "PUT",
          body: JSON.stringify(cropForm)
        });
        setCrops((prev) =>
          prev.map((c) => (c._id === editingCrop._id ? res.crop : c))
        );
        notify(`Crop "${res.crop.name}" updated successfully.`);
      } else {
        const res = await apiRequest("/api/admin/crops", {
          method: "POST",
          body: JSON.stringify(cropForm)
        });
        setCrops((prev) => [...prev, res.crop]);
        notify(`Crop "${res.crop.name}" added to catalog.`);
      }
      setCropModalOpen(false);
      setEditingCrop(null);
      setCropForm({
        name: "",
        icon: "🌱",
        season: "Kharif & Rabi",
        soil: "Well-drained loam",
        duration: "90-120 days",
        description: ""
      });
    } catch (err) {
      setError("Could not save crop: " + err.message);
    }
  };

  const handleDeleteCrop = async (id, name) => {
    if (!window.confirm(`Delete "${name}" from the crop catalog?`)) return;

    try {
      await apiRequest(`/api/admin/crops/${id}`, { method: "DELETE" });
      setCrops((prev) => prev.filter((c) => c._id !== id));
      notify(`Crop "${name}" removed.`);
    } catch (err) {
      setError("Could not delete crop: " + err.message);
    }
  };

  const openEditCrop = (crop) => {
    setEditingCrop(crop);
    setCropForm({
      name: crop.name || "",
      icon: crop.icon || "🌱",
      season: crop.season || "",
      soil: crop.soil || "",
      duration: crop.duration || "",
      description: crop.description || ""
    });
    setCropModalOpen(true);
  };

  // ── Filter Computations ───────────────────────────────────────
  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q));

    const role = u.role === "admin" ? "admin" : "user";
    const matchesRole =
      userRoleFilter === "all" ||
      (userRoleFilter === "admin" && role === "admin") ||
      (userRoleFilter === "user" && role === "user");

    return matchesSearch && matchesRole;
  });

  const filteredScans = scans.filter((s) => {
    if (scanFilterCrop === "all") return true;
    return s.crop?.toLowerCase() === scanFilterCrop.toLowerCase();
  });

  const filteredConsultations = consultations.filter((c) => {
    if (consultationFilter === "all") return true;
    return c.status === consultationFilter;
  });

  // Unique crops in scans for filter dropdown
  const uniqueScanCrops = Array.from(new Set(scans.map((s) => s.crop).filter(Boolean)));

  // If not logged in or not admin
  if (!token) {
    return (
      <section className="admin-portal-page">
        <div className="admin-access-denied-card">
          <div className="denied-icon">🔐</div>
          <h2>Admin Authentication Required</h2>
          <p>Please log in with an administrator account to view farmer statistics and manage system data.</p>
          <Link to="/login" className="admin-login-btn">
            Go to Login
          </Link>
        </div>
      </section>
    );
  }

  if (currentUser && currentUser.role !== "admin") {
    return (
      <section className="admin-portal-page">
        <div className="admin-access-denied-card">
          <div className="denied-icon">🛡️🚫</div>
          <h2>Administrator Privileges Required</h2>
          <p>Your current session is signed in with a Normal User (Farmer) account. Administrative controls and user management are restricted to platform administrators.</p>
          <Link to="/dashboard" className="admin-login-btn" style={{ background: "#15803d" }}>
            Return to Farmer Dashboard
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-portal-page">
      {/* ── HEADER BANNER ────────────────────────────────────────── */}
      <div className="admin-header-row">
        <div>
          <div className="admin-badge-tag">
            <span className="dot-live"></span> CROP DOCTOR CONTROL CENTER
          </div>
          <h1>Admin Management Portal 👨‍🌾</h1>
          <p>
            Real-time farm intelligence, farmer records, AI diagnostic history, and agronomic consultation management.
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="admin-refresh-btn"
            onClick={() => loadData(true)}
            disabled={refreshing}
            title="Refresh database records"
          >
            {refreshing ? "🔄 Refreshing..." : "🔄 Refresh Data"}
          </button>
          <div className="admin-current-user-tag">
            <span>Admin: <strong>{currentUser?.name || "Administrator"}</strong></span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="admin-success-banner" role="alert">
          ✅ {successMsg}
        </div>
      )}
      {error && (
        <div className="admin-error-banner" role="alert">
          ⚠️ {error}
        </div>
      )}

      {/* ── NAVIGATION TABS ──────────────────────────────────────── */}
      <div className="admin-nav-tabs">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 System Overview
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👨‍🌾 Farmers ({users.length})
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "scans" ? "active" : ""}`}
          onClick={() => setActiveTab("scans")}
        >
          🔬 All Scans ({scans.length})
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "consultations" ? "active" : ""}`}
          onClick={() => setActiveTab("consultations")}
        >
          💬 Consultations ({consultations.length})
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === "crops" ? "active" : ""}`}
          onClick={() => setActiveTab("crops")}
        >
          🌱 Crop Catalog ({crops.length})
        </button>
      </div>

      {loading ? (
        <div className="admin-loading-state">
          <div className="admin-spinner"></div>
          <p>Fetching real-time data from MongoDB Atlas...</p>
        </div>
      ) : (
        <>
          {/* ========================================================= */}
          {/* TAB 1: SYSTEM OVERVIEW                                    */}
          {/* ========================================================= */}
          {activeTab === "overview" && (
            <div className="admin-tab-content">
              {/* Metric Cards Row */}
              <div className="admin-metrics-grid">
                <div className="admin-metric-card">
                  <div className="metric-icon-box bg-green">👨‍🌾</div>
                  <div className="metric-details">
                    <span className="metric-number">{stats?.totalUsers ?? users.length}</span>
                    <span className="metric-label">Registered Farmers</span>
                  </div>
                </div>

                <div className="admin-metric-card">
                  <div className="metric-icon-box bg-blue">🔬</div>
                  <div className="metric-details">
                    <span className="metric-number">{stats?.totalScans ?? scans.length}</span>
                    <span className="metric-label">Leaf Diagnoses Run</span>
                  </div>
                </div>

                <div className="admin-metric-card">
                  <div className="metric-icon-box bg-amber">💬</div>
                  <div className="metric-details">
                    <span className="metric-number">{stats?.totalConsultations ?? consultations.length}</span>
                    <span className="metric-label">Farmer Consultations</span>
                  </div>
                </div>

                <div className="admin-metric-card">
                  <div className="metric-icon-box bg-purple">🌾</div>
                  <div className="metric-details">
                    <span className="metric-number">{stats?.totalCrops ?? crops.length}</span>
                    <span className="metric-label">Crops in Catalog</span>
                  </div>
                </div>
              </div>

              {/* System Diagnostics & Breakdown */}
              <div className="admin-overview-columns">
                {/* Left: Top Diagnosed Crops */}
                <div className="admin-card">
                  <div className="admin-card-header">
                    <h3>🌱 Top Crops Diagnosed by Farmers</h3>
                    <span className="badge-pill">Live Scans</span>
                  </div>
                  {stats?.cropStats && stats.cropStats.length > 0 ? (
                    <div className="admin-bar-list">
                      {stats.cropStats.map((item) => (
                        <div key={item._id} className="bar-item">
                          <div className="bar-info">
                            <strong>{item._id || "Unknown"}</strong>
                            <span>{item.count} scans</span>
                          </div>
                          <div className="bar-track">
                            <div
                              className="bar-fill"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (item.count / (stats.totalScans || 1)) * 100
                                )}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="empty-subtext">No crop diagnosis records yet.</p>
                  )}
                </div>

                {/* Right: System & AI Engine Status */}
                <div className="admin-card">
                  <div className="admin-card-header">
                    <h3>⚡ Diagnostic Engine & Infrastructure</h3>
                    <span className="badge-pill green">Operational</span>
                  </div>
                  <ul className="admin-system-status-list">
                    <li>
                      <span className="status-label">Database Engine:</span>
                      <strong className="status-value green">MongoDB Atlas (Connected)</strong>
                    </li>
                    <li>
                      <span className="status-label">Authentication:</span>
                      <strong className="status-value green">Firebase Google Auth + JWT</strong>
                    </li>
                    <li>
                      <span className="status-label">Vision AI Provider:</span>
                      <strong className="status-value">Gemini 1.5 Vision / Smart Engine</strong>
                    </li>
                    <li>
                      <span className="status-label">Active Host:</span>
                      <strong className="status-value">Vercel Serverless Edge</strong>
                    </li>
                  </ul>

                  <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                    <button
                      type="button"
                      className="admin-btn-secondary"
                      onClick={() => setActiveTab("scans")}
                    >
                      Inspect Latest Scans →
                    </button>
                    <button
                      type="button"
                      className="admin-btn-secondary"
                      onClick={() => setActiveTab("consultations")}
                    >
                      Answer Farmer Queries →
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Scans Table Preview */}
              <div className="admin-card" style={{ marginTop: "24px" }}>
                <div className="admin-card-header">
                  <h3>⏱️ Latest Leaf Scans Across All Farms</h3>
                  <button
                    type="button"
                    className="admin-text-link"
                    onClick={() => setActiveTab("scans")}
                  >
                    View All {scans.length} Scans →
                  </button>
                </div>

                <div className="admin-table-responsive">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Photo</th>
                        <th>Farmer</th>
                        <th>Crop</th>
                        <th>Diagnosis</th>
                        <th>Severity</th>
                        <th>Confidence</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scans.slice(0, 6).map((scan) => (
                        <tr key={scan._id}>
                          <td>
                            {scan.imageUrl ? (
                              <img
                                src={scan.imageUrl}
                                alt={scan.crop}
                                className="table-thumb-img"
                                onClick={() => setSelectedImageModal(scan.imageUrl)}
                                title="Click to view photo full size"
                              />
                            ) : (
                              <div className="table-thumb-placeholder">🌿</div>
                            )}
                          </td>
                          <td>
                            <strong>{scan.user?.name || "Farmer"}</strong>
                            <div className="subtext">{scan.user?.email || "—"}</div>
                          </td>
                          <td><strong>{scan.crop}</strong></td>
                          <td>{scan.disease}</td>
                          <td>
                            <span className={`badge-severity ${scan.severity?.toLowerCase() || "moderate"}`}>
                              {scan.severity || "Moderate"}
                            </span>
                          </td>
                          <td><strong>{scan.confidence || 0}%</strong></td>
                          <td>{new Date(scan.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button
                              type="button"
                              className="table-btn view"
                              onClick={() => setSelectedScanModal(scan)}
                            >
                              Report
                            </button>
                          </td>
                        </tr>
                      ))}
                      {scans.length === 0 && (
                        <tr>
                          <td colSpan="8" className="table-empty">
                            No scans performed yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: FARMERS & USERS                                    */}
          {/* ========================================================= */}
          {activeTab === "users" && (
            <div className="admin-tab-content">
              <div className="admin-toolbar-row">
                <div className="admin-search-box">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search farmers by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                  {userSearch && (
                    <button
                      type="button"
                      className="clear-search-btn"
                      onClick={() => setUserSearch("")}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => setUserRoleFilter("all")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "700",
                      border: "1px solid #e2e8f0",
                      cursor: "pointer",
                      background: userRoleFilter === "all" ? "#15803d" : "#ffffff",
                      color: userRoleFilter === "all" ? "#ffffff" : "#475569"
                    }}
                  >
                    All Users ({users.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRoleFilter("user")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "700",
                      border: "1px solid #e2e8f0",
                      cursor: "pointer",
                      background: userRoleFilter === "user" ? "#15803d" : "#ffffff",
                      color: userRoleFilter === "user" ? "#ffffff" : "#475569"
                    }}
                  >
                    Normal Users ({users.filter((u) => u.role !== "admin").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserRoleFilter("admin")}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: "700",
                      border: "1px solid #e2e8f0",
                      cursor: "pointer",
                      background: userRoleFilter === "admin" ? "#d97706" : "#ffffff",
                      color: userRoleFilter === "admin" ? "#ffffff" : "#475569"
                    }}
                  >
                    Admins ({users.filter((u) => u.role === "admin").length})
                  </button>
                </div>

                <div className="toolbar-stats">
                  Showing <strong>{filteredUsers.length}</strong> of {users.length} users
                </div>
              </div>

              <div className="admin-card">
                <div className="admin-table-responsive">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>User Details</th>
                        <th>Email Address</th>
                        <th>Platform Role</th>
                        <th>Joined On</th>
                        <th>Scans Run</th>
                        <th>Queries</th>
                        <th>Role Management</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u._id}>
                          <td>
                            <div className="user-table-cell">
                              <div className="user-table-avatar">
                                {(u.name || u.email || "F").charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <strong>{u.name || "Farmer"}</strong>
                                <div className="subtext">ID: {u._id.slice(-6)}</div>
                              </div>
                            </div>
                          </td>
                          <td>{u.email}</td>
                          <td>
                            <span className={`badge-role ${u.role === "admin" ? "admin" : "farmer"}`}>
                              {u.role === "admin" ? "🛡️ Admin" : "👤 Normal User"}
                            </span>
                          </td>
                          <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span className="badge-count green">{u.scansCount || 0} scans</span>
                          </td>
                          <td>
                            <span className="badge-count amber">{u.queriesCount || 0} queries</span>
                          </td>
                          <td>
                            {currentUser && (currentUser._id === u._id || currentUser.id === u._id) ? (
                              <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "700" }}>
                                Active Admin (You)
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="table-btn"
                                style={{
                                  background: u.role === "admin" ? "#f1f5f9" : "#fef3c7",
                                  color: u.role === "admin" ? "#334155" : "#92400e",
                                  border: `1px solid ${u.role === "admin" ? "#cbd5e1" : "#fde68a"}`
                                }}
                                onClick={() => handleToggleRole(u._id, u.role, u.name)}
                                title={u.role === "admin" ? "Demote to Normal User" : "Promote to Administrator"}
                              >
                                {u.role === "admin" ? "Demote to User 👤" : "Make Admin 🛡️"}
                              </button>
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="table-btn delete"
                              disabled={currentUser && (currentUser._id === u._id || currentUser.id === u._id)}
                              onClick={() => handleDeleteUser(u._id, u.name)}
                              title={currentUser && (currentUser._id === u._id || currentUser.id === u._id) ? "You cannot delete your own account" : "Delete user and all related data"}
                              style={currentUser && (currentUser._id === u._id || currentUser.id === u._id) ? { opacity: 0.4, cursor: "not-allowed" } : {}}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan="8" className="table-empty">
                            No farmers match &quot;{userSearch}&quot;.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: ALL CROP SCANS                                     */}
          {/* ========================================================= */}
          {activeTab === "scans" && (
            <div className="admin-tab-content">
              <div className="admin-toolbar-row">
                <div className="filter-group">
                  <label htmlFor="cropFilter">Filter by Crop:</label>
                  <select
                    id="cropFilter"
                    value={scanFilterCrop}
                    onChange={(e) => setScanFilterCrop(e.target.value)}
                  >
                    <option value="all">All Crops ({scans.length})</option>
                    {uniqueScanCrops.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="toolbar-stats">
                  Showing <strong>{filteredScans.length}</strong> diagnoses
                </div>
              </div>

              <div className="admin-card">
                <div className="admin-table-responsive">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Leaf Photo</th>
                        <th>Farmer</th>
                        <th>Crop Plant</th>
                        <th>Detected Pathology</th>
                        <th>Severity</th>
                        <th>AI Confidence</th>
                        <th>Scanned At</th>
                        <th>Manage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredScans.map((scan) => (
                        <tr key={scan._id}>
                          <td>
                            {scan.imageUrl ? (
                              <img
                                src={scan.imageUrl}
                                alt={scan.crop}
                                className="table-thumb-img"
                                onClick={() => setSelectedImageModal(scan.imageUrl)}
                                title="Click to view full photo"
                              />
                            ) : (
                              <div className="table-thumb-placeholder">🌿</div>
                            )}
                          </td>
                          <td>
                            <strong>{scan.user?.name || "Farmer"}</strong>
                            <div className="subtext">{scan.user?.email || "—"}</div>
                          </td>
                          <td>
                            <strong style={{ color: "#15803d" }}>{scan.crop}</strong>
                          </td>
                          <td>
                            <strong>{scan.disease}</strong>
                          </td>
                          <td>
                            <span className={`badge-severity ${scan.severity?.toLowerCase() || "moderate"}`}>
                              {scan.severity || "Moderate"}
                            </span>
                          </td>
                          <td>
                            <div className="table-confidence-bar">
                              <span>{scan.confidence || 0}%</span>
                              <div className="bar-bg">
                                <div
                                  className="bar-progress"
                                  style={{ width: `${scan.confidence || 0}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td>{new Date(scan.createdAt).toLocaleString()}</td>
                          <td>
                            <div className="table-action-group">
                              <button
                                type="button"
                                className="table-btn view"
                                onClick={() => setSelectedScanModal(scan)}
                              >
                                View Report
                              </button>
                              <button
                                type="button"
                                className="table-btn delete"
                                onClick={() => handleDeleteScan(scan._id, scan.crop)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredScans.length === 0 && (
                        <tr>
                          <td colSpan="8" className="table-empty">
                            No scan records match filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: FARMER CONSULTATIONS                               */}
          {/* ========================================================= */}
          {activeTab === "consultations" && (
            <div className="admin-tab-content">
              <div className="admin-toolbar-row">
                <div className="filter-group">
                  <label htmlFor="consultFilter">Status Filter:</label>
                  <select
                    id="consultFilter"
                    value={consultationFilter}
                    onChange={(e) => setConsultationFilter(e.target.value)}
                  >
                    <option value="all">All Inquiries ({consultations.length})</option>
                    <option value="pending">Pending Review</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div className="toolbar-stats">
                  Showing <strong>{filteredConsultations.length}</strong> inquiries
                </div>
              </div>

              <div className="admin-consultations-list">
                {filteredConsultations.map((item) => (
                  <div key={item._id} className="admin-consult-card">
                    <div className="consult-header">
                      <div className="consult-farmer-info">
                        <span className="farmer-badge-icon">👨‍🌾</span>
                        <div>
                          <h4>{item.name || item.user?.name || "Farmer"}</h4>
                          <span className="subtext">{item.user?.email || "Direct Inquiry"}</span>
                        </div>
                      </div>

                      <div className="consult-meta-tags">
                        <span className="crop-tag">🌱 Crop: <strong>{item.crop}</strong></span>
                        <select
                          className={`status-select ${item.status}`}
                          value={item.status}
                          onChange={(e) => handleUpdateConsultation(item._id, e.target.value)}
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="in_progress">🔄 In Progress</option>
                          <option value="resolved">✅ Resolved</option>
                        </select>
                      </div>
                    </div>

                    <div className="consult-problem-box">
                      <strong>Farmer&apos;s Field Problem:</strong>
                      <p>{item.problem}</p>
                      <span className="consult-date">
                        Submitted: {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {/* Admin Agronomic Solution / Reply */}
                    <div className="consult-reply-section">
                      <label htmlFor={`reply-${item._id}`}>
                        <strong>💊 Agronomic Advice / Prescription:</strong>
                      </label>
                      <textarea
                        id={`reply-${item._id}`}
                        rows="3"
                        placeholder="Type chemical / organic treatment instructions or advice for this farmer..."
                        value={replies[item._id] ?? ""}
                        onChange={(e) =>
                          setReplies({ ...replies, [item._id]: e.target.value })
                        }
                      />
                      <div className="consult-actions-row">
                        <button
                          type="button"
                          className="admin-btn-primary"
                          onClick={() => handleUpdateConsultation(item._id, "resolved")}
                        >
                          💾 Save &amp; Mark Resolved
                        </button>
                        <button
                          type="button"
                          className="table-btn delete"
                          onClick={() => handleDeleteConsultation(item._id)}
                        >
                          Delete Query
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredConsultations.length === 0 && (
                  <div className="admin-card text-center p-8">
                    <p className="empty-subtext">No consultations match this filter.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: CROP CATALOG MANAGEMENT                            */}
          {/* ========================================================= */}
          {activeTab === "crops" && (
            <div className="admin-tab-content">
              <div className="admin-toolbar-row">
                <div>
                  <h3>System Crop Profiles</h3>
                  <p className="subtext">Manage crops recognized by Crop Doctor knowledge base.</p>
                </div>

                <button
                  type="button"
                  className="admin-btn-primary"
                  onClick={() => {
                    setEditingCrop(null);
                    setCropForm({
                      name: "",
                      icon: "🌱",
                      season: "Kharif & Rabi",
                      soil: "Well-drained loam",
                      duration: "90-120 days",
                      description: ""
                    });
                    setCropModalOpen(true);
                  }}
                >
                  ➕ Add New Crop
                </button>
              </div>

              <div className="admin-crops-grid">
                {crops.map((crop) => (
                  <div key={crop._id} className="admin-crop-card">
                    <div className="crop-card-top">
                      <span className="crop-avatar-emoji">{crop.icon || "🌱"}</span>
                      <div className="crop-card-actions">
                        <button
                          type="button"
                          className="action-icon-btn"
                          onClick={() => openEditCrop(crop)}
                          title="Edit crop details"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className="action-icon-btn danger"
                          onClick={() => handleDeleteCrop(crop._id, crop.name)}
                          title="Delete crop"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <h4 className="crop-card-title">{crop.name}</h4>
                    <div className="crop-card-meta">
                      <span><strong>Season:</strong> {crop.season || "All seasons"}</span>
                      <span><strong>Soil:</strong> {crop.soil || "Standard"}</span>
                      <span><strong>Duration:</strong> {crop.duration || "—"}</span>
                    </div>

                    {crop.description && (
                      <p className="crop-card-desc">{crop.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── MODAL 1: FULL DIAGNOSTIC REPORT MODAL ────────────────── */}
      {selectedScanModal && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setSelectedScanModal(null)}
        >
          <div
            className="admin-modal-card large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3>Diagnostic Report: {selectedScanModal.crop}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedScanModal(null)}
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              {selectedScanModal.imageUrl && (
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <img
                    src={selectedScanModal.imageUrl}
                    alt={selectedScanModal.crop}
                    style={{
                      maxHeight: "220px",
                      borderRadius: "12px",
                      border: "1px solid #bbf7d0",
                      objectFit: "cover"
                    }}
                  />
                </div>
              )}

              <div className="report-summary-box">
                <div>
                  <span className="report-label">Disease / Pathology:</span>
                  <h4 style={{ color: "#15803d", fontSize: "18px" }}>
                    {selectedScanModal.disease}
                  </h4>
                </div>
                <div>
                  <span className="report-label">Severity:</span>
                  <span className={`badge-severity ${selectedScanModal.severity?.toLowerCase()}`}>
                    {selectedScanModal.severity}
                  </span>
                </div>
                <div>
                  <span className="report-label">AI Confidence:</span>
                  <strong>{selectedScanModal.confidence}% Match</strong>
                </div>
              </div>

              {selectedScanModal.note && (
                <div className="report-section">
                  <strong>📌 Expert Agronomic Note:</strong>
                  <p>{selectedScanModal.note}</p>
                </div>
              )}

              {selectedScanModal.treatment?.length > 0 && (
                <div className="report-section treatment">
                  <strong>💊 Prescribed Treatment Protocols:</strong>
                  <ul>
                    {selectedScanModal.treatment.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedScanModal.precautions?.length > 0 && (
                <div className="report-section precautions">
                  <strong>⚠️ Immediate Field Precautions:</strong>
                  <ul>
                    {selectedScanModal.precautions.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="report-footer-meta">
                <span>Farmer: {selectedScanModal.user?.name} ({selectedScanModal.user?.email})</span>
                <span>Date: {new Date(selectedScanModal.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setSelectedScanModal(null)}
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: FULL IMAGE PREVIEW MODAL ────────────────────── */}
      {selectedImageModal && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setSelectedImageModal(null)}
        >
          <div
            className="admin-modal-card image-preview"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3>Leaf Photo Preview</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedImageModal(null)}
              >
                ✕
              </button>
            </div>
            <div className="admin-modal-body" style={{ textAlign: "center", padding: "16px" }}>
              <img
                src={selectedImageModal}
                alt="Full size crop leaf"
                style={{
                  maxWidth: "100%",
                  maxHeight: "75vh",
                  borderRadius: "10px",
                  objectFit: "contain"
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: ADD / EDIT CROP MODAL ───────────────────────── */}
      {cropModalOpen && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setCropModalOpen(false)}
        >
          <div
            className="admin-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3>{editingCrop ? `Edit Crop: ${editingCrop.name}` : "Add New Crop"}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setCropModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCrop}>
              <div className="admin-modal-body form-grid">
                <div className="form-field">
                  <label htmlFor="cropName">Crop Name *</label>
                  <input
                    id="cropName"
                    type="text"
                    required
                    placeholder="e.g. Mango, Mustard, Guava..."
                    value={cropForm.name}
                    onChange={(e) => setCropForm({ ...cropForm, name: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="cropIcon">Icon / Emoji</label>
                  <input
                    id="cropIcon"
                    type="text"
                    placeholder="e.g. 🥭, 🌾, 🍅"
                    value={cropForm.icon}
                    onChange={(e) => setCropForm({ ...cropForm, icon: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="cropSeason">Sowing Season</label>
                  <input
                    id="cropSeason"
                    type="text"
                    placeholder="e.g. Kharif (June-Oct), Rabi..."
                    value={cropForm.season}
                    onChange={(e) => setCropForm({ ...cropForm, season: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="cropSoil">Soil Type</label>
                  <input
                    id="cropSoil"
                    type="text"
                    placeholder="e.g. Well-drained loamy, Alluvial..."
                    value={cropForm.soil}
                    onChange={(e) => setCropForm({ ...cropForm, soil: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="cropDuration">Crop Duration</label>
                  <input
                    id="cropDuration"
                    type="text"
                    placeholder="e.g. 110-130 days"
                    value={cropForm.duration}
                    onChange={(e) => setCropForm({ ...cropForm, duration: e.target.value })}
                  />
                </div>

                <div className="form-field full-width">
                  <label htmlFor="cropDesc">Agronomic Description</label>
                  <textarea
                    id="cropDesc"
                    rows="3"
                    placeholder="Brief details about optimal growth conditions..."
                    value={cropForm.description}
                    onChange={(e) => setCropForm({ ...cropForm, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setCropModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn-primary">
                  {editingCrop ? "Update Crop" : "Save Crop"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
