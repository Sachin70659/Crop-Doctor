
import { useState } from "react";
import "./Shop.css";

const products = [
  {
    id: 1,
    name: "Vegetable Seeds Pack",
    price: 120,
    category: "Seeds",
    image: "🌱",
    description: "Seeds for a home vegetable garden",
  },
  {
    id: 2,
    name: "Organic Compost",
    price: 180,
    category: "Garden Care",
    image: "🌿",
    description: "Compost for garden soil",
  },
  {
    id: 3,
    name: "Garden Tool Set",
    price: 350,
    category: "Tools",
    image: "🧰",
    description: "Useful tools for gardening",
  },
  {
    id: 4,
    name: "Plant Pots Set",
    price: 250,
    category: "Pots",
    image: "🪴",
    description: "Pots for growing plants",
  },
];

export default function Shop() {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  function addToCart(product) {
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
  }

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <main className="shop-page">
      <section className="shop-hero">
        <p>🌾 CROP DOCTOR MARKETPLACE</p>
        <h1>Grow Better, Naturally</h1>
        <p>Find useful products for your garden and farm.</p>

        <input
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search products"
        />
      </section>

      <section className="shop-content">
        <h2>Our Products</h2>

        <div className="shop-layout">
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-image">{product.image}</div>

                <p className="product-category">{product.category}</p>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <h3>₹{product.price}</h3>

                <button onClick={() => addToCart(product)}>
                  Add to Cart
                </button>
              </article>
            ))}

            {filteredProducts.length === 0 && (
              <p>No products found.</p>
            )}
          </div>

          <aside className="cart-panel">
            <h2>🛒 Your Cart ({cart.reduce(
              (sum, item) => sum + item.quantity, 0
            )})</h2>

            {cart.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <>
                {cart.map((item) => (
                  <div className="cart-item" key={item.id}>
                    <span>{item.name} × {item.quantity}</span>
                    <strong>₹{item.price * item.quantity}</strong>
                    <button
                      className="remove-btn"
                      onClick={() =>
                        setCart((current) =>
                          current.filter((p) => p.id !== item.id)
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <h3>Total: ₹{total}</h3>
                <p>Cart demo only — no order has been placed.</p>
              </>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
