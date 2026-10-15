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
            Upload a crop image, identify possible plant diseases, check local weather,
            and get verified agricultural guidance all in one platform.
          </p>

          <div className="hero-buttons">
            <Link to="/scanner" className="primary-btn">
              📷 Scan Your Crop
            </Link>

            <Link to="/crops" className="secondary-btn">
              Explore Crop Guide →
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
          Simple digital agronomy tools to help farmers diagnose plant leaf problems and make informed crop decisions.
        </p>

        <div className="feature-grid">
          <Link to="/scanner" className="feature-card">
            <div className="feature-icon">📷</div>
            <h3>AI Crop Scanner</h3>
            <p>
              Upload plant leaf images to detect early or late blight, blast, rust, and other diseases.
            </p>
          </Link>

          <Link to="/crops" className="feature-card">
            <div className="feature-icon">🌱</div>
            <h3>Crop Guide</h3>
            <p>
              Learn about seasonal cultivation, soil compatibility, duration, and best farming practices.
            </p>
          </Link>

          <Link to="/weather" className="feature-card">
            <div className="feature-icon">🌦️</div>
            <h3>Live Farm Weather</h3>
            <p>
              Check humidity, rain probability, wind speeds, and temperatures for timely pesticide & fertilizer application.
            </p>
          </Link>

          <Link to="/expert" className="feature-card">
            <div className="feature-icon">👨‍🌾</div>
            <h3>Expert Advice</h3>
            <p>
              Submit tough field problems and symptoms to agricultural officers for verified guidance.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;