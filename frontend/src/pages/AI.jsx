import React from 'react'
import SpendingAnalysis from '../components/ai/SpendingAnalysis'
import FraudAlerts from '../components/ai/FraudAlerts'
import SavingRecommendations from '../components/ai/SavingRecommendations'

export default function AIPage() {
  return (
    <div className="container mx-auto p-6 space-y-4">
      <SpendingAnalysis />
      <FraudAlerts />
      <SavingRecommendations />
    </div>
  )
}
