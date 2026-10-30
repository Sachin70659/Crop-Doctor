import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const CROP_DISEASES = [
  {
    name: "Early Blight",
    nameHi: "अगेती झुलसा (Early Blight)",
    crop: "Tomato",
    cropHi: "टमाटर (Tomato)",
    icon: "🍅",
    cause: "Fungus (Alternaria solani)",
    causeHi: "कवक (Alternaria solani)",
    severity: "High",
    severityHi: "उच्च (High)",
    description: "A common and destructive fungal disease causing brown concentric leaf spots and defoliation.",
    descriptionHi: "टमाटर का सामान्य और घातक फंगल रोग, जिससे पत्तियों पर गोल छल्लेदार भूरे धब्बे बनते हैं और पत्तियां झड़ने लगती हैं।",
    symptoms: [
      "Circular dark brown to black spots with concentric rings resembling a target board.",
      "Starts on oldest lower leaves and progressively moves up the canopy.",
      "Leaves turn chlorotic (yellow) around spots and drop prematurely, exposing fruit to sunscald."
    ],
    symptomsHi: [
      "पत्तियों पर गोल गहरे भूरे से काले छल्लेदार धब्बे (Target board जैसी आकृति)।",
      "शुरुआत सबसे पुरानी निचली पत्तियों से होती है और धीरे-धीरे ऊपर की ओर फैलती है।",
      "धब्बों के आसपास पत्तियां पीली पड़ जाती हैं और समय से पहले गिर जाती हैं।"
    ],
    treatment: [
      "Prune lower infected foliage immediately and destroy away from the field.",
      "Spray copper-based fungicides or mancozeb at 7-10 day intervals during humid warm periods.",
      "Use bio-fungicides like Trichoderma viride in early growth stages."
    ],
    treatmentHi: [
      "रोगग्रस्त निचली पत्तियों को तुरंत काटकर खेत से दूर नष्ट करें।",
      "मैनकोज़ेब (Mancozeb 75 WP) @ 2-2.5 ग्राम/लीटर या कॉपर ऑक्सीक्लोराइड का छिड़काव 7-10 दिनों के अंतर पर करें।",
      "शुरुआती अवस्था में जैविक ट्राइकोडर्मा विरिडी (Trichoderma viride) का उपयोग करें।"
    ],
    prevention: [
      "Use drip irrigation to prevent water splashing onto foliage.",
      "Practice 3-year crop rotation avoiding other nightshade crops (potato, eggplant).",
      "Apply organic mulch around the plant base."
    ],
    preventionHi: [
      "ड्रिप सिंचाई अपनाएं ताकि पत्तियों पर पानी के छींटे न पड़ें।",
      "3 साल का फसल चक्र अपनाएं; टमाटर के बाद आलू या बैंगन न लगाएं।",
      "पौधों के आधार पर जैविक मल्चिंग करें।"
    ]
  },
  {
    name: "Late Blight",
    nameHi: "पछेती झुलसा (Late Blight)",
    crop: "Potato",
    cropHi: "आलू (Potato)",
    icon: "🥔",
    cause: "Oomycete pathogen (Phytophthora infestans)",
    causeHi: "कवक सदृश पैथोजन (Phytophthora infestans)",
    severity: "Critical",
    severityHi: "अति गंभीर (Critical)",
    description: "The notorious water mold disease that causes rapid rotting of foliage and tubers.",
    descriptionHi: "आलू का कुख्यात फफूंद रोग जो पत्तियों और कंदों को बहुत तेजी से सड़ा देता है।",
    symptoms: [
      "Irregular pale to dark water-soaked lesions that enlarge rapidly in cool, humid weather.",
      "Delicate whitish mildew visible on leaf undersides especially during morning dew.",
      "Infected tubers exhibit brown dry rot extending inward from the skin."
    ],
    symptomsHi: [
      "ठंडे और नम मौसम में पत्तियों पर अनियमित जल-सिक्त धब्बे जो बहुत तेजी से फैलते हैं।",
      "सुबह ओस के समय पत्तियों की निचली सतह पर सफेद रुई जैसी फफूंद दिखाई देती है।",
      "संक्रमित कंदों (आलू) पर भूरे सूखे सड़न के निशान अंदर तक फैल जाते हैं।"
    ],
    treatment: [
      "Immediately rogue out and destroy severely diseased plants (never compost them).",
      "Apply systemic fungicides such as metalaxyl, cymoxanil, or dimethomorph upon first forecast warning."
    ],
    treatmentHi: [
      "गंभीर रूप से प्रभावित पौधों को उखाड़कर तुरंत नष्ट करें (खाद में न डालें)।",
      "लक्षण दिखते ही साइमोक्सानिल + मैनकोज़ेब (Curzate) या मेटालेक्सिल 2 ग्राम/लीटर पानी में घोलकर छिड़कें।"
    ],
    prevention: [
      "Plant only certified disease-free seed tubers.",
      "Ensure proper hilling and earthing up to prevent zoospores from washing into tubers.",
      "Avoid poor-draining low-lying areas of the farm."
    ],
    preventionHi: [
      "केवल प्रमाणित रोग-मुक्त बीज कंदों की ही बुवाई करें।",
      "आलू पर अच्छी तरह मिट्टी चढ़ाएं ताकि बीजाणु कंदों तक न पहुंच सकें।",
      "खेत के जलभराव वाले निचले स्थानों में आलू की खेती से बचें।"
    ]
  },
  {
    name: "Leaf Blast",
    nameHi: "पत्ती झोंका रोग (Leaf Blast)",
    crop: "Rice",
    cropHi: "धान (Rice)",
    icon: "🌾",
    cause: "Fungus (Magnaporthe oryzae)",
    causeHi: "कवक (Magnaporthe oryzae)",
    severity: "Critical",
    severityHi: "अति गंभीर (Critical)",
    description: "One of the most devastating rice diseases affecting seedlings, tillers, nodes, and panicles.",
    descriptionHi: "धान की सबसे विनाशकारी बीमारियों में से एक, जो पत्तियों, गांठों और बालियों को नुकसान पहुंचाती है।",
    symptoms: [
      "Spindle- or diamond-shaped lesions with grayish-white centers and reddish-brown margins.",
      "Lesions rapidly coalesce under high humidity, giving the field a burned or blasted appearance.",
      "Neck blast causes panicles to break and fail to fill grains."
    ],
    symptomsHi: [
      "पत्तियों पर नाव या आंख के आकार के धब्बे जिनके बीच का भाग भूरा-सफेद और किनारे कत्थई होते हैं।",
      "अधिक नमी में धब्बे आपस में मिलकर पूरे खेत को झुलसा (जला हुआ) जैसा दिखाते हैं।",
      "गर्दन तोड़ (Neck blast) से बालियां टूट जाती हैं और दाने नहीं भरते।"
    ],
    treatment: [
      "Spray tricyclazole 75 WP (0.6 g/L) or isoprothiolane (1.5 mL/L) at early onset.",
      "Avoid draining paddy fields completely during blast outbreaks; maintain standing water."
    ],
    treatmentHi: [
      "रोग के शुरुआती लक्षण दिखते ही ट्राइसाइक्लाज़ोल 75 WP (0.6 ग्राम/लीटर) या आइसोप्रोपिलिन का छिड़काव करें।",
      "रोग के प्रकोप के दौरान खेत से पानी पूरी तरह न निकालें; हल्का पानी खड़ा रखें।"
    ],
    prevention: [
      "Avoid excess nitrogen fertilizer application; split nitrogen into smaller doses with potash.",
      "Treat seeds with carbendazim or thiram before nursery sowing.",
      "Grow blast-resistant cultivars recommended for your agro-climatic zone."
    ],
    preventionHi: [
      "यूरिया (नाइट्रोजन) का अत्यधिक प्रयोग न करें; पोटाश के साथ संतुलित मात्रा में दें।",
      "नर्सरी में बुवाई से पहले कार्बेन्डाजिम या थीरम से बीज उपचार अवश्य करें।",
      "रोगरोधी किस्मों की बुवाई करें।"
    ]
  },
  {
    name: "Powdery Mildew",
    nameHi: "चूर्णिल आसिता / छाछिया रोग (Powdery Mildew)",
    crop: "Wheat",
    cropHi: "गेहूं (Wheat)",
    icon: "🌾",
    cause: "Fungus (Blumeria graminis f. sp. tritici)",
    causeHi: "कवक (Blumeria graminis)",
    severity: "Moderate",
    severityHi: "मध्यम (Moderate)",
    description: "A foliar fungal disease characterized by superficial white talcum-like powder on leaves.",
    descriptionHi: "पत्तियों पर सफेद पाउडर या आटे जैसी फफूंद जमने वाला प्रमुख कवक रोग।",
    symptoms: [
      "Fluffy white to light gray fungal colonies appearing on the upper surface of leaves and leaf sheaths.",
      "Infected leaves gradually turn yellow, senesce, and wither prematurely.",
      "Severe attacks during heading stages reduce grain weight and quality."
    ],
    symptomsHi: [
      "पत्तियों और तनों पर सफेद या हल्का सलेटी चूर्ण (पाउडर) दिखाई देता है।",
      "प्रभावित पत्तियां धीरे-धीरे पीली होकर सूखने लगती हैं।",
      "बालियां निकलते समय प्रकोप होने से दानों का वजन और गुणवत्ता घट जाती है।"
    ],
    treatment: [
      "Apply wettable sulfur (2-3 g/L) or propiconazole 25 EC (1 mL/L) at first symptom appearance.",
      "Ensure adequate spray coverage across the canopy."
    ],
    treatmentHi: [
      "घुलनशील सल्फर (2-3 ग्राम/लीटर) या प्रोपिकोनाज़ोल 25 EC (1 मिली/लीटर) का छिड़काव करें।",
      "छिड़काव पूरे पौधे की पत्तियों पर समान रूप से करें।"
    ],
    prevention: [
      "Avoid dense planting; maintain optimum seed rates to allow adequate air circulation.",
      "Select certified resistant wheat cultivars.",
      "Balance nitrogen fertilizer with phosphorus and potassium."
    ],
    preventionHi: [
      "बहुत घनी बुवाई से बचें; उचित बीज दर रखें ताकि हवा का संचार बना रहे।",
      "प्रमाणित रोगरोधी किस्मों का चयन करें।"
    ]
  },
  {
    name: "Common Rust",
    nameHi: "मक्के का गेरुआ / रस्ट रोग (Common Rust)",
    crop: "Maize",
    cropHi: "मक्का (Maize)",
    icon: "🌽",
    cause: "Fungus (Puccinia sorghi)",
    causeHi: "कवक (Puccinia sorghi)",
    severity: "Moderate to High",
    severityHi: "मध्यम से उच्च (Moderate to High)",
    description: "A widespread foliar disease forming small powdery pustules across both surfaces of corn leaves.",
    descriptionHi: "मक्के की पत्तियों पर जंग जैसे कत्थई रंग के फफोले बनने वाला फंगल रोग।",
    symptoms: [
      "Small circular to elongated cinnamon-brown pustules scattered on upper and lower leaf surfaces.",
      "Pustules rupture the epidermis, releasing powdery spores when touched.",
      "Severe infections lead to chlorosis and premature leaf death."
    ],
    symptomsHi: [
      "पत्तियों की दोनों सतहों पर छोटे कत्थई या भूरे रंग के उभरे हुए फफोले बनते हैं।",
      "छूने पर हाथ में जंग जैसा भूरा पाउडर लगता है।",
      "गंभीर संक्रमण में पत्तियां पीली पड़कर समय से पहले सूख जाती हैं।"
    ],
    treatment: [
      "Foliar fungicides containing azoxystrobin or tebuconazole are effective when applied prior to tassel emergence.",
      "Ensure early intervention if weather is cool and moist."
    ],
    treatmentHi: [
      "मंजरी निकलने से पहले एज़ोक्सीस्ट्रोबिन या टेबुकोनाज़ोल युक्त फफूंदनाशक का छिड़काव करें।",
      "ठंडे और नम मौसम में समय रहते उपचार शुरू करें।"
    ],
    prevention: [
      "Plant rust-resistant corn hybrids.",
      "Plant early in the season to avoid peak airborne spore loads."
    ],
    preventionHi: [
      "रस्ट प्रतिरोधी संकर मक्का किस्मों की बुवाई करें।",
      "समय पर बुवाई करें ताकि हवा में बीजाणुओं के चरम फैलाव से बचा जा सके।"
    ]
  },
  {
    name: "White Rust",
    nameHi: "सफेद रोली / रतुआ (White Rust)",
    crop: "Mustard",
    cropHi: "सरसों (Mustard)",
    icon: "🌼",
    cause: "Oomycete (Albugo candida)",
    causeHi: "कवक (Albugo candida)",
    severity: "High",
    severityHi: "उच्च (High)",
    description: "Causes white blister-like pustules and floral malformations ('staghead') in mustard and rapeseed.",
    descriptionHi: "सरसों की पत्तियों पर सफेद फफोले और फूलों का विकृत होकर हिरन के सींग जैसा बनने वाला रोग।",
    symptoms: [
      "Prominent white or creamy chalk-like raised pustules on the underside of leaves.",
      "Upper leaf surface opposite pustules shows yellow patches.",
      "Floral parts become hypertrophied and distorted into sterile 'staghead' structures."
    ],
    symptomsHi: [
      "पत्तियों की निचली सतह पर सफेद या हल्के पीले उभरे हुए चॉक जैसे फफोले बनते हैं।",
      "फफोलों के ठीक ऊपर पत्ती की ऊपरी सतह पीली दिखाई देती है।",
      "फूल और बालियां विकृत होकर फूल जाती हैं (Staghead) और दाने नहीं बनते।"
    ],
    treatment: [
      "Spray metalaxyl + mancozeb (Ridomil MZ) @ 2 g/L at early infection.",
      "Remove and burn staghead floral parts to arrest spore production."
    ],
    treatmentHi: [
      "लक्षण दिखते ही रिडोमिल एमज़ेड (मेटालेक्सिल + मैनकोज़ेब) @ 2 ग्राम/लीटर का छिड़काव करें।",
      "विकृत फूलों की टहनियों को काटकर जला दें ताकि बीजाणु न फैलें।"
    ],
    prevention: [
      "Treat seeds with Apron 35 SD (6 g/kg seed) before sowing.",
      "Practice clean cultivation and destroy wild cruciferous weeds.",
      "Adhere to recommended sowing windows."
    ],
    preventionHi: [
      "बुवाई से पहले बीज उपचार अवश्य करें।",
      "खेत और मेड़ों से जंगली सरसों व खरपतवार नष्ट करें।",
      "समय पर बुवाई करें।"
    ]
  }
];

function Diseases() {
  const { isHindi, t } = useLanguage();
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [filterCrop, setFilterCrop] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const crops = [
    { key: "All", labelEn: "All Diseases", labelHi: "सभी रोग" },
    { key: "Tomato", labelEn: "Tomato", labelHi: "टमाटर" },
    { key: "Potato", labelEn: "Potato", labelHi: "आलू" },
    { key: "Rice", labelEn: "Rice", labelHi: "धान" },
    { key: "Wheat", labelEn: "Wheat", labelHi: "गेहूं" },
    { key: "Maize", labelEn: "Maize", labelHi: "मक्का" },
    { key: "Mustard", labelEn: "Mustard", labelHi: "सरसों" }
  ];

  const filteredDiseases = CROP_DISEASES.filter((d) => {
    const matchesCrop = filterCrop === "All" || d.crop.toLowerCase() === filterCrop.toLowerCase();
    const query = searchTerm.toLowerCase();

    const nameMatch = isHindi
      ? (d.nameHi || d.name).toLowerCase().includes(query) || d.name.toLowerCase().includes(query)
      : d.name.toLowerCase().includes(query);

    const cropMatch = isHindi
      ? (d.cropHi || d.crop).toLowerCase().includes(query) || d.crop.toLowerCase().includes(query)
      : d.crop.toLowerCase().includes(query);

    const desc = isHindi ? (d.descriptionHi || d.description) : d.description;
    const descMatch = desc && desc.toLowerCase().includes(query);

    return matchesCrop && (nameMatch || cropMatch || descMatch);
  });

  return (
    <section className="content-page">
      <div className="page-heading">
        <p>{t("diseases.badge", "PLANT PATHOLOGY & DIAGNOSTICS")}</p>
        <h1>{t("diseases.title", "Common Crop Diseases & Remedies")}</h1>
        <span>
          {t("diseases.subtitle", "Identify leaf symptoms, fungal pathogens, and proven organic & chemical treatments for your crops.")}
        </span>
      </div>

      <div className="crop-controls">
        <input
          type="text"
          className="crop-search-input"
          placeholder={isHindi ? "🔍 रोग, फसल या लक्षण खोजें (उदा. झुलसा, रस्ट, फफूंद)..." : "🔍 Search disease or symptom (e.g. Blight, Rust, Mildew)..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="season-filter-chips">
          {crops.map((c) => (
            <button
              key={c.key}
              type="button"
              className={`season-chip ${filterCrop === c.key ? "active" : ""}`}
              onClick={() => setFilterCrop(c.key)}
            >
              {isHindi ? c.labelHi : c.labelEn}
            </button>
          ))}
        </div>
      </div>

      <div className="crop-grid">
        {filteredDiseases.map((disease) => (
          <div key={disease.name} className="crop-card">
            <div className="crop-icon">{disease.icon}</div>

            <div className="disease-card-header">
              <h2>{isHindi ? (disease.nameHi || disease.name) : disease.name}</h2>
              <span className={`severity-tag ${(disease.severity || "").toLowerCase().replace(/\s+/g, "-")}`}>
                {isHindi ? (disease.severityHi || disease.severity) : disease.severity}
              </span>
            </div>

            <p>
              {isHindi ? "प्रभावित फसल:" : "Host Crop:"} <strong>{isHindi ? (disease.cropHi || disease.crop) : disease.crop}</strong>
            </p>

            <p className="disease-desc">{isHindi ? (disease.descriptionHi || disease.description) : disease.description}</p>

            <button
              type="button"
              className="disease-details-btn"
              onClick={() => setSelectedDisease(disease)}
            >
              {isHindi ? "लक्षण व उपचार पढ़ें →" : "Read Symptoms & Care →"}
            </button>
          </div>
        ))}
      </div>

      {filteredDiseases.length === 0 && (
        <div className="empty-scans" style={{ marginTop: "30px" }}>
          <p>{isHindi ? "आपकी खोज के अनुसार कोई रोग नहीं मिला।" : "No diseases matched your search."}</p>
          <button
            type="button"
            className="secondary-btn"
            style={{ marginTop: "10px" }}
            onClick={() => {
              setSearchTerm("");
              setFilterCrop("All");
            }}
          >
            {isHindi ? "फ़िल्टर हटाएं" : "Clear Filters"}
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
                  <h2>{isHindi ? (selectedDisease.nameHi || selectedDisease.name) : selectedDisease.name}</h2>
                  <span className="disease-pathogen">
                    {isHindi
                      ? `फसल: ${selectedDisease.cropHi || selectedDisease.crop} | कारक: ${selectedDisease.causeHi || selectedDisease.cause}`
                      : `Target Crop: ${selectedDisease.crop} | Pathogen: ${selectedDisease.cause}`}
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
              <p className="crop-modal-desc">
                {isHindi ? (selectedDisease.descriptionHi || selectedDisease.description) : selectedDisease.description}
              </p>

              <div className="disease-info-block symptoms-block">
                <strong>🔍 {isHindi ? "मुख्य लक्षण:" : "Key Symptoms to Look For:"}</strong>
                <ul>
                  {(isHindi ? (selectedDisease.symptomsHi || selectedDisease.symptoms) : selectedDisease.symptoms).map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>

              <div className="disease-info-block treatment-block">
                <strong>💊 {isHindi ? "अनुशंसित उपचार एवं दवाइयां:" : "Treatment & Control Measures:"}</strong>
                <ul>
                  {(isHindi ? (selectedDisease.treatmentHi || selectedDisease.treatment) : selectedDisease.treatment).map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>

              <div className="disease-info-block prevention-block">
                <strong>🛡️ {isHindi ? "रोकथाम के उपाय:" : "Preventative Farm Hygiene:"}</strong>
                <ul>
                  {(isHindi ? (selectedDisease.preventionHi || selectedDisease.prevention) : selectedDisease.prevention).map((p, idx) => (
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
                  📷 {isHindi ? "पत्ती स्कैन करें" : "Scan Plant Leaf Now"}
                </Link>
                <Link
                  to="/expert"
                  className="secondary-btn"
                  onClick={() => setSelectedDisease(null)}
                >
                  👨‍🌾 {isHindi ? "कृषि विशेषज्ञ से पूछें" : "Consult Agricultural Officer"}
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
