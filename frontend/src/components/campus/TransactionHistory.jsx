import React from 'react'
import { useApp } from '../../context/AppContext'

export default function TransactionHistory() {
  const { state } = useApp()
  const txs = state.recentTxs ?? []

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-sm text-gray-500">Transaction History</h3>
      <ul className="mt-2 text-sm space-y-2">
        {txs.length === 0 ? (
          <li className="text-gray-400">No history</li>
        ) : (
          txs.map((t) => (
            <li key={t.id} className="flex justify-between items-start">
              <div>
                <div className="font-medium">{t.type} • {t.amount} ALGO</div>
                <div className="text-xs text-slate-500">From {t.senderFull ? t.senderFull : t.sender} • {t.date}</div>
                {t.rawNote && <div className="text-xs text-slate-400 italic">{t.rawNote}</div>}
              </div>
              <div className="text-xs text-slate-500">{t.status}</div>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
