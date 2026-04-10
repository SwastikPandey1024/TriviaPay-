import React, { useState, useEffect } from 'react'
import TxTable from '../components/TxTable'
import Loader from '../components/Loader'
import { useApp } from '../context/AppContext'

// Labels must match what formatTx() returns for tx.type
const TYPE_OPTIONS   = ['All', 'Payment', 'App Call', 'Asset Transfer']
const STATUSES       = ['All', 'success', 'pending', 'failed']

export default function Transactions() {
  const { state, refreshAll } = useApp()

  // Trigger a refresh whenever this page mounts (if wallet is connected)
  useEffect(() => {
    if (state.walletConnected && state.address) {
      refreshAll(state.address)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // All tx data is maintained centrally by AppContext (refreshed every 30 s + on wallet connect)
  const allTxs  = state.recentTxs
  const loading = state.loading
  const error   = state.fetchError

  const [typeFilter,   setTypeFilter]   = useState('All')   // matches TYPE_OPTIONS labels
  const [statusFilter, setStatusFilter] = useState('All')
  const [search,       setSearch]       = useState('')
  const [startDate,    setStartDate]    = useState('')
  const [endDate,      setEndDate]      = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 8

  const filtered = allTxs.filter(tx => {
    const matchType   = typeFilter   === 'All' || tx.type === typeFilter
    const matchStatus = statusFilter === 'All' || tx.status === statusFilter
    const matchSearch = !search ||
      tx.id.toLowerCase().includes(search.toLowerCase()) ||
      (tx.sender   || '').toLowerCase().includes(search.toLowerCase()) ||
      (tx.receiver || '').toLowerCase().includes(search.toLowerCase())
    const txDate = tx.date ? new Date(tx.date) : null
    const startMatch = !startDate || (txDate && txDate >= new Date(startDate))
    const endMatch = !endDate || (txDate && txDate <= new Date(endDate + 'T23:59:59'))
    return matchType && matchStatus && matchSearch && startMatch && endMatch
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentTxs = filtered.slice((page - 1) * pageSize, page * pageSize)

  const totalAmt = filtered
    .filter(t => t.status === 'success')
    .reduce((s, t) => s + parseFloat(t.amount || 0), 0)

  const downloadStatement = () => {
    if (!filtered.length) return
    const rows = [
      ['Tx ID', 'Type', 'Amount', 'Sender', 'Receiver', 'Status', 'Date'],
      ...filtered.map(tx => [
        tx.id,
        tx.type,
        tx.amount,
        tx.sender,
        tx.receiver,
        tx.status,
        tx.date,
      ]),
    ]
    const csv = rows.map(r => r.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const dateSuffix = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `trivia-statements-${dateSuffix}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Transaction <span className="gradient-text">History</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Live Indexer data · Algorand Testnet
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => refreshAll()}
            disabled={loading || !state.walletConnected}
            className="btn-secondary text-sm px-4 py-2 disabled:opacity-40"
          >
            {loading ? '…' : '↻ Refresh'}
          </button>
          <button
            onClick={downloadStatement}
            disabled={!filtered.length}
            className="btn-primary text-sm px-4 py-2 disabled:opacity-40"
          >
            ⬇️ Download Statement
          </button>
        </div>
      </div>

      {/* Not connected banner */}
      {!state.walletConnected && (
        <div className="rounded-xl p-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 text-yellow-700 dark:text-yellow-200 text-sm">
          🟡 Connect your Pera Wallet to view real transaction history.
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-900 p-3 text-center">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{allTxs.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total Fetched</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-900 p-3 text-center">
          <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-300">{totalAmt.toFixed(3)} Ⓐ</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Volume (filtered)</p>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-900 p-3 text-center">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-300">
            {allTxs.filter(t => t.status === 'pending').length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pending</p>
        </div>
      </div>

      {/* Loader / error */}
      {loading && <Loader text="Fetching from Indexer…" />}
      {error && (
        <div className="rounded-xl p-4 bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
          ❌ {error}
        </div>
      )}

      {/* Filters */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <input
            className="input col-span-2"
            placeholder="Search by Tx ID, sender, receiver…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="input"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            className="input"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      )}
      {!loading && (
        <div className="flex flex-wrap gap-3 items-center mt-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
            <span>From</span>
            <input type="date" className="input input-xs" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300">
            <span>To</span>
            <input type="date" className="input input-xs" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <button
            onClick={() => { setStartDate(''); setEndDate(''); setPage(1) }}
            className="btn-ghost btn-xs"
          >Clear Dates</button>
        </div>
      )}

      {/* Table */}
      {!loading && filtered.length > 0 && (
        <>
          <div className="card p-0 overflow-hidden">
            <div className="p-3 border-b border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Transactions</p>
                <p className="text-xs text-slate-500">Showing {currentTxs.length} of {filtered.length} filtered transactions</p>
              </div>
              <div className="flex items-center gap-2">
                    <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="btn-ghost btn-xs disabled:opacity-40"
                >← Prev</button>
                <span className="text-xs text-slate-500 dark:text-slate-300">Page {page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="btn-ghost btn-xs disabled:opacity-40"
                >Next →</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <TxTable transactions={currentTxs} />
            </div>
          </div>
        </>
      )}
      {!loading && filtered.length === 0 && (
        <div className="card text-center py-8 text-slate-500">
          {state.walletConnected
            ? 'No transactions matched your filters.'
            : 'Connect your wallet to see transactions.'}
        </div>
      )}

      {/* Explorer links */}
      {!loading && state.walletConnected && allTxs.length === 0 && !error && (
        <div className="card text-center py-8 text-slate-500 text-sm">
          No transactions found for this address on Testnet.
        </div>
      )}

      {state.walletConnected && (
        <div className="card text-xs text-slate-500 flex flex-col gap-1">
          <p className="font-semibold text-slate-400 mb-1">Explorer Links</p>
          <a
            href={`https://testnet.algoexplorer.io/address/${state.address}`}
            target="_blank" rel="noreferrer"
            className="text-cyan-500 hover:underline truncate"
          >
            🔗 View wallet on AlgoExplorer
          </a>
          {state.escrowAddress && (
            <a
              href={`https://testnet.algoexplorer.io/address/${state.escrowAddress}`}
              target="_blank" rel="noreferrer"
              className="text-purple-400 hover:underline truncate"
            >
              🔗 View escrow on AlgoExplorer
            </a>
          )}
        </div>
      )}
    </div>
  )
}
