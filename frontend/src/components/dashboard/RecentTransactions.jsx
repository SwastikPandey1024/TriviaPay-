import React from 'react'

export default function RecentTransactions({ txs = [] }) {
  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-sm text-gray-500">Recent Transactions</h3>
      <ul className="mt-2">
        {txs.length === 0 ? <li className="text-gray-400">No transactions</li> : txs.map((t, i) => (
          <li key={i} className="text-sm">{t}</li>
        ))}
      </ul>
    </div>
  )
}
