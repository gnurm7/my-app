import { useState } from "react";

const ReviewStatus = () => {
  const [trackingId, setTrackingId] = useState("");
  const [status, setStatus] = useState("");

  const checkStatus = async () => {
    try {
      const response = await fetch(`http://localhost:5000/status/${trackingId}`);
      const data = await response.json();
      setStatus(`Durum: ${data.status}`);
    } catch (error) {
      setStatus("Takip numarası bulunamadı.");
    }
  };

  return (
    <div>
      <h2>Makale Değerlendirme Durumu</h2>
      <input
        type="text"
        placeholder="Takip Numaranızı Girin"
        value={trackingId}
        onChange={(e) => setTrackingId(e.target.value)}
      />
      <button onClick={checkStatus}>Sorgula</button>
      {status && <p>{status}</p>}
    </div>
  );
};

export default ReviewStatus;
