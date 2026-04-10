import React from 'react'

export default function GoalProgress({ progress = 0 }) {
  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-sm text-gray-500">Goal Progress</h3>
      <div className="mt-2 font-medium">{progress}%</div>
    </div>
  )
}
