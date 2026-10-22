import { useState } from "react";
import "./Shop.css";

const PRODUCTS_DATA = [
  {
    id: 1,
    name: "Certified Hybrid Tomato Seeds (Arka Rakshak)",
    price: 199,
    originalPrice: 280,
    category: "Seeds",
    badge: "Triple Disease Resistant",
    rating: 4.9,
    reviews: 142,
    image: "🍅",
    inStock: true,
    description: "High yielding hybrid resistant to Leaf Curl Virus, Early & Late Blight. Ideal for all Indian soil types."
  },
  {
    id: 2,
    name: "Pure Cold-Pressed Neem Oil (10,000 PPM)",
    price: 349,
    originalPrice: 450,
    category: "Organic Care",
    badge: "100% Organic",
    rating: 4.8,
    reviews: 218,
    image: "🌿",
    inStock: true,
    description: "Natural organic broad-spectrum bio-pesticide. Effective against aphids, whiteflies, powdery mildew and rust."
  },
  {
    id: 3,
    name: "Enriched Bio-Vermicompost (5 kg Bag)",
    price: 249,
    originalPrice: 320,
    category: "Organic Care",
    badge: "Soil Booster",
    rating: 4.7,
    reviews: 95,
    image: "🌱",
    inStock: true,
    description: "Microbial rich earthworm casting with humic acid for explosive root development and moisture retention."
  },
  {
    id: 4,
    name: "16-Litre 2-in-1 Battery Backpack Sprayer",
    price: 1899,
    originalPrice: 2400,
    category: "Tools & Sprayers",
    badge: "Best Seller",
    rating: 4.9,
    reviews: 310,
    image: "🧰",
    inStock: true,
    description: "Rechargeable 12V battery sprayer with brass nozzles. Covers up to 25 spray tanks on a single charge."
  },
  {
    id: 5,
    name: "Fungicide Shield Pack (Mancozeb 75 WP - 500g)",
    price: 280,
    originalPrice: 350,
    category: "Crop Health",
    badge: "Cure Protocol",
    rating: 4.8,
    reviews: 86,
    image: "🛡️",
    inStock: true,
    description: "Broad-spectrum contact fungicide recommended by agronomists for Early Blight, Blast, and Downy Mildew."
  },
  {
    id: 6,
    name: "3-in-1 Soil pH, Moisture & Sunlight Meter",
    price: 499,
    originalPrice: 799,
    category: "Testing Kits",
    badge: "No Battery Needed",
    rating: 4.6,
    reviews: 64,
    image: "📟",
    inStock: true,
    description: "Instant testing probe to measure soil acidity and moisture level before fertilizer or irrigation."
  },
  {
    id: 7,
    name: "High-Carbon Steel Ergonomic Pruning Shears",
    price: 420,
    originalPrice: 600,
    category: "Tools & Sprayers",
    badge: "Durable Steel",
    rating: 4.8,
    reviews: 112,
    image: "✂️",
    inStock: true,
    description: "Precision branch cutter for removing diseased foliage, suckers, and dead plant canes with clean cuts."
  },
  {
    id: 8,
    name: "Wheat HD-2967 Certified Sowing Seeds (10 kg)",
    price: 650,
    originalPrice: 850,
    category: "Seeds",
    badge: "High Yield",
    rating: 4.9,
    reviews: 175,
    image: "🌾",
    inStock: true,
    description: "Government-certified high yielding wheat variety tolerant to yellow rust and lodging."
  }
];

const CATEGORIES = ["All", "Seeds", "Organic Care", "Crop Health", "Tools & Sprayers", "Testing Kits"];

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const filteredProducts = PRODUCTS_DATA.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase());
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
    }, 4000);
  };

  return (
    <main className="shop-page">
      {/* ─── MARKETPLACE HERO ──────────────────────────────── */}
      <section className="shop-hero">
        <div className="shop-hero-inner">
          <span className="shop-pill">🌾 FARMER CERTIFIED MARKETPLACE</span>
          <h1 className="shop-heading">Farm Health & Care Store</h1>
          <p className="shop-subheading">
            Authentic disease-resistant seeds, lab-tested bio-pesticides, and agronomy equipment delivered to your farm.
          </p>

          <div className="shop-search-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="search"
              placeholder="Search seeds, neem oil, sprayers, fungicides..."
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
              key={cat}
              type="button"
              className={`category-chip ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
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
                {selectedCategory === "All" ? "All Agricultural Supplies" : selectedCategory}
                <span className="count-badge">({filteredProducts.length})</span>
              </h2>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="no-products-empty-state">
                <span className="empty-emoji">🔍</span>
                <h3>No agricultural supplies found</h3>
                <p>Try searching for seeds, neem oil, fungicide, or clear your filters.</p>
                <button
                  type="button"
                  className="btn-reset-filters"
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("All");
                  }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="product-cards-grid">
                {filteredProducts.map((product) => (
                  <article className="pro-product-card" key={product.id}>
                    <div className="card-top-badges">
                      <span className="badge-tag">{product.badge}</span>
                      <span className="stock-indicator">
                        <span className="stock-dot"></span> In Stock
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
                        <span className="category-tag-sub">• {product.category}</span>
                      </div>

                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-desc">{product.description}</p>

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
                          <span>Add</span>
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
                <h3>Farm Cart</h3>
              </div>
              <span className="cart-count-pill">{totalItems} items</span>
            </div>

            {orderPlaced && (
              <div className="order-success-banner" role="alert">
                <span>🎉 Order simulated successfully! Fast farm delivery dispatched.</span>
              </div>
            )}

            {cart.length === 0 ? (
              <div className="cart-empty-box">
                <span className="empty-cart-icon">🛒</span>
                <p className="empty-cart-title">Your cart is empty</p>
                <p className="empty-cart-desc">Add seeds, fertilizers, or sprayers to place your farm order.</p>
              </div>
            ) : (
              <div className="cart-body">
                <div className="cart-items-list">
                  {cart.map((item) => (
                    <div className="cart-item-row" key={item.id}>
                      <span className="cart-item-icon">{item.image}</span>
                      <div className="cart-item-details">
                        <h4 className="cart-item-name">{item.name}</h4>
                        <span className="cart-item-unit-price">₹{item.price} each</span>
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
                    <span>Subtotal</span>
                    <span>₹{totalAmount}</span>
                  </div>
                  <div className="summary-row">
                    <span>Farm Delivery</span>
                    <span className="delivery-free">FREE</span>
                  </div>
                  <div className="summary-row total-row">
                    <span>Estimated Total</span>
                    <span className="final-total">₹{totalAmount}</span>
                  </div>

                  <button
                    type="button"
                    className="btn-checkout-now"
                    onClick={handleCheckout}
                  >
                    Proceed to Farm Checkout →
                  </button>
                  <p className="checkout-note">Demo Store • Cash on Delivery & UPI supported</p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
