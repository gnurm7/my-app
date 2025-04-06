import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import EditorDashboard from "./pages/EditorDashboard";
import AuthorDashboard from "./pages/AuthorDashboard";
import ReviewerDashboard from "./pages/ReviewerDashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Varsayılan olarak AuthorDashboard açılsın */}
        <Route path="/" element={<Navigate to="/author" replace />} />
        <Route path="/author" element={<AuthorDashboard />} />
        <Route path="/editor" element={<EditorDashboard />} />
        <Route path="/reviewer" element={<ReviewerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
