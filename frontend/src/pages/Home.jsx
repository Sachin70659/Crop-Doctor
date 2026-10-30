import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

function Home() {
  const { t, isHindi } = useLanguage();

  return (
    <div className="home-container">
      {/* ─── HERO SECTION ─────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-grid">
          {/* Left Column: Value Prop */}
          <div className="hero-content">
            <div className="hero-badge">
              <span className="hero-badge-dot"></span>
              <span className="hero-badge-text">{t("home.badge", "AI Plant Pathology 2.0 • 98% Accuracy")}</span>
            </div>

            <h1 className="hero-heading">
              {t("home.heroTitle1", "Protect Your Harvest")} <br />
              <span className="gradient-text">{t("home.heroTitle2", "With AI Agronomy")}</span>
            </h1>

            <p className="hero-description">
              {t("home.heroDesc", "Detect fungal blights, rusts, pests, and nutrient deficiencies from a single leaf photo. Get instant organic & chemical cure protocols curated by agricultural scientists.")}
            </p>

            <div className="hero-cta-group">
              <Link to="/scanner" className="btn-primary-hero">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span>{t("home.diagnoseBtn", "Diagnose Crop Leaf")}</span>
              </Link>

              <Link to="/crops" className="btn-secondary-hero">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                  <path d="M6 6h10" />
                  <path d="M6 10h10" />
                </svg>
                <span>{t("home.cropsBtn", "Crop Encyclopedia")}</span>
              </Link>
            </div>

            {/* Micro Trust Indicators */}
            <div className="hero-trust-bar">
              <div className="trust-item">
                <span className="trust-check">✓</span>
                <span>{t("home.trust1", "Fast 2-Sec AI Vision")}</span>
              </div>
              <div className="trust-item">
                <span className="trust-check">✓</span>
                <span>{t("home.trust2", "40+ Diseases Covered")}</span>
              </div>
              <div className="trust-item">
                <span className="trust-check">✓</span>
                <span>{t("home.trust3", "100% Free for Farmers")}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Diagnostic Preview Card */}
          <div className="hero-visual-wrapper">
            <div className="hero-card-glow"></div>
            <div className="hero-preview-card">
              <div className="preview-card-header">
                <div className="preview-status-pill">
                  <span className="status-live-pulse"></span>
                  <span>{t("home.liveDemo", "AI Vision Live Demo")}</span>
                </div>
                <span className="preview-crop-tag">{isHindi ? "टमाटर (Solanum lycopersicum)" : "Tomato (Solanum lycopersicum)"}</span>
              </div>

              <div className="preview-image-box">
                <div className="preview-leaf-illustration">
                  <span className="leaf-emoji">🍃</span>
                  <div className="scan-laser-line"></div>
                </div>
                <div className="preview-detection-badge">
                  <span className="badge-severity moderate">{t("home.moderateSeverity", "Moderate Severity")}</span>
                  <span className="badge-confidence">{t("home.confidenceSample", "94% Confidence")}</span>
                </div>
              </div>

              <div className="preview-card-body">
                <h4 className="preview-diagnosis-title">
                  {isHindi ? "अगेती झुलसा (Early Blight - Alternaria solani)" : "Early Blight (Alternaria solani)"}
                </h4>
                <p className="preview-diagnosis-desc">
                  {isHindi
                    ? "निचली पत्तियों पर गोल भूरे छल्लेदार धब्बे और चारों ओर पीलापन देखा गया।"
                    : "Concentric dark brown rings observed on lower foliar tissue with chlorotic yellow halo."}
                </p>

                <div className="preview-action-snippet">
                  <span className="snippet-label">{t("home.urgentAction", "Urgent Action:")}</span>
                  <p className="snippet-text">
                    {isHindi
                      ? "मैनकोज़ेब 75 WP @ 2 ग्राम/लीटर पानी में घोलकर छिड़कें। रोगग्रस्त निचली पत्तियों को तुरंत तोड़कर नष्ट करें।"
                      : "Spray Mancozeb 75 WP @ 2g/L. Rogue infected bottom leaves immediately."}
                  </p>
                </div>
              </div>

              <div className="preview-card-footer">
                <div className="footer-meta">
                  <span className="meta-icon">🌦️</span>
                  <span>{t("home.sprayingWindow", "Safe spraying window: 7:00 AM – 10:00 AM")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS STRIP ──────────────────────────────────── */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <h3 className="stat-number">98.4%</h3>
            <p className="stat-label">{isHindi ? "निदान सटीकता" : "Diagnostic Accuracy"}</p>
            <span className="stat-sub">{isHindi ? "पादप रोग विज्ञान मानकों द्वारा परीक्षित" : "Validated against leaf pathology"}</span>
          </div>
          <div className="stat-card">
            <h3 className="stat-number">40+</h3>
            <p className="stat-label">{isHindi ? "फसल रोग" : "Crop Diseases"}</p>
            <span className="stat-sub">{isHindi ? "फंगल, बैक्टीरियल व वायरस जनित" : "Fungal, bacterial & viral species"}</span>
          </div>
          <div className="stat-card">
            <h3 className="stat-number">&lt; 2s</h3>
            <p className="stat-label">{isHindi ? "स्कैन गति" : "Scan Speed"}</p>
            <span className="stat-sub">{isHindi ? "त्वरित जेमिनी विज़न एआई इंजन" : "Real-time Gemini Vision engine"}</span>
          </div>
          <div className="stat-card">
            <h3 className="stat-number">24/7</h3>
            <p className="stat-label">{isHindi ? "कृषि विशेषज्ञ पोर्टल" : "Agronomist Portal"}</p>
            <span className="stat-sub">{isHindi ? "कृषि वैज्ञानिकों से कभी भी पूछें" : "Consult field specialists anytime"}</span>
          </div>
        </div>
      </section>

      {/* ─── FEATURES SHOWCASE GRID ───────────────────────── */}
      <section className="features-section">
        <div className="section-header-center">
          <span className="section-pill">{isHindi ? "कृषि समाधान पारिस्थितिकी तंत्र" : "FARM TOOLS ECOSYSTEM"}</span>
          <h2 className="section-title">{isHindi ? "आपके खेत के लिए संपूर्ण समाधान" : "Everything Your Farm Needs"}</h2>
          <p className="section-subtitle">
            {isHindi
              ? "फसल रोग निदान, मौसम परामर्श, विशेषज्ञ सलाह और कृषि उत्पादों की एक ही स्थान पर उपलब्धता।"
              : "Integrated diagnostic, advisory, weather, and farm store solutions engineered for modern cultivators."}
          </p>
        </div>

        <div className="features-grid">
          {/* Card 1: Scanner */}
          <Link to="/scanner" className="feature-modern-card highlight-card">
            <div className="card-icon-container">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <div className="card-badge-top">{isHindi ? "लाइव एआई" : "Live AI"}</div>
            <h3 className="card-title">{isHindi ? "एआई पत्ती स्कैनर" : "AI Leaf Scanner"}</h3>
            <p className="card-text">
              {isHindi
                ? "स्मार्टफोन से पत्ती की फोटो अपलोड करके झुलसा, रस्ट, फफूंद और पोषक तत्वों की कमी को तुरंत पहचानें।"
                : "Upload smartphone photos of leaves to instantly identify blights, rusts, mildews, and nutrient starvation symptoms."}
            </p>
            <div className="card-footer-link">
              <span>{isHindi ? "स्कैनर शुरू करें" : "Launch Scanner"}</span>
              <span className="arrow-icon">→</span>
            </div>
          </Link>

          {/* Card 2: Crop Guide */}
          <Link to="/crops" className="feature-modern-card">
            <div className="card-icon-container">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
                <path d="M12 12v10" />
              </svg>
            </div>
            <h3 className="card-title">{isHindi ? "फसल ज्ञानकोष" : "Crop Encyclopedia"}</h3>
            <p className="card-text">
              {isHindi
                ? "रबी, खरीफ और जायद की फसलों के लिए उपयुक्त मिट्टी, बुवाई का समय और अवधि की संपूर्ण जानकारी।"
                : "Comprehensive profiles for Rabi, Kharif, and Zaid crops with soil compatibility, nursery timings, and duration data."}
            </p>
            <div className="card-footer-link">
              <span>{isHindi ? "फसलें देखें" : "Browse Crops"}</span>
              <span className="arrow-icon">→</span>
            </div>
          </Link>

          {/* Card 3: Live Farm Weather */}
          <Link to="/weather" className="feature-modern-card">
            <div className="card-icon-container">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
              </svg>
            </div>
            <h3 className="card-title">{isHindi ? "खेत का मौसम पूर्वानुमान" : "Farm Weather Forecast"}</h3>
            <p className="card-text">
              {isHindi
                ? "दवा और कीटनाशक छिड़काव की सही योजना के लिए नमी, तापमान, हवा की गति और बारिश का लाइव डेटा।"
                : "Real-time relative humidity, temperature, wind speeds, and rain forecasts to plan pesticide spraying windows."}
            </p>
            <div className="card-footer-link">
              <span>{isHindi ? "मौसम देखें" : "Check Weather"}</span>
              <span className="arrow-icon">→</span>
            </div>
          </Link>

          {/* Card 4: Agronomist Advice */}
          <Link to="/expert" className="feature-modern-card">
            <div className="card-icon-container">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="card-title">{isHindi ? "कृषि विशेषज्ञ सलाह" : "Expert Consultation"}</h3>
            <p className="card-text">
              {isHindi
                ? "असामान्य लक्षणों या अज्ञात कीट प्रकोप की समस्या भेजें और कृषि वैज्ञानिकों से व्यक्तिगत सलाह पाएं।"
                : "Submit atypical field symptoms to certified extension officers for personalized agronomy recommendations."}
            </p>
            <div className="card-footer-link">
              <span>{isHindi ? "विशेषज्ञ से पूछें" : "Ask an Expert"}</span>
              <span className="arrow-icon">→</span>
            </div>
          </Link>

          {/* Card 5: Farm Care Shop */}
          <Link to="/shop" className="feature-modern-card">
            <div className="card-icon-container">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <h3 className="card-title">{isHindi ? "कृषि सेवा केंद्र व बाज़ार" : "Farm Store"}</h3>
            <p className="card-text">
              {isHindi
                ? "सत्यापित जैविक खाद, रोगरोधी संकर बीज और उच्च गुणवत्ता वाले बैटरी स्प्रेयर उपकरण।"
                : "Curated organic fertilizers, high-yield vegetable seed varieties, and professional pruning and spraying equipment."}
            </p>
            <div className="card-footer-link">
              <span>{isHindi ? "दुकान देखें" : "Visit Shop"}</span>
              <span className="arrow-icon">→</span>
            </div>
          </Link>

          {/* Card 6: Disease Library */}
          <Link to="/diseases" className="feature-modern-card">
            <div className="card-icon-container">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m8 2 1.88 1.88" />
                <path d="M14.12 3.88 16 2" />
                <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
                <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
                <path d="M12 20v-9" />
                <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
                <path d="M6 13H2" />
                <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
                <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
                <path d="M22 13h-4" />
                <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
              </svg>
            </div>
            <h3 className="card-title">{isHindi ? "रोग व उपचार लाइब्रेरी" : "Pathology Library"}</h3>
            <p className="card-text">
              {isHindi
                ? "50+ प्रमुख फसल रोगों के लक्षण, शुरुआती पहचान और रोकथाम के जैविक व रासायनिक उपाय।"
                : "Reference guide detailing symptom onset, causative pathogens, and cultural mitigation techniques for 50+ diseases."}
            </p>
            <div className="card-footer-link">
              <span>{isHindi ? "लाइब्रेरी देखें" : "View Library"}</span>
              <span className="arrow-icon">→</span>
            </div>
          </Link>
        </div>
      </section>

      {/* ─── 3-STEP WORKFLOW ──────────────────────────────── */}
      <section className="workflow-section">
        <div className="section-header-center">
          <span className="section-pill">{isHindi ? "कार्यप्रणाली" : "HOW IT WORKS"}</span>
          <h2 className="section-title">{isHindi ? "3 आसान चरणों में फसल की जांच" : "Diagnose Crops in 3 Easy Steps"}</h2>
          <p className="section-subtitle">
            {isHindi
              ? "खेत में फोटो खींचने से लेकर 15 सेकंड के अंदर दवा और जैविक उपचार का पूरा नुस्खा पाएं।"
              : "From field photo to verified chemical & organic treatment instructions in under 15 seconds."}
          </p>
        </div>

        <div className="workflow-steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon-box">📸</div>
            <h3 className="step-title">{isHindi ? "पत्ती की फोटो लें" : "Take a Photo"}</h3>
            <p className="step-desc">
              {isHindi
                ? "प्रभावित पौधे की पत्ती या शाखा की दिन के उजाले में साफ़ और नज़दीक से फोटो खींचें।"
                : "Snap a clear, well-lit photo of the affected plant leaf or crop canopy showing visible spots or curling."}
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon-box">🧠</div>
            <h3 className="step-title">{isHindi ? "त्वरित एआई निदान" : "Instant AI Diagnosis"}</h3>
            <p className="step-desc">
              {isHindi
                ? "जेमिनी विज़न एआई धब्बों के किनारों, रंग के बदलाव और फंगल बीजाणुओं का विश्लेषण कर सटीक रोग बताता है।"
                : "Gemini Vision AI inspects lesion borders, color changes, and fungal spore signs to identify the exact pathogen."}
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon-box">💊</div>
            <h3 className="step-title">{isHindi ? "उपचार करें व फसल बचाएं" : "Apply Cure & Prevent"}</h3>
            <p className="step-desc">
              {isHindi
                ? "फफूंदनाशक दवा की सटीक मात्रा, नीम तेल के जैविक नुस्खे और मिट्टी की देखभाल की सलाह प्राप्त करें।"
                : "Receive clear fungicide dosages, organic alternatives (like neem oil), and soil management steps to protect the rest of your field."}
            </p>
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA BANNER ────────────────────────────── */}
      <section className="cta-banner-section">
        <div className="cta-banner-box">
          <div className="cta-banner-content">
            <span className="cta-mini-tag">{isHindi ? "आज ही फसल सुरक्षित करें" : "START PROTECTING TODAY"}</span>
            <h2 className="cta-title">{isHindi ? "स्वस्थ फसल, समृद्ध किसान" : "Healthy Crops, Higher Yields"}</h2>
            <p className="cta-subtitle">
              {isHindi
                ? "हज़ारों किसानों के साथ जुड़ें जो वैज्ञानिक तरीके से खेती कर रहे हैं। 100% निःशुल्क और आसान।"
                : "Join thousands of farmers making data-driven agricultural decisions. No subscription, no complex downloads."}
            </p>
            <div className="cta-button-row">
              <Link to="/scanner" className="btn-cta-primary">
                {isHindi ? "📷 अभी फसल की पत्ती जांचें" : "📷 Scan a Crop Now"}
              </Link>
              <Link to="/login" className="btn-cta-secondary">
                {isHindi ? "निशुल्क किसान खाता बनाएं →" : "Create Free Account →"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
