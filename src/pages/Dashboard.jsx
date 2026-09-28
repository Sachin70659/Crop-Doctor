function Dashboard() {
  return (
    <section className="dashboard">
      <div className="dashboard-header">
        <p>FARMER DASHBOARD</p>
        <h1>Welcome, Farmer 👨‍🌾</h1>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <span>📷</span>
          <h3>Crop Scans</h3>
          <strong>12</strong>
        </div>

        <div className="dashboard-card">
          <span>🌱</span>
          <h3>My Crops</h3>
          <strong>5</strong>
        </div>

        <div className="dashboard-card">
          <span>👨‍🔬</span>
          <h3>Expert Requests</h3>
          <strong>3</strong>
        </div>

        <div className="dashboard-card">
          <span>📋</span>
          <h3>Reports</h3>
          <strong>8</strong>
        </div>
      </div>

      <div className="recent-scans">
        <h2>Recent Crop Scans</h2>

        <div className="scan-row">
          <span>🍅</span>
          <div>
            <strong>Tomato</strong>
            <p>Early Blight</p>
          </div>
          <span>92%</span>
        </div>

        <div className="scan-row">
          <span>🌾</span>
          <div>
            <strong>Rice</strong>
            <p>Leaf Blast</p>
          </div>
          <span>88%</span>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;