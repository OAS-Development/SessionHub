'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { AnalyticsTimeframe } from '@/lib/analytics'

// Analytics data types
export interface AnalyticsData {
  timeframe: string
  timestamp: string
  systemMetrics: {
    learning: any
    cache: any
    files: any
    database: any
  }
  correlations: any
  alerts: any
  insights?: any
  baselines?: any
  summary: any
  _performance: any
}

export interface HealthData {
  timestamp: string
  health: any
  indicators: any
  alerts?: any
  events?: any
  summary?: any
  status: any
  _performance: any
}

export interface UseAdvancedAnalyticsOptions {
  timeframe?: keyof typeof AnalyticsTimeframe
  includeInsights?: boolean
  includeBaselines?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export interface UseAdvancedAnalyticsReturn {
  // Analytics data
  analyticsData: AnalyticsData | null
  healthData: HealthData | null
  
  // Loading states
  isLoading: boolean
  isRefreshing: boolean
  
  // Error handling
  error: string | null
  
  // Actions
  refreshAnalytics: () => Promise<void>
  refreshHealth: () => Promise<void>
  exportData: (format?: string) => Promise<void>
  startMonitoring: () => Promise<void>
  stopMonitoring: () => Promise<void>
  
  // Configuration
  setTimeframe: (timeframe: keyof typeof AnalyticsTimeframe) => void
  setOptions: (options: Partial<UseAdvancedAnalyticsOptions>) => void
  
  // Real-time status
  isMonitoringActive: boolean
  lastUpdated: Date | null
}

export function useAdvancedAnalytics(
  initialOptions: UseAdvancedAnalyticsOptions = {}
): UseAdvancedAnalyticsReturn {
  // State management
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [healthData, setHealthData] = useState<HealthData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMonitoringActive, setIsMonitoringActive] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
  // Options state
  const [options, setOptionsState] = useState<UseAdvancedAnalyticsOptions>({
    timeframe: 'MEDIUM_TERM',
    includeInsights: true,
    includeBaselines: true,
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    ...initialOptions
  })

  // Refs for cleanup
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Fetch analytics data
  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    setError(null)

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    try {
      const params = new URLSearchParams({
        timeframe: options.timeframe || 'MEDIUM_TERM',
        insights: options.includeInsights ? 'true' : 'false',
        baselines: options.includeBaselines ? 'true' : 'false'
      })

      const response = await fetch(`/api/analytics/overview?${params}`, {
        signal: abortControllerRef.current.signal,
        headers: {
          'x-session-id': crypto.randomUUID()
        }
      })

      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setAnalyticsData(result.data)
        setLastUpdated(new Date())
      } else {
        throw new Error(result.error || 'Failed to fetch analytics data')
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message)
        console.error('Analytics fetch error:', err)
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [options])

  // Fetch health data
  const fetchHealth = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true)
    } else if (!healthData) {
      setIsLoading(true)
    }

    try {
      const params = new URLSearchParams({
        alerts: 'true',
        events: 'true',
        summary: 'true',
        eventLimit: '20'
      })

      const response = await fetch(`/api/monitoring/health?${params}`)

      if (!response.ok) {
        throw new Error(`Health API error: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setHealthData(result.data)
        setLastUpdated(new Date())
      } else {
        throw new Error(result.error || 'Failed to fetch health data')
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
        console.error('Health fetch error:', err)
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [healthData])

  // Refresh both analytics and health
  const refreshAnalytics = useCallback(async () => {
    await Promise.all([
      fetchAnalytics(true),
      fetchHealth(true)
    ])
  }, [fetchAnalytics, fetchHealth])

  // Refresh only health data
  const refreshHealth = useCallback(async () => {
    await fetchHealth(true)
  }, [fetchHealth])

  // Export analytics data
  const exportData = useCallback(async (format = 'json') => {
    try {
      const response = await fetch('/api/analytics/overview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format,
          timeframe: options.timeframe,
          includeRawData: true,
          sessionId: crypto.randomUUID()
        })
      })

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        // Create download
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: 'application/json'
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        throw new Error(result.error || 'Export failed')
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
        console.error('Export error:', err)
      }
    }
  }, [options.timeframe])

  // Start monitoring
  const startMonitoring = useCallback(async () => {
    try {
      const response = await fetch('/api/monitoring/health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'start' })
      })

      if (!response.ok) {
        throw new Error(`Failed to start monitoring: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setIsMonitoringActive(true)
      } else {
        throw new Error(result.error || 'Failed to start monitoring')
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
        console.error('Start monitoring error:', err)
      }
    }
  }, [])

  // Stop monitoring
  const stopMonitoring = useCallback(async () => {
    try {
      const response = await fetch('/api/monitoring/health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'stop' })
      })

      if (!response.ok) {
        throw new Error(`Failed to stop monitoring: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setIsMonitoringActive(false)
      } else {
        throw new Error(result.error || 'Failed to stop monitoring')
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
        console.error('Stop monitoring error:', err)
      }
    }
  }, [])

  // Set timeframe
  const setTimeframe = useCallback((timeframe: keyof typeof AnalyticsTimeframe) => {
    setOptionsState(prev => ({ ...prev, timeframe }))
  }, [])

  // Set options
  const setOptions = useCallback((newOptions: Partial<UseAdvancedAnalyticsOptions>) => {
    setOptionsState(prev => ({ ...prev, ...newOptions }))
  }, [])

  // Setup auto-refresh
  useEffect(() => {
    if (options.autoRefresh && options.refreshInterval) {
      refreshIntervalRef.current = setInterval(() => {
        refreshAnalytics()
      }, options.refreshInterval)

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current)
        }
      }
    }
  }, [options.autoRefresh, options.refreshInterval, refreshAnalytics])

  // Initial data fetch
  useEffect(() => {
    fetchAnalytics()
    fetchHealth()
    
    // Start monitoring by default
    startMonitoring()

    return () => {
      // Cleanup
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, []) // Only run on mount

  // Refetch when options change
  useEffect(() => {
    if (analyticsData) { // Only refetch if we already have data
      fetchAnalytics()
    }
  }, [options.timeframe, options.includeInsights, options.includeBaselines])

  return {
    // Data
    analyticsData,
    healthData,
    
    // Loading states
    isLoading,
    isRefreshing,
    
    // Error handling
    error,
    
    // Actions
    refreshAnalytics,
    refreshHealth,
    exportData,
    startMonitoring,
    stopMonitoring,
    
    // Configuration
    setTimeframe,
    setOptions,
    
    // Status
    isMonitoringActive,
    lastUpdated
  }
} 