import React from 'react'
import { useApp } from '../context/AppContext'
import { Link } from 'react-router-dom'

export default function CampusWallet() {
  const { state } = useApp()

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Campus <span className="gradient-text">Wallet</span></h1>
          <p className="text-slate-400 text-sm mt-1">Manage your campus funds, quick actions and recent activity.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/deposit" className="btn-primary">Deposit</Link>
          <Link to="/scan-pay" className="btn-ghost">Send / Receive</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet summary */}
        <div className="card md:col-span-1">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Your Wallet</p>
          <div className="mt-4">
            <p className="text-sm text-slate-400">Address</p>
            <p className="font-mono text-xs text-cyan-300 break-all">{state.address ?? 'Not connected'}</p>
          </div>
          <div className="mt-4">
            <p className="text-sm text-slate-400">Balance</p>
            <p className="text-2xl font-semibold text-green-400">{state.balance !== null ? `${Number(state.balance).toFixed(4)} ALGO` : '—'}</p>
          </div>
          <div className="mt-4 flex gap-2">
            <Link to="/deposit" className="btn-primary flex-1 text-center">Deposit</Link>
            <Link to="/scan-pay" className="btn-ghost flex-1 text-center">Pay</Link>
          </div>
        </div>

        {/* Pool / Escrow */}
        <div className="card">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Pool / Escrow</p>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Pool Balance</p>
              <p className="text-xl font-semibold text-emerald-300">{state.escrowBalance !== null ? `${Number(state.escrowBalance).toFixed(4)} ALGO` : '—'}</p>
            </div>
            <div className="text-sm text-slate-500 text-right">
              <p>Txs: <span className="font-semibold text-slate-200">{state.recentTxs.length}</span></p>
              <p className="mt-1">Updated: {state.lastRefreshed ? state.lastRefreshed.toLocaleTimeString() : '—'}</p>
            </div>
          </div>
        </div>

        {/* Quick actions + contacts */}
        <div className="card">
          <p className="text-xs text-slate-400 uppercase tracking-wider">Quick Actions</p>
          <div className="mt-4 space-y-3">
            <Link to="/bill-split" className="btn-ghost w-full text-left">Create Bill Split</Link>
            <Link to="/scan-pay" className="btn-ghost w-full text-left">Scan & Pay</Link>
            <Link to="/transactions" className="btn-ghost w-full text-left">View Transactions</Link>
          </div>

          <div className="mt-6">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Frequent Contacts</p>
            <div className="space-y-2">
              {state.recentTxs.slice(0,4).map(tx => (
                <div key={tx.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm truncate">{tx.senderFull?.slice(0,12) ?? tx.receiverFull?.slice(0,12) ?? '—'}</p>
                    <p className="text-xs text-slate-500">{tx.type} · {tx.date}</p>
                  </div>
                  <div className="text-sm font-semibold text-slate-200">{tx.amount} Ⓐ</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="card">
        <h3 className="font-semibold">Recent Activity</h3>
        <div className="mt-3 divide-y divide-white/6">
          {state.recentTxs.length === 0 ? (
            <p className="text-sm text-slate-400 py-6">No activity yet.</p>
          ) : (
            state.recentTxs.slice(0,8).map(tx => (
              <div key={tx.id} className="py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{tx.type} · {tx.rawNote || tx.receiver}</p>
                  <p className="text-xs text-slate-500">{tx.date} — {tx.sender}</p>
                </div>
                <div className={`text-sm font-semibold ${tx.type === 'Payment' ? 'text-green-400' : 'text-cyan-300'}`}>{tx.amount} Ⓐ</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
// import React from 'react'
// import SendMoney from '../components/campus/SendMoney'
// import ReceiveMoney from '../components/campus/ReceiveMoney'
// import TransactionHistory from '../components/campus/TransactionHistory'

// export default function CampusWalletPage() {
//   return (
//     <div className="container mx-auto p-6 space-y-4">
//       <div className="grid grid-cols-2 gap-4">
//         <SendMoney />
//         <ReceiveMoney />
//       </div>
//       <TransactionHistory />
//     </div>
//   )
// }
