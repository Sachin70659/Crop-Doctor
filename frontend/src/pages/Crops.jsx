import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api";
import { useLanguage } from "../context/LanguageContext";

const FALLBACK_CROPS = [
  {
    name: "Wheat",
    nameHi: "गेहूं (Wheat)",
    season: "Rabi",
    seasonHi: "रबी",
    icon: "🌾",
    description: "A major cool-season cereal crop essential for flour and food security worldwide.",
    descriptionHi: "सर्दियों की प्रमुख खाद्यान्न फसल, जो देश भर में आटे और खाद्य सुरक्षा के लिए अनिवार्य है।",
    soil: "Well-drained loamy to clay loam soil (pH 6.0 - 7.5)",
    soilHi: "उचित जल निकास वाली बलुई दोमट या मटियार दोमट मिट्टी (pH 6.0 - 7.5)",
    duration: "110 - 140 days",
    durationHi: "110 - 140 दिन",
    tips: "Ensure timely sowing in November; requires 4-6 irrigations at crown root initiation and flowering.",
    tipsHi: "नवंबर में समय पर बुवाई करें; ताजमूल (CRI) और फूल आने की अवस्था पर 4-6 सिंचाई आवश्यक हैं।"
  },
  {
    name: "Rice",
    nameHi: "धान / चावल (Rice)",
    season: "Kharif",
    seasonHi: "खरीफ",
    icon: "🌾",
    description: "A staple cereal grain requiring warm temperatures and abundant water management.",
    descriptionHi: "मानसून की प्रमुख फसल जिसे गर्म मौसम और भरपूर पानी की आवश्यकता होती है।",
    soil: "Clayey or heavy loamy soil with high moisture retention (pH 5.5 - 6.5)",
    soilHi: "नमी धारण करने वाली चिकनी या भारी दोमट मिट्टी (pH 5.5 - 6.5)",
    duration: "105 - 150 days",
    durationHi: "105 - 150 दिन",
    tips: "Puddle fields thoroughly before transplanting 20-25 day old seedlings; maintain shallow water depth.",
    tipsHi: "20-25 दिन की पौध की रोपाई से पहले खेत की अच्छी तरह लेव (Puddling) लगाएं और पानी बनाए रखें।"
  },
  {
    name: "Tomato",
    nameHi: "टमाटर (Tomato)",
    season: "Multiple",
    seasonHi: "सभी मौसम",
    icon: "🍅",
    description: "A versatile, high-value solanaceous fruit vegetable grown across multiple seasons.",
    descriptionHi: "एक बहुमूल्य सब्जी फसल, जिसे साल भर विभिन्न मौसमों में उगाया जा सकता है।",
    soil: "Deep, well-drained fertile loamy soil rich in organic matter (pH 6.0 - 7.0)",
    soilHi: "जीवांश युक्त गहरी, उपजाऊ दोमट मिट्टी (pH 6.0 - 7.0)",
    duration: "70 - 90 days after transplanting",
    durationHi: "रोपाई के 70 - 90 दिन बाद",
    tips: "Stake plants to keep fruits off the ground; avoid wetting leaves to prevent fungal leaf blights.",
    tipsHi: "पौधों को सहारा (staking) दें ताकि फल जमीन से न छुएं; पत्ती झुलसा रोकने हेतु पत्तियों पर पानी न गिराएं।"
  },
  {
    name: "Potato",
    nameHi: "आलू (Potato)",
    season: "Rabi",
    seasonHi: "रबी",
    icon: "🥔",
    description: "A high-yielding tuber crop grown in cool conditions with loose friable soil.",
    descriptionHi: "ठंडे मौसम की अधिक पैदावार देने वाली कंद वर्गीय फसल, जिसे भुरभुरी मिट्टी पसंद है।",
    soil: "Loose, well-aerated sandy loam with good drainage (pH 5.2 - 6.4)",
    soilHi: "हल्की, भुरभुरी व हवादार बलुई दोमट मिट्टी (pH 5.2 - 6.4)",
    duration: "90 - 120 days",
    durationHi: "90 - 120 दिन",
    tips: "Perform earthing-up around 30 days after sowing to protect growing tubers from sunlight.",
    tipsHi: "बुवाई के लगभग 30 दिन बाद मिट्टी चढ़ाएं ताकि बढ़ते कंदों पर धूप न लगे और वे हरे न हों।"
  },
  {
    name: "Maize",
    nameHi: "मक्का (Maize)",
    season: "Kharif",
    seasonHi: "खरीफ",
    icon: "🌽",
    description: "A multipurpose warm-season cereal crop used for human food, fodder, and starch.",
    descriptionHi: "भोजन, पशु चारे और औद्योगिक उपयोग के लिए महत्वपूर्ण बहुउद्देशीय अनाज फसल।",
    soil: "Fertile, well-drained loamy soil (pH 6.5 - 7.5)",
    soilHi: "उपजाऊ और अच्छे जल निकास वाली दोमट मिट्टी (pH 6.5 - 7.5)",
    duration: "85 - 110 days",
    durationHi: "85 - 110 दिन",
    tips: "Sensitive to waterlogging; ensure proper field drainage and balanced nitrogen application.",
    tipsHi: "खेत में जलभराव न होने दें; जल निकास की उचित व्यवस्था रखें और संतुलित नत्रजन खाद दें।"
  },
  {
    name: "Mustard",
    nameHi: "सरसों (Mustard)",
    season: "Rabi",
    seasonHi: "रबी",
    icon: "🌼",
    description: "A prominent winter oilseed crop requiring dry and cool growing conditions.",
    descriptionHi: "सर्दियों की प्रमुख तिलहनी फसल जिसे ठंडे व शुष्क मौसम की आवश्यकता होती है।",
    soil: "Sandy loam to light loam soil with good drainage (pH 6.0 - 7.5)",
    soilHi: "बलुई दोमट से हल्की दोमट मिट्टी (pH 6.0 - 7.5)",
    duration: "105 - 130 days",
    durationHi: "105 - 130 दिन",
    tips: "Requires light irrigation during flowering and pod development; watch out for aphids in warm spells.",
    tipsHi: "फूल आने और फलियां बनते समय हल्की सिंचाई करें; तापमान बढ़ने पर माहू (चेपा) कीट से सतर्क रहें।"
  }
];

function Crops() {
  const { isHindi, t } = useLanguage();
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
        // Retain fallback list on offline or server delay
      }
    }

    loadCrops();
    return () => {
      isMounted = false;
    };
  }, []);

  const seasons = [
    { key: "All", labelEn: "All Crops", labelHi: "सभी फसलें" },
    { key: "Rabi", labelEn: "Rabi (Winter)", labelHi: "रबी (सर्दियां)" },
    { key: "Kharif", labelEn: "Kharif (Monsoon)", labelHi: "खरीफ (मानसून)" },
    { key: "Multiple", labelEn: "All Seasons", labelHi: "सभी मौसम" },
  ];

  const filteredCrops = cropList.filter((crop) => {
    const nameMatch = isHindi
      ? (crop.nameHi || crop.name).toLowerCase().includes(searchTerm.toLowerCase()) || crop.name.toLowerCase().includes(searchTerm.toLowerCase())
      : crop.name.toLowerCase().includes(searchTerm.toLowerCase());

    const desc = isHindi ? (crop.descriptionHi || crop.description) : crop.description;
    const matchesSearch = nameMatch || (desc && desc.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSeason =
      selectedSeason === "All" || crop.season?.toLowerCase() === selectedSeason.toLowerCase();

    return matchesSearch && matchesSeason;
  });

  return (
    <section className="content-page">
      <div className="page-heading">
        <p>{t("crops.badge", "CROP REPOSITORY & AGRONOMY")}</p>
        <h1>{t("crops.title", "Crop Guide & Cultivation")}</h1>
        <span>
          {t("crops.subtitle", "Explore agronomic requirements, recommended seasons, soils, and growth cycles for key crops.")}
        </span>
      </div>

      <div className="crop-controls">
        <input
          type="text"
          className="crop-search-input"
          placeholder={isHindi ? "🔍 फसल का नाम, मौसम या मिट्टी खोजें..." : "🔍 Search crops by name, season, or soil..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="season-filter-chips">
          {seasons.map((s) => (
            <button
              key={s.key}
              type="button"
              className={`season-chip ${selectedSeason === s.key ? "active" : ""}`}
              onClick={() => setSelectedSeason(s.key)}
            >
              {isHindi ? s.labelHi : s.labelEn}
            </button>
          ))}
        </div>
      </div>

      <div className="crop-grid">
        {filteredCrops.map((crop) => (
          <div key={crop.name} className="crop-card">
            <div className="crop-icon">{crop.icon || "🌱"}</div>

            <h2>{isHindi ? (crop.nameHi || crop.name) : crop.name}</h2>

            <p className="crop-season">
              🗓️ {isHindi ? "मौसम:" : "Season:"} <strong>{isHindi ? (crop.seasonHi || crop.season) : (crop.season || "General")}</strong>
            </p>

            <p>{isHindi ? (crop.descriptionHi || crop.description) : crop.description}</p>

            <button
              type="button"
              className="crop-details-btn"
              onClick={() => setSelectedCrop(crop)}
            >
              {isHindi ? "सम्पूर्ण जानकारी देखें →" : "View Full Guide →"}
            </button>
          </div>
        ))}
      </div>

      {filteredCrops.length === 0 && (
        <div className="empty-scans" style={{ marginTop: "30px" }}>
          <p>{isHindi ? "आपकी खोज के अनुसार कोई फसल नहीं मिली।" : "No crops matched your search filter."}</p>
          <button
            type="button"
            className="secondary-btn"
            style={{ marginTop: "10px" }}
            onClick={() => {
              setSearchTerm("");
              setSelectedSeason("All");
            }}
          >
            {isHindi ? "फ़िल्टर हटाएं" : "Clear Filters"}
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
                  <h2>{isHindi ? (selectedCrop.nameHi || selectedCrop.name) : selectedCrop.name}</h2>
                  <span className="season-tag">
                    {isHindi ? `${selectedCrop.seasonHi || selectedCrop.season} मौसम` : `${selectedCrop.season} Season`}
                  </span>
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
              <p className="crop-modal-desc">
                {isHindi ? (selectedCrop.descriptionHi || selectedCrop.description) : selectedCrop.description}
              </p>

              <div className="crop-specs-grid">
                <div className="spec-card">
                  <strong>🌱 {isHindi ? "उपयुक्त मिट्टी" : "Soil Type"}</strong>
                  <p>{isHindi ? (selectedCrop.soilHi || selectedCrop.soil) : (selectedCrop.soil || "Well-drained fertile loam")}</p>
                </div>
                <div className="spec-card">
                  <strong>⏳ {isHindi ? "फसल अवधि" : "Growth Duration"}</strong>
                  <p>{isHindi ? (selectedCrop.durationHi || selectedCrop.duration) : (selectedCrop.duration || "Standard seasonal duration")}</p>
                </div>
              </div>

              {(selectedCrop.tips || selectedCrop.tipsHi) && (
                <div className="cultivation-tips-box">
                  <strong>💡 {isHindi ? "उन्नत कृषि वैज्ञानिक सलाह:" : "Best Cultivation Practices:"}</strong>
                  <p>{isHindi ? (selectedCrop.tipsHi || selectedCrop.tips) : selectedCrop.tips}</p>
                </div>
              )}

              <div className="modal-action-row">
                <Link
                  to="/scanner"
                  className="primary-btn"
                  onClick={() => setSelectedCrop(null)}
                >
                  📷 {isHindi ? `इस फसल (${isHindi ? (selectedCrop.nameHi || selectedCrop.name) : selectedCrop.name}) की पत्ती जांचें` : `Scan ${selectedCrop.name} For Disease`}
                </Link>
                <Link
                  to="/expert"
                  className="secondary-btn"
                  onClick={() => setSelectedCrop(null)}
                >
                  👨‍🌾 {isHindi ? `विशेषज्ञ से सलाह लें` : `Ask Expert About ${selectedCrop.name}`}
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
