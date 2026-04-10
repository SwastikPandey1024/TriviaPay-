import React from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useApp } from '../context/AppContext'

export default function Layout({ children }) {
  const { state } = useApp()

  // When wallet connected the navbar grows by ~36px (live status bar)
  const topPad = state.walletConnected ? 'pt-28' : 'pt-16'

  return (
    <div className="min-h-screen dark:bg-surface-900 bg-slate-100">
      <Navbar />
      <Sidebar />

      {/* Main content — offset below navbar (grows when status bar is visible) */}
      <main className={`${topPad} min-h-screen transition-[padding] duration-200`}>
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 page-enter">
          {children}
        </div>
      </main>
    </div>
  )
}
