import { useState } from "react";

function Expert() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="content-page">
      <div className="page-heading">
        <p>AGRICULTURE SUPPORT</p>
        <h1>Ask an Expert</h1>
        <span>
          Describe your farming problem and request expert guidance.
        </span>
      </div>

      <form
        className="expert-form"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          placeholder="Your Name"
          required
        />

        <input
          type="text"
          placeholder="Crop Name"
          required
        />

        <textarea
          placeholder="Describe your crop problem..."
          rows="6"
          required
        />

        <input
          type="file"
          accept="image/*"
        />

        <button type="submit">
          Submit Problem
        </button>

        {submitted && (
          <p className="success-message">
            Your request has been submitted successfully.
          </p>
        )}
      </form>
    </section>
  );
}

export default Expert;