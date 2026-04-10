import React from 'react'

/**
 * StatCard
 * Props: title, value, sub, icon, accent ('cyan'|'purple'|'green'|'yellow')
 */
export default function StatCard({ title, value, sub, icon, accent = 'cyan' }) {
  const accentMap = {
    cyan:   'from-cyan-100 to-cyan-50 border-cyan-200 text-cyan-700 dark:from-cyan-500/20 dark:to-cyan-500/5 dark:border-cyan-500/20 dark:text-cyan-300',
    purple: 'from-purple-100 to-purple-100 border-purple-200 text-purple-700 dark:from-purple-500/20 dark:to-purple-500/5 dark:border-purple-500/20 dark:text-purple-300',
    green:  'from-emerald-100 to-emerald-50 border-emerald-200 text-emerald-700 dark:from-green-500/20 dark:to-green-500/5 dark:border-green-500/20 dark:text-green-300',
    yellow: 'from-yellow-100 to-yellow-50 border-yellow-200 text-amber-700 dark:from-yellow-500/20 dark:to-yellow-500/5 dark:border-yellow-500/20 dark:text-yellow-300',
  }
  const cls = accentMap[accent] || accentMap.cyan

  return (
    <div className={`
      card relative overflow-hidden
      bg-gradient-to-br ${cls.split(' ').slice(0,2).join(' ')}
      border ${cls.split(' ')[2]}
    `}>
      {/* Icon */}
      {icon && (
        <div className={`absolute top-4 right-4 opacity-90 dark:opacity-100 text-5xl select-none text-slate-500 dark:text-white`}>
          {icon}
        </div>
      )}
      <p className="text-xs text-slate-500 dark:text-white font-medium uppercase tracking-widest mb-2">
        {title}
      </p>
      <p className={`text-3xl font-bold ${cls.split(' ')[3]}`}>{value}</p>
      {sub && (
        <p className="text-xs text-slate-700 dark:text-slate-400  mt-1.5">{sub}</p>
      )}
    </div>
  )
}
