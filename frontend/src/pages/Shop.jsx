import { useState } from "react";
import "./Shop.css";
import { useLanguage } from "../context/LanguageContext";

const PRODUCTS_DATA = [
  {
    id: 1,
    name: "Certified Hybrid Tomato Seeds (Arka Rakshak)",
    nameHi: "प्रमाणित संकर टमाटर बीज (अर्क रक्षक)",
    price: 199,
    originalPrice: 280,
    category: "Seeds",
    categoryHi: "बीज",
    badge: "Triple Disease Resistant",
    badgeHi: "रोगरोधी संकर",
    rating: 4.9,
    reviews: 142,
    image: "🍅",
    inStock: true,
    description: "High yielding hybrid resistant to Leaf Curl Virus, Early & Late Blight. Ideal for all Indian soil types.",
    descriptionHi: "पत्ती मरोड़ वायरस और झुलसा रोग प्रतिरोधी उच्च पैदावार देने वाली किस्म। सभी प्रकार की मिट्टी के लिए उत्तम।"
  },
  {
    id: 2,
    name: "Pure Cold-Pressed Neem Oil (10,000 PPM)",
    nameHi: "शुद्ध कोल्ड-प्रेस्ड नीम तेल (10,000 PPM)",
    price: 349,
    originalPrice: 450,
    category: "Organic Care",
    categoryHi: "जैविक उत्पाद",
    badge: "100% Organic",
    badgeHi: "100% जैविक",
    rating: 4.8,
    reviews: 218,
    image: "🌿",
    inStock: true,
    description: "Natural organic broad-spectrum bio-pesticide. Effective against aphids, whiteflies, powdery mildew and rust.",
    descriptionHi: "प्राकृतिक जैविक कीटनाशक। माहू (चेपा), सफेद मक्खी और फफूंद जनित रोगों के नियंत्रण में अत्यंत प्रभावी।"
  },
  {
    id: 3,
    name: "Enriched Bio-Vermicompost (5 kg Bag)",
    nameHi: "पोषक तत्वों से भरपूर वर्मीकम्पोस्ट केंचुआ खाद (5 किग्रा)",
    price: 249,
    originalPrice: 320,
    category: "Organic Care",
    categoryHi: "जैविक उत्पाद",
    badge: "Soil Booster",
    badgeHi: "मिट्टी पोषक",
    rating: 4.7,
    reviews: 95,
    image: "🌱",
    inStock: true,
    description: "Microbial rich earthworm casting with humic acid for explosive root development and moisture retention.",
    descriptionHi: "ह्यूमिक एसिड युक्त शुद्ध केंचुआ खाद, जो जड़ों के तेजी से विकास और मिट्टी में नमी रोकने में सहायक है।"
  },
  {
    id: 4,
    name: "16-Litre 2-in-1 Battery Backpack Sprayer",
    nameHi: "16-लीटर 2-इन-1 बैटरी एवं हस्तचालित स्प्रेयर",
    price: 1899,
    originalPrice: 2400,
    category: "Tools & Sprayers",
    categoryHi: "कृषि उपकरण",
    badge: "Best Seller",
    badgeHi: "बेस्ट सेलर",
    rating: 4.9,
    reviews: 310,
    image: "🧰",
    inStock: true,
    description: "Rechargeable 12V battery sprayer with brass nozzles. Covers up to 25 spray tanks on a single charge.",
    descriptionHi: "रिचार्जेबल 12V बैटरी स्प्रेयर पीतल के नोजल के साथ। एक बार चार्ज करने पर 25 टंकी तक छिड़काव।"
  },
  {
    id: 5,
    name: "Fungicide Shield Pack (Mancozeb 75 WP - 500g)",
    nameHi: "फफूंदनाशक शील्ड पैक (मैनकोज़ेब 75 WP - 500 ग्राम)",
    price: 280,
    originalPrice: 350,
    category: "Crop Health",
    categoryHi: "दवाइयां",
    badge: "Cure Protocol",
    badgeHi: "रोग उपचार",
    rating: 4.8,
    reviews: 86,
    image: "🛡️",
    inStock: true,
    description: "Broad-spectrum contact fungicide recommended by agronomists for Early Blight, Blast, and Downy Mildew.",
    descriptionHi: "वैज्ञानिकों द्वारा अनुशंसित संपर्क फफूंदनाशक, जो अगेती झुलसा, ब्लास्ट और डाउनी मिल्ड्यू को तुरंत रोकता है।"
  },
  {
    id: 6,
    name: "3-in-1 Soil pH, Moisture & Sunlight Meter",
    nameHi: "3-इन-1 मिट्टी पीएच, नमी और धूप मीटर",
    price: 499,
    originalPrice: 799,
    category: "Testing Kits",
    categoryHi: "जांच किट",
    badge: "No Battery Needed",
    badgeHi: "बैटरी रहित",
    rating: 4.6,
    reviews: 64,
    image: "📟",
    inStock: true,
    description: "Instant testing probe to measure soil acidity and moisture level before fertilizer or irrigation.",
    descriptionHi: "खाद या सिंचाई से पहले मिट्टी की अम्लीयता और नमी स्तर की तुरंत सटीक जांच करने वाला यंत्र।"
  },
  {
    id: 7,
    name: "High-Carbon Steel Ergonomic Pruning Shears",
    nameHi: "उच्च-कार्बन स्टील कटाई एवं छंटाई कैंची (Pruner)",
    price: 420,
    originalPrice: 600,
    category: "Tools & Sprayers",
    categoryHi: "कृषि उपकरण",
    badge: "Durable Steel",
    badgeHi: "मजबूत स्टील",
    rating: 4.8,
    reviews: 112,
    image: "✂️",
    inStock: true,
    description: "Precision branch cutter for removing diseased foliage, suckers, and dead plant canes with clean cuts.",
    descriptionHi: "रोगग्रस्त पत्तियों, सूखी टहनियों और शाखाओं को साफ़-सुथरे तरीके से काटने के लिए टिकाऊ कैंची।"
  },
  {
    id: 8,
    name: "Wheat HD-2967 Certified Sowing Seeds (10 kg)",
    nameHi: "गेहूं HD-2967 प्रमाणित बुवाई बीज (10 किग्रा)",
    price: 650,
    originalPrice: 850,
    category: "Seeds",
    categoryHi: "बीज",
    badge: "High Yield",
    badgeHi: "अधिक पैदावार",
    rating: 4.9,
    reviews: 175,
    image: "🌾",
    inStock: true,
    description: "Government-certified high yielding wheat variety tolerant to yellow rust and lodging.",
    descriptionHi: "पीला रतुआ प्रतिरोधी और अधिक उपज देने वाली सरकार द्वारा प्रमाणित उन्नत गेहूं बीज किस्म।"
  }
];

const CATEGORIES = [
  { key: "All", labelEn: "All Products", labelHi: "सभी उत्पाद" },
  { key: "Seeds", labelEn: "Seeds", labelHi: "उन्नत बीज" },
  { key: "Organic Care", labelEn: "Organic Care", labelHi: "जैविक उत्पाद" },
  { key: "Crop Health", labelEn: "Crop Health", labelHi: "दवाइयां" },
  { key: "Tools & Sprayers", labelEn: "Tools & Sprayers", labelHi: "स्प्रेयर व उपकरण" },
  { key: "Testing Kits", labelEn: "Testing Kits", labelHi: "जांच किट" }
];

export default function Shop() {
  const { isHindi, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const filteredProducts = PRODUCTS_DATA.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;

    const query = search.toLowerCase();
    const nameStr = isHindi ? `${product.nameHi} ${product.name}` : product.name;
    const descStr = isHindi ? `${product.descriptionHi} ${product.description}` : product.description;
    const catStr = isHindi ? `${product.categoryHi} ${product.category}` : product.category;

    const matchesSearch =
      nameStr.toLowerCase().includes(query) ||
      descStr.toLowerCase().includes(query) ||
      catStr.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart((current) =>
      current
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((current) => current.filter((item) => item.id !== productId));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setOrderPlaced(true);
    setTimeout(() => {
      setCart([]);
      setOrderPlaced(false);
    }, 4500);
  };

  return (
    <main className="shop-page">
      {/* ─── MARKETPLACE HERO ──────────────────────────────── */}
      <section className="shop-hero">
        <div className="shop-hero-inner">
          <span className="shop-pill">{isHindi ? "🌾 किसान प्रमाणित कृषि बाज़ार" : "🌾 FARMER CERTIFIED MARKETPLACE"}</span>
          <h1 className="shop-heading">{t("shop.title", "Farm Care Store")}</h1>
          <p className="shop-subheading">
            {t("shop.subtitle", "Authentic disease-resistant seeds, lab-tested bio-pesticides, and agronomy equipment delivered to your farm.")}
          </p>

          <div className="shop-search-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="search"
              placeholder={isHindi ? "बीज, नीम तेल, स्प्रेयर, दवाइयां खोजें..." : "Search seeds, neem oil, sprayers, fungicides..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search agricultural products"
            />
            {search && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearch("")}
                aria-label="Clear search query"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ─── CATEGORY FILTER CHIPS ────────────────────────── */}
      <div className="shop-category-bar">
        <div className="category-scroll-container">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              className={`category-chip ${selectedCategory === cat.key ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat.key)}
            >
              {isHindi ? cat.labelHi : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* ─── MAIN CONTENT: PRODUCT GRID + CART ASIDE ──────── */}
      <section className="shop-content-section">
        <div className="shop-layout-container">
          {/* Products Column */}
          <div className="products-column">
            <div className="products-header-row">
              <h2 className="products-count-title">
                {selectedCategory === "All"
                  ? (isHindi ? "सभी कृषि उत्पाद" : "All Agricultural Supplies")
                  : (isHindi ? (CATEGORIES.find(c => c.key === selectedCategory)?.labelHi || selectedCategory) : selectedCategory)}
                <span className="count-badge">({filteredProducts.length})</span>
              </h2>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="no-products-empty-state">
                <span className="empty-emoji">🔍</span>
                <h3>{isHindi ? "कोई उत्पाद नहीं मिला" : "No agricultural supplies found"}</h3>
                <p>{isHindi ? "बीज, नीम तेल, दवाइयां खोजें या फ़िल्टर रीसेट करें।" : "Try searching for seeds, neem oil, fungicide, or clear your filters."}</p>
                <button
                  type="button"
                  className="btn-reset-filters"
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("All");
                  }}
                >
                  {isHindi ? "सभी फ़िल्टर हटाएं" : "Reset All Filters"}
                </button>
              </div>
            ) : (
              <div className="product-cards-grid">
                {filteredProducts.map((product) => (
                  <article className="pro-product-card" key={product.id}>
                    <div className="card-top-badges">
                      <span className="badge-tag">{isHindi ? product.badgeHi : product.badge}</span>
                      <span className="stock-indicator">
                        <span className="stock-dot"></span> {isHindi ? "उपलब्ध है" : "In Stock"}
                      </span>
                    </div>

                    <div className="product-media-box">
                      <span className="product-illustration">{product.image}</span>
                    </div>

                    <div className="product-info-wrap">
                      <div className="rating-row">
                        <span className="star-icon">★</span>
                        <span className="rating-score">{product.rating}</span>
                        <span className="rating-count">({product.reviews})</span>
                        <span className="category-tag-sub">• {isHindi ? product.categoryHi : product.category}</span>
                      </div>

                      <h3 className="product-name">{isHindi ? product.nameHi : product.name}</h3>
                      <p className="product-desc">{isHindi ? product.descriptionHi : product.description}</p>

                      <div className="product-card-bottom">
                        <div className="price-block">
                          <span className="current-price">₹{product.price}</span>
                          {product.originalPrice && (
                            <span className="mrp-price">₹{product.originalPrice}</span>
                          )}
                        </div>

                        <button
                          type="button"
                          className="btn-add-to-cart"
                          onClick={() => addToCart(product)}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                            <path d="M3 6h18" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                          </svg>
                          <span>{isHindi ? "जोड़ें" : "Add"}</span>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Sticky Cart Sidebar */}
          <aside className="cart-sidebar-panel">
            <div className="cart-card-header">
              <div className="cart-header-title">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
                <h3>{isHindi ? "किसान कार्ट" : "Farm Cart"}</h3>
              </div>
              <span className="cart-count-pill">{totalItems} {isHindi ? "सामान" : "items"}</span>
            </div>

            {orderPlaced && (
              <div className="order-success-banner" role="alert">
                <span>🎉 {isHindi ? "ऑर्डर सफलतापूर्वक दर्ज हुआ! खेत तक शीघ्र डिलीवरी रवाना होगी।" : "Order simulated successfully! Fast farm delivery dispatched."}</span>
              </div>
            )}

            {cart.length === 0 ? (
              <div className="cart-empty-box">
                <span className="empty-cart-icon">🛒</span>
                <p className="empty-cart-title">{isHindi ? "आपकी टोकरी खाली है" : "Your cart is empty"}</p>
                <p className="empty-cart-desc">
                  {isHindi ? "ऑर्डर करने के लिए बीज, खाद या स्प्रेयर कार्ट में जोड़ें।" : "Add seeds, fertilizers, or sprayers to place your farm order."}
                </p>
              </div>
            ) : (
              <div className="cart-body">
                <div className="cart-items-list">
                  {cart.map((item) => (
                    <div className="cart-item-row" key={item.id}>
                      <span className="cart-item-icon">{item.image}</span>
                      <div className="cart-item-details">
                        <h4 className="cart-item-name">{isHindi ? item.nameHi : item.name}</h4>
                        <span className="cart-item-unit-price">₹{item.price} {isHindi ? "प्रति इकाई" : "each"}</span>
                        <div className="cart-qty-stepper">
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, -1)}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="qty-number">{item.quantity}</span>
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="cart-item-right">
                        <span className="cart-item-total">₹{item.price * item.quantity}</span>
                        <button
                          type="button"
                          className="cart-remove-icon-btn"
                          onClick={() => removeFromCart(item.id)}
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-summary-breakdown">
                  <div className="summary-row">
                    <span>{isHindi ? "कुल मूल्य" : "Subtotal"}</span>
                    <span>₹{totalAmount}</span>
                  </div>
                  <div className="summary-row">
                    <span>{isHindi ? "खेत तक डिलीवरी" : "Farm Delivery"}</span>
                    <span className="delivery-free">{isHindi ? "मुफ़्त (FREE)" : "FREE"}</span>
                  </div>
                  <div className="summary-row total-row">
                    <span>{isHindi ? "भुगतान योग्य राशि" : "Estimated Total"}</span>
                    <span className="final-total">₹{totalAmount}</span>
                  </div>

                  <button
                    type="button"
                    className="btn-checkout-now"
                    onClick={handleCheckout}
                  >
                    {isHindi ? "ऑर्डर कन्फर्म करें →" : "Proceed to Farm Checkout →"}
                  </button>
                  <p className="checkout-note">{isHindi ? "कैश ऑन डिलीवरी (COD) और UPI समर्थित" : "Demo Store • Cash on Delivery & UPI supported"}</p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
