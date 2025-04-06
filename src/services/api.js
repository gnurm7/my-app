const FILEUPLOAD_URL = "https://localhost:7196/api/FileUpload";
const EDITOR_URL = "https://localhost:7196/api/Editor"; // 👈 yeni eklendi
const REVIEWER_URL = "https://localhost:7196/api/Reviewer"; // 👈 yeni eklendi
// 1. Makale Yükleme
export const uploadArticle = async (formData) => {
  const response = await fetch(FILEUPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error(await response.text());

  return await response.json(); // { Message, TrackingNumber }
};

// 2. Revize Dosya Yükleme
export const uploadRevision = async (trackingNumber, file) => {
  const formData = new FormData();
  formData.append("newFile", file);

  const response = await fetch(`${FILEUPLOAD_URL}/revise/${trackingNumber}`, {
    method: "PUT",
    body: formData,
  });

  if (!response.ok) throw new Error(await response.text());

  return await response.json();
};

// 3. Revize Edilmiş Dosya Bilgisi Getirme
export const getRevisedFile = async (trackingNumber) => {
  const response = await fetch(`${FILEUPLOAD_URL}/revise/${trackingNumber}`);

  if (!response.ok) throw new Error(await response.text());

  return await response.json();
};

// 4. Makale Durum ve Feedback Sorgulama (Yazarın eriştiği)
export const checkStatus = async (trackingNumber, email) => {
  const response = await fetch(`${FILEUPLOAD_URL}/status/${trackingNumber}?email=${email}`);

  if (!response.ok) throw new Error(await response.text());

  return await response.json();
};

// 5. Editöre Mesaj Gönderme
export async function sendMessage(trackingNumber, message) {
  const response = await fetch(`${FILEUPLOAD_URL}/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trackingNumber, message }),
  });

  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

// 6. Mesajları Getirme
export async function getMessages(trackingNumber) {
  const response = await fetch(`${FILEUPLOAD_URL}/messages?trackingNumber=${trackingNumber}`);

  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

// 🧞 EDITOR İŞLEMLERİ 🧞

// 7. Editör Makaleleri Getir
export async function getArticles() {
  const response = await fetch(`${EDITOR_URL}/articles`);
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

// 8. Makale Durumu Güncelleme
export async function updateArticleStatus(articleId, newStatus) {
  const response = await fetch(`${EDITOR_URL}/status/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ articleId, status: newStatus }),
  });

  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

// 9. Geri Bildirim Ekle
export async function addFeedback(articleId, feedback) {
  const response = await fetch(`${EDITOR_URL}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ articleId, feedback }),
  });

  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
// 12. Hakem Atama
export async function assignReviewer(articleId, reviewerEmail) {
  const response = await fetch("https://localhost:7196/api/Editor/assign-reviewer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ articleId, reviewerEmail }),
  });

  if (!response.ok) throw new Error(await response.text());
  return response.json(); // { message }
}

// 10. Hakeme Atanmış Makaleleri Getir
export async function getReviewerArticles(email) {
  const response = await fetch(`${EDITOR_URL}/reviewer/articles?email=${email}`);

  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

// 11. Hakem Değerlendirme Gönder
export async function submitReview(articleId, reviewText) {
  const response = await fetch(`${EDITOR_URL}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ articleId, reviewText }),
  });

  if (!response.ok) throw new Error(await response.text());
  return response.json();
}
// 13. Hakem Ekleme (ReviewerController)
export async function addReviewer(reviewer) {
  const response = await fetch(`${REVIEWER_URL}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reviewer),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }

  return await response.json(); // { message: "Hakem eklendi" }
}

// 14. Tüm Hakemleri Getir (ReviewerController)
export async function getReviewers() {
  const response = await fetch(`${REVIEWER_URL}/all`);

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }

  return await response.json(); // reviewer listesi
}