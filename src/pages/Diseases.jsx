const diseases = [
  {
    name: "Early Blight",
    crop: "Tomato",
    icon: "🍅",
  },
  {
    name: "Leaf Blast",
    crop: "Rice",
    icon: "🌾",
  },
  {
    name: "Powdery Mildew",
    crop: "Wheat",
    icon: "🌱",
  },
  {
    name: "Late Blight",
    crop: "Potato",
    icon: "🥔",
  },
];

function Diseases() {
  return (
    <section className="content-page">
      <div className="page-heading">
        <p>PLANT HEALTH</p>
        <h1>Common Crop Diseases</h1>
        <span>
          Explore symptoms and general prevention information.
        </span>
      </div>

      <div className="disease-grid">
        {diseases.map((disease) => (
          <div className="disease-card" key={disease.name}>
            <div className="disease-icon">{disease.icon}</div>

            <h2>{disease.name}</h2>

            <p>
              Crop: <strong>{disease.crop}</strong>
            </p>

            <button>Read More →</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Diseases;