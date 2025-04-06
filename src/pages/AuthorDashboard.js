import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  Grid
} from "@mui/material";
import {
  uploadArticle,
  checkStatus,
  sendMessage,
  uploadRevision,
  getMessages
} from "../services/api";

const AuthorDashboard = () => {
  const [email, setEmail] = useState("");
  const [file, setFile] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [status, setStatus] = useState("");
  const [reviseFile, setReviseFile] = useState(null);
  const [messageToEditor, setMessageToEditor] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, text: "", severity: "success" });
  const [feedback, setFeedback] = useState("");

  const showMessage = (text, severity = "success") => {
    setNotification({ open: true, text, severity });
  };

  const handleArticleUpload = async () => {
    if (!email.includes("@")) return showMessage("Geçerli bir e-posta giriniz", "error");
    if (!file) return showMessage("PDF dosyası seçmelisiniz", "error");

    const formData = new FormData();
    formData.append("email", email);
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await uploadArticle(formData);
      setTrackingNumber(res.trackingNumber);
      showMessage("Makale yüklendi. Takip No: " + res.trackingNumber);
    }  catch (error) {
      console.error("🛑 Yükleme sırasında hata:", error);
      showMessage("Yükleme başarısız: " + error.message, "error");
     } finally {
      setLoading(false);
    }
  };

  const handleStatusCheck = async () => {
    if (!trackingNumber || !email.includes("@")) {
      return showMessage("Takip numarası ve e-posta zorunlu", "error");
    }
    try {
      const res = await checkStatus(trackingNumber, email);
      setStatus(res.status);
      setFeedback(res.feedback); // <-- Burada geri bildirimi alıyoruz
      showMessage("Durum getirildi");
    } catch {
      showMessage("Durum sorgulanamadı", "error");
    }
  };
  
  const handleMessageSend = async () => {
    if (!messageToEditor || !trackingNumber) return;
    try {
      await sendMessage(trackingNumber, messageToEditor);
      showMessage("Mesaj gönderildi");
      setMessageToEditor("");
      handleFetchMessages();
    } catch {
      showMessage("Mesaj gönderilemedi", "error");
    }
  };

  const handleFetchMessages = async () => {
    if (!trackingNumber) return;
    try {
      const res = await getMessages(trackingNumber);
      setMessages(res.messages || []);
    } catch {
      showMessage("Mesajlar alınamadı", "error");
    }
  };

  const handleRevisionUpload = async () => {
    if (!reviseFile || !trackingNumber) return;
    try {
      await uploadRevision(trackingNumber, reviseFile);
      showMessage("Revize makale gönderildi");
    } catch {
      showMessage("Revize gönderilemedi", "error");
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "#0d0d2b",
        minHeight: "100vh",
        py: 6,
        px: 3,
        fontFamily: "'Poppins', sans-serif"
      }}
    >
      <Typography
        variant="h3"
        align="center"
        sx={{
          color: "#90caf9",
          mb: 6,
          fontWeight: "bold",
          textShadow: "0 0 15px #2196f3",
          animation: "glow 2s ease-in-out infinite alternate"
        }}
      >
        ✍️ Makale Takip Sistemi
      </Typography>

      <Grid container spacing={5} justifyContent="center">
        <Grid item xs={12} md={5}>
          <Paper
            sx={{
              p: 4,
              borderRadius: 5,
              backdropFilter: "blur(10px)",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
              color: "#fff",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 12px 40px 0 rgba(31, 38, 135, 0.5)"
              }
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#42a5f5' }}>
              📤 Makale Yükle
            </Typography>
            <TextField
              label="E-Posta"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{ style: { color: '#fff' } }}
              InputLabelProps={{ style: { color: '#aaa' } }}
            />
            <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} style={{ color: '#fff', marginBottom: '16px' }} />
            <Button
              variant="contained"
              fullWidth
              sx={{
                mt: 1,
                background: 'linear-gradient(135deg, #2196f3, #21cbf3)',
                color: '#fff',
                fontWeight: 'bold',
                '&:hover': {
                  transform: 'scale(1.02)',
                  background: 'linear-gradient(135deg, #1e88e5, #00bcd4)'
                }
              }}
              onClick={handleArticleUpload}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Makale Yükle"}
            </Button>
            {trackingNumber && (
              <>
                <Divider sx={{ my: 3, bgcolor: '#444' }} />
                <Typography variant="h6">📦 Takip No: {trackingNumber}</Typography>
                <Button
                  variant="outlined"
                  onClick={handleStatusCheck}
                  sx={{ mt: 1, color: '#90caf9', borderColor: '#90caf9' }}
                >
                  Durumu Sorgula
                </Button>
                {status && (
                  <Typography sx={{ mt: 1 }}>Durum: {status}</Typography>
                )} 
                {feedback && (
                <Typography sx={{ mt: 1 }}>
                  🧾 Hakem Yorumu: <i>{feedback}</i>
                </Typography>
                )}

                <Divider sx={{ my: 3, bgcolor: '#444' }} />
                <Typography variant="h6">🔁 Revize Makale</Typography>
                <input type="file" accept="application/pdf" onChange={(e) => setReviseFile(e.target.files[0])} style={{ color: '#fff', marginBottom: '16px' }} />
                <Button
                  onClick={handleRevisionUpload}
                  variant="contained"
                  fullWidth
                  sx={{
                    background: 'linear-gradient(135deg, #ab47bc, #8e24aa)',
                    color: '#fff',
                    fontWeight: 'bold'
                  }}
                >
                  Revize Gönder
                </Button>
              </>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper
            sx={{
              p: 4,
              borderRadius: 5,
              backdropFilter: "blur(10px)",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
              color: "#fff",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 12px 40px 0 rgba(31, 38, 135, 0.5)"
              }
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#42a5f5' }}>
              ✉️ Editörle Mesajlaşma
            </Typography>
            <TextField
              label="Mesaj"
              multiline
              fullWidth
              rows={3}
              value={messageToEditor}
              onChange={(e) => setMessageToEditor(e.target.value)}
              InputProps={{ style: { color: '#fff' } }}
              InputLabelProps={{ style: { color: '#aaa' } }}
            />
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <Button
                onClick={handleMessageSend}
                variant="contained"
                fullWidth
                sx={{
                  background: 'linear-gradient(135deg, #ec407a, #d81b60)',
                  color: '#fff',
                  fontWeight: 'bold',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    background: 'linear-gradient(135deg, #c2185b, #ad1457)'
                  }
                }}
              >
                Gönder
              </Button>
              <Button
                onClick={handleFetchMessages}
                variant="outlined"
                fullWidth
                sx={{ color: '#90caf9', borderColor: '#90caf9' }}
              >
                Yenile
              </Button>
            </Box>
            {trackingNumber && (
              <>
                <Divider sx={{ my: 3, bgcolor: '#444' }} />
                <Typography variant="h6">Mesajlar</Typography>
                <Box sx={{ mt: 2 }}>
                  {messages.length > 0 ? (
                    messages.map((msg, i) => (
                      <Box key={i} sx={{ mb: 2, p: 2, bgcolor: "#2a2a4a", borderRadius: 2 }}>
                        <strong>{msg.sender === "editor" ? "📨 Editör" : "👤 Siz"}:</strong>
                        <div>{msg.text}</div>
                        <small style={{ color: "#bbb" }}>{new Date(msg.date).toLocaleString()}</small>
                      </Box>
                    ))
                  ) : (
                    <Typography>Henüz mesaj yok</Typography>
                  )}
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.severity}>{notification.text}</Alert>
      </Snackbar>

      <style>{`
        @keyframes glow {
          from {
            text-shadow: 0 0 5px #2196f3;
          }
          to {
            text-shadow: 0 0 20px #2196f3, 0 0 30px #21cbf3;
          }
        }
      `}</style>
    </Box>
  );
};

export default AuthorDashboard;
