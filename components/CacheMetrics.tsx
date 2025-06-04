'use client'

import React from 'react'
import { useCacheMetrics, useCacheConnection, useCacheOperations } from '@/lib/hooks/useCacheMetrics'

export default function CacheMetrics() {
  const { metrics, loading, error, isConnected, refetch, resetMetrics } = useCacheMetrics()
  const { clearCache, warmCache } = useCacheOperations()

  const handleClearCache = async () => {
    if (confirm('Are you sure you want to clear all cache data?')) {
      const success = await clearCache()
      if (success) {
        await refetch()
      }
    }
  }

  const handleWarmCache = async () => {
    const success = await warmCache(['dashboard', 'learning', 'patterns'])
    if (success) {
      await refetch()
    }
  }

  if (loading && !metrics) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">Cache Performance</h2>
          <ConnectionStatus isConnected={isConnected} />
        </div>
        <div className="flex gap-2">
          <button
            onClick={refetch}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleWarmCache}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Warm Cache
          </button>
          <button
            onClick={handleClearCache}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-red-600">⚠️</span>
            <div>
              <h3 className="text-red-800 font-medium">Cache Error</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {metrics && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Hit Rate"
              value={`${(metrics.hitRate * 100).toFixed(1)}%`}
              subtitle={`${metrics.totalOps} total operations`}
              status={metrics.performance.hitRateStatus}
              icon="🎯"
            />
            <MetricCard
              title="Avg Response Time"
              value={`${metrics.avgResponseTime.toFixed(1)}ms`}
              subtitle="Cache operations"
              status={metrics.performance.responseTimeStatus}
              icon="⚡"
            />
            <MetricCard
              title="Total Operations"
              value={metrics.totalOps.toLocaleString()}
              subtitle="Last 24 hours"
              status={metrics.totalOps > 1000 ? 'good' : 'fair'}
              icon="📊"
            />
            <MetricCard
              title="Errors"
              value={metrics.errors.toString()}
              subtitle="Connection issues"
              status={metrics.errors === 0 ? 'excellent' : 'poor'}
              icon="🛡️"
            />
          </div>

          {/* Performance Status */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PerformanceIndicator
                label="Hit Rate Performance"
                status={metrics.performance.hitRateStatus}
                value={metrics.hitRate}
                target={0.7}
                description="Target: 70%+ for optimal performance"
              />
              <PerformanceIndicator
                label="Response Time Performance"
                status={metrics.performance.responseTimeStatus}
                value={metrics.avgResponseTime}
                target={25}
                description="Target: Under 25ms for excellent performance"
                invert={true}
              />
            </div>
          </div>

          {/* Recommendations */}
          {metrics.performance.recommendations.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-yellow-900 font-medium mb-3">Performance Recommendations</h3>
              <ul className="space-y-2">
                {metrics.performance.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-yellow-800 text-sm flex items-start gap-2">
                    <span className="text-yellow-600 mt-0.5">•</span>
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Hourly Stats Chart */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">24-Hour Performance</h3>
            <HourlyStatsChart stats={metrics.hourlyStats} />
          </div>

          {/* Cache Operations */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cache Operations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {metrics.hourlyStats.reduce((sum, stat) => sum + stat.hits, 0)}
                </div>
                <div className="text-sm text-gray-600">Cache Hits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {metrics.hourlyStats.reduce((sum, stat) => sum + stat.misses, 0)}
                </div>
                <div className="text-sm text-gray-600">Cache Misses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.hourlyStats.reduce((sum, stat) => sum + stat.ops, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Operations</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  subtitle: string
  status: 'excellent' | 'good' | 'fair' | 'poor'
  icon: string
}

function MetricCard({ title, value, subtitle, status, icon }: MetricCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'fair': return 'text-yellow-600'
      case 'poor': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-50 border-green-200'
      case 'good': return 'bg-blue-50 border-blue-200'
      case 'fair': return 'bg-yellow-50 border-yellow-200'
      case 'poor': return 'bg-red-50 border-red-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className={`${getStatusBg(status)} border rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className={`text-2xl font-bold mb-1 ${getStatusColor(status)}`}>{value}</div>
      <p className="text-sm text-gray-600">{subtitle}</p>
    </div>
  )
}

interface ConnectionStatusProps {
  isConnected: boolean
}

function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <span className={`text-sm font-medium ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  )
}

interface PerformanceIndicatorProps {
  label: string
  status: 'excellent' | 'good' | 'fair' | 'poor'
  value: number
  target: number
  description: string
  invert?: boolean
}

function PerformanceIndicator({ label, status, value, target, description, invert = false }: PerformanceIndicatorProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-500'
      case 'good': return 'bg-blue-500'
      case 'fair': return 'bg-yellow-500'
      case 'poor': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const percentage = invert 
    ? Math.max(0, Math.min(100, (target / Math.max(value, 1)) * 100))
    : Math.max(0, Math.min(100, (value / target) * 100))

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">{status}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full ${getStatusColor(status)}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  )
}

interface HourlyStatsChartProps {
  stats: Array<{
    hour: number
    hits: number
    misses: number
    ops: number
    avgDuration: number
  }>
}

function HourlyStatsChart({ stats }: HourlyStatsChartProps) {
  const maxOps = Math.max(...stats.map(s => s.ops), 1)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-1">
        {stats.slice(-12).map((stat, index) => {
          const height = (stat.ops / maxOps) * 100
          const hitRate = stat.ops > 0 ? (stat.hits / stat.ops) * 100 : 0
          
          return (
            <div key={index} className="text-center">
              <div className="bg-gray-200 rounded h-20 flex items-end justify-center mb-1">
                <div 
                  className={`w-full rounded ${hitRate > 70 ? 'bg-green-500' : hitRate > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ height: `${height}%` }}
                  title={`Hour ${stat.hour}: ${stat.ops} ops, ${hitRate.toFixed(1)}% hit rate`}
                ></div>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(stat.hour * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit' })}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Last 12 hours</span>
        <span>Height = operations, Color = hit rate</span>
      </div>
    </div>
  )
} 