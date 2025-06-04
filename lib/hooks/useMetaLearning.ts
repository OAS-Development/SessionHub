import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@clerk/nextjs'

// Meta-learning hook interfaces
export interface MetaLearningState {
  algorithms: AlgorithmStatus[]
  optimizationInProgress: boolean
  lastOptimization: Date | null
  improvements: ImprovementRecord[]
  selfReflection: SelfReflectionData | null
  autonomousAdaptations: AutonomousAdaptation[]
  loading: boolean
  error: string | null
}

export interface AlgorithmStatus {
  algorithmId: string
  algorithmType: string
  currentVersion: string
  performance: PerformanceMetrics
  lastOptimized: Date
  optimizationPotential: number
  selfAssessment: SelfAssessmentData
  evolutionHistory: EvolutionRecord[]
}

export interface PerformanceMetrics {
  accuracy: number
  efficiency: number
  convergenceTime: number
  successRate: number
  adaptability: number
  selfReflectionAccuracy: number
}

export interface ImprovementRecord {
  algorithmId: string
  timestamp: Date
  improvementType: string
  improvement: number
  confidence: number
  method: string
  validated: boolean
}

export interface SelfReflectionData {
  timestamp: Date
  overallAccuracy: number
  algorithmInsights: AlgorithmInsight[]
  systemWidePatterns: string[]
  improvementOpportunities: string[]
  confidenceLevel: number
}

export interface AlgorithmInsight {
  algorithmId: string
  capabilities: string[]
  weaknesses: string[]
  opportunities: string[]
  reflectionAccuracy: number
  autonomousAdaptations: number
}

export interface AutonomousAdaptation {
  algorithmId: string
  timestamp: Date
  adaptationType: string
  description: string
  success: boolean
  improvement: number
  confidence: number
}

export interface EvolutionRecord {
  evolutionId: string
  timestamp: Date
  evolutionType: string
  improvement: number
  newCapabilities: string[]
  success: boolean
}

export interface OptimizationOptions {
  algorithmId?: string
  optimizationType: 'comprehensive' | 'hyperparameter' | 'architecture' | 'learning_rate' | 'feature_engineering'
  targetImprovement: number
  metaLearningEnabled: boolean
  recursiveLearningDepth: number
}

export interface EvolutionOptions {
  evolutionType: 'capability_enhancement' | 'architecture_evolution' | 'learning_optimization' | 'autonomous_adaptation'
  targetAlgorithms: string[]
  parallelEvolution: boolean
  autonomousEvolutionEnabled: boolean
  crossAlgorithmLearning: boolean
}

// Main meta-learning hook
export function useMetaLearning() {
  const { userId } = useAuth()
  const [state, setState] = useState<MetaLearningState>({
    algorithms: [],
    optimizationInProgress: false,
    lastOptimization: null,
    improvements: [],
    selfReflection: null,
    autonomousAdaptations: [],
    loading: false,
    error: null
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  // Load meta-learning insights
  const loadMetaLearningInsights = useCallback(async () => {
    if (!userId) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/meta-learning/optimize', {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error(`Failed to load meta-learning insights: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to load meta-learning insights')
      }

      const insights = result.data
      
      setState(prev => ({
        ...prev,
        algorithms: insights.metaLearningInsights?.topPerformingAlgorithms || [],
        selfReflection: {
          timestamp: new Date(),
          overallAccuracy: insights.systemWideMetrics?.averageImprovement || 0,
          algorithmInsights: [],
          systemWidePatterns: [],
          improvementOpportunities: [],
          confidenceLevel: 0.85
        },
        loading: false,
        error: null
      }))
    } catch (error) {
      console.error('Failed to load meta-learning insights:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load insights'
      }))
    }
  }, [userId])

  // Optimize algorithm performance
  const optimizeAlgorithm = useCallback(async (options: OptimizationOptions) => {
    if (!userId) return

    // Cancel any ongoing optimization
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    setState(prev => ({ ...prev, optimizationInProgress: true, error: null }))

    try {
      const response = await fetch('/api/meta-learning/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error(`Optimization failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Optimization failed')
      }

      const optimization = result.data

      // Update state with optimization results
      setState(prev => ({
        ...prev,
        optimizationInProgress: false,
        lastOptimization: new Date(),
        improvements: [
          ...prev.improvements,
          {
            algorithmId: options.algorithmId || 'system_wide',
            timestamp: new Date(),
            improvementType: options.optimizationType,
            improvement: optimization.performance.overallImprovement,
            confidence: optimization.performance.selfReflectionAccuracy,
            method: 'meta_learning',
            validated: optimization.performance.targetAchieved
          }
        ],
        selfReflection: optimization.optimization.selfReflectionResults ? {
          timestamp: new Date(),
          overallAccuracy: optimization.optimization.selfReflectionResults.selfReflectionAccuracy,
          algorithmInsights: [{
            algorithmId: options.algorithmId || 'system_wide',
            capabilities: optimization.optimization.selfReflectionResults.currentCapabilities,
            weaknesses: optimization.optimization.selfReflectionResults.identifiedWeaknesses,
            opportunities: optimization.optimization.selfReflectionResults.improvementOpportunities,
            reflectionAccuracy: optimization.optimization.selfReflectionResults.selfReflectionAccuracy,
            autonomousAdaptations: optimization.optimization.selfReflectionResults.autonomousAdaptations
          }],
          systemWidePatterns: [],
          improvementOpportunities: optimization.optimization.selfReflectionResults.improvementOpportunities,
          confidenceLevel: optimization.optimization.selfReflectionResults.selfReflectionAccuracy
        } : prev.selfReflection,
        error: null
      }))

      return optimization
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return // Request was cancelled
      }

      console.error('Algorithm optimization failed:', error)
      setState(prev => ({
        ...prev,
        optimizationInProgress: false,
        error: error instanceof Error ? error.message : 'Optimization failed'
      }))
      throw error
    }
  }, [userId])

  // Trigger capability evolution
  const evolveCapabilities = useCallback(async (options: EvolutionOptions) => {
    if (!userId) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/meta-learning/evolve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options)
      })

      if (!response.ok) {
        throw new Error(`Evolution failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Evolution failed')
      }

      const evolution = result.data

      // Update state with evolution results
      setState(prev => ({
        ...prev,
        loading: false,
        autonomousAdaptations: [
          ...prev.autonomousAdaptations,
          ...evolution.evolution.autonomousAdaptations.map((adapt: any) => ({
            algorithmId: adapt.algorithmId,
            timestamp: new Date(),
            adaptationType: adapt.adaptationType,
            description: `Autonomous adaptation: ${adapt.adaptationsApplied.join(', ')}`,
            success: adapt.success,
            improvement: adapt.improvement,
            confidence: adapt.confidence
          }))
        ],
        improvements: [
          ...prev.improvements,
          ...evolution.evolution.evolutions
            .filter((evo: any) => !evo.error)
            .map((evo: any) => ({
              algorithmId: evo.evolutionId?.split('_')[0] || 'unknown',
              timestamp: new Date(),
              improvementType: evo.evolutionType,
              improvement: evo.measuredImprovement || evo.improvement || 0,
              confidence: evo.confidence || 0.8,
              method: 'capability_evolution',
              validated: true
            }))
        ],
        error: null
      }))

      return evolution
    } catch (error) {
      console.error('Capability evolution failed:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Evolution failed'
      }))
      throw error
    }
  }, [userId])

  // Monitor algorithm performance
  const monitorAlgorithm = useCallback(async (algorithmId: string, performanceData: any) => {
    if (!userId) return

    try {
      const response = await fetch('/api/meta-learning/optimize', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          algorithmId,
          performanceData,
          selfReflectionEnabled: true,
          autonomousAdaptationEnabled: true
        })
      })

      if (!response.ok) {
        throw new Error(`Performance monitoring failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Performance monitoring failed')
      }

      // Update algorithm status
      setState(prev => ({
        ...prev,
        algorithms: prev.algorithms.map(algo => 
          algo.algorithmId === algorithmId 
            ? {
                ...algo,
                performance: {
                  ...algo.performance,
                  accuracy: performanceData.accuracy || algo.performance.accuracy,
                  efficiency: performanceData.efficiency || algo.performance.efficiency,
                  selfReflectionAccuracy: result.data.metaLearning.selfReflectionAccuracy
                },
                lastOptimized: new Date()
              }
            : algo
        )
      }))

      return result.data
    } catch (error) {
      console.error('Performance monitoring failed:', error)
      throw error
    }
  }, [userId])

  // Get algorithm-specific insights
  const getAlgorithmInsights = useCallback(async (algorithmId: string) => {
    if (!userId) return

    try {
      const response = await fetch(`/api/meta-learning/optimize?algorithmId=${algorithmId}&includeSelfReflection=true`)

      if (!response.ok) {
        throw new Error(`Failed to get algorithm insights: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to get algorithm insights')
      }

      return result.data.algorithmSpecific
    } catch (error) {
      console.error('Failed to get algorithm insights:', error)
      throw error
    }
  }, [userId])

  // Trigger manual evolution for specific algorithm
  const triggerManualEvolution = useCallback(async (
    algorithmId: string, 
    evolutionScope: 'targeted' | 'comprehensive' | 'experimental' = 'targeted'
  ) => {
    if (!userId) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/meta-learning/evolve', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          algorithmId,
          evolutionTrigger: 'manual',
          evolutionScope
        })
      })

      if (!response.ok) {
        throw new Error(`Manual evolution failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Manual evolution failed')
      }

      // Update evolution history
      setState(prev => ({
        ...prev,
        loading: false,
        algorithms: prev.algorithms.map(algo =>
          algo.algorithmId === algorithmId
            ? {
                ...algo,
                evolutionHistory: [
                  ...algo.evolutionHistory,
                  {
                    evolutionId: result.data.metadata.evolutionTriggerId,
                    timestamp: new Date(),
                    evolutionType: result.data.evolution.evolutionType,
                    improvement: result.data.performance.improvement,
                    newCapabilities: result.data.evolution.newCapabilities || [],
                    success: result.data.performance.success
                  }
                ]
              }
            : algo
        ),
        error: null
      }))

      return result.data
    } catch (error) {
      console.error('Manual evolution failed:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Manual evolution failed'
      }))
      throw error
    }
  }, [userId])

  // Load initial data on mount
  useEffect(() => {
    loadMetaLearningInsights()
  }, [loadMetaLearningInsights])

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
    loadMetaLearningInsights,
    optimizeAlgorithm,
    evolveCapabilities,
    monitorAlgorithm,
    getAlgorithmInsights,
    triggerManualEvolution
  }
}

// Algorithm performance tracking hook
export function useAlgorithmPerformance(algorithmId?: string) {
  const { userId } = useAuth()
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null)
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load algorithm performance data
  const loadPerformance = useCallback(async () => {
    if (!userId || !algorithmId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/meta-learning/optimize?algorithmId=${algorithmId}&includeHistory=true`)

      if (!response.ok) {
        throw new Error(`Failed to load performance: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to load performance')
      }

      const algorithmData = result.data.algorithmSpecific
      if (algorithmData?.performance) {
        setPerformance({
          accuracy: algorithmData.performance.performanceMetrics.accuracy,
          efficiency: algorithmData.performance.performanceMetrics.efficiency,
          convergenceTime: algorithmData.performance.performanceMetrics.convergenceTime,
          successRate: algorithmData.performance.performanceMetrics.successRate,
          adaptability: algorithmData.performance.performanceMetrics.adaptability,
          selfReflectionAccuracy: algorithmData.performance.selfAssessment.selfReflectionAccuracy
        })
      }

      if (algorithmData?.optimizationHistory) {
        setHistory(algorithmData.optimizationHistory)
      }
    } catch (error) {
      console.error('Failed to load algorithm performance:', error)
      setError(error instanceof Error ? error.message : 'Failed to load performance')
    } finally {
      setLoading(false)
    }
  }, [userId, algorithmId])

  // Update performance data
  const updatePerformance = useCallback(async (performanceData: Partial<PerformanceMetrics>) => {
    if (!userId || !algorithmId) return

    try {
      const response = await fetch('/api/meta-learning/optimize', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          algorithmId,
          performanceData
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to update performance: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to update performance')
      }

      // Update local performance state
      setPerformance(prev => prev ? { ...prev, ...performanceData } : null)

      return result.data
    } catch (error) {
      console.error('Failed to update performance:', error)
      throw error
    }
  }, [userId, algorithmId])

  // Load data when algorithm ID changes
  useEffect(() => {
    if (algorithmId) {
      loadPerformance()
    }
  }, [algorithmId, loadPerformance])

  return {
    performance,
    history,
    loading,
    error,
    loadPerformance,
    updatePerformance
  }
}

// Evolution history hook
export function useEvolutionHistory(algorithmId?: string) {
  const { userId } = useAuth()
  const [evolutionHistory, setEvolutionHistory] = useState<any[]>([])
  const [evolutionInsights, setEvolutionInsights] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load evolution history
  const loadEvolutionHistory = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        includeInsights: 'true'
      })
      
      if (algorithmId) {
        params.append('algorithmId', algorithmId)
      }

      const response = await fetch(`/api/meta-learning/evolve?${params}`)

      if (!response.ok) {
        throw new Error(`Failed to load evolution history: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to load evolution history')
      }

      setEvolutionHistory(result.data.evolutionHistory)
      setEvolutionInsights(result.data.evolutionInsights)
    } catch (error) {
      console.error('Failed to load evolution history:', error)
      setError(error instanceof Error ? error.message : 'Failed to load evolution history')
    } finally {
      setLoading(false)
    }
  }, [userId, algorithmId])

  // Load data on mount and when algorithm changes
  useEffect(() => {
    loadEvolutionHistory()
  }, [loadEvolutionHistory])

  return {
    evolutionHistory,
    evolutionInsights,
    loading,
    error,
    loadEvolutionHistory
  }
}

// Utility functions for meta-learning analytics
export const MetaLearningUtils = {
  // Calculate improvement trend
  calculateImprovementTrend: (improvements: ImprovementRecord[]): string => {
    if (improvements.length < 2) return 'insufficient_data'
    
    const recent = improvements.slice(-3)
    const earlier = improvements.slice(-6, -3)
    
    if (earlier.length === 0) return 'insufficient_data'
    
    const recentAvg = recent.reduce((sum, imp) => sum + imp.improvement, 0) / recent.length
    const earlierAvg = earlier.reduce((sum, imp) => sum + imp.improvement, 0) / earlier.length
    
    if (recentAvg > earlierAvg * 1.1) return 'improving'
    if (recentAvg < earlierAvg * 0.9) return 'declining'
    return 'stable'
  },

  // Calculate meta-learning effectiveness
  calculateMetaLearningEffectiveness: (algorithms: AlgorithmStatus[]): number => {
    if (algorithms.length === 0) return 0
    
    const totalAccuracy = algorithms.reduce((sum, algo) => sum + algo.performance.selfReflectionAccuracy, 0)
    return totalAccuracy / algorithms.length
  },

  // Get algorithm recommendations
  getAlgorithmRecommendations: (algorithm: AlgorithmStatus): string[] => {
    const recommendations = []
    
    if (algorithm.performance.accuracy < 0.9) {
      recommendations.push('Consider hyperparameter optimization')
    }
    
    if (algorithm.performance.efficiency < 0.8) {
      recommendations.push('Architecture optimization may improve efficiency')
    }
    
    if (algorithm.performance.convergenceTime > 10000) {
      recommendations.push('Learning rate adaptation could speed up convergence')
    }
    
    if (algorithm.optimizationPotential > 0.2) {
      recommendations.push('High optimization potential detected - consider evolution')
    }
    
    return recommendations
  },

  // Format performance metrics
  formatPerformanceMetrics: (metrics: PerformanceMetrics): any => {
    return {
      accuracy: Math.round(metrics.accuracy * 100),
      efficiency: Math.round(metrics.efficiency * 100),
      convergenceTime: `${(metrics.convergenceTime / 1000).toFixed(1)}s`,
      successRate: Math.round(metrics.successRate * 100),
      adaptability: Math.round(metrics.adaptability * 100),
      selfReflectionAccuracy: Math.round(metrics.selfReflectionAccuracy * 100)
    }
  }
} 