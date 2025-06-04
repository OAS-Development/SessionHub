'use client'

import React from 'react'
import { useLearning } from '@/lib/hooks/useLearning'
import { LearningPattern } from '@/lib/types/learning'

export default function LearningDashboard() {
  const { metrics, patterns, loading, error, refetch } = useLearning()

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-red-800 font-medium">Error Loading Learning Data</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={refetch}
            className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No learning data available yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Learning Analytics</h2>
          <button
            onClick={refetch}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Instructions"
            value={metrics.totalInstructions.toString()}
            subtitle="Claude interactions"
            icon="📝"
          />
          <MetricCard
            title="Success Rate"
            value={`${(metrics.successRate * 100).toFixed(1)}%`}
            subtitle={`${metrics.successfulInstructions}/${metrics.totalInstructions} successful`}
            icon="✅"
          />
          <MetricCard
            title="Avg Response Time"
            value={`${(metrics.avgResponseTime / 1000).toFixed(1)}s`}
            subtitle="Processing time"
            icon="⚡"
          />
          <MetricCard
            title="Learning Score"
            value="A+"
            subtitle="Overall effectiveness"
            icon="🎯"
          />
        </div>
      </div>

      {/* Instruction Type Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Instruction Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(metrics.instructionTypeDistribution).map(([type, count]) => (
            <div key={type} className="text-center">
              <div className="text-2xl font-bold text-blue-600">{count}</div>
              <div className="text-sm text-gray-600 capitalize">
                {type.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Effectiveness Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Effectiveness Trends</h3>
        <div className="space-y-2">
          {metrics.effectivenessTrends.map((trend, index) => (
            <div key={trend.date} className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">{trend.date}</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Success:</span>
                  <span className="font-medium text-green-600">
                    {(trend.successRate * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Effectiveness:</span>
                  <span className="font-medium text-blue-600">
                    {(trend.avgEffectiveness * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Patterns */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Learning Patterns ({patterns.length})
        </h3>
        {patterns.length > 0 ? (
          <div className="space-y-4">
            {patterns.slice(0, 5).map((pattern) => (
              <PatternCard key={pattern.id} pattern={pattern} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No patterns identified yet. Keep using the system to build learning data!
          </p>
        )}
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  subtitle: string
  icon: string
}

function MetricCard({ title, value, subtitle, icon }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <p className="text-sm text-gray-600">{subtitle}</p>
    </div>
  )
}

interface PatternCardProps {
  pattern: LearningPattern
}

function PatternCard({ pattern }: PatternCardProps) {
  const getPatternColor = (type: string) => {
    switch (type) {
      case 'successful_instruction':
        return 'bg-green-100 text-green-800'
      case 'failed_instruction':
        return 'bg-red-100 text-red-800'
      case 'context_dependency':
        return 'bg-yellow-100 text-yellow-800'
      case 'optimization':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPatternColor(pattern.pattern_type)}`}>
            {pattern.pattern_type.replace('_', ' ')}
          </span>
          <span className="text-sm font-medium text-gray-900">
            {(pattern.success_rate * 100).toFixed(0)}% success
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {pattern.sample_size} samples
        </span>
      </div>
      
      <h4 className="font-medium text-gray-900 mb-2">{pattern.pattern_description}</h4>
      
      <div className="flex flex-wrap gap-1 mb-2">
        {pattern.instruction_keywords.slice(0, 5).map((keyword) => (
          <span key={keyword} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
            {keyword}
          </span>
        ))}
        {pattern.instruction_keywords.length > 5 && (
          <span className="text-xs text-gray-500">
            +{pattern.instruction_keywords.length - 5} more
          </span>
        )}
      </div>
      
      <div className="text-xs text-gray-500">
        Last updated: {pattern.updated_at.toLocaleDateString()}
      </div>
    </div>
  )
} 