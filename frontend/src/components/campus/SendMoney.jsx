import React, { useState } from 'react'
import { useApp, ACTIONS } from '../../context/AppContext'

export default function SendMoney() {
  const { state, dispatch } = useApp()
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')

  function handleSend(e) {
    e.preventDefault()
    const tx = {
      id: `tx_local_${Date.now()}`,
      type: 'Payment',
      amount: Number(amount).toFixed(4),
      sender: state.address || 'You',
      senderFull: state.address || 'You',
      receiver: to,
      receiverFull: to,
      rawNote: note,
      status: 'success',
      date: new Date().toLocaleDateString('en-US'),
    }
    const newTxs = [tx, ...(state.recentTxs || [])]
    dispatch({ type: ACTIONS.SET_RECENT_TXS, payload: newTxs })
    setTo(''); setAmount(''); setNote('')
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-sm text-gray-500">Send Money</h3>
      <form onSubmit={handleSend} className="mt-3 space-y-2 max-w-md">
        <input className="w-full input" placeholder="To address" value={to} onChange={e => setTo(e.target.value)} />
        <input className="w-full input" placeholder="Amount (ALGO)" value={amount} onChange={e => setAmount(e.target.value)} />
        <input className="w-full input" placeholder="Note (optional)" value={note} onChange={e => setNote(e.target.value)} />
        <div>
          <button className="btn-primary" type="submit">Send (mock)</button>
        </div>
      </form>
    </div>
  )
}
