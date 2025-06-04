'use client'

import { useState, useEffect, useCallback } from 'react'

// Monitoring data interfaces
export interface MonitoringData {
  timestamp: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  performance: {
    responseTime: number
    throughput: number
    errorRate: number
    availability: number
    monitoringUptime: number
    errorDetectionTime: number
    dashboardLoadTime: number
  }
  systems: {
    [key: string]: {
      status: 'healthy' | 'degraded' | 'unhealthy'
      score: number
      responseTime: number
      details: any
    }
  }
}

export interface HealthStatus {
  overall: {
    status: 'healthy' | 'degraded' | 'unhealthy'
    score: number
    message: string
    responseTime: number
    lastCheck: string
  }
  systems: {
    [key: string]: {
      status: 'healthy' | 'degraded' | 'unhealthy'
      score: number
      responseTime: number
      details: any
    }
  }
}

export interface MetricsData {
  performance?: {
    responseTime?: {
      average: number
      p50: number
      p95: number
      p99: number
    }
    throughput?: {
      requestsPerSecond: number
      peakRps: number
      averageRps: number
    }
    availability?: {
      percentage: number
      uptime: string
      downtime: string
    }
    cachePerformance?: {
      hitRate: number
      missRate: number
      evictionRate: number
    }
  }
  ai_systems?: {
    claude_cursor_integration?: {
      status: string
      successRate: number
      averageCycleTime: number
    }
    meta_learning?: {
      status: string
      learningRate: number
      optimizationCycles: number
    }
    overall?: {
      healthScore: number
      activeWorkflows: number
      completedTasks: number
      aiResponseTime: number
      intelligenceLevel: string
    }
  }
  infrastructure?: {
    system?: {
      cpuUsage: number
      memoryUsage: number
      diskUsage: number
      networkUtilization: number
    }
    database?: {
      connectionPool: number
      queryResponseTime: number
      slowQueries: number
      storageUtilization: number
    }
    cache?: {
      hitRate: number
      memoryUsage: number
      keyCount: number
      evictionRate: number
    }
    network?: {
      bandwidth: number
      latency: number
      packetLoss: number
      connections: number
    }
  }
  errors?: {
    total: number
    critical: number
    warnings: number
    info: number
    rate: number
    detection?: {
      averageDetectionTime: number
      automatedResolution: number
    }
  }
  automation?: {
    efficiency?: {
      automationLevel: number
    }
  }
  business?: any
}

export interface AlertData {
  id: string
  title: string
  description: string
  severity: 'critical' | 'error' | 'warning' | 'info'
  system: string
  timestamp: string
  resolved: boolean
  actionRequired: boolean
}

export interface InsightData {
  id: string
  message: string
  type: 'insight' | 'recommendation' | 'prediction'
  confidence: number
  timestamp: string
}

// Hook implementation
export function useMonitoring() {
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null)
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null)
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [insights, setInsights] = useState<InsightData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Fetch system health
  const getSystemHealth = useCallback(async (service?: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (service) params.append('service', service)
      params.append('detailed', 'true')
      params.append('includeMetrics', 'true')

      const response = await fetch(`/api/monitoring/health?${params}`)
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Transform API response to expected format
      const healthData: HealthStatus = {
        overall: {
          status: data.status || 'unknown',
          score: 0.95, // Mock score
          message: `System is ${data.status}`,
          responseTime: data.responseTime || 0,
          lastCheck: data.timestamp
        },
        systems: data.data || {}
      }

      setHealthStatus(healthData)
      setLastUpdate(new Date())
      
      return healthData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch health status'
      setError(errorMessage)
      console.error('Health check error:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch metrics
  const getMetrics = useCallback(async (type?: string, timeRange?: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (type) params.append('type', type)
      if (timeRange) params.append('timeRange', timeRange)
      params.append('aggregated', 'true')
      params.append('realTime', 'true')
      params.append('predictive', 'true')
      params.append('aiInsights', 'true')

      const response = await fetch(`/api/monitoring/metrics?${params}`)
      
      if (!response.ok) {
        throw new Error(`Metrics fetch failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      setMetrics(data.data || {})
      setLastUpdate(new Date())
      
      return data.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch metrics'
      setError(errorMessage)
      console.error('Metrics fetch error:', err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch alerts
  const getAlerts = useCallback(async () => {
    try {
      // Mock alerts data - in production, this would fetch from an alerts API
      const mockAlerts: AlertData[] = [
        {
          id: '1',
          title: 'High CPU Usage Detected',
          description: 'CPU usage exceeded 80% threshold',
          severity: 'warning',
          system: 'infrastructure',
          timestamp: new Date().toISOString(),
          resolved: false,
          actionRequired: true
        },
        {
          id: '2',
          title: 'Database Connection Pool Full',
          description: 'All database connections in use',
          severity: 'critical',
          system: 'database',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          resolved: false,
          actionRequired: true
        }
      ]
      
      setAlerts(mockAlerts)
      return mockAlerts
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch alerts'
      setError(errorMessage)
      console.error('Alerts fetch error:', err)
      return []
    }
  }, [])

  // Fetch AI insights
  const getInsights = useCallback(async () => {
    try {
      // Mock insights data - in production, this would fetch from an AI insights API
      const mockInsights: InsightData[] = [
        {
          id: '1',
          message: 'System performance is optimal with 99.97% availability',
          type: 'insight',
          confidence: 0.95,
          timestamp: new Date().toISOString()
        },
        {
          id: '2',
          message: 'Consider increasing cache size by 20% for better performance',
          type: 'recommendation',
          confidence: 0.87,
          timestamp: new Date().toISOString()
        },
        {
          id: '3',
          message: 'Expected traffic increase of 15% next week',
          type: 'prediction',
          confidence: 0.82,
          timestamp: new Date().toISOString()
        }
      ]
      
      setInsights(mockInsights)
      return mockInsights
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch insights'
      setError(errorMessage)
      console.error('Insights fetch error:', err)
      return []
    }
  }, [])

  // Comprehensive refresh function
  const refreshMonitoring = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch all monitoring data in parallel
      const [healthData, metricsData, alertsData, insightsData] = await Promise.allSettled([
        getSystemHealth('all'),
        getMetrics('all', '1h'),
        getAlerts(),
        getInsights()
      ])

      // Update monitoring data based on fetched information
      if (healthData.status === 'fulfilled' && healthData.value) {
        const monitoringInfo: MonitoringData = {
          timestamp: new Date().toISOString(),
          status: healthData.value.overall.status,
          performance: {
            responseTime: healthData.value.overall.responseTime,
            throughput: 125,
            errorRate: 0.02,
            availability: 99.97,
            monitoringUptime: 99.9,
            errorDetectionTime: 15000,
            dashboardLoadTime: 1500
          },
          systems: healthData.value.systems
        }
        setMonitoringData(monitoringInfo)
      }

      setLastUpdate(new Date())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh monitoring data'
      setError(errorMessage)
      console.error('Monitoring refresh error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [getSystemHealth, getMetrics, getAlerts, getInsights])

  // Post metrics
  const postMetrics = useCallback(async (metricsToPost: any[], source = 'manual') => {
    try {
      const response = await fetch('/api/monitoring/metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics: metricsToPost,
          source,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to post metrics: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to post metrics'
      setError(errorMessage)
      console.error('Metrics post error:', err)
      throw err
    }
  }, [])

  // Update configuration
  const updateConfig = useCallback(async (action: string, configuration: any) => {
    try {
      const response = await fetch('/api/monitoring/metrics', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          configuration
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to update configuration: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update configuration'
      setError(errorMessage)
      console.error('Config update error:', err)
      throw err
    }
  }, [])

  // Trigger health operation
  const triggerHealthOperation = useCallback(async (action: string, services: string[] = ['all'], configuration: any = {}) => {
    try {
      const response = await fetch('/api/monitoring/health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          services,
          configuration
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to trigger health operation: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to trigger health operation'
      setError(errorMessage)
      console.error('Health operation error:', err)
      throw err
    }
  }, [])

  // Initialize monitoring data on mount
  useEffect(() => {
    refreshMonitoring()
  }, [refreshMonitoring])

  // Utility functions
  const getSystemStatus = useCallback((systemName: string) => {
    return healthStatus?.systems?.[systemName]?.status || 'unknown'
  }, [healthStatus])

  const getMetricValue = useCallback((path: string) => {
    const keys = path.split('.')
    let current: any = metrics
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return null
      }
    }
    return current
  }, [metrics])

  const getActiveAlerts = useCallback(() => {
    return alerts.filter(alert => !alert.resolved)
  }, [alerts])

  const getCriticalAlerts = useCallback(() => {
    return alerts.filter(alert => alert.severity === 'critical' && !alert.resolved)
  }, [alerts])

  const getRecentInsights = useCallback((count = 5) => {
    return insights
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, count)
  }, [insights])

  return {
    // State
    monitoringData,
    healthStatus,
    metrics,
    alerts,
    insights,
    isLoading,
    error,
    lastUpdate,

    // Actions
    refreshMonitoring,
    getSystemHealth,
    getMetrics,
    getAlerts,
    getInsights,
    postMetrics,
    updateConfig,
    triggerHealthOperation,

    // Utilities
    getSystemStatus,
    getMetricValue,
    getActiveAlerts,
    getCriticalAlerts,
    getRecentInsights
  }
}

// Additional monitoring utilities
export const MonitoringUtils = {
  formatUptime: (uptimeSeconds: number): string => {
    const days = Math.floor(uptimeSeconds / (24 * 60 * 60))
    const hours = Math.floor((uptimeSeconds % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((uptimeSeconds % (60 * 60)) / 60)
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  },

  formatBytes: (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  },

  formatPercentage: (value: number, decimals = 1): string => {
    return `${value.toFixed(decimals)}%`
  },

  formatDuration: (milliseconds: number): string => {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`
    } else if (milliseconds < 60000) {
      return `${(milliseconds / 1000).toFixed(1)}s`
    } else {
      return `${(milliseconds / 60000).toFixed(1)}m`
    }
  },

  getStatusColor: (status: string): string => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'degraded': return 'text-yellow-600'
      case 'unhealthy': return 'text-red-600'
      default: return 'text-gray-600'
    }
  },

  getSeverityColor: (severity: string): string => {
    switch (severity) {
      case 'critical': return 'text-red-600'
      case 'error': return 'text-red-500'
      case 'warning': return 'text-yellow-600'
      case 'info': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  },

  calculateAvailability: (uptime: number, totalTime: number): number => {
    return totalTime > 0 ? (uptime / totalTime) * 100 : 0
  },

  calculateResponseTimeScore: (responseTime: number, target = 200): number => {
    return Math.max(0, Math.min(100, 100 - ((responseTime - target) / target) * 100))
  },

  calculateOverallScore: (scores: number[]): number => {
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
  }
} 