import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@clerk/nextjs'

// Intelligent generation hook interfaces
export interface GenerationState {
  generatedSession: any | null
  alternatives: any[]
  loading: boolean
  error: string | null
  performance: {
    generationTime: number
    efficiency: number
    successPrediction: number
  }
  metadata: {
    algorithmsUsed: string[]
    optimizationLevel: number
    lastGenerated: Date | null
  }
}

export interface OptimizationState {
  originalTemplate: any | null
  optimizedTemplate: any | null
  improvement: any | null
  recommendations: any[]
  loading: boolean
  error: string | null
  performance: {
    processingTime: number
    efficiency: number
    actualImprovement: number
  }
}

export interface GenerationOptions {
  sessionType: string
  targetDuration?: number
  difficulty: string
  objectives: string[]
  context: Record<string, any>
  preferences: Record<string, any>
  constraints: Record<string, any>
  optimizationLevel: 'quick' | 'standard' | 'comprehensive'
}

export interface OptimizationOptions {
  sessionTemplate: any
  optimizationGoals: string[]
  algorithms: string[]
  constraints: Record<string, any>
  optimizationLevel: 'quick' | 'standard' | 'intensive'
}

export interface ContinuousLearningState {
  learningData: any[]
  improvements: any[]
  adaptations: any[]
  effectiveness: number
  lastUpdate: Date | null
}

// Main intelligent generation hook
export function useIntelligentGeneration(defaultOptions?: Partial<GenerationOptions>) {
  const { userId } = useAuth()
  const [state, setState] = useState<GenerationState>({
    generatedSession: null,
    alternatives: [],
    loading: false,
    error: null,
    performance: {
      generationTime: 0,
      efficiency: 0,
      successPrediction: 0
    },
    metadata: {
      algorithmsUsed: [],
      optimizationLevel: 0,
      lastGenerated: null
    }
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  const defaultGenerationOptions: GenerationOptions = {
    sessionType: 'development',
    targetDuration: 90,
    difficulty: 'intermediate',
    objectives: ['general_development'],
    context: {},
    preferences: {},
    constraints: {},
    optimizationLevel: 'standard',
    ...defaultOptions
  }

  // Generate intelligent session
  const generateSession = useCallback(async (customOptions?: Partial<GenerationOptions>) => {
    if (!userId) return

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const options = { ...defaultGenerationOptions, ...customOptions }
      
      const response = await fetch('/api/sessions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
        signal: controller.signal
      })

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Generation failed')
      }

      const { session, performance, metadata } = result.data

      setState(prev => ({
        ...prev,
        generatedSession: session,
        alternatives: session.alternatives || [],
        loading: false,
        error: null,
        performance: {
          generationTime: performance.generationTime,
          efficiency: performance.efficiency,
          successPrediction: performance.successPrediction
        },
        metadata: {
          algorithmsUsed: metadata.algorithmsUsed,
          optimizationLevel: session.metadata.optimizationLevel,
          lastGenerated: new Date()
        }
      }))

      return session
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return // Request was cancelled
      }

      console.error('Session generation failed:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Generation failed'
      }))
      throw error
    }
  }, [userId, defaultGenerationOptions])

  // Quick generation for immediate use
  const quickGenerate = useCallback(async (type?: string, duration?: number, difficulty?: string, objective?: string) => {
    if (!userId) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const params = new URLSearchParams({
        type: type || 'development',
        duration: (duration || 90).toString(),
        difficulty: difficulty || 'intermediate',
        objective: objective || 'general_development'
      })

      const response = await fetch(`/api/sessions/generate?${params}`)

      if (!response.ok) {
        throw new Error(`Quick generation failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Quick generation failed')
      }

      setState(prev => ({
        ...prev,
        generatedSession: result.data.session,
        alternatives: result.data.session.alternatives || [],
        loading: false,
        error: null,
        performance: {
          generationTime: result.data.performance.generationTime,
          efficiency: 100, // Quick generation is always efficient
          successPrediction: result.data.performance.successPrediction
        },
        metadata: {
          algorithmsUsed: ['quick_generation'],
          optimizationLevel: 0.5,
          lastGenerated: new Date()
        }
      }))

      return result.data.session
    } catch (error) {
      console.error('Quick generation failed:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Quick generation failed'
      }))
      throw error
    }
  }, [userId])

  // Batch generation for multiple sessions
  const batchGenerate = useCallback(async (requests: any[], parallelExecution: boolean = true) => {
    if (!userId) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/sessions/generate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests, parallelExecution })
      })

      if (!response.ok) {
        throw new Error(`Batch generation failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Batch generation failed')
      }

      setState(prev => ({
        ...prev,
        generatedSession: result.data.sessions[0], // Use first session as primary
        alternatives: result.data.sessions.slice(1), // Rest as alternatives
        loading: false,
        error: null,
        performance: {
          generationTime: result.data.batchMetrics.totalProcessingTime,
          efficiency: 100,
          successPrediction: result.data.batchMetrics.averageSuccessPrediction
        },
        metadata: {
          algorithmsUsed: ['batch_generation'],
          optimizationLevel: 0.7,
          lastGenerated: new Date()
        }
      }))

      return result.data.sessions
    } catch (error) {
      console.error('Batch generation failed:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Batch generation failed'
      }))
      throw error
    }
  }, [userId])

  // Clear generated session
  const clearSession = useCallback(() => {
    setState({
      generatedSession: null,
      alternatives: [],
      loading: false,
      error: null,
      performance: {
        generationTime: 0,
        efficiency: 0,
        successPrediction: 0
      },
      metadata: {
        algorithmsUsed: [],
        optimizationLevel: 0,
        lastGenerated: null
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
    generateSession,
    quickGenerate,
    batchGenerate,
    clearSession
  }
}

// Session optimization hook
export function useSessionOptimization() {
  const { userId } = useAuth()
  const [state, setState] = useState<OptimizationState>({
    originalTemplate: null,
    optimizedTemplate: null,
    improvement: null,
    recommendations: [],
    loading: false,
    error: null,
    performance: {
      processingTime: 0,
      efficiency: 0,
      actualImprovement: 0
    }
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  // Optimize session template
  const optimizeSession = useCallback(async (options: OptimizationOptions) => {
    if (!userId) return

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/sessions/optimize', {
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

      const { optimization, performance } = result.data

      setState(prev => ({
        ...prev,
        originalTemplate: optimization.originalTemplate,
        optimizedTemplate: optimization.bestOptimizedTemplate,
        improvement: optimization.improvement,
        recommendations: optimization.recommendations,
        loading: false,
        error: null,
        performance: {
          processingTime: performance.totalProcessingTime,
          efficiency: performance.efficiency,
          actualImprovement: performance.actualImprovement
        }
      }))

      return optimization
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return // Request was cancelled
      }

      console.error('Session optimization failed:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Optimization failed'
      }))
      throw error
    }
  }, [userId])

  // Continuous optimization with feedback
  const applyContinuousOptimization = useCallback(async (sessionId: string, performanceData: any, userFeedback?: any) => {
    if (!userId) return

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/sessions/optimize', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          performanceData,
          userFeedback,
          learningFromExecution: true
        })
      })

      if (!response.ok) {
        throw new Error(`Continuous optimization failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Continuous optimization failed')
      }

      setState(prev => ({
        ...prev,
        recommendations: result.data.continuousOptimization.updatedRecommendations,
        loading: false,
        error: null,
        performance: {
          ...prev.performance,
          processingTime: result.data.performance.processingTime
        }
      }))

      return result.data.continuousOptimization
    } catch (error) {
      console.error('Continuous optimization failed:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Continuous optimization failed'
      }))
      throw error
    }
  }, [userId])

  // Get optimization history
  const getOptimizationHistory = useCallback(async (filters?: any) => {
    if (!userId) return

    try {
      const params = new URLSearchParams({
        type: filters?.type || 'all',
        limit: (filters?.limit || 10).toString(),
        timeRange: filters?.timeRange || '7d'
      })

      const response = await fetch(`/api/sessions/optimize?${params}`)

      if (!response.ok) {
        throw new Error(`Failed to get optimization history: ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to get optimization history')
      }

      return result.data
    } catch (error) {
      console.error('Failed to get optimization history:', error)
      throw error
    }
  }, [userId])

  // Clear optimization results
  const clearOptimization = useCallback(() => {
    setState({
      originalTemplate: null,
      optimizedTemplate: null,
      improvement: null,
      recommendations: [],
      loading: false,
      error: null,
      performance: {
        processingTime: 0,
        efficiency: 0,
        actualImprovement: 0
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
    optimizeSession,
    applyContinuousOptimization,
    getOptimizationHistory,
    clearOptimization
  }
}

// Continuous learning hook
export function useContinuousLearning() {
  const { userId } = useAuth()
  const [state, setState] = useState<ContinuousLearningState>({
    learningData: [],
    improvements: [],
    adaptations: [],
    effectiveness: 0,
    lastUpdate: null
  })

  // Record learning data from session execution
  const recordLearning = useCallback(async (sessionData: any) => {
    if (!userId) return

    try {
      const learningEntry = {
        sessionId: sessionData.sessionId,
        userId,
        timestamp: new Date(),
        performance: sessionData.performance,
        feedback: sessionData.feedback,
        outcomes: sessionData.outcomes
      }

      setState(prev => ({
        ...prev,
        learningData: [...prev.learningData, learningEntry],
        lastUpdate: new Date()
      }))

      // Apply to continuous optimization
      await applyContinuousOptimization(sessionData.sessionId, sessionData.performance, sessionData.feedback)
    } catch (error) {
      console.error('Failed to record learning data:', error)
    }
  }, [userId])

  // Get learning insights
  const getLearningInsights = useCallback(() => {
    if (state.learningData.length === 0) return null

    const insights = {
      averagePerformance: state.learningData.reduce((sum, data) => sum + (data.performance?.score || 0), 0) / state.learningData.length,
      improvementTrend: calculateImprovementTrend(state.learningData),
      commonPatterns: identifyCommonPatterns(state.learningData),
      recommendations: generateLearningRecommendations(state.learningData)
    }

    return insights
  }, [state.learningData])

  // Apply learning to future sessions
  const applyLearning = useCallback(async (sessionTemplate: any) => {
    if (!userId || state.learningData.length === 0) return sessionTemplate

    try {
      // Use learning data to enhance session template
      const enhancedTemplate = await enhanceTemplateWithLearning(sessionTemplate, state.learningData)
      
      setState(prev => ({
        ...prev,
        adaptations: [...prev.adaptations, {
          timestamp: new Date(),
          originalTemplate: sessionTemplate,
          enhancedTemplate,
          learningApplied: true
        }]
      }))

      return enhancedTemplate
    } catch (error) {
      console.error('Failed to apply learning:', error)
      return sessionTemplate
    }
  }, [userId, state.learningData])

  return {
    ...state,
    recordLearning,
    getLearningInsights,
    applyLearning
  }
}

// Template management hook
export function useTemplateManagement() {
  const { userId } = useAuth()
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load user's templates
  const loadTemplates = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      // In a real implementation, this would fetch from API
      const userTemplates = await fetchUserTemplates(userId)
      setTemplates(userTemplates)
    } catch (error) {
      console.error('Failed to load templates:', error)
      setError(error instanceof Error ? error.message : 'Failed to load templates')
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Save template
  const saveTemplate = useCallback(async (template: any) => {
    if (!userId) return

    try {
      const savedTemplate = await saveUserTemplate(userId, template)
      setTemplates(prev => [...prev, savedTemplate])
      return savedTemplate
    } catch (error) {
      console.error('Failed to save template:', error)
      throw error
    }
  }, [userId])

  // Update template
  const updateTemplate = useCallback(async (templateId: string, updates: any) => {
    if (!userId) return

    try {
      const updatedTemplate = await updateUserTemplate(userId, templateId, updates)
      setTemplates(prev => prev.map(t => t.id === templateId ? updatedTemplate : t))
      return updatedTemplate
    } catch (error) {
      console.error('Failed to update template:', error)
      throw error
    }
  }, [userId])

  // Delete template
  const deleteTemplate = useCallback(async (templateId: string) => {
    if (!userId) return

    try {
      await deleteUserTemplate(userId, templateId)
      setTemplates(prev => prev.filter(t => t.id !== templateId))
    } catch (error) {
      console.error('Failed to delete template:', error)
      throw error
    }
  }, [userId])

  // Load templates on mount
  useEffect(() => {
    loadTemplates()
  }, [loadTemplates])

  return {
    templates,
    loading,
    error,
    loadTemplates,
    saveTemplate,
    updateTemplate,
    deleteTemplate
  }
}

// Helper functions
function calculateImprovementTrend(data: any[]): string {
  if (data.length < 2) return 'insufficient_data'
  
  const recent = data.slice(-5)
  const earlier = data.slice(-10, -5)
  
  if (earlier.length === 0) return 'insufficient_data'
  
  const recentAvg = recent.reduce((sum, d) => sum + (d.performance?.score || 0), 0) / recent.length
  const earlierAvg = earlier.reduce((sum, d) => sum + (d.performance?.score || 0), 0) / earlier.length
  
  if (recentAvg > earlierAvg * 1.1) return 'improving'
  if (recentAvg < earlierAvg * 0.9) return 'declining'
  return 'stable'
}

function identifyCommonPatterns(data: any[]): string[] {
  // Simple pattern identification
  const patterns = []
  
  const avgDurations = data.map(d => d.performance?.duration || 0)
  const avgDuration = avgDurations.reduce((sum, d) => sum + d, 0) / avgDurations.length
  
  if (avgDuration > 120) patterns.push('long_sessions_preferred')
  if (avgDuration < 60) patterns.push('short_sessions_preferred')
  
  return patterns
}

function generateLearningRecommendations(data: any[]): any[] {
  const recommendations = []
  
  const successRate = data.filter(d => (d.performance?.score || 0) > 0.7).length / data.length
  
  if (successRate < 0.6) {
    recommendations.push({
      type: 'difficulty_adjustment',
      description: 'Consider reducing session difficulty for better success rates',
      confidence: 0.8
    })
  }
  
  return recommendations
}

async function enhanceTemplateWithLearning(template: any, learningData: any[]): Promise<any> {
  // Apply learning insights to enhance template
  const enhanced = { ...template }
  
  // Adjust duration based on learning
  const avgSuccessfulDuration = learningData
    .filter(d => (d.performance?.score || 0) > 0.7)
    .reduce((sum, d) => sum + (d.performance?.duration || 90), 0) / learningData.length
  
  if (avgSuccessfulDuration && Math.abs(enhanced.estimatedDuration - avgSuccessfulDuration) > 15) {
    enhanced.estimatedDuration = Math.round((enhanced.estimatedDuration + avgSuccessfulDuration) / 2)
  }
  
  return enhanced
}

// Mock API functions (in production, these would be real API calls)
async function fetchUserTemplates(userId: string): Promise<any[]> {
  return []
}

async function saveUserTemplate(userId: string, template: any): Promise<any> {
  return { ...template, id: `template_${Date.now()}` }
}

async function updateUserTemplate(userId: string, templateId: string, updates: any): Promise<any> {
  return { id: templateId, ...updates }
}

async function deleteUserTemplate(userId: string, templateId: string): Promise<void> {
  // Mock deletion
}

// Additional utility functions for intelligent generation
export const GenerationUtils = {
  // Validate generation options
  validateOptions: (options: Partial<GenerationOptions>): string[] => {
    const errors = []
    
    if (options.targetDuration && (options.targetDuration < 15 || options.targetDuration > 480)) {
      errors.push('Target duration must be between 15 and 480 minutes')
    }
    
    if (options.objectives && options.objectives.length === 0) {
      errors.push('At least one objective is required')
    }
    
    return errors
  },

  // Calculate generation metrics
  calculateMetrics: (sessions: any[]): any => {
    if (sessions.length === 0) return null
    
    return {
      averageGenerationTime: sessions.reduce((sum, s) => sum + (s.metadata?.generationTime || 0), 0) / sessions.length,
      averageSuccessPrediction: sessions.reduce((sum, s) => sum + (s.predictions?.successProbability || 0), 0) / sessions.length,
      algorithmDistribution: sessions.reduce((dist, s) => {
        const algorithms = s.metadata?.algorithmsUsed || []
        algorithms.forEach((alg: string) => {
          dist[alg] = (dist[alg] || 0) + 1
        })
        return dist
      }, {} as Record<string, number>)
    }
  },

  // Format generation results
  formatResults: (session: any): any => {
    return {
      id: session.id,
      name: session.template?.name || 'Generated Session',
      duration: session.template?.estimatedDuration || 0,
      difficulty: session.template?.difficulty || 'intermediate',
      successPrediction: Math.round((session.predictions?.successProbability || 0) * 100),
      phases: session.template?.structure?.phases?.length || 0,
      generationTime: session.metadata?.generationTime || 0,
      algorithms: session.metadata?.algorithmsUsed || []
    }
  }
} 