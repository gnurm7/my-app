import { useState } from "react";

const ArticleUpload = () => {
  const [email, setEmail] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !email) {
      setMessage("Lütfen e-posta adresi girin ve bir dosya seçin.");
      return;
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setMessage(`Makale başarıyla yüklendi. Takip No: ${data.trackingId}`);
    } catch (error) {
      setMessage("Yükleme başarısız oldu.");
    }
  };

  return (
    <div>
      <h2>Makale Yükleme</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="E-posta adresiniz"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input type="file" accept="application/pdf" onChange={handleFileChange} required />
        <button type="submit">Yükle</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ArticleUpload;
