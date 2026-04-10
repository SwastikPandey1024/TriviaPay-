import React from 'react'
import { useApp, ACTIONS } from '../../context/AppContext'

export default function SettlementStatus() {
  const { state, dispatch } = useApp()
  const bills = state.bills || []

  if (bills.length === 0) return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-sm text-gray-500">Settlement Status</h3>
      <div className="mt-2 text-gray-400">No active bills</div>
    </div>
  )

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-sm text-gray-500">Settlement Status</h3>
      <div className="mt-3 space-y-4">
        {bills.map(b => (
          <div key={b.id} className="border p-3 rounded">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{b.name}</div>
                <div className="text-xs text-slate-500">Total: {b.total} • {new Date(b.date).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="mt-2">
              {b.payees.map(p => (
                <div key={p.id} className="flex items-center justify-between text-sm py-1">
                  <div>
                    <div className="font-medium">{p.name || p.address}</div>
                    <div className="text-xs text-slate-500">Share: {p.share} • Status: {p.status}</div>
                  </div>
                  <div>
                    {p.status !== 'paid' && (
                      <button
                        onClick={() => dispatch({ type: ACTIONS.UPDATE_PAYEE_STATUS, payload: { billId: b.id, payeeId: p.id, status: 'paid' } })}
                        className="text-xs text-green-600 font-semibold"
                      >Mark paid</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
