import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { AppProvider, useApp } from './context/AppContext'
import Layout from './layout/Layout'

// Pages
import Dashboard      from './pages/Dashboard'
import Deposit        from './pages/Deposit'
import BillSplit      from './pages/BillSplit'
import PaymentTracker from './pages/PaymentTracker'
import GoalTracker    from './pages/GoalTracker'
import Transactions   from './pages/Transactions'
import Settings       from './pages/Settings'
import ScanPay        from './pages/ScanPay'
import VendorMarketplace from './pages/VendorMarketplace'
import Analytics      from './pages/Analytics'
import CampusWallet   from './pages/CampusWallet'
import AI             from './pages/AI'
import Login          from './pages/Login'
import Register       from './pages/Register'

function ThemedRoot() {
  const { state } = useApp()
  useEffect(() => {
    const root = document.documentElement
    if (state.theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [state.theme])
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><ProtectedRoute><Dashboard /></ProtectedRoute></Layout>} />
        <Route path="/deposit" element={<Layout><ProtectedRoute><Deposit /></ProtectedRoute></Layout>} />
        <Route path="/bill-split" element={<Layout><ProtectedRoute><BillSplit /></ProtectedRoute></Layout>} />
        <Route path="/payment-tracker" element={<Layout><ProtectedRoute><PaymentTracker /></ProtectedRoute></Layout>} />
        <Route path="/goal-tracker" element={<Layout><ProtectedRoute><GoalTracker /></ProtectedRoute></Layout>} />
        <Route path="/transactions" element={<Layout><ProtectedRoute><Transactions /></ProtectedRoute></Layout>} />
        <Route path="/scan-pay" element={<Layout><ProtectedRoute><ScanPay /></ProtectedRoute></Layout>} />
        <Route path="/vendor-marketplace" element={<Layout><ProtectedRoute><VendorMarketplace /></ProtectedRoute></Layout>} />
        <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
        <Route path="/campus-wallet" element={<Layout><ProtectedRoute><CampusWallet /></ProtectedRoute></Layout>} />
        <Route path="/ai" element={<Layout><ProtectedRoute><AI /></ProtectedRoute></Layout>} />
        <Route path="/settings" element={<Layout><ProtectedRoute><Settings /></ProtectedRoute></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AppProvider>
      <ThemedRoot />
    </AppProvider>
  )
}
