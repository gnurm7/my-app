import { useState } from "react";

const Messages = () => {
  const [message, setMessage] = useState("");
  const [responseMsg, setResponseMsg] = useState("");

  const sendMessage = async () => {
    try {
      const response = await fetch("http://localhost:5000/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      setResponseMsg(data.response);
    } catch (error) {
      setResponseMsg("Mesaj gönderilemedi.");
    }
  };

  return (
    <div>
      <h2>Editöre Mesaj Gönder</h2>
      <textarea value={message} onChange={(e) => setMessage(e.target.value)} />
      <button onClick={sendMessage}>Gönder</button>
      {responseMsg && <p>{responseMsg}</p>}
    </div>
  );
};

export default Messages;
