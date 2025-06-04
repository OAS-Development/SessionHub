import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@clerk/nextjs'

// Pattern recognition hook interfaces
export interface PatternAnalysisState {
  patterns: any[]
  insights: any[]
  recommendations: any[]
  correlations: any[]
  anomalies: any[]
  loading: boolean
  error: string | null
  metadata: {
    processingTime: number
    lastUpdated: Date | null
    confidence: number
    dataPointsAnalyzed: number
  }
}

export interface PredictionState {
  predictions: any
  alternatives: any[]
  confidenceIntervals: any
  loading: boolean
  error: string | null
  metadata: {
    accuracy: number
    reliability: number
    processingTime: number
    lastUpdated: Date | null
  }
}

export interface AnalysisOptions {
  systems: string[]
  timeRange: {
    start: Date
    end: Date
  }
  minConfidence: number
  maxResults: number
  includeML: boolean
  includePredictions: boolean
  autoRefresh: boolean
  refreshInterval: number // seconds
}

export interface PredictionOptions {
  targetMetric: string
  timeHorizon: number
  context: Record<string, any>
  includeRecommendations: boolean
  includeAlternatives: boolean
  includeConfidenceInterval: boolean
  predictionType: 'quick' | 'comprehensive' | 'detailed'
}

// Main pattern recognition hook
export function usePatternRecognition(options?: Partial<AnalysisOptions>) {
  const { userId } = useAuth()
  const [state, setState] = useState<PatternAnalysisState>({
    patterns: [],
    insights: [],
    recommendations: [],
    correlations: [],
    anomalies: [],
    loading: false,
    error: null,
    metadata: {
      processingTime: 0,
      lastUpdated: null,
      confidence: 0,
      dataPointsAnalyzed: 0
    }
  })

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const defaultOptions: AnalysisOptions = {
    systems: ['learning', 'sessions', 'analytics', 'cache', 'files'],
    timeRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      end: new Date()
    },
    minConfidence: 0.7,
    maxResults: 50,
    includeML: true,
    includePredictions: true,
    autoRefresh: false,
    refreshInterval: 300 // 5 minutes
  }

  const mergedOptions = { ...defaultOptions, ...options }

  // Analyze patterns
  const analyzePatterns = useCallback(async (customOptions?: Partial<AnalysisOptions>) => {
    if (!userId) return

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const analysisOptions = { ...mergedOptions, ...customOptions }
      
      const response = await fetch('/api/patterns/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisOptions),
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Analysis failed')
      }

      const { analysis, mlPredictions, futurePredictions, metadata } = result.data

      setState(prev => ({
        ...prev,
        patterns: analysis.patterns || [],
        insights: analysis.insights || [],
        recommendations: analysis.recommendations || [],
        correlations: analysis.crossSystemCorrelations || [],
        anomalies: analysis.anomalies || [],
        loading: false,
        error: null,
        metadata: {
          processingTime: metadata.processingTime || 0,
          lastUpdated: new Date(),
          confidence: analysis.metadata?.confidence || 0,
          dataPointsAnalyzed: analysis.metadata?.dataPointsAnalyzed || 0
        }
      }))

      return {
        analysis,
        mlPredictions,
        futurePredictions,
        metadata
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return // Request was cancelled
      }

      console.error('Pattern analysis failed:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Analysis failed'
      }))
      throw error
    }
  }, [userId, mergedOptions])

  // Quick analysis for lightweight operations
  const quickAnalysis = useCallback(async (systems?: string[], hours?: number) => {
    if (!userId) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const params = new URLSearchParams({
        systems: (systems || ['learning', 'sessions', 'analytics']).join(','),
        hours: (hours || 24).toString(),
        minConfidence: '0.6'
      })

      const response = await fetch(`/api/patterns/analyze?${params}`)

      if (!response.ok) {
        throw new Error(`Quick analysis failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Quick analysis failed')
      }

      setState(prev => ({
        ...prev,
        patterns: result.data.patterns || [],
        insights: result.data.insights || [],
        recommendations: result.data.recommendations || [],
        correlations: [],
        anomalies: [],
        loading: false,
        error: null,
        metadata: {
          processingTime: result.data.summary?.processingTime || 0,
          lastUpdated: new Date(),
          confidence: result.data.summary?.averageConfidence || 0,
          dataPointsAnalyzed: result.data.summary?.totalPatterns || 0
        }
      }))

      return result.data
    } catch (error) {
      console.error('Quick analysis failed:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Quick analysis failed'
      }))
      throw error
    }
  }, [userId])

  // Clear results
  const clearResults = useCallback(() => {
    setState({
      patterns: [],
      insights: [],
      recommendations: [],
      correlations: [],
      anomalies: [],
      loading: false,
      error: null,
      metadata: {
        processingTime: 0,
        lastUpdated: null,
        confidence: 0,
        dataPointsAnalyzed: 0
      }
    })
  }, [])

  // Setup auto-refresh
  useEffect(() => {
    if (mergedOptions.autoRefresh && mergedOptions.refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        analyzePatterns()
      }, mergedOptions.refreshInterval * 1000)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [mergedOptions.autoRefresh, mergedOptions.refreshInterval, analyzePatterns])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    ...state,
    analyzePatterns,
    quickAnalysis,
    clearResults,
    isRefreshing: mergedOptions.autoRefresh
  }
}

// Prediction hook
export function usePrediction(options?: Partial<PredictionOptions>) {
  const { userId } = useAuth()
  const [state, setState] = useState<PredictionState>({
    predictions: null,
    alternatives: [],
    confidenceIntervals: null,
    loading: false,
    error: null,
    metadata: {
      accuracy: 0,
      reliability: 0,
      processingTime: 0,
      lastUpdated: null
    }
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  const defaultOptions: PredictionOptions = {
    targetMetric: 'success_rate',
    timeHorizon: 24,
    context: {},
    includeRecommendations: true,
    includeAlternatives: true,
    includeConfidenceInterval: true,
    predictionType: 'comprehensive'
  }

  const mergedOptions = { ...defaultOptions, ...options }

  // Generate predictions
  const predict = useCallback(async (customOptions?: Partial<PredictionOptions>) => {
    if (!userId) return

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const predictionOptions = { ...mergedOptions, ...customOptions }
      
      const response = await fetch('/api/patterns/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(predictionOptions),
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error(`Prediction failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Prediction failed')
      }

      const { predictions, confidenceIntervals, alternatives, metadata } = result.data

      setState(prev => ({
        ...prev,
        predictions,
        alternatives: alternatives?.scenarios || [],
        confidenceIntervals,
        loading: false,
        error: null,
        metadata: {
          accuracy: metadata.accuracy || 0,
          reliability: metadata.reliability || 0,
          processingTime: metadata.processingTime || 0,
          lastUpdated: new Date()
        }
      }))

      return result.data
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return // Request was cancelled
      }

      console.error('Prediction failed:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Prediction failed'
      }))
      throw error
    }
  }, [userId, mergedOptions])

  // Quick prediction for simple metrics
  const quickPredict = useCallback(async (metric?: string, hours?: number) => {
    if (!userId) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const params = new URLSearchParams({
        metric: metric || 'success_rate',
        hours: (hours || 24).toString()
      })

      const response = await fetch(`/api/patterns/predict?${params}`)

      if (!response.ok) {
        throw new Error(`Quick prediction failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Quick prediction failed')
      }

      setState(prev => ({
        ...prev,
        predictions: {
          primary: {
            predictedValue: result.data.prediction,
            confidence: result.data.confidence
          }
        },
        alternatives: [],
        confidenceIntervals: null,
        loading: false,
        error: null,
        metadata: {
          accuracy: result.data.confidence || 0,
          reliability: 0.8,
          processingTime: 500, // Estimated for quick prediction
          lastUpdated: new Date()
        }
      }))

      return result.data
    } catch (error) {
      console.error('Quick prediction failed:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Quick prediction failed'
      }))
      throw error
    }
  }, [userId])

  // Clear predictions
  const clearPredictions = useCallback(() => {
    setState({
      predictions: null,
      alternatives: [],
      confidenceIntervals: null,
      loading: false,
      error: null,
      metadata: {
        accuracy: 0,
        reliability: 0,
        processingTime: 0,
        lastUpdated: null
      }
    })
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    ...state,
    predict,
    quickPredict,
    clearPredictions
  }
}

// Real-time pattern monitoring hook
export function usePatternMonitoring(enableRealTime: boolean = false, interval: number = 60) {
  const { userId } = useAuth()
  const [patterns, setPatterns] = useState<any[]>([])
  const [anomalies, setAnomalies] = useState<any[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startMonitoring = useCallback(() => {
    if (!userId || !enableRealTime) return

    setIsMonitoring(true)

    const monitor = async () => {
      try {
        const response = await fetch('/api/patterns/analyze?systems=all&hours=1&minConfidence=0.8')
        const result = await response.json()

        if (result.success) {
          setPatterns(result.data.patterns || [])
          setAnomalies(result.data.anomalies || [])
          setLastUpdate(new Date())
        }
      } catch (error) {
        console.error('Pattern monitoring failed:', error)
      }
    }

    // Initial check
    monitor()

    // Set up interval
    intervalRef.current = setInterval(monitor, interval * 1000)
  }, [userId, enableRealTime, interval])

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (enableRealTime) {
      startMonitoring()
    } else {
      stopMonitoring()
    }

    return stopMonitoring
  }, [enableRealTime, startMonitoring, stopMonitoring])

  return {
    patterns,
    anomalies,
    lastUpdate,
    isMonitoring,
    startMonitoring,
    stopMonitoring
  }
}

// Pattern insights hook for specific pattern types
export function usePatternInsights(patternType?: string) {
  const { userId } = useAuth()
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInsights = useCallback(async (type?: string) => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const systems = type ? [type] : ['learning', 'sessions', 'analytics']
      const response = await fetch('/api/patterns/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systems,
          timeRange: {
            start: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours
            end: new Date()
          },
          minConfidence: 0.8,
          maxResults: 10,
          includeML: true
        })
      })

      const result = await response.json()

      if (result.success) {
        setInsights(result.data.analysis?.insights || [])
      } else {
        throw new Error(result.error || 'Failed to fetch insights')
      }
    } catch (error) {
      console.error('Failed to fetch pattern insights:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch insights')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchInsights(patternType)
  }, [fetchInsights, patternType])

  return {
    insights,
    loading,
    error,
    refetch: () => fetchInsights(patternType)
  }
}

// Performance metrics hook for pattern recognition
export function usePatternMetrics() {
  const [metrics, setMetrics] = useState({
    analysisSpeed: 0,
    accuracy: 0,
    cacheHitRate: 0,
    predictionsGenerated: 0,
    anomaliesDetected: 0,
    lastMeasurement: null as Date | null
  })

  const updateMetrics = useCallback((newMetrics: Partial<typeof metrics>) => {
    setMetrics(prev => ({
      ...prev,
      ...newMetrics,
      lastMeasurement: new Date()
    }))
  }, [])

  return {
    metrics,
    updateMetrics
  }
}

// Export utility functions for pattern data processing
export const PatternUtils = {
  // Filter patterns by confidence threshold
  filterByConfidence: (patterns: any[], threshold: number) => {
    return patterns.filter(pattern => pattern.confidence >= threshold)
  },

  // Sort patterns by various criteria
  sortPatterns: (patterns: any[], criteria: 'confidence' | 'frequency' | 'impact' | 'date') => {
    return [...patterns].sort((a, b) => {
      switch (criteria) {
        case 'confidence':
          return (b.confidence || 0) - (a.confidence || 0)
        case 'frequency':
          return (b.frequency || 0) - (a.frequency || 0)
        case 'impact':
          return (b.impact || 0) - (a.impact || 0)
        case 'date':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        default:
          return 0
      }
    })
  },

  // Group patterns by type
  groupByType: (patterns: any[]) => {
    return patterns.reduce((groups, pattern) => {
      const type = pattern.type || 'unknown'
      if (!groups[type]) groups[type] = []
      groups[type].push(pattern)
      return groups
    }, {} as Record<string, any[]>)
  },

  // Calculate pattern statistics
  calculateStats: (patterns: any[]) => {
    if (patterns.length === 0) {
      return {
        totalPatterns: 0,
        averageConfidence: 0,
        averageFrequency: 0,
        averageImpact: 0,
        typeDistribution: {}
      }
    }

    const totalPatterns = patterns.length
    const averageConfidence = patterns.reduce((sum, p) => sum + (p.confidence || 0), 0) / totalPatterns
    const averageFrequency = patterns.reduce((sum, p) => sum + (p.frequency || 0), 0) / totalPatterns
    const averageImpact = patterns.reduce((sum, p) => sum + (p.impact || 0), 0) / totalPatterns
    
    const typeDistribution = patterns.reduce((dist, pattern) => {
      const type = pattern.type || 'unknown'
      dist[type] = (dist[type] || 0) + 1
      return dist
    }, {} as Record<string, number>)

    return {
      totalPatterns,
      averageConfidence,
      averageFrequency,
      averageImpact,
      typeDistribution
    }
  },

  // Format confidence as percentage
  formatConfidence: (confidence: number) => {
    return `${Math.round(confidence * 100)}%`
  },

  // Format processing time
  formatProcessingTime: (milliseconds: number) => {
    if (milliseconds < 1000) return `${milliseconds}ms`
    if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(1)}s`
    return `${(milliseconds / 60000).toFixed(1)}m`
  }
} 