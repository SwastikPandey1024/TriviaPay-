import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, ACTIONS } from '../../context/AppContext'
import { registerUser } from '../../services/api'
import WalletConnectBtn from '../WalletConnectBtn'
import ReceiveQR from '../ReceiveQR'

export default function RegisterForm() {
  const { dispatch, state, refreshAll } = useApp()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const finalWalletAddress = (walletAddress || state.address || '').trim()
      if (!finalWalletAddress || finalWalletAddress.length !== 58) {
        throw new Error('Please connect Pera and/or provide a valid 58-character Algorand wallet address.')
      }
      const user = await registerUser({ name, email, password, walletAddress: finalWalletAddress })
      dispatch({ type: ACTIONS.LOGIN_USER, payload: user })
      await refreshAll(finalWalletAddress)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card border-green-200/20 bg-slate-900/70 backdrop-blur-md">
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-green-300">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-sm">📝</span>
          <div>
            <p className="text-lg font-semibold text-white">Create your account</p>
            <p className="text-xs text-slate-300">Register and connect your Pera wallet.</p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="text-xs text-slate-400">Connect your Pera wallet first to auto-fill your Algorand address.</div>
        <div className="flex justify-center">
          <WalletConnectBtn />
        </div>
        {state.walletConnected && (
          <p className="text-xs text-green-300 text-center">Connected wallet: {state.address?.slice(0, 6)}…{state.address?.slice(-4)}</p>
        )}
      </div>
      {state.walletConnected && (
        <div className="card border border-white/10 p-3 bg-slate-900/50 mt-2">
          <p className="text-xs text-slate-300 mb-2">Scan this QR in Pera to verify your connected wallet address (optional).</p>
          <ReceiveQR compact />
        </div>
      )}
      <form onSubmit={handleRegister} className="space-y-3 mt-3">
        <input className="input w-full" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required />
        <input className="input w-full" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input className="input w-full" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <input
          className="input w-full"
          value={state.walletConnected ? state.address || '' : walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder="Algorand wallet address"
          required
          readOnly={state.walletConnected}
          title={state.walletConnected ? 'Connected wallet address is pre-filled and locked' : ''}
        />
        <button className="btn-primary w-full" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
      </form>
      <div className="text-center text-xs text-slate-400 mt-1">
        Already have an account? <a href="/login" className="text-green-400 hover:underline">Login</a>
      </div>
      {error && <p className="text-xs text-red-300 mt-1">{error}</p>}
    </div>
  )
}
