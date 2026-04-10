import React from 'react'
import { useApp } from '../../context/AppContext'

export default function SavingRecommendations() {
  const { state } = useApp()
  const goals = state.goals || []

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold">Saving Recommendations</h3>
          <p className="text-xs text-slate-400">Actionable tips to reach your goals faster</p>
        </div>
        <div className="text-xs text-slate-400">{goals.length} {goals.length === 1 ? 'goal' : 'goals'}</div>
      </div>

      <div className="mt-3 space-y-3">
        {goals.length === 0 ? (
          <div className="text-sm text-slate-400">No goals set. Create a goal to get recommendations.</div>
        ) : (
          goals.map(g => {
            const pct = Math.min(100, Math.round((g.current / g.target) * 100))
            const remaining = Math.max(0, (g.target - g.current).toFixed(2))
            const rec = g.current < g.target ? `Contribute ${remaining} ALGO to reach your target` : 'Goal reached 🎉'
            return (
              <div key={g.id} className="rounded-lg p-3 border border-white/6 bg-surface-800/40">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm text-slate-200">{g.name}</div>
                    <div className="text-xs text-slate-400">Progress: {g.current}/{g.target} ({pct}%)</div>
                  </div>
                  <div className="text-sm font-semibold text-green-400">{g.current}/{g.target}</div>
                </div>
                <div className="mt-2 text-sm text-slate-300">{rec}</div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
