import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const POPULAR_FARMING_REGIONS = [
  "Prayagraj",
  "Punjab",
  "Pune",
  "Patna",
  "Nagpur",
  "Bengaluru"
];

async function fetchLocationAndWeather(place) {
  if (!place || !place.trim()) return null;

  const geoResponse = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      place.trim()
    )}&count=1&language=en&format=json`
  );

  if (!geoResponse.ok) {
    throw new Error("Could not connect to geocoding service.");
  }

  const geoData = await geoResponse.json();
  const location = geoData.results?.[0];

  if (!location) {
    throw new Error(`Location "${place}" was not found. Please try another city or district.`);
  }

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=precipitation_probability&forecast_days=1&timezone=auto`
  );

  if (!response.ok) {
    throw new Error("Weather service unavailable. Please try again.");
  }

  const data = await response.json();

  return {
    ...data,
    locationName: `${location.name}${location.admin1 ? `, ${location.admin1}` : ""}, ${location.country || ""}`,
  };
}

function Weather() {
  const { isHindi, t } = useLanguage();
  const [searchCity, setSearchCity] = useState("Prayagraj");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    async function loadInitial() {
      try {
        setError("");
        const data = await fetchLocationAndWeather("Prayagraj");
        if (!isCancelled && data) {
          setWeather(data);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err.message || (isHindi ? "मौसम डेटा लोड करने में असमर्थ।" : "Unable to load initial weather data."));
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadInitial();

    return () => {
      isCancelled = true;
    };
  }, [isHindi]);

  const handleQuery = async (place) => {
    if (!place || !place.trim()) return;

    setLoading(true);
    setError("");

    try {
      const data = await fetchLocationAndWeather(place);
      if (data) {
        setWeather(data);
      }
    } catch (err) {
      setError(err.message || (isHindi ? "मौसम जानकारी उपलब्ध नहीं है।" : "Unable to load weather."));
    } finally {
      setLoading(false);
    }
  };

  const weatherDescription = (code) => {
    if (code === 0) return isHindi ? "साफ़ आसमान (Clear Sky)" : "Clear Sky";
    if ([1, 2, 3].includes(code)) return isHindi ? "आंशिक रूप से बादल (Partly Cloudy)" : "Partly Cloudy";
    if ([45, 48].includes(code)) return isHindi ? "कोहरा / धुंध (Foggy)" : "Foggy / Mist";
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code))
      return isHindi ? "बारिश / फुहारें (Rain / Showers)" : "Rain / Showers";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return isHindi ? "बर्फबारी (Snow)" : "Snow";
    if ([95, 96, 99].includes(code)) return isHindi ? "आंधी व बिजली (Thunderstorm)" : "Thunderstorm";
    return isHindi ? "सामान्य मौसम" : "Current Conditions";
  };

  const current = weather?.current;
  const hourly = weather?.hourly;
  const rainIndex = hourly?.time?.findIndex(
    (time) => current?.time && time.slice(0, 13) === current.time.slice(0, 13)
  );
  const rainProbability =
    rainIndex !== undefined && rainIndex >= 0
      ? hourly?.precipitation_probability?.[rainIndex]
      : null;

  return (
    <section className="content-page">
      <div className="page-heading">
        <p>{t("weather.badge", "LIVE FARM WEATHER")}</p>
        <h1>{t("weather.title", "Weather Information")}</h1>
        <span>
          {t("weather.subtitle", "Check current atmospheric conditions and rain probabilities for better irrigation and farm planning.")}
        </span>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleQuery(searchCity);
        }}
        className="weather-search-form"
      >
        <input
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
          placeholder={isHindi ? "शहर या जिले का नाम लिखें (उदा. प्रयागराज, पुणे, पटना)..." : "Enter city or district name (e.g. Prayagraj, Pune, Patna)"}
          className="weather-input"
        />

        <button
          type="submit"
          disabled={loading}
          className="weather-search-btn"
        >
          {loading ? (isHindi ? "खोज जारी..." : "Searching...") : (isHindi ? "मौसम देखें" : "Check Weather")}
        </button>
      </form>

      <div className="weather-quick-chips">
        <span className="chips-label">{isHindi ? "त्वरित चयन:" : "Quick check:"}</span>
        {POPULAR_FARMING_REGIONS.map((region) => (
          <button
            key={region}
            type="button"
            className={`quick-chip-btn ${searchCity === region ? "active" : ""}`}
            onClick={() => {
              setSearchCity(region);
              handleQuery(region);
            }}
          >
            📍 {region}
          </button>
        ))}
      </div>

      {loading && (
        <p className="weather-status-text">
          {isHindi ? "स्थानीय मौसम डेटा प्राप्त किया जा रहा है..." : "Fetching current meteorological data..."}
        </p>
      )}

      {error && (
        <div className="weather-error" role="alert">
          ⚠️ {error}
        </div>
      )}

      {current && !loading && (
        <div className="weather-card">
          <div className="weather-icon">
            {current.weather_code === 0 ? "☀️" : current.weather_code > 50 ? "🌧️" : "⛅"}
          </div>

          <h2>{weather.locationName}</h2>
          <h3>{weatherDescription(current.weather_code)}</h3>

          <div className="temperature">
            {Math.round(current.temperature_2m)}°C
          </div>

          <div className="weather-details">
            <div>
              <strong>{isHindi ? "महसूस तापमान" : "Feels Like"}</strong>
              <span>{Math.round(current.apparent_temperature)}°C</span>
            </div>

            <div>
              <strong>{isHindi ? "हवा में नमी (आर्द्रता)" : "Humidity"}</strong>
              <span>{current.relative_humidity_2m}%</span>
            </div>

            <div>
              <strong>{isHindi ? "हवा की गति" : "Wind Speed"}</strong>
              <span>{current.wind_speed_10m} km/h</span>
            </div>

            <div>
              <strong>{isHindi ? "वर्षा" : "Precipitation"}</strong>
              <span>{current.precipitation} mm</span>
            </div>

            <div>
              <strong>{isHindi ? "बारिश की संभावना" : "Rain Probability"}</strong>
              <span>
                {rainProbability == null ? "0%" : `${rainProbability}%`}
              </span>
            </div>

            <div>
              <strong>{isHindi ? "मौसम कोड" : "Condition Code"}</strong>
              <span>WMO #{current.weather_code}</span>
            </div>
          </div>

          <p className="weather-disclaimer">
            {isHindi
              ? "मौसम डेटा Open-Meteo द्वारा संचालित है। खेत में कीटनाशक छिड़काव से पहले हमेशा स्थानीय वायुमंडलीय परिस्थितियों की पुष्टि करें।"
              : "Weather data is powered by Open-Meteo. Conditions can shift rapidly; always verify local atmospheric signs before pesticide or fertilizer application."}
          </p>
        </div>
      )}
    </section>
  );
}

export default Weather;
