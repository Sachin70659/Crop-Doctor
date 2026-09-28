function Weather() {
  return (
    <section className="content-page">
      <div className="page-heading">
        <p>FARM WEATHER</p>
        <h1>Weather Information</h1>
        <span>
          Weather information for agricultural planning.
        </span>
      </div>

      <div className="weather-card">
        <div className="weather-icon">☀️</div>

        <h2>Today's Weather</h2>

        <div className="temperature">
          28°C
        </div>

        <p>Clear Sky</p>

        <div className="weather-details">
          <div>
            <strong>Humidity</strong>
            <span>65%</span>
          </div>

          <div>
            <strong>Wind</strong>
            <span>12 km/h</span>
          </div>

          <div>
            <strong>Rain</strong>
            <span>10%</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Weather;