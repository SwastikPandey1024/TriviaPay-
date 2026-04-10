import React from 'react'
import { useApp } from '../../context/AppContext'

export default function FraudAlerts() {
  const { state } = useApp()
  const txs = state.recentTxs || []

  // Simple heuristic: flag any incoming payment >= 5 ALGO as suspicious
  const alerts = txs.filter(t => {
    if (t.type !== 'Payment') return false
    const amt = parseFloat(t.amount || '0')
    return amt >= 5
  })

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold">Fraud Alerts</h3>
          <p className="text-xs text-slate-400">Heuristic flags for suspicious activity</p>
        </div>
        <div className="text-sm font-semibold text-red-400">
          {alerts.length} {alerts.length === 1 ? 'alert' : 'alerts'}
        </div>
      </div>

      <div className="mt-3 space-y-3">
        {alerts.length === 0 ? (
          <div className="text-sm text-slate-400">No suspicious activity detected.</div>
        ) : (
          alerts.map(a => (
            <div key={a.id} className="rounded-lg p-3 border border-red-500/10 bg-red-500/5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-red-200">Suspicious payment — {a.amount} ALGO</div>
                  <div className="text-xs text-slate-400">From <span className="font-mono">{a.senderFull}</span></div>
                </div>
                <div className="text-xs text-slate-300">{a.date}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
