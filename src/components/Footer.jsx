import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div>
        <h2>🌱 Crop Doctor</h2>
        <p>
          Smart agriculture assistance for healthy crops and better farming.
        </p>
      </div>

      <div>
        <h3>Quick Links</h3>
        <p><Link to="/scanner">📷 Crop Scanner</Link></p>
        <p><Link to="/crops">🌱 Crop Guide</Link></p>
        <p><Link to="/diseases">🦠 Plant Diseases</Link></p>
        <p><Link to="/weather">🌦️ Weather</Link></p>
        <p><Link to="/expert">👨‍🌾 Expert Advice</Link></p>
      </div>

      <div>
        <h3>Contact</h3>
        <p>Email: cropdocto7800@gmail.com</p>
        <p>Phone: +91 7065942905</p>
        <p>Prayagraj Up.</p>
        <p>India</p>
      </div>

      <div className="copyright">
        © 2026 Crop Doctor. All Rights Reserved.
      </div>
    </footer>
  );
}

export default Footer;