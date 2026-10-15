import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const navigate = useNavigate();

  // Update login state
  useEffect(() => {
    const updateAuth = () => {
      try {
        setUser(JSON.parse(localStorage.getItem("user")) || null);
      } catch {
        setUser(null);
      }
    };

    window.addEventListener("auth-changed", updateAuth);
    window.addEventListener("storage", updateAuth);

    return () => {
      window.removeEventListener("auth-changed", updateAuth);
      window.removeEventListener("storage", updateAuth);
    };
  }, []);

  // Close menu after navigation
  useEffect(() => {
    setMenuOpen(false);
  }, [navigate]);

  const closeMenu = () => setMenuOpen(false);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    closeMenu();

    window.dispatchEvent(new Event("auth-changed"));
    navigate("/login");
  };

  const navClass = ({ isActive }) =>
    `nav-link ${isActive ? "active" : ""}`;

  const mobileClass = ({ isActive }) =>
    `mobile-nav-link ${isActive ? "active" : ""}`;

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="logo" onClick={closeMenu}>
        🌱 <span>Crop Doctor</span>
      </Link>

      {/* Desktop Menu */}
      <div className="nav-links desktop-menu">
        <NavLink to="/" end className={navClass}>
          Home
        </NavLink>

        <NavLink to="/scanner" className={navClass}>
          Crop Scanner
        </NavLink>

        <NavLink to="/crops" className={navClass}>
          Crops
        </NavLink>

        <NavLink to="/diseases" className={navClass}>
          Diseases
        </NavLink>

        <NavLink to="/weather" className={navClass}>
          Weather
        </NavLink>

        <NavLink to="/expert" className={navClass}>
          Expert
        </NavLink>

        <NavLink to="/shop" className={navClass}>
          Shop
        </NavLink>

        {user && (
          <NavLink to="/dashboard" className={navClass}>
            Dashboard
          </NavLink>
        )}

        {user ? (
          <div className="user-nav-actions">
            <span className="user-nav-name">
              👤 {user.name || "User"}
            </span>

            <button
              type="button"
              className="logout-nav-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        ) : (
          <NavLink to="/login" className="login-btn">
            Login
          </NavLink>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        type="button"
        className="menu-toggle"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <NavLink
          to="/"
          end
          className={mobileClass}
          onClick={closeMenu}
        >
          🏠 Home
        </NavLink>

        <NavLink
          to="/scanner"
          className={mobileClass}
          onClick={closeMenu}
        >
          📷 Crop Scanner
        </NavLink>

        <NavLink
          to="/crops"
          className={mobileClass}
          onClick={closeMenu}
        >
          🌱 Crops
        </NavLink>

        <NavLink
          to="/diseases"
          className={mobileClass}
          onClick={closeMenu}
        >
          🦠 Diseases
        </NavLink>

        <NavLink
          to="/weather"
          className={mobileClass}
          onClick={closeMenu}
        >
          🌦️ Weather
        </NavLink>

        <NavLink
          to="/expert"
          className={mobileClass}
          onClick={closeMenu}
        >
          👨‍🔬 Expert Advice
        </NavLink>

        <NavLink
          to="/shop"
          className={mobileClass}
          onClick={closeMenu}
        >
          🛒 Shop
        </NavLink>

        {user && (
          <NavLink
            to="/dashboard"
            className={mobileClass}
            onClick={closeMenu}
          >
            📊 Dashboard
          </NavLink>
        )}

        {user ? (
          <div className="mobile-user-section">
            <span className="mobile-user-name">
              👤 {user.name || "User"}
            </span>

            <button
              type="button"
              className="mobile-logout-btn"
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          </div>
        ) : (
          <NavLink
            to="/login"
            className="mobile-login"
            onClick={closeMenu}
          >
            🔐 Login
          </NavLink>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
