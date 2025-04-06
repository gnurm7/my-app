// ReviewerDashboard.js
import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import { getReviewerArticles, submitReview } from "../services/api";

const ReviewerDashboard = () => {
  const [email, setEmail] = useState("");
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [notification, setNotification] = useState({ open: false, text: "", severity: "success" });

  const showMessage = (text, severity = "success") => {
    setNotification({ open: true, text, severity });
  };

  const handleFetch = async () => {
    try {
      const data = await getReviewerArticles(email);
      setArticles(data);
    } catch {
      showMessage("Makaleler alınamadı", "error");
    }
  };

  const handleSubmitReview = async () => {
    try {
      await submitReview(selectedArticle.id, reviewText);
      showMessage("Değerlendirme gönderildi");
      setReviewText("");
    } catch {
      showMessage("Gönderim başarısız", "error");
    }
  };

  return (
    <Box sx={{ p: 4, bgcolor: "#1a1a2e", minHeight: "100vh", color: "#fff" }}>
      <Typography variant="h4" sx={{ mb: 3, color: "#4dd0e1" }}>🧑‍🏫 Hakem Paneli</Typography>

      <TextField
        label="E-posta"
        fullWidth
        sx={{ mb: 2 }}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button variant="contained" onClick={handleFetch}>
        Makaleleri Getir
      </Button>

      {articles.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6">Atandığınız Makaleler</Typography>
          {articles.map((article) => (
            <Paper
              key={article.id}
              sx={{ p: 2, my: 2, background: "#2c2c54" }}
              onClick={() => setSelectedArticle(article)}
            >
              <Typography><b>Tracking:</b> {article.trackingNumber}</Typography>
              <Typography><b>Status:</b> {article.status}</Typography>
              <Typography><b>Dosya:</b> {article.fileName}</Typography>
              <a
                href={`https://localhost:7196/${article.filePath}`.replace("\\", "/")}
                target="_blank"
                rel="noreferrer"
              >
                PDF Görüntüle
              </a>
            </Paper>
          ))}
        </Box>
      )}

      {selectedArticle && (
        <Box mt={4}>
          <Typography variant="h6">Değerlendirme Ekle</Typography>
          <TextField
            multiline
            fullWidth
            rows={5}
            sx={{ my: 2 }}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
          <Button
            variant="outlined"
            onClick={handleSubmitReview}
            sx={{ borderColor: "#4dd0e1", color: "#4dd0e1" }}
          >
            Gönder
          </Button>
        </Box>
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.severity}>{notification.text}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ReviewerDashboard;
