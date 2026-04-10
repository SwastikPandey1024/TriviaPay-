import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp, ACTIONS } from '../../context/AppContext'
import { loginUser } from '../../services/api'
import WalletConnectBtn from '../WalletConnectBtn'

export default function LoginForm() {
  const { dispatch, refreshAll, state } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await loginUser({ email, password })
      dispatch({ type: ACTIONS.LOGIN_USER, payload: user })
      await refreshAll(user.walletAddress)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card border-green-200/20 bg-slate-900/70 backdrop-blur-md">
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-green-300">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-sm">🔐</span>
          <div>
            <p className="text-lg font-semibold text-white">Welcome Back</p>
            <p className="text-xs text-slate-300">Sign in to your Trivia Pay account</p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="text-xs text-slate-400">Connect your Pera wallet before payment to sign transactions securely.</div>
        <div className="flex justify-center">
          <WalletConnectBtn />
        </div>
        {state.walletConnected && (
          <p className="text-xs text-green-300 text-center">Connected wallet: {state.address?.slice(0, 6)}…{state.address?.slice(-4)}</p>
        )}
      </div>
      <form onSubmit={handleLogin} className="space-y-3 mt-3">
        <input className="input w-full" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="input w-full" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      </form>
      <div className="text-center text-xs text-slate-400 mt-1">
        Don’t have an account? <a href="/register" className="text-green-400 hover:underline">Register</a>
      </div>
      {error && <p className="text-xs text-red-300 mt-1">{error}</p>}
    </div>
  )
}
