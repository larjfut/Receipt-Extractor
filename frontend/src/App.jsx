import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UploadPage from './pages/UploadPage.jsx';
import ReviewPage from './pages/ReviewPage.jsx';
import SignaturePage from './pages/SignaturePage.jsx';
import SubmitPage from './pages/SubmitPage.jsx';
import { ReceiptProvider } from './context/ReceiptContext.jsx';

export default function App() {
  return (
    <ReceiptProvider>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Navigate to="/upload" replace />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/signature" element={<SignaturePage />} />
          <Route path="/submit" element={<SubmitPage />} />
        </Routes>
      </div>
    </ReceiptProvider>
  );
}
