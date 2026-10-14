import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";

const FALLBACK_CROPS = [
  {
    name: "Wheat",
    season: "Rabi",
    icon: "🌾",
    description: "A major cool-season cereal crop essential for flour and food security worldwide.",
    soil: "Well-drained loamy to clay loam soil (pH 6.0 - 7.5)",
    duration: "110 - 140 days",
    tips: "Ensure timely sowing in November; requires 4-6 irrigations at crown root initiation and flowering."
  },
  {
    name: "Rice",
    season: "Kharif",
    icon: "🌾",
    description: "A staple cereal grain requiring warm temperatures and abundant water management.",
    soil: "Clayey or heavy loamy soil with high moisture retention (pH 5.5 - 6.5)",
    duration: "105 - 150 days",
    tips: "Puddle fields thoroughly before transplanting 20-25 day old seedlings; maintain shallow water depth."
  },
  {
    name: "Tomato",
    season: "Multiple",
    icon: "🍅",
    description: "A versatile, high-value solanaceous fruit vegetable grown across multiple seasons.",
    soil: "Deep, well-drained fertile loamy soil rich in organic matter (pH 6.0 - 7.0)",
    duration: "70 - 90 days after transplanting",
    tips: "Stake plants to keep fruits off the ground; avoid wetting leaves to prevent fungal leaf blights."
  },
  {
    name: "Potato",
    season: "Rabi",
    icon: "🥔",
    description: "A high-yielding tuber crop grown in cool conditions with loose friable soil.",
    soil: "Loose, well-aerated sandy loam with good drainage (pH 5.2 - 6.4)",
    duration: "90 - 120 days",
    tips: "Perform earthing-up around 30 days after sowing to protect growing tubers from sunlight."
  },
  {
    name: "Maize",
    season: "Kharif",
    icon: "🌽",
    description: "A multipurpose warm-season cereal crop used for human food, fodder, and starch.",
    soil: "Fertile, well-drained loamy soil (pH 6.5 - 7.5)",
    duration: "85 - 110 days",
    tips: "Sensitive to waterlogging; ensure proper field drainage and balanced nitrogen application."
  },
  {
    name: "Mustard",
    season: "Rabi",
    icon: "🌼",
    description: "A prominent winter oilseed crop requiring dry and cool growing conditions.",
    soil: "Sandy loam to light loam soil with good drainage (pH 6.0 - 7.5)",
    duration: "105 - 130 days",
    tips: "Requires light irrigation during flowering and pod development; watch out for aphids in warm spells."
  }
];

function Crops() {
  const [cropList, setCropList] = useState(FALLBACK_CROPS);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("All");

  useEffect(() => {
    let isMounted = true;
    async function loadCrops() {
      try {
        const data = await apiRequest("/api/crops");
        if (isMounted && Array.isArray(data) && data.length > 0) {
          // Merge with detailed tips from fallback if database entries don't have them yet
          const merged = data.map((item) => {
            const fallback = FALLBACK_CROPS.find(
              (f) => f.name.toLowerCase() === item.name.toLowerCase()
            );
            return {
              ...fallback,
              ...item,
            };
          });
          setCropList(merged);
        }
      } catch {
        // Retain fallback list on offline or server startup delay
      }
    }

    loadCrops();
    return () => {
      isMounted = false;
    };
  }, []);

  const seasons = ["All", "Rabi", "Kharif", "Multiple"];

  const filteredCrops = cropList.filter((crop) => {
    const matchesSearch =
      crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (crop.description && crop.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSeason =
      selectedSeason === "All" || crop.season?.toLowerCase() === selectedSeason.toLowerCase();
    return matchesSearch && matchesSeason;
  });

  return (
    <section className="content-page">
      <div className="page-heading">
        <p>CROP REPOSITORY & AGRONOMY</p>
        <h1>Crop Guide & Cultivation</h1>
        <span>
          Explore agronomic requirements, recommended seasons, soils, and growth cycles for key crops.
        </span>
      </div>

      <div className="crop-controls">
        <input
          type="text"
          className="crop-search-input"
          placeholder="🔍 Search crops by name or keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="season-filter-chips">
          {seasons.map((season) => (
            <button
              key={season}
              type="button"
              className={`season-chip ${selectedSeason === season ? "active" : ""}`}
              onClick={() => setSelectedSeason(season)}
            >
              {season} {season !== "All" && "Season"}
            </button>
          ))}
        </div>
      </div>

      <div className="crop-grid">
        {filteredCrops.map((crop) => (
          <div key={crop.name} className="crop-card">
            <div className="crop-icon">{crop.icon || "🌱"}</div>

            <h2>{crop.name}</h2>

            <p className="crop-season">
              🗓️ Season: <strong>{crop.season || "General"}</strong>
            </p>

            <p>{crop.description}</p>

            <button
              type="button"
              className="crop-details-btn"
              onClick={() => setSelectedCrop(crop)}
            >
              View Full Guide →
            </button>
          </div>
        ))}
      </div>

      {filteredCrops.length === 0 && (
        <div className="empty-scans" style={{ marginTop: "30px" }}>
          <p>No crops matched your search filter.</p>
          <button
            type="button"
            className="secondary-btn"
            style={{ marginTop: "10px" }}
            onClick={() => {
              setSearchTerm("");
              setSelectedSeason("All");
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Modal Dialog for Crop Details */}
      {selectedCrop && (
        <div className="modal-backdrop" onClick={() => setSelectedCrop(null)}>
          <div
            className="crop-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="modal-crop-icon">{selectedCrop.icon || "🌱"}</span>
                <div>
                  <h2>{selectedCrop.name}</h2>
                  <span className="season-tag">{selectedCrop.season} Season</span>
                </div>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setSelectedCrop(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p className="crop-modal-desc">{selectedCrop.description}</p>

              <div className="crop-specs-grid">
                <div className="spec-card">
                  <strong>🌱 Soil Type</strong>
                  <p>{selectedCrop.soil || "Well-drained fertile loam"}</p>
                </div>
                <div className="spec-card">
                  <strong>⏳ Growth Duration</strong>
                  <p>{selectedCrop.duration || "Standard seasonal duration"}</p>
                </div>
              </div>

              {selectedCrop.tips && (
                <div className="cultivation-tips-box">
                  <strong>💡 Best Cultivation Practices:</strong>
                  <p>{selectedCrop.tips}</p>
                </div>
              )}

              <div className="modal-action-row">
                <Link
                  to="/scanner"
                  className="primary-btn"
                  onClick={() => setSelectedCrop(null)}
                >
                  📷 Scan {selectedCrop.name} For Disease
                </Link>
                <Link
                  to="/expert"
                  className="secondary-btn"
                  onClick={() => setSelectedCrop(null)}
                >
                  👨‍🌾 Ask Expert About {selectedCrop.name}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Crops;