import { useState, useEffect, useCallback } from 'react'
import { LearningMetrics, InteractionCapture, PatternRecognitionResult, LearningPattern } from '@/lib/types/learning'

interface UseLearningReturn {
  metrics: LearningMetrics | null
  patterns: LearningPattern[]
  loading: boolean
  error: string | null
  captureInteraction: (interaction: InteractionCapture) => Promise<void>
  analyzeInstruction: (instructionText: string, context?: Record<string, any>) => Promise<PatternRecognitionResult | null>
  refetch: () => Promise<void>
}

export function useLearning(): UseLearningReturn {
  const [metrics, setMetrics] = useState<LearningMetrics | null>(null)
  const [patterns, setPatterns] = useState<LearningPattern[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // In a real implementation, this would fetch from the API
      // For now, we'll return mock metrics
      const mockMetrics: LearningMetrics = {
        totalInstructions: 156,
        successfulInstructions: 134,
        successRate: 0.859,
        avgResponseTime: 2300,
        topPatterns: [],
        recentSessions: [],
        instructionTypeDistribution: {
          'code_generation': 45,
          'debugging': 32,
          'refactoring': 28,
          'analysis': 23,
          'explanation': 18,
          'other': 10
        },
        effectivenessTrends: [
          { date: '2024-01-01', successRate: 0.78, avgEffectiveness: 0.72 },
          { date: '2024-01-02', successRate: 0.82, avgEffectiveness: 0.76 },
          { date: '2024-01-03', successRate: 0.85, avgEffectiveness: 0.79 },
          { date: '2024-01-04', successRate: 0.87, avgEffectiveness: 0.82 },
          { date: '2024-01-05', successRate: 0.86, avgEffectiveness: 0.81 }
        ]
      }
      
      setMetrics(mockMetrics)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch learning metrics'
      setError(errorMessage)
      console.error('Learning metrics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPatterns = useCallback(async () => {
    try {
      const response = await fetch('/api/learning/patterns')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch patterns: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.success && result.data) {
        setPatterns(result.data.patterns)
      } else {
        throw new Error(result.error || 'API returned error')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch patterns'
      setError(errorMessage)
      console.error('Patterns fetch error:', err)
    }
  }, [])

  const captureInteraction = useCallback(async (interaction: InteractionCapture) => {
    try {
      const response = await fetch('/api/learning/capture-interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interaction)
      })
      
      if (!response.ok) {
        throw new Error(`Failed to capture interaction: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to capture interaction')
      }
      
      console.log('Interaction captured successfully:', result.data)
      
      // Optionally refresh metrics after successful capture
      // await fetchMetrics()
    } catch (err) {
      console.error('Interaction capture error:', err)
      throw err
    }
  }, [])

  const analyzeInstruction = useCallback(async (
    instructionText: string, 
    context?: Record<string, any>
  ): Promise<PatternRecognitionResult | null> => {
    try {
      const response = await fetch('/api/learning/patterns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ instructionText, context })
      })
      
      if (!response.ok) {
        throw new Error(`Failed to analyze instruction: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.success && result.data) {
        return result.data
      } else {
        throw new Error(result.error || 'Analysis failed')
      }
    } catch (err) {
      console.error('Instruction analysis error:', err)
      return null
    }
  }, [])

  const refetch = useCallback(async () => {
    await Promise.all([fetchMetrics(), fetchPatterns()])
  }, [fetchMetrics, fetchPatterns])

  useEffect(() => {
    refetch()
  }, [refetch])

  return {
    metrics,
    patterns,
    loading,
    error,
    captureInteraction,
    analyzeInstruction,
    refetch
  }
}

// Auto-capture hook for seamless integration
export function useAutoCapture(sessionId: string) {
  const { captureInteraction } = useLearning()
  
  const autoCapture = useCallback(async (
    instructionText: string,
    responseText: string,
    options: {
      instructionType?: string
      responseType?: string
      executionTime?: number
      filesModified?: string[]
      success?: boolean
      context?: Record<string, any>
    } = {}
  ) => {
    try {
      const interaction: InteractionCapture = {
        instruction: {
          session_id: sessionId,
          user_id: '', // Will be filled by the API
          instruction_text: instructionText,
          instruction_type: (options.instructionType as any) || 'other',
          context: options.context || {},
          follow_up_needed: false
        },
        response: {
          instruction_id: '', // Will be filled by the API
          session_id: sessionId,
          response_text: responseText,
          response_type: (options.responseType as any) || 'code',
          execution_time_ms: options.executionTime || 0,
          files_modified: options.filesModified || [],
          success: options.success !== undefined ? options.success : true
        }
      }
      
      await captureInteraction(interaction)
    } catch (error) {
      console.error('Auto-capture failed:', error)
      // Don't throw - we don't want to break the main flow
    }
  }, [captureInteraction, sessionId])
  
  return { autoCapture }
} 