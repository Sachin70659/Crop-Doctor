import { useState } from "react";
import { Link } from "react-router-dom";

const CROP_DISEASES = [
  {
    name: "Early Blight",
    crop: "Tomato",
    icon: "🍅",
    cause: "Fungus (Alternaria solani)",
    severity: "High",
    description: "A common and destructive fungal disease causing brown concentric leaf spots and defoliation.",
    symptoms: [
      "Circular dark brown to black spots with concentric rings resembling a target board.",
      "Starts on oldest lower leaves and progressively moves up the canopy.",
      "Leaves turn chlorotic (yellow) around spots and drop prematurely, exposing fruit to sunscald."
    ],
    treatment: [
      "Prune lower infected foliage immediately and destroy away from the field.",
      "Spray copper-based fungicides or mancozeb at 7-10 day intervals during humid warm periods.",
      "Use bio-fungicides like Trichoderma viride in early growth stages."
    ],
    prevention: [
      "Use drip irrigation to prevent water splashing onto foliage.",
      "Practice 3-year crop rotation avoiding other nightshade crops (potato, eggplant).",
      "Apply organic mulch around the plant base."
    ]
  },
  {
    name: "Late Blight",
    crop: "Potato",
    icon: "🥔",
    cause: "Oomycete pathogen (Phytophthora infestans)",
    severity: "Critical",
    description: "The notorious water mold disease that causes rapid rotting of foliage and tubers.",
    symptoms: [
      "Irregular pale to dark water-soaked lesions that enlarge rapidly in cool, humid weather.",
      "Delicate whitish mildew visible on leaf undersides especially during morning dew.",
      "Infected tubers exhibit brown dry rot extending inward from the skin."
    ],
    treatment: [
      "Immediately rogue out and destroy severely diseased plants (never compost them).",
      "Apply systemic fungicides such as metalaxyl, cymoxanil, or dimethomorph upon first forecast warning."
    ],
    prevention: [
      "Plant only certified disease-free seed tubers.",
      "Ensure proper hilling and earthing up to prevent zoospores from washing into tubers.",
      "Avoid poor-draining low-lying areas of the farm."
    ]
  },
  {
    name: "Leaf Blast",
    crop: "Rice",
    icon: "🌾",
    cause: "Fungus (Magnaporthe oryzae)",
    severity: "Critical",
    description: "One of the most devastating rice diseases affecting seedlings, tillers, nodes, and panicles.",
    symptoms: [
      "Spindle- or diamond-shaped lesions with grayish-white centers and reddish-brown margins.",
      "Lesions rapidly coalesce under high humidity, giving the field a burned or blasted appearance.",
      "Neck blast causes panicles to break and fail to fill grains."
    ],
    treatment: [
      "Spray tricyclazole 75 WP (0.6 g/L) or isoprothiolane (1.5 mL/L) at early onset.",
      "Avoid draining paddy fields completely during blast outbreaks; maintain standing water."
    ],
    prevention: [
      "Avoid excess nitrogen fertilizer application; split nitrogen into smaller doses with potash.",
      "Treat seeds with carbendazim or thiram before nursery sowing.",
      "Grow blast-resistant cultivars recommended for your agro-climatic zone."
    ]
  },
  {
    name: "Powdery Mildew",
    crop: "Wheat",
    icon: "🌾",
    cause: "Fungus (Blumeria graminis f. sp. tritici)",
    severity: "Moderate",
    description: "A foliar fungal disease characterized by superficial white talcum-like powder on leaves.",
    symptoms: [
      "Fluffy white to light gray fungal colonies appearing on the upper surface of leaves and leaf sheaths.",
      "Infected leaves gradually turn yellow, senesce, and wither prematurely.",
      "Severe attacks during heading stages reduce grain weight and quality."
    ],
    treatment: [
      "Apply wettable sulfur (2-3 g/L) or propiconazole 25 EC (1 mL/L) at first symptom appearance.",
      "Ensure adequate spray coverage across the canopy."
    ],
    prevention: [
      "Avoid dense planting; maintain optimum seed rates to allow adequate air circulation.",
      "Select certified resistant wheat cultivars.",
      "Balance nitrogen fertilizer with phosphorus and potassium."
    ]
  },
  {
    name: "Common Rust",
    crop: "Maize",
    icon: "🌽",
    cause: "Fungus (Puccinia sorghi)",
    severity: "Moderate to High",
    description: "A widespread foliar disease forming small powdery pustules across both surfaces of corn leaves.",
    symptoms: [
      "Small circular to elongated cinnamon-brown pustules scattered on upper and lower leaf surfaces.",
      "Pustules rupture the epidermis, releasing powdery spores when touched.",
      "Severe infections lead to chlorosis and premature leaf death."
    ],
    treatment: [
      "Foliar fungicides containing azoxystrobin or tebuconazole are effective when applied prior to tassel emergence.",
      "Ensure early intervention if weather is cool and moist."
    ],
    prevention: [
      "Plant rust-resistant corn hybrids.",
      "Plant early in the season to avoid peak airborne spore loads."
    ]
  },
  {
    name: "White Rust",
    crop: "Mustard",
    icon: "🌼",
    cause: "Oomycete (Albugo candida)",
    severity: "High",
    description: "Causes white blister-like pustules and floral malformations ('staghead') in mustard and rapeseed.",
    symptoms: [
      "Prominent white or creamy chalk-like raised pustules on the underside of leaves.",
      "Upper leaf surface opposite pustules shows yellow patches.",
      "Floral parts become hypertrophied and distorted into sterile 'staghead' structures."
    ],
    treatment: [
      "Spray metalaxyl + mancozeb (Ridomil MZ) @ 2 g/L at early infection.",
      "Remove and burn staghead floral parts to arrest spore production."
    ],
    prevention: [
      "Treat seeds with Apron 35 SD (6 g/kg seed) before sowing.",
      "Practice clean cultivation and destroy wild cruciferous weeds.",
      "Adhere to recommended sowing windows."
    ]
  }
];

function Diseases() {
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [filterCrop, setFilterCrop] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const crops = ["All", "Tomato", "Potato", "Rice", "Wheat", "Maize", "Mustard"];

  const filteredDiseases = CROP_DISEASES.filter((d) => {
    const matchesCrop = filterCrop === "All" || d.crop.toLowerCase() === filterCrop.toLowerCase();
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCrop && matchesSearch;
  });

  return (
    <section className="content-page">
      <div className="page-heading">
        <p>PLANT PATHOLOGY & DIAGNOSTICS</p>
        <h1>Common Crop Diseases & Remedies</h1>
        <span>
          Identify leaf symptoms, fungal pathogens, and proven organic & chemical treatments for your crops.
        </span>
      </div>

      <div className="crop-controls">
        <input
          type="text"
          className="crop-search-input"
          placeholder="🔍 Search disease or symptom (e.g. Blight, Rust, Mildew)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="season-filter-chips">
          {crops.map((c) => (
            <button
              key={c}
              type="button"
              className={`season-chip ${filterCrop === c ? "active" : ""}`}
              onClick={() => setFilterCrop(c)}
            >
              {c === "All" ? "All Crops" : `${c}`}
            </button>
          ))}
        </div>
      </div>

      <div className="disease-grid">
        {filteredDiseases.map((disease) => (
          <div className="disease-card" key={disease.name}>
            <div className="disease-icon">{disease.icon}</div>

            <div className="disease-title-row">
              <h2>{disease.name}</h2>
              <span className={`severity-tag ${disease.severity.toLowerCase()}`}>
                {disease.severity}
              </span>
            </div>

            <p>
              Host Crop: <strong>{disease.crop}</strong>
            </p>

            <p className="disease-desc">{disease.description}</p>

            <button
              type="button"
              className="disease-details-btn"
              onClick={() => setSelectedDisease(disease)}
            >
              Read Symptoms & Care →
            </button>
          </div>
        ))}
      </div>

      {filteredDiseases.length === 0 && (
        <div className="empty-scans" style={{ marginTop: "30px" }}>
          <p>No diseases matched your search.</p>
          <button
            type="button"
            className="secondary-btn"
            style={{ marginTop: "10px" }}
            onClick={() => {
              setSearchTerm("");
              setFilterCrop("All");
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Disease Detail Modal */}
      {selectedDisease && (
        <div className="modal-backdrop" onClick={() => setSelectedDisease(null)}>
          <div
            className="crop-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <span className="modal-crop-icon">{selectedDisease.icon}</span>
                <div>
                  <h2>{selectedDisease.name}</h2>
                  <span className="disease-pathogen">
                    Target Crop: {selectedDisease.crop} | Pathogen: {selectedDisease.cause}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setSelectedDisease(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p className="crop-modal-desc">{selectedDisease.description}</p>

              <div className="disease-info-block symptoms-block">
                <strong>🔍 Key Symptoms to Look For:</strong>
                <ul>
                  {selectedDisease.symptoms.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="disease-info-block treatment-block">
                <strong>💊 Treatment & Control Measures:</strong>
                <ul>
                  {selectedDisease.treatment.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>

              <div className="disease-info-block prevention-block">
                <strong>🛡️ Preventative Farm Hygiene:</strong>
                <ul>
                  {selectedDisease.prevention.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="modal-action-row">
                <Link
                  to="/scanner"
                  className="primary-btn"
                  onClick={() => setSelectedDisease(null)}
                >
                  📷 Scan Plant Leaf Now
                </Link>
                <Link
                  to="/expert"
                  className="secondary-btn"
                  onClick={() => setSelectedDisease(null)}
                >
                  👨‍🌾 Consult Agricultural Officer
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Diseases;