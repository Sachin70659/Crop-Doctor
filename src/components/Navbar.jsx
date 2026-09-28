import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
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

        <NavLink to="/login" className="login-btn">
          Login
        </NavLink>
      </div>

      {/* Mobile Menu Button */}
      <button
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

        <NavLink to="/dashboard" onClick={closeMenu}>
          📊 Dashboard
        </NavLink>

        <NavLink to="/login" onClick={closeMenu} className="mobile-login">
          🔐 Login
        </NavLink>
      </div>
    </nav>
  );
}

export default Navbar;

