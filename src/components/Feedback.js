import { useState } from "react";

const Feedback = () => {
  const [trackingId, setTrackingId] = useState("");
  const [feedback, setFeedback] = useState("");

  const getFeedback = async () => {
    try {
      const response = await fetch(`http://localhost:5000/feedback/${trackingId}`);
      const data = await response.json();
      setFeedback(data.feedback);
    } catch (error) {
      setFeedback("Geri bildirim bulunamadı.");
    }
  };

  return (
    <div>
      <h2>Hakem Geri Bildirimleri</h2>
      <input
        type="text"
        placeholder="Takip Numaranızı Girin"
        value={trackingId}
        onChange={(e) => setTrackingId(e.target.value)}
      />
      <button onClick={getFeedback}>Sorgula</button>
      {feedback && <p>{feedback}</p>}
    </div>
  );
};

export default Feedback;
