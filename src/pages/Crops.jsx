const crops = [
  {
    name: "Wheat",
    season: "Rabi",
    icon: "🌾",
  },
  {
    name: "Rice",
    season: "Kharif",
    icon: "🌾",
  },
  {
    name: "Tomato",
    season: "Multiple",
    icon: "🍅",
  },
  {
    name: "Potato",
    season: "Rabi",
    icon: "🥔",
  },
  {
    name: "Maize",
    season: "Kharif",
    icon: "🌽",
  },
  {
    name: "Mustard",
    season: "Rabi",
    icon: "🌼",
  },
];

function Crops() {
  return (
    <section className="content-page">
      <div className="page-heading">
        <p>CROP INFORMATION</p>
        <h1>Crop Guide</h1>
        <span>
          Learn about different crops and their cultivation.
        </span>
      </div>

      <div className="crop-grid">
        {crops.map((crop) => (
          <div className="crop-card" key={crop.name}>
            <div className="crop-icon">{crop.icon}</div>
            <h2>{crop.name}</h2>
            <p>Season: {crop.season}</p>
            <button>View Details →</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Crops;