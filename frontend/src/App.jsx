import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import UploadPage from './pages/UploadPage.jsx'
import ReviewPage from './pages/ReviewPage.jsx'
import SignaturePage from './pages/SignaturePage.jsx'
import SubmitPage from './pages/SubmitPage.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'
import { AuthContext } from './auth/AuthContext.jsx'
import logoUrl from './assets/logo.png'

function Header() {
  const { user } = useContext(AuthContext)
  return (
    <div className="gradient-purple-dark text-white shadow-2xl">
      <div className="max-w-7xl mx-auto px-8 py-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img src={logoUrl} alt="TCFV Logo" className="w-14 h-14 rounded-2xl shadow-lg hoverable" />
          <div>
            <h1 className="text-3xl font-bold text-readable-white tracking-tight">Receipt Extractor</h1>
            <p className="text-readable-white-light">TCFV’s Custom Automated Document Processor</p>
          </div>
        </div>
        <div className="text-right bg-white/10 rounded-2xl px-6 py-4 border border-white/15 shadow-lg">
          <p className="font-bold text-readable-white">{user?.name || 'Demo User'}</p>
          <p className="text-readable-white-light">{user?.email || 'demo@company.com'}</p>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen gradient-purple">
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/upload" replace />} />
        <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
        <Route path="/review" element={<ProtectedRoute><ReviewPage /></ProtectedRoute>} />
        <Route path="/signature" element={<ProtectedRoute><SignaturePage /></ProtectedRoute>} />
        <Route path="/submit" element={<ProtectedRoute><SubmitPage /></ProtectedRoute>} />
        <Route path="*" element={<div className="p-8 text-center">404 Not Found</div>} />
      </Routes>
    </div>
  )
}
