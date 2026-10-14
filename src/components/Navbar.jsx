import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const navigate = useNavigate();

  useEffect(() => {
    const updateAuth = () => {
      try {
        const stored = localStorage.getItem("user");
        setUser(stored ? JSON.parse(stored) : null);
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

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("auth-changed"));
    closeMenu();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="logo" onClick={closeMenu}>
        🌱 <span>Crop Doctor</span>
      </Link>

      {/* Desktop Menu */}
      <div className="nav-links desktop-menu">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/scanner">Crop Scanner</NavLink>
        <NavLink to="/crops">Crops</NavLink>
        <NavLink to="/diseases">Diseases</NavLink>
        <NavLink to="/weather">Weather</NavLink>
        <NavLink to="/expert">Expert</NavLink>
        {user && <NavLink to="/dashboard">Dashboard</NavLink>}

        {user ? (
          <div className="user-nav-actions">
            <span className="user-nav-name" title={user.email}>
              👤 {user.name}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="logout-nav-btn"
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
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <NavLink to="/" onClick={closeMenu}>
          🏠 Home
        </NavLink>

        <NavLink to="/scanner" onClick={closeMenu}>
          📷 Crop Scanner
        </NavLink>

        <NavLink to="/crops" onClick={closeMenu}>
          🌱 Crops
        </NavLink>

        <NavLink to="/diseases" onClick={closeMenu}>
          🦠 Diseases
        </NavLink>

        <NavLink to="/weather" onClick={closeMenu}>
          🌦️ Weather
        </NavLink>

        <NavLink to="/expert" onClick={closeMenu}>
          👨‍🔬 Expert Advice
        </NavLink>

        {user && (
          <NavLink to="/dashboard" onClick={closeMenu}>
            📊 Dashboard
          </NavLink>
        )}

        {user ? (
          <div className="mobile-user-section">
            <span className="mobile-user-name">👤 {user.name}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="mobile-logout-btn"
            >
              🚪 Logout
            </button>
          </div>
        ) : (
          <NavLink to="/login" onClick={closeMenu} className="mobile-login">
            🔐 Login
          </NavLink>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
