import { useState, useEffect, useCallback, useRef } from 'react'

// Core deployment status interface
export interface GlobalDeploymentStatus {
  global: {
    status: any
    targets: any
    performance: any
  }
  activeDeployments: any[]
  regions: any[]
  infrastructure: any
  metrics: any
  pipeline: any
  metadata: any
}

export interface DeploymentPlan {
  strategy: string
  regions: any[]
  phases: any[]
  rollbackPlan: any
  estimates: any
  validation: any
}

export interface DeploymentMetrics {
  deployment: any
  availability: any
  performance: any
  security: any
  infrastructure: any
}

// Main deployment management hook
export function useDeployment(autoRefresh = true, refreshInterval = 10000) {
  const [status, setStatus] = useState<GlobalDeploymentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(autoRefresh)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchDeploymentStatus = useCallback(async (includeDetailed = true) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        includeHistory: 'true',
        includeInfrastructure: 'true',
        includeMetrics: includeDetailed ? 'true' : 'false',
        includeRegions: 'true'
      })

      const response = await fetch(`/api/deployment/status?${params}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch deployment status')
      }

      const data = await response.json()
      setStatus(data)
      setLastUpdate(new Date())
      
      console.log('Deployment status updated:', data)
    } catch (err) {
      console.error('Error fetching deployment status:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  const startDeployment = useCallback(async (deploymentConfig: any) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/deployment/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(deploymentConfig)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Deployment failed')
      }

      // Refresh status after deployment
      await fetchDeploymentStatus()
      
      return result
    } catch (err) {
      console.error('Error starting deployment:', err)
      setError(err instanceof Error ? err.message : 'Deployment failed')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchDeploymentStatus])

  const cancelDeployment = useCallback(async (deploymentId: string, reason: string, forceRollback = false) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        deploymentId,
        reason,
        forceRollback: forceRollback.toString()
      })

      const response = await fetch(`/api/deployment/deploy?${params}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel deployment')
      }

      // Refresh status after cancellation
      await fetchDeploymentStatus()
      
      return result
    } catch (err) {
      console.error('Error cancelling deployment:', err)
      setError(err instanceof Error ? err.message : 'Failed to cancel deployment')
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchDeploymentStatus])

  const exportDeploymentData = useCallback(() => {
    if (!status) return null

    const exportData = {
      timestamp: new Date().toISOString(),
      globalStatus: status.global,
      regions: status.regions,
      metrics: status.metrics,
      infrastructure: status.infrastructure,
      activeDeployments: status.activeDeployments,
      session16Targets: status.metadata?.session16Targets
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `deployment-status-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    return exportData
  }, [status])

  // Auto-refresh effect
  useEffect(() => {
    // Initial load
    fetchDeploymentStatus()

    if (autoRefreshEnabled) {
      intervalRef.current = setInterval(() => {
        fetchDeploymentStatus(false) // Don't include detailed metrics on auto-refresh
      }, refreshInterval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchDeploymentStatus, autoRefreshEnabled, refreshInterval])

  return {
    status,
    loading,
    error,
    lastUpdate,
    autoRefreshEnabled,
    setAutoRefreshEnabled,
    fetchDeploymentStatus,
    startDeployment,
    cancelDeployment,
    exportDeploymentData,
    // Computed values
    globalHealth: status?.global?.status?.globalAvailability || 0,
    activeRegions: status?.global?.status?.activeRegions || 0,
    totalRegions: status?.global?.status?.totalRegions || 0,
    deploymentInProgress: status?.global?.status?.deploymentInProgress || false,
    criticalAlerts: status?.activeDeployments?.filter(d => d.severity === 'critical') || []
  }
}

// Deployment planning hook
export function useDeploymentPlanning() {
  const [plan, setPlan] = useState<DeploymentPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generatePlan = useCallback(async (strategy = 'blue_green', regions?: string[], includeValidation = true) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        strategy,
        includeValidation: includeValidation.toString()
      })

      if (regions) {
        params.set('regions', regions.join(','))
      }

      const response = await fetch(`/api/deployment/deploy?${params}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate deployment plan')
      }

      const data = await response.json()
      setPlan(data)
      
      console.log('Deployment plan generated:', data)
      return data
    } catch (err) {
      console.error('Error generating deployment plan:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const validatePlan = useCallback(async (planData: any) => {
    try {
      // Simulate plan validation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const validation = {
        valid: true,
        warnings: [] as string[],
        risks: [] as string[],
        estimatedDuration: planData.estimates?.totalDuration || 900000,
        riskLevel: planData.estimates?.riskAssessment || 'medium'
      }

      // Add some example validations
      if (planData.strategy === 'immediate') {
        validation.warnings.push('Immediate deployment has higher risk')
        validation.risks.push('No gradual rollout protection')
      }

      if (planData.regions && planData.regions.length > 4) {
        validation.warnings.push('Large number of regions may extend deployment time')
      }

      return validation
    } catch (err) {
      console.error('Error validating plan:', err)
      throw err
    }
  }, [])

  return {
    plan,
    loading,
    error,
    generatePlan,
    validatePlan
  }
}

// Regional deployment monitoring hook
export function useRegionalDeployment(regionId?: string, autoRefresh = true) {
  const [regionStatus, setRegionStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchRegionStatus = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        includeRegions: 'true'
      })

      if (regionId) {
        params.set('region', regionId)
      }

      const response = await fetch(`/api/deployment/status?${params}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch region status')
      }

      const data = await response.json()
      setRegionStatus(regionId ? data.regions?.find((r: any) => r.regionId === regionId) : data.regions)
      
    } catch (err) {
      console.error('Error fetching region status:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [regionId])

  useEffect(() => {
    fetchRegionStatus()

    if (autoRefresh) {
      intervalRef.current = setInterval(fetchRegionStatus, 15000) // 15 second refresh
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchRegionStatus, autoRefresh])

  return {
    regionStatus,
    loading,
    error,
    fetchRegionStatus,
    // Computed values for single region
    isHealthy: regionStatus?.health >= 99,
    isDeployed: regionStatus?.status === 'deployed',
    responseTime: regionStatus?.endpoints?.[0]?.responseTime || 0
  }
}

// Deployment metrics hook
export function useDeploymentMetrics(includeHistory = false, timeRange = '24h') {
  const [metrics, setMetrics] = useState<DeploymentMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        includeMetrics: 'true',
        includeHistory: includeHistory.toString(),
        timeRange
      })

      const response = await fetch(`/api/deployment/status?${params}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch deployment metrics')
      }

      const data = await response.json()
      setMetrics(data.metrics)
      
    } catch (err) {
      console.error('Error fetching deployment metrics:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [includeHistory, timeRange])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  return {
    metrics,
    loading,
    error,
    fetchMetrics,
    // Computed metrics
    deploymentFrequency: metrics?.deployment?.frequency || 0,
    successRate: metrics?.deployment?.successRate || 0,
    averageDuration: metrics?.deployment?.averageDuration || 0,
    globalAvailability: metrics?.availability?.global || 0,
    globalLatency: metrics?.performance?.globalLatency || 0,
    securityScore: metrics?.security?.score || 0
  }
}

// Infrastructure monitoring hook
export function useInfrastructureStatus(autoRefresh = true) {
  const [infrastructure, setInfrastructure] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchInfrastructure = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        includeInfrastructure: 'true'
      })

      const response = await fetch(`/api/deployment/status?${params}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch infrastructure status')
      }

      const data = await response.json()
      setInfrastructure(data.infrastructure)
      
    } catch (err) {
      console.error('Error fetching infrastructure status:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInfrastructure()

    if (autoRefresh) {
      intervalRef.current = setInterval(fetchInfrastructure, 30000) // 30 second refresh
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [fetchInfrastructure, autoRefresh])

  return {
    infrastructure,
    loading,
    error,
    fetchInfrastructure,
    // Computed values
    totalRegions: infrastructure?.regions?.length || 0,
    healthyRegions: infrastructure?.regions?.filter((r: any) => r.status === 'operational').length || 0,
    sslCertificatesActive: infrastructure?.ssl?.allActive || false,
    dnsStatus: infrastructure?.dns?.status || 'unknown',
    globalLoadBalancing: infrastructure?.globalLoadBalancing?.status === 'active'
  }
}

// Real-time deployment events hook
export function useDeploymentEvents(deploymentId?: string) {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const subscribeToEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Simulate real-time events
      const mockEvents = [
        {
          id: 'event_1',
          timestamp: new Date(),
          type: 'deployment_started',
          message: 'Global deployment initiated',
          severity: 'info',
          region: 'global'
        },
        {
          id: 'event_2',
          timestamp: new Date(Date.now() - 60000),
          type: 'region_deployed',
          message: 'US East deployment completed',
          severity: 'success',
          region: 'us-east-1'
        },
        {
          id: 'event_3',
          timestamp: new Date(Date.now() - 120000),
          type: 'health_check_passed',
          message: 'All health checks passing',
          severity: 'success',
          region: 'global'
        }
      ]

      setEvents(mockEvents)
    } catch (err) {
      console.error('Error subscribing to deployment events:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [deploymentId])

  const addEvent = useCallback((event: any) => {
    setEvents(prev => [event, ...prev].slice(0, 100)) // Keep last 100 events
  }, [])

  const clearEvents = useCallback(() => {
    setEvents([])
  }, [])

  useEffect(() => {
    subscribeToEvents()
  }, [subscribeToEvents])

  return {
    events,
    loading,
    error,
    subscribeToEvents,
    addEvent,
    clearEvents,
    // Computed values
    recentEvents: events.slice(0, 10),
    criticalEvents: events.filter(e => e.severity === 'critical'),
    errorEvents: events.filter(e => e.severity === 'error')
  }
} 