import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer-wrapper">
      <div className="footer-top-container">
        {/* Col 1: Brand Info */}
        <div className="footer-col brand-col">
          <Link to="/" className="footer-brand-logo">
            <div className="brand-icon-wrapper">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
                <path d="M12 12v10" />
              </svg>
            </div>
            <span className="brand-title">Crop<span className="brand-accent">Doctor</span></span>
          </Link>
          <p className="footer-brand-bio">
            Empowering Indian cultivators with real-time AI computer vision plant diagnostics, weather-guided spraying windows, and agricultural extension advice.
          </p>
          <div className="system-status-indicator">
            <span className="status-dot"></span>
            <span className="status-text">Gemini Vision AI Engine: Operational</span>
          </div>
        </div>

        {/* Col 2: Agricultural Tools */}
        <div className="footer-col">
          <h4 className="footer-heading">Diagnostic Tools</h4>
          <ul className="footer-links-list">
            <li><Link to="/scanner">📷 AI Crop Scanner</Link></li>
            <li><Link to="/crops">🌱 Crop Encyclopedia</Link></li>
            <li><Link to="/diseases">🦠 Plant Diseases Library</Link></li>
            <li><Link to="/weather">🌦️ Live Farm Weather</Link></li>
            <li><Link to="/expert">👨‍🌾 Expert Agronomist</Link></li>
            <li><Link to="/shop">🛒 Farm Care Store</Link></li>
          </ul>
        </div>

        {/* Col 3: Common Diagnoses */}
        <div className="footer-col">
          <h4 className="footer-heading">Common Diagnoses</h4>
          <ul className="footer-links-list">
            <li><Link to="/diseases">Early & Late Blight</Link></li>
            <li><Link to="/diseases">Rice Leaf Blast</Link></li>
            <li><Link to="/diseases">Powdery Mildew</Link></li>
            <li><Link to="/diseases">Wheat Stripe Rust</Link></li>
            <li><Link to="/diseases">Maize Common Rust</Link></li>
            <li><Link to="/diseases">Bacterial Wilt Protocols</Link></li>
          </ul>
        </div>

        {/* Col 4: Contact & Support */}
        <div className="footer-col">
          <h4 className="footer-heading">Support & Outreach</h4>
          <div className="footer-contact-items">
            <div className="contact-item">
              <span className="contact-icon">📧</span>
              <div>
                <span className="contact-sub">Email Support</span>
                <a href="mailto:cropdocto7800@gmail.com" className="contact-val">cropdocto7800@gmail.com</a>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <div>
                <span className="contact-sub">Farmer Helpline</span>
                <a href="tel:+917065942905" className="contact-val">+91 7065942905</a>
              </div>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <div>
                <span className="contact-sub">Headquarters</span>
                <span className="contact-val">Prayagraj, Uttar Pradesh, India</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="footer-bottom-bar">
        <p className="copyright-text">
          © {new Date().getFullYear()} Crop Doctor. Dedicated to smallholder farmer prosperity.
        </p>
        <div className="footer-legal-links">
          <span>Privacy Policy</span>
          <span>•</span>
          <span>Agronomic Disclaimer</span>
          <span>•</span>
          <span>Terms of Service</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
