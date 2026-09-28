import { useState } from "react";

function Scanner() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = () => {
    if (!image) {
      alert("Please upload a crop image first.");
      return;
    }

    alert(
      "AI analysis will be connected in the next step."
    );
  };

  return (
    <section className="scanner-page">
      <div className="page-heading">
        <p>AI CROP DIAGNOSIS</p>
        <h1>Crop Disease Scanner</h1>
        <span>
          Upload a clear image of your crop or leaf.
        </span>
      </div>

      <div className="scanner-container">
        <div className="upload-box">
          {!preview ? (
            <>
              <div className="upload-icon">📷</div>

              <h2>Upload Crop Image</h2>

              <p>
                JPG, JPEG or PNG
              </p>

              <label className="upload-btn">
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  hidden
                />
              </label>
            </>
          ) : (
            <>
              <img
                src={preview}
                alt="Crop Preview"
                className="crop-preview"
              />

              <label className="change-btn">
                Change Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  hidden
                />
              </label>
            </>
          )}
        </div>

        <div className="analysis-box">
          <h2>🔬 Analysis</h2>

          <div className="result-placeholder">
            <span>🌿</span>
            <p>
              Your crop analysis result will appear here.
            </p>
          </div>

          <button
            className="analyze-btn"
            onClick={handleAnalyze}
          >
            Analyze Crop
          </button>
        </div>
      </div>
    </section>
  );
}

export default Scanner;