import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <section className="hero">
        <div className="hero-content">
          <p className="small-title">🌾 SMART AGRICULTURE</p>

          <h1>
            Protect Your Crops
            <br />
            With <span>AI Technology</span>
          </h1>

          <p className="hero-text">
            Upload a crop image, identify possible diseases and get useful
            agricultural guidance from one platform.
          </p>

          <div className="hero-buttons">
            <Link to="/scanner" className="primary-btn">
              📷 Scan Your Crop
            </Link>

            <Link to="/crops" className="secondary-btn">
              Explore Crops →
            </Link>
          </div>
        </div>

        <div className="hero-image">
          <div className="plant-circle">
            🌱
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Everything Your Farm Needs</h2>

        <p className="section-text">
          Simple digital tools to help farmers understand and manage their
          crops.
        </p>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">📷</div>
            <h3>AI Crop Scanner</h3>
            <p>
              Upload a crop image and check for possible diseases.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🌱</div>
            <h3>Crop Guide</h3>
            <p>
              Learn about crops, soil, irrigation and cultivation.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🌦️</div>
            <h3>Weather</h3>
            <p>
              Get weather information useful for farming decisions.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👨‍🌾</div>
            <h3>Expert Advice</h3>
            <p>
              Send your farming problem to an agricultural expert.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;