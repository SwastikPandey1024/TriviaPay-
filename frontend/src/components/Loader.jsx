import React from 'react'

export default function Loader({ text = 'Processing transaction...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      {/* Spinning ring */}
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-slate-200 dark:border-slate-500/30" />
        <div className="absolute inset-0 rounded-full border-t-2 border-green-500 animate-spin" />
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300">{text}</p>
    </div>
  )
}
