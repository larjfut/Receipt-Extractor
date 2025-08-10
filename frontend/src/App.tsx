import { Routes, Route } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import HomePage from "./pages/HomePage"
import UploadPage from "./pages/UploadPage"
import ReviewPage from "./pages/ReviewPage"
import SignaturePage from "./pages/SignaturePage"
import SubmitPage from "./pages/SubmitPage"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/review" element={<ReviewPage />} />
      <Route path="/signature" element={<SignaturePage />} />
      <Route path="/submit" element={<SubmitPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  )
}
