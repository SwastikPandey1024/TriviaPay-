import React from 'react'

export default function WalletAddress({ address = '' }) {
  return (
    <div className="p-4">
      <h3 className="text-sm text-gray-500">Wallet Address</h3>
      <div className="mt-1 text-sm break-all">{address || 'Not connected'}</div>
    </div>
  )
}
