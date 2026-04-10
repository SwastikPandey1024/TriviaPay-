import React, { useState } from 'react'
import { useApp, ACTIONS } from '../../context/AppContext'

export default function CreateExpense() {
  const { dispatch } = useApp()
  const [name, setName] = useState('')
  const [total, setTotal] = useState('')
  const [payees, setPayees] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const id = `bill_${Date.now()}`
    const payeeList = payees.split(',').map((p, i) => ({ id: `p${i}`, address: p.trim(), name: '', status: 'pending', share: 0 }))
    const parsedTotal = parseFloat(total) || 0
    // evenly split shares
    const share = payeeList.length ? +(parsedTotal / payeeList.length).toFixed(4) : 0
    payeeList.forEach(p => p.share = share)
    const bill = { id, name, total: parsedTotal, note: '', creator: null, payees: payeeList, date: new Date().toISOString() }
    dispatch({ type: ACTIONS.ADD_BILL, payload: bill })
    setName(''); setTotal(''); setPayees('')
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-sm text-gray-500">Create Expense</h3>
      <form onSubmit={handleSubmit} className="mt-3 space-y-2 max-w-md">
        <input className="w-full input" placeholder="Expense name" value={name} onChange={e => setName(e.target.value)} />
        <input className="w-full input" placeholder="Total (ALGO)" value={total} onChange={e => setTotal(e.target.value)} />
        <input className="w-full input" placeholder="Payee addresses (comma separated)" value={payees} onChange={e => setPayees(e.target.value)} />
        <div>
          <button className="btn-primary" type="submit">Create</button>
        </div>
      </form>
    </div>
  )
}
