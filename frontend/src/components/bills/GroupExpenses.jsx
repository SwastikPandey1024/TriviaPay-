import React from 'react'
import { useApp } from '../../context/AppContext'

export default function GroupExpenses() {
  const { state } = useApp()
  const bills = state.bills || []

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-sm text-gray-500">Group Expenses</h3>
      <div className="mt-3 space-y-3">
        {bills.length === 0 ? (
          <div className="text-gray-400">No group expenses</div>
        ) : bills.map(b => (
          <div key={b.id} className="border p-2 rounded">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{b.name}</div>
                <div className="text-xs text-slate-500">Total: {b.total}</div>
              </div>
              <div className="text-xs text-slate-500">{b.payees.length} payees</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
