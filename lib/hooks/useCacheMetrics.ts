import { useState, useEffect, useCallback } from 'react'

export interface CacheMetrics {
  hitRate: number
  avgResponseTime: number
  totalOps: number
  errors: number
  hourlyStats: Array<{
    hour: number
    hits: number
    misses: number
    ops: number
    avgDuration: number
  }>
  performance: {
    hitRateStatus: 'excellent' | 'good' | 'fair' | 'poor'
    responseTimeStatus: 'excellent' | 'good' | 'fair' | 'poor'
    recommendations: string[]
  }
}

interface UseCacheMetricsReturn {
  metrics: CacheMetrics | null
  loading: boolean
  error: string | null
  isConnected: boolean
  refetch: () => Promise<void>
  resetMetrics: () => Promise<void>
}

export function useCacheMetrics(): UseCacheMetricsReturn {
  const [metrics, setMetrics] = useState<CacheMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/cache/metrics')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch cache metrics: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.success && result.data) {
        setMetrics(result.data)
        setIsConnected(true)
      } else {
        throw new Error(result.error || 'Failed to get cache metrics')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cache metrics'
      setError(errorMessage)
      setIsConnected(false)
      console.error('Cache metrics fetch error:', err)
      
      // Set fallback metrics when Redis is unavailable
      setMetrics({
        hitRate: 0,
        avgResponseTime: 0,
        totalOps: 0,
        errors: 0,
        hourlyStats: [],
        performance: {
          hitRateStatus: 'poor',
          responseTimeStatus: 'poor',
          recommendations: ['Redis connection unavailable - caching disabled']
        }
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const resetMetrics = useCallback(async () => {
    try {
      const response = await fetch('/api/cache/reset', { method: 'POST' })
      
      if (!response.ok) {
        throw new Error('Failed to reset cache metrics')
      }
      
      // Refetch metrics after reset
      await fetchMetrics()
    } catch (err) {
      console.error('Failed to reset cache metrics:', err)
      setError(err instanceof Error ? err.message : 'Failed to reset metrics')
    }
  }, [fetchMetrics])

  const refetch = useCallback(async () => {
    await fetchMetrics()
  }, [fetchMetrics])

  useEffect(() => {
    fetchMetrics()
    
    // Set up polling for real-time metrics
    const interval = setInterval(fetchMetrics, 30000) // Every 30 seconds
    
    return () => clearInterval(interval)
  }, [fetchMetrics])

  return {
    metrics,
    loading,
    error,
    isConnected,
    refetch,
    resetMetrics
  }
}

// Hook for cache connection testing
export function useCacheConnection() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/cache/health')
      const result = await response.json()
      setIsConnected(result.connected || false)
    } catch (error) {
      setIsConnected(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    testConnection()
  }, [testConnection])

  return {
    isConnected,
    loading,
    testConnection
  }
}

// Hook for cache operations
export function useCacheOperations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearCache = useCallback(async (pattern?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/cache/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pattern })
      })
      
      if (!response.ok) {
        throw new Error('Failed to clear cache')
      }
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear cache'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const warmCache = useCallback(async (targets: string[]) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/cache/warm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targets })
      })
      
      if (!response.ok) {
        throw new Error('Failed to warm cache')
      }
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to warm cache'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    clearCache,
    warmCache
  }
} 