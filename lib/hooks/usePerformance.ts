import { useState, useEffect, useCallback } from 'react'
import { performanceOptimizationEngine } from '@/lib/performance'
import { autoScalingEngine } from '@/lib/auto-scaling'
import { globalCDNEngine } from '@/lib/cdn-config'

// Performance hook interfaces
export interface PerformanceState {
  globalMetrics: any
  scalingMetrics: any
  cdnMetrics: any
  targets: any
  optimization: any
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
}

export interface OptimizationState {
  isOptimizing: boolean
  currentOperation: string | null
  progress: number
  results: any[]
  error: string | null
}

export interface PerformanceConfig {
  autoRefresh: boolean
  refreshInterval: number // milliseconds
  enableRealtimeUpdates: boolean
  includeHistorical: boolean
  includePredictions: boolean
  includeRecommendations: boolean
  alertThresholds: AlertThresholds
}

export interface AlertThresholds {
  loadTime: number
  apiResponseTime: number
  cacheHitRate: number
  availability: number
  errorRate: number
}

export interface PerformanceActions {
  refreshMetrics: () => Promise<void>
  optimizePerformance: (type?: string) => Promise<void>
  executeScaling: () => Promise<void>
  optimizeCDN: () => Promise<void>
  getRealtimeMetrics: () => Promise<any>
  setConfig: (config: Partial<PerformanceConfig>) => void
  exportMetrics: (format: 'json' | 'csv') => Promise<string>
}

// Main performance monitoring hook
export function usePerformance(initialConfig?: Partial<PerformanceConfig>) {
  const [performanceState, setPerformanceState] = useState<PerformanceState>({
    globalMetrics: null,
    scalingMetrics: null,
    cdnMetrics: null,
    targets: null,
    optimization: null,
    isLoading: true,
    error: null,
    lastUpdated: null
  })

  const [optimizationState, setOptimizationState] = useState<OptimizationState>({
    isOptimizing: false,
    currentOperation: null,
    progress: 0,
    results: [],
    error: null
  })

  const [config, setConfigState] = useState<PerformanceConfig>({
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    enableRealtimeUpdates: false,
    includeHistorical: false,
    includePredictions: true,
    includeRecommendations: true,
    alertThresholds: {
      loadTime: 2000, // 2 seconds
      apiResponseTime: 100, // 100ms
      cacheHitRate: 0.95, // 95%
      availability: 0.9999, // 99.99%
      errorRate: 0.01 // 1%
    },
    ...initialConfig
  })

  // Refresh performance metrics
  const refreshMetrics = useCallback(async () => {
    try {
      setPerformanceState(prev => ({ ...prev, isLoading: true, error: null }))

      // Fetch metrics from API
      const response = await fetch(`/api/performance/metrics?includeHistorical=${config.includeHistorical}&includePredictions=${config.includePredictions}&includeRecommendations=${config.includeRecommendations}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      setPerformanceState(prev => ({
        ...prev,
        globalMetrics: data.globalMetrics,
        scalingMetrics: data.globalMetrics?.scaling,
        cdnMetrics: data.globalMetrics?.cdn,
        targets: data.targets,
        optimization: data.performance?.optimization,
        isLoading: false,
        lastUpdated: new Date()
      }))

      // Check for alerts
      checkAlerts(data)
    } catch (error) {
      console.error('Failed to refresh performance metrics:', error)
      setPerformanceState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh metrics'
      }))
    }
  }, [config.includeHistorical, config.includePredictions, config.includeRecommendations])

  // Optimize performance
  const optimizePerformance = useCallback(async (type: string = 'comprehensive_optimization') => {
    try {
      setOptimizationState(prev => ({
        ...prev,
        isOptimizing: true,
        currentOperation: type,
        progress: 0,
        error: null
      }))

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setOptimizationState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }))
      }, 500)

      const response = await fetch('/api/performance/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: type,
          configuration: {},
          targetMetrics: config.alertThresholds
        })
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      setOptimizationState(prev => ({
        ...prev,
        isOptimizing: false,
        currentOperation: null,
        progress: 100,
        results: [...prev.results, result]
      }))

      // Refresh metrics after optimization
      await refreshMetrics()
    } catch (error) {
      console.error('Performance optimization failed:', error)
      setOptimizationState(prev => ({
        ...prev,
        isOptimizing: false,
        currentOperation: null,
        progress: 0,
        error: error instanceof Error ? error.message : 'Optimization failed'
      }))
    }
  }, [config.alertThresholds, refreshMetrics])

  // Execute scaling decision
  const executeScaling = useCallback(async () => {
    await optimizePerformance('scaling_decision')
  }, [optimizePerformance])

  // Optimize CDN
  const optimizeCDN = useCallback(async () => {
    await optimizePerformance('cdn_optimization')
  }, [optimizePerformance])

  // Get real-time metrics
  const getRealtimeMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/performance/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'realtime_metrics',
          filters: {}
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to get real-time metrics:', error)
      throw error
    }
  }, [])

  // Set configuration
  const setConfig = useCallback((newConfig: Partial<PerformanceConfig>) => {
    setConfigState(prev => ({ ...prev, ...newConfig }))
  }, [])

  // Export metrics
  const exportMetrics = useCallback(async (format: 'json' | 'csv' = 'json') => {
    try {
      const metrics = {
        timestamp: new Date().toISOString(),
        globalMetrics: performanceState.globalMetrics,
        scalingMetrics: performanceState.scalingMetrics,
        cdnMetrics: performanceState.cdnMetrics,
        targets: performanceState.targets,
        optimization: performanceState.optimization
      }

      if (format === 'json') {
        return JSON.stringify(metrics, null, 2)
      } else {
        // Convert to CSV format
        return convertToCSV(metrics)
      }
    } catch (error) {
      console.error('Failed to export metrics:', error)
      throw error
    }
  }, [performanceState])

  // Check for performance alerts
  const checkAlerts = useCallback((data: any) => {
    const alerts = []
    const current = data.globalMetrics?.performance?.global || {}
    const thresholds = config.alertThresholds

    if (current.globalLoadTime > thresholds.loadTime) {
      alerts.push({
        type: 'warning',
        metric: 'load_time',
        message: `Load time ${current.globalLoadTime}ms exceeds threshold ${thresholds.loadTime}ms`,
        value: current.globalLoadTime,
        threshold: thresholds.loadTime
      })
    }

    if (current.apiResponseTime > thresholds.apiResponseTime) {
      alerts.push({
        type: 'warning',
        metric: 'api_response_time',
        message: `API response time ${current.apiResponseTime}ms exceeds threshold ${thresholds.apiResponseTime}ms`,
        value: current.apiResponseTime,
        threshold: thresholds.apiResponseTime
      })
    }

    if (current.cdnCacheHitRate < thresholds.cacheHitRate) {
      alerts.push({
        type: 'info',
        metric: 'cache_hit_rate',
        message: `Cache hit rate ${(current.cdnCacheHitRate * 100).toFixed(1)}% below threshold ${(thresholds.cacheHitRate * 100).toFixed(1)}%`,
        value: current.cdnCacheHitRate,
        threshold: thresholds.cacheHitRate
      })
    }

    if (current.globalAvailability < thresholds.availability) {
      alerts.push({
        type: 'critical',
        metric: 'availability',
        message: `Availability ${(current.globalAvailability * 100).toFixed(2)}% below threshold ${(thresholds.availability * 100).toFixed(2)}%`,
        value: current.globalAvailability,
        threshold: thresholds.availability
      })
    }

    // Log alerts
    alerts.forEach(alert => {
      console.warn('Performance Alert:', alert)
    })
  }, [config.alertThresholds])

  // Set up auto-refresh
  useEffect(() => {
    if (config.autoRefresh) {
      refreshMetrics() // Initial load
      
      const interval = setInterval(refreshMetrics, config.refreshInterval)
      return () => clearInterval(interval)
    }
  }, [config.autoRefresh, config.refreshInterval, refreshMetrics])

  // Actions object
  const actions: PerformanceActions = {
    refreshMetrics,
    optimizePerformance,
    executeScaling,
    optimizeCDN,
    getRealtimeMetrics,
    setConfig,
    exportMetrics
  }

  return {
    // State
    ...performanceState,
    optimization: optimizationState,
    config,
    
    // Computed values
    isHealthy: performanceState.error === null && !optimizationState.error,
    targetsMet: calculateTargetsMet(performanceState, config.alertThresholds),
    optimizationScore: calculateOptimizationScore(performanceState),
    
    // Actions
    ...actions
  }
}

// Performance optimization hook for specific operations
export function usePerformanceOptimization() {
  const [state, setState] = useState({
    isOptimizing: false,
    operations: [] as string[],
    progress: {} as Record<string, number>,
    results: {} as Record<string, any>,
    errors: {} as Record<string, string>
  })

  const startOptimization = useCallback(async (operations: string[]) => {
    setState(prev => ({
      ...prev,
      isOptimizing: true,
      operations,
      progress: Object.fromEntries(operations.map(op => [op, 0])),
      results: {},
      errors: {}
    }))

    try {
      // Run optimizations in parallel
      const optimizationPromises = operations.map(async (operation) => {
        try {
          // Simulate progress
          const progressInterval = setInterval(() => {
            setState(prev => ({
              ...prev,
              progress: {
                ...prev.progress,
                [operation]: Math.min(prev.progress[operation] + 15, 90)
              }
            }))
          }, 1000)

          const response = await fetch('/api/performance/optimize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: operation })
          })

          clearInterval(progressInterval)

          if (!response.ok) {
            throw new Error(`${operation} failed: ${response.statusText}`)
          }

          const result = await response.json()

          setState(prev => ({
            ...prev,
            progress: { ...prev.progress, [operation]: 100 },
            results: { ...prev.results, [operation]: result }
          }))

          return { operation, result }
        } catch (error) {
          setState(prev => ({
            ...prev,
            errors: {
              ...prev.errors,
              [operation]: error instanceof Error ? error.message : 'Unknown error'
            }
          }))
          throw error
        }
      })

      await Promise.allSettled(optimizationPromises)
    } finally {
      setState(prev => ({ ...prev, isOptimizing: false }))
    }
  }, [])

  return {
    ...state,
    startOptimization
  }
}

// Real-time performance monitoring hook
export function useRealtimePerformance(enabled: boolean = false) {
  const [metrics, setMetrics] = useState<any>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connect = useCallback(async () => {
    if (!enabled) return

    try {
      setIsConnected(true)
      setError(null)

      // Poll for real-time metrics every 5 seconds
      const interval = setInterval(async () => {
        try {
          const response = await fetch('/api/performance/metrics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'realtime_metrics' })
          })

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }

          const data = await response.json()
          setMetrics(data.result)
        } catch (error) {
          console.error('Real-time metrics error:', error)
          setError(error instanceof Error ? error.message : 'Connection error')
        }
      }, 5000)

      return () => {
        clearInterval(interval)
        setIsConnected(false)
      }
    } catch (error) {
      setIsConnected(false)
      setError(error instanceof Error ? error.message : 'Connection failed')
    }
  }, [enabled])

  useEffect(() => {
    if (enabled) {
      connect()
    }
  }, [enabled, connect])

  return {
    metrics,
    isConnected,
    error,
    connect
  }
}

// Helper functions
function calculateTargetsMet(state: PerformanceState, thresholds: AlertThresholds): number {
  if (!state.globalMetrics?.performance?.global) return 0

  const current = state.globalMetrics.performance.global
  let targetsMet = 0
  let totalTargets = 0

  // Check each target
  if (current.globalLoadTime <= thresholds.loadTime) targetsMet++
  totalTargets++

  if (current.apiResponseTime <= thresholds.apiResponseTime) targetsMet++
  totalTargets++

  if (current.cdnCacheHitRate >= thresholds.cacheHitRate) targetsMet++
  totalTargets++

  if (current.globalAvailability >= thresholds.availability) targetsMet++
  totalTargets++

  return totalTargets > 0 ? (targetsMet / totalTargets) * 100 : 0
}

function calculateOptimizationScore(state: PerformanceState): number {
  if (!state.optimization) return 0
  return state.optimization.score || 0
}

function convertToCSV(data: any): string {
  const flattenObject = (obj: any, prefix = ''): any => {
    const flattened: any = {}
    
    for (const key in obj) {
      if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        Object.assign(flattened, flattenObject(obj[key], `${prefix}${key}.`))
      } else {
        flattened[`${prefix}${key}`] = obj[key]
      }
    }
    
    return flattened
  }

  const flattened = flattenObject(data)
  const headers = Object.keys(flattened)
  const values = Object.values(flattened)

  return [
    headers.join(','),
    values.map(v => typeof v === 'string' ? `"${v}"` : v).join(',')
  ].join('\n')
} 