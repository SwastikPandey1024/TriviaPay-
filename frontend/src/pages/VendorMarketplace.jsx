import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import peraWallet from '../services/peraWallet'
import { makePaymentTxn, submitSignedTxn, explorerLink } from '../services/blockchain'
import { getVendors, fraudCheck, saveTransaction, getSseUpdates } from '../services/api'

export default function VendorMarketplace() {
  const { state, refreshAll } = useApp()
  const [vendors, setVendors] = useState([])
  const [selectedVendor, setSelectedVendor] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('Campus marketplace purchase')
  const [status, setStatus] = useState('')
  const [txId, setTxId] = useState(null)
  const [error, setError] = useState('')
  const [recent, setRecent] = useState([])
  const [vendorName, setVendorName] = useState('')
  const [vendorCategory, setVendorCategory] = useState('Food & Drinks')
  const [vendorWalletAddress, setVendorWalletAddress] = useState('')
  const [addVendorError, setAddVendorError] = useState('')
  const [addVendorStatus, setAddVendorStatus] = useState('')

  useEffect(() => {
    getVendors().then((list) => {
      setVendors(list)
      if (list.length > 0) setSelectedVendor(list[0].id)
    }).catch((err) => {
      console.error('[VendorMarketplace] getVendors', err)
      setError('Failed to load vendors. Please ensure backend is running.')
    })
  }, [])

  useEffect(() => {
    const es = getSseUpdates((tx) => {
      setRecent((prev) => [tx, ...prev].slice(0, 6))
    })
    return () => es.close()
  }, [])

  async function handleAddVendor(e) {
    e.preventDefault()
    setAddVendorError('')
    setAddVendorStatus('Adding vendor...')
    try {
      if (!vendorName.trim() || !vendorCategory.trim() || !vendorWalletAddress.trim()) {
        throw new Error('Please fill out name, category, and wallet address.')
      }
      if (vendorWalletAddress.trim().length !== 58) {
        throw new Error('Algorand wallet address must be 58 chars long.')
      }
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://vlpt1123-4001.inc1.devtunnels.ms'}/api/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: vendorName.trim(),
          category: vendorCategory.trim(),
          walletAddress: vendorWalletAddress.trim(),
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        throw new Error(json.error || 'Failed to add vendor')
      }
      setVendors((prev) => [json.vendor, ...prev])
      setSelectedVendor(json.vendor.id)
      setVendorName('')
      setVendorWalletAddress('')
      setAddVendorStatus('Vendor added successfully.')
      setTimeout(() => setAddVendorStatus(''), 2500)
    } catch (err) {
      setAddVendorError(err?.message || 'Failed to add vendor.')
      setAddVendorStatus('')
    }
  }

  async function handleBuy(e) {
    e.preventDefault()
    setError('')
    setTxId(null)
    setStatus('Validating order...')

    const senderAddress = state.address
    if (!state.walletConnected || !senderAddress) {
      setError('Connect your Pera wallet first.'); setStatus(''); return
    }
    if (typeof senderAddress !== 'string' || senderAddress.length !== 58) {
      setError('Connected wallet address is invalid.'); setStatus(''); return
    }
    const vendor = vendors.find((v) => v.id === selectedVendor)
    if (!vendor) {
      setError('Please choose a vendor.'); setStatus(''); return
    }
    if (!vendor.walletAddress || typeof vendor.walletAddress !== 'string' || vendor.walletAddress.length !== 58) {
      setError('Selected vendor has invalid wallet address.'); setStatus(''); return
    }
    const amountNum = Number(amount)
    if (!amountNum || amountNum <= 0) {
      setError('Enter a valid amount above 0.')
      setStatus('')
      return
    }

    try {
      await fraudCheck({ studentWallet: senderAddress, vendorId: vendor.id, amount: amountNum })
      setStatus('Building Algorand payment transaction...')
      console.log('[VendorMarketplace] txn from', senderAddress, 'to', vendor.walletAddress)
      const unsignedTxn = await makePaymentTxn(senderAddress, vendor.walletAddress, amountNum, note)

      // Confirm the connected Pera account can sign this sender
      const connectedAccounts = await peraWallet.reconnectSession()
      if (!connectedAccounts || connectedAccounts.length === 0) {
        throw new Error('No wallet session found. Connect Pera Wallet again before confirming payment.')
      }
      if (connectedAccounts[0] !== senderAddress) {
        throw new Error('Connected Pera account does not match the sender wallet address. Reconnect with the correct wallet account.')
      }

      setStatus('Signing transaction in Pera Wallet...')
      const signedGroups = await peraWallet.signTransaction([[{ txn: unsignedTxn, signers: [] }]])
      const signedBlob = signedGroups[0]

      setStatus('Submitting to Algorand network...')
      const { txId: confirmedId } = await submitSignedTxn(signedBlob)
      setTxId(confirmedId)
      setStatus('Saving transaction to Prisma...')

      await saveTransaction({
        senderWallet: state.address,
        receiverWallet: vendor.walletAddress,
        amount: amountNum,
        txHash: confirmedId,
        type: 'Payment',
        vendorId: vendor.id,
      })

      setStatus('Transaction complete! Dashboard updates via SSE.')
      refreshAll()
    } catch (err) {
      setError(err?.message ?? 'Transaction failed.')
      setStatus('')
      console.error('[VendorMarketplace] error:', err)
    }
  }

  return (
    <div className="space-y-5 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vendor <span className="gradient-text">Marketplace</span></h1>
          <p className="text-slate-400">Select vendor, enter amount, pass fraud check, sign via Pera, and save to Prisma.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card">
          <h2 className="text-lg font-semibold">Buy from Vendor</h2>
          {vendors.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-500 p-4 text-center text-slate-300">
              <p className="font-semibold">No vendors currently available.</p>
              <p className="text-xs text-slate-400 mt-1">Backend seeded default vendors on startup. Refresh if empty.</p>
              <button onClick={() => window.location.reload()} className="mt-2 btn-ghost">Reload vendors</button>
            </div>
          ) : (
            <form onSubmit={handleBuy} className="mt-4 space-y-3">
              <div>
                <label className="text-xs uppercase text-slate-400">Vendor</label>
                <select value={selectedVendor} onChange={(e) => setSelectedVendor(e.target.value)} className="input w-full">
                  <option value="">Select a vendor</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.name} · {v.category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase text-slate-400">Amount (ALGO)</label>
                <input type="number" step="0.001" min="0" className="input w-full" placeholder="e.g. 0.5" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div>
                <label className="text-xs uppercase text-slate-400">Note</label>
                <input className="input w-full" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              <button type="submit" className="btn-primary w-full">Pay Vendor</button>
              {status && <p className="text-xs text-blue-300">⏳ {status}</p>}
              {error && <p className="text-xs text-red-300">⚠️ {error}</p>}
              {txId && <p className="text-xs text-green-300">✅ Sent: <a className="underline" target="_blank" rel="noreferrer" href={`https://testnet.algoexplorer.io/tx/${txId}`}>{txId}</a></p>}
            </form>
          )}

        </div>

        <div className="card space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Live Marketplace Events</h2>
              <p className="text-xs text-slate-400">Transactions from this API appear in real time via SSE.</p>
            </div>
            <div className="rounded-xl border border-green-200/20 bg-slate-800 p-3 text-xs text-slate-200">
              <p className="font-semibold text-green-300">Add vendor (optional)</p>
              <form onSubmit={handleAddVendor} className="space-y-2 mt-1">
                <input
                  className="input w-full text-xs"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="Vendor name"
                  required
                />
                <input
                  className="input w-full text-xs"
                  value={vendorCategory}
                  onChange={(e) => setVendorCategory(e.target.value)}
                  placeholder="Category"
                  required
                />
                <input
                  className="input w-full text-xs"
                  value={vendorWalletAddress}
                  onChange={(e) => setVendorWalletAddress(e.target.value)}
                  placeholder="Algorand wallet address"
                  required
                />
                <button type="submit" className="btn-primary text-xs w-full py-1.5">Add Vendor</button>
              </form>
              {addVendorStatus && <p className="text-[11px] text-emerald-300 mt-1">{addVendorStatus}</p>}
              {addVendorError && <p className="text-[11px] text-red-300 mt-1">{addVendorError}</p>}
            </div>
          </div>
          <div className="space-y-2">
            {recent.length === 0 ? (
              <div className="rounded-xl border border-slate-700 p-3 text-xs text-slate-300">No live transaction events yet.</div>
            ) : (
              recent.map((tx) => (
                <div key={tx.id} className="rounded-xl border border-slate-700 p-3 bg-slate-900/40 text-xs">
                  <div className="flex justify-between gap-2"><span className="font-semibold">{tx.type}</span><span>{tx.amount} ALGO</span></div>
                  <div className="text-slate-400 truncate">{tx.senderWallet} → {tx.receiverWallet}</div>
                  <a className="text-cyan-300 text-[11px] underline" target="_blank" rel="noreferrer" href={`https://testnet.algoexplorer.io/tx/${tx.txHash}`}>View tx</a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold">Architecture Quick Trace</h2>
        <ol className="list-decimal ml-5 text-sm text-slate-300 space-y-1 mt-2">
          <li>Student selects vendor and amount in UI.</li>
          <li>Client calls backend fraud-check API.</li>
          <li>Client builds transaction and signs via Pera Wallet.</li>
          <li>Client submits signed txn to Algorand via Algod.</li>
          <li>Client saves transaction to Prisma via backend API.</li>
          <li>Backend dispatches SSE update to update dashboard events.</li>
        </ol>
      </div>
    </div>
  )
}
