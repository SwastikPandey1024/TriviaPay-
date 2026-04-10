import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function ProtectedRoute({ children }) {
  const { state } = useApp()
  const location = useLocation()

  if (!state.authRestored) {
    return null
  }

  const isAuthenticated = state.walletConnected || !!state.user
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}
