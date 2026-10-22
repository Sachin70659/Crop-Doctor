import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const navigate = useNavigate();

  // Scroll detection for enhanced glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update auth state on login/logout
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

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [navigate]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

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
    <>
      <header className={`navbar-header ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-container">
          {/* Brand Logo */}
          <Link to="/" className="brand-logo" onClick={closeMenu}>
            <div className="brand-icon-wrapper">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
                <path d="M12 12v10" />
              </svg>
            </div>
            <div className="brand-text">
              <span className="brand-title">Crop<span className="brand-accent">Doctor</span></span>
              <span className="brand-tagline">AI Plant Health</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="desktop-nav">
            <NavLink to="/" end className={navClass}>
              Home
            </NavLink>
            <NavLink to="/scanner" className={navClass}>
              <span className="nav-badge-pill">AI</span>
              Scanner
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
          </nav>

          {/* User Actions */}
          <div className="desktop-actions">
            {user ? (
              <div className="user-profile-menu">
                <Link to="/dashboard" className="user-avatar-btn" title="View Dashboard">
                  <span className="user-avatar-initials">
                    {(user.name || user.email || "U").charAt(0).toUpperCase()}
                  </span>
                  <span className="user-display-name">{user.name?.split(" ")[0] || "Farmer"}</span>
                </Link>
                <button
                  type="button"
                  className="nav-btn-logout"
                  onClick={handleLogout}
                  title="Sign out"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </div>
            ) : (
              <Link to="/login" className="nav-btn-login">
                <span>Sign In</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>

          {/* Hamburger Mobile Toggle */}
          <button
            type="button"
            className={`mobile-toggle-btn ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "Close menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      <div
        className={`mobile-drawer-overlay ${menuOpen ? "open" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Mobile Drawer Panel */}
      <aside className={`mobile-drawer ${menuOpen ? "open" : ""}`}>
        <div className="mobile-drawer-header">
          <div className="brand-logo">
            <div className="brand-icon-wrapper">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
              </svg>
            </div>
            <span className="brand-title">Crop<span className="brand-accent">Doctor</span></span>
          </div>
          <button
            type="button"
            className="mobile-close-btn"
            onClick={closeMenu}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="mobile-nav-links">
          <NavLink to="/" end className={mobileClass} onClick={closeMenu}>
            <span className="mobile-icon">🏠</span>
            <span>Home</span>
          </NavLink>
          <NavLink to="/scanner" className={mobileClass} onClick={closeMenu}>
            <span className="mobile-icon">📷</span>
            <span>AI Crop Scanner</span>
            <span className="mobile-badge-new">AI</span>
          </NavLink>
          <NavLink to="/crops" className={mobileClass} onClick={closeMenu}>
            <span className="mobile-icon">🌱</span>
            <span>Crop Encyclopedia</span>
          </NavLink>
          <NavLink to="/diseases" className={mobileClass} onClick={closeMenu}>
            <span className="mobile-icon">🦠</span>
            <span>Plant Diseases</span>
          </NavLink>
          <NavLink to="/weather" className={mobileClass} onClick={closeMenu}>
            <span className="mobile-icon">🌦️</span>
            <span>Farm Weather</span>
          </NavLink>
          <NavLink to="/expert" className={mobileClass} onClick={closeMenu}>
            <span className="mobile-icon">👨‍🌾</span>
            <span>Expert Agronomist</span>
          </NavLink>
          <NavLink to="/shop" className={mobileClass} onClick={closeMenu}>
            <span className="mobile-icon">🛒</span>
            <span>Farm Care Shop</span>
          </NavLink>
          {user && (
            <NavLink to="/dashboard" className={mobileClass} onClick={closeMenu}>
              <span className="mobile-icon">📊</span>
              <span>Farmer Dashboard</span>
            </NavLink>
          )}
        </nav>

        <div className="mobile-drawer-footer">
          {user ? (
            <div className="mobile-user-card">
              <div className="mobile-user-info">
                <span className="user-avatar-initials">
                  {(user.name || user.email || "U").charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="mobile-user-name">{user.name || "Farmer"}</p>
                  <p className="mobile-user-email">{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                className="mobile-logout-action-btn"
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link to="/login" className="mobile-login-action-btn" onClick={closeMenu}>
              Sign In to Your Farm Account
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}

export default Navbar;
