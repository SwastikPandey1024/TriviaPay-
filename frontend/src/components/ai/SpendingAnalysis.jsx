import React, { useMemo } from 'react'
import { useApp } from '../../context/AppContext'

function MiniBar({ value, max }) {
  const pct = max > 0 ? Math.max(4, Math.round((value / max) * 100)) : 4
  return (
    <div className="w-full bg-surface-700/40 rounded-full h-3 progress-track">
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}

export default function SpendingAnalysis() {
  const { state } = useApp()

  // Aggregate recent transactions into daily buckets (last 7 days)
  const { labels, totals, max } = useMemo(() => {
    const last7 = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })
    const totals = last7.map(() => 0)
    const txs = state.recentTxs || []
    txs.forEach(tx => {
      if (!tx.date || !tx.amount) return
      const idx = last7.findIndex(l => l === tx.date)
      if (idx >= 0) totals[idx] += parseFloat(tx.amount || 0)
    })
    const max = Math.max(...totals, 1)
    return { labels: last7, totals, max }
  }, [state.recentTxs])

  const recommended = [
    { id: 'r1', text: 'Reduce small daily spends (coffee) to save ~5 ALGO/month.' },
    { id: 'r2', text: 'Set a weekly cap for dining-out and use bill-splits.' },
  ]

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-medium">Spending Analysis</h2>
          <p className="text-sm text-slate-400">Summary of on-chain and in-app spending over the last 7 days.</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Total spent</p>
          <p className="text-lg font-semibold text-red-400">{totals.reduce((s, v) => s + v, 0).toFixed(4)} ALGO</p>
        </div>
      </div>

      <div className="card">
        <div className="space-y-3">
          {labels.map((label, i) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-24 text-xs text-slate-400">{label}</div>
              <div className="flex-1">
                <MiniBar value={totals[i]} max={max} />
              </div>
              <div className="w-20 text-right font-semibold">{totals[i].toFixed(4)} Ⓐ</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card md:col-span-2">
          <h3 className="font-semibold">Top Categories</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-400">
            <div className="flex items-center justify-between">
              <div>Food &amp; Drink</div>
              <div className="font-semibold text-slate-200">{(totals.reduce((s,v)=>s+v,0)*0.6).toFixed(4)} Ⓐ</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Transport</div>
              <div className="font-semibold text-slate-200">{(totals.reduce((s,v)=>s+v,0)*0.15).toFixed(4)} Ⓐ</div>
            </div>
            <div className="flex items-center justify-between">
              <div>Misc</div>
              <div className="font-semibold text-slate-200">{(totals.reduce((s,v)=>s+v,0)*0.25).toFixed(4)} Ⓐ</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold">Recommendations</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            {recommended.map(r => (
              <li key={r.id} className="flex items-start gap-2">
                <span className="text-green-400">•</span>
                <span>{r.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
