import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from './AuthContext'

export default function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext)
  const demo = import.meta.env.VITE_DEMO_MODE === 'true'
  if (!user && !demo) return <Navigate to="/login" replace />
  return children
}
