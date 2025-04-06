import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  MenuItem,
  Grid,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
} from "@mui/material";
import {
  getArticles,
  updateArticleStatus,
  addFeedback,
  assignReviewer,
  addReviewer,
  getReviewers,
} from "../services/api";

const EditorDashboard = () => {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [notification, setNotification] = useState({ open: false, text: "", severity: "success" });
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [reviewers, setReviewers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newReviewer, setNewReviewer] = useState({ name: "", surname: "", email: "" });
  const [anonymizedUrl, setAnonymizedUrl] = useState(null);

  const showMessage = (text, severity = "success") => {
    setNotification({ open: true, text, severity });
  };

  const fetchArticles = useCallback(async () => {
    try {
      const data = await getArticles();
      setArticles(data);
    } catch {
      showMessage("Makaleler yüklenemedi", "error");
    }
  }, []);

  const fetchReviewers = useCallback(async () => {
    try {
      const data = await getReviewers();
      setReviewers(data);
    } catch {
      showMessage("Hakemler yüklenemedi", "error");
    }
  }, []);

  const handleStatusUpdate = async () => {
    if (!selectedArticle || !newStatus) return;
    try {
      await updateArticleStatus(selectedArticle.id, newStatus);
      showMessage("Durum güncellendi");
      fetchArticles();
    } catch {
      showMessage("Durum güncellenemedi", "error");
    }
  };

  const handleAddFeedback = async () => {
    if (!selectedArticle || !feedback) return;
    try {
      await addFeedback(selectedArticle.id, feedback);
      showMessage("Geri bildirim eklendi");
    } catch {
      showMessage("Geri bildirim eklenemedi", "error");
    }
  };

  const handleAssignReviewer = async () => {
    if (!selectedArticle || !reviewerEmail) return;
    try {
      await assignReviewer(selectedArticle.id, reviewerEmail);
      showMessage("Hakem atandı");
      setReviewerEmail("");
      fetchArticles();
    } catch {
      showMessage("Hakem atanamadı", "error");
    }
  };

  const handleAddReviewer = async () => {
    try {
      await addReviewer(newReviewer);
      showMessage("Hakem eklendi");
      setOpenDialog(false);
      setNewReviewer({ name: "", surname: "", email: "" });
      fetchReviewers();
    } catch {
      showMessage("Hakem eklenemedi", "error");
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchReviewers();
  }, [fetchArticles, fetchReviewers]);

  const handleAnonymize = async () => {
    if (!selectedArticle || !selectedArticle.id || !selectedArticle.filePath) {
      alert("Dosya veya makale bilgisi eksik.");
      return;
    }
  
    const inputPath = selectedArticle.filePath;
    const outputPath = inputPath.replace(".pdf", "_anon.pdf");
    const anonFileName = outputPath.split("\\").pop().split("/").pop();
  
    try {
      // 1. Flask'a gönder
      const flaskResponse = await fetch("http://localhost:5001/anonimize-et", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_path: inputPath,
          output_path: outputPath
        })
      });
  
      const flaskData = await flaskResponse.json();
  
      if (!flaskResponse.ok || flaskData.error) {
        alert(flaskData.error || "Anonimleştirme başarısız.");
        return;
      }
  
      // 2. .NET'e anonim dosya adını kaydet (HTTPS olmalı)
      const netResponse = await fetch("https://localhost:7196/api/Editor/anonymized-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: selectedArticle.id,
          anonymizedFileName: anonFileName
        })
      });
  
      const netData = await netResponse.json();
  
      if (!netResponse.ok) {
        alert(netData.error || "Veritabanına anonim dosya kaydı başarısız.");
        return;
      }
  
      // 3. Başarıyla anonimleştirildi
      setAnonymizedUrl(`https://localhost:7196/upload/${anonFileName}`);
      showMessage("✅ Anonimleştirme tamamlandı.");
      fetchArticles(); // listeyi güncelle
    } catch (err) {
      console.error("❌ Hata:", err);
      alert("Sunucuya ulaşılamadı.");
    }
  };
  
  
  
  
  return (
    <Box sx={{ p: 4, bgcolor: "#0d0d2b", minHeight: "100vh", color: "#fff", fontFamily: 'Roboto, sans-serif' }}>
      <Typography variant="h3" gutterBottom sx={{ color: "#81d4fa", fontWeight: "bold" }}>
        🧞 Editör Paneli
      </Typography>
      <Button onClick={() => setOpenDialog(true)} variant="contained" sx={{ mb: 3, background: 'linear-gradient(to right, #00bcd4, #3f51b5)' }}>
        + Yeni Hakem
      </Button>
      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Typography variant="h6" sx={{ color: "#64b5f6" }}>📄 Makaleler</Typography>
          {articles.map((article) => (
            <Paper
              key={article.id}
              elevation={4}
              sx={{ p: 2, my: 2, background: "rgba(255,255,255,0.05)", borderRadius: 3, backdropFilter: "blur(6px)", border: "1px solid #333", cursor: "pointer" }}
              onClick={() => setSelectedArticle(article)}
            >
              <Typography variant="subtitle1"><b>Email:</b> {article.email}</Typography>
              <Typography variant="subtitle2"><b>Durum:</b> {article.status}</Typography>
              <Typography variant="caption">Yüklenme Tarihi: {new Date(article.uploadDate).toLocaleString()}</Typography>
            </Paper>
          ))}
        </Grid>

        {selectedArticle && (
          <Grid item xs={12} md={7}>
            <Paper elevation={5} sx={{ p: 3, background: "rgba(255,255,255,0.05)", borderRadius: 4, backdropFilter: "blur(8px)", border: "1px solid #444" }}>
              <Typography variant="h6" sx={{ mb: 2 }}>📦 Seçili Makale: <b>{selectedArticle.trackingNumber}</b></Typography>

              <TextField
                select
                label="Durum Seç"
                fullWidth
                sx={{ mb: 2 }}
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                InputLabelProps={{ style: { color: '#aaa' } }}
                InputProps={{ style: { color: '#fff' } }}
              >
                <MenuItem value="Kabul">Kabul</MenuItem>
                <MenuItem value="Revize">Revize</MenuItem>
                <MenuItem value="Reddedildi">Reddedildi</MenuItem>
              </TextField>

              <Button
  variant="contained"
  fullWidth
  onClick={handleStatusUpdate}
  sx={{ mb: 3, background: 'linear-gradient(to right, #42a5f5, #478ed1)' }}
>
  Durumu Güncelle
</Button>

{selectedArticle.pdfUrl && (
  <Box sx={{ mt: 3 }}>
    <Typography variant="subtitle1" sx={{ mb: 1, color: "#90caf9" }}>📄 Yüklenen PDF:</Typography>
    <iframe
      title="Makale PDF"
      src={selectedArticle.pdfUrl}
      width="100%"
      height="500px"
      style={{ border: "1px solid #555", borderRadius: "10px" }}
    />
  </Box>
)}
{selectedArticle && (
  <Grid item xs={12} md={7}>
    <Paper elevation={5} sx={{ p: 3, mb: 4, background: "rgba(255,255,255,0.05)", borderRadius: 4, backdropFilter: "blur(8px)", border: "1px solid #444" }}>

      <Button
        variant="contained"
        sx={{ mt: 2, background: 'linear-gradient(to right, #f44336, #e91e63)' }}
        onClick={handleAnonymize}
      >
        🔐 Anonimleştir
      </Button>

      {anonymizedUrl && (
  <Box sx={{ mt: 3 }}>
    <Typography variant="subtitle1" sx={{ color: "#90caf9" }}>🔏 Anonimleştirilmiş PDF:</Typography>
    <iframe
      title="Anonimleştirilmiş PDF"
      src={anonymizedUrl}
      width="100%"
      height="500px"
      style={{ border: "1px solid #555", borderRadius: "10px" }}
    />
  </Box>
)}
    </Paper>
  </Grid>
)}


              <TextField
                label="Geri Bildirim"
                multiline
                fullWidth
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                InputLabelProps={{ style: { color: '#aaa' } }}
                InputProps={{ style: { color: '#fff' } }}
              />
              <Button
                variant="outlined"
                fullWidth
                onClick={handleAddFeedback}
                sx={{ mt: 2, color: '#90caf9', borderColor: '#90caf9' }}
              >
                Geri Bildirim Ekle
              </Button>

              <Select
                fullWidth
                value={reviewerEmail}
                onChange={(e) => setReviewerEmail(e.target.value)}
                displayEmpty
                sx={{ mt: 4, color: '#fff' }}
              >
                <MenuItem value="" disabled>Hakem Seç</MenuItem>
                {reviewers.map((r) => (
                  <MenuItem key={r.email} value={r.email}>{r.name} {r.surname} ({r.email})</MenuItem>
                ))}
              </Select>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleAssignReviewer}
                sx={{ mt: 1, color: '#a5d6a7', borderColor: '#a5d6a7' }}
              >
                Hakem Ata
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Yeni Hakem Ekle</DialogTitle>
        <DialogContent>
          <TextField
            label="İsim"
            fullWidth
            margin="dense"
            value={newReviewer.name}
            onChange={(e) => setNewReviewer({ ...newReviewer, name: e.target.value })}
          />
          <TextField
            label="Soyisim"
            fullWidth
            margin="dense"
            value={newReviewer.surname}
            onChange={(e) => setNewReviewer({ ...newReviewer, surname: e.target.value })}
          />
          <TextField
            label="Email"
            fullWidth
            margin="dense"
            value={newReviewer.email}
            onChange={(e) => setNewReviewer({ ...newReviewer, email: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>İptal</Button>
          <Button onClick={handleAddReviewer} variant="contained">Ekle</Button>
        </DialogActions>
      </Dialog>

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

export default EditorDashboard;
