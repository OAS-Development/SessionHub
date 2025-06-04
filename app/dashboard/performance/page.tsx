'use client'

import React from 'react'
import { PerformanceDashboard } from '@/components/PerformanceDashboard'

export default function PerformancePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <PerformanceDashboard />
      </div>
    </div>
  )
} 