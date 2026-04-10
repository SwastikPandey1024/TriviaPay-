import React from 'react'

export default function WalletBalance({ balance = 0 }) {
  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-sm text-gray-500">Wallet Balance</h3>
      <div className="text-2xl font-bold">{balance} ALGO</div>
    </div>
  )
}
