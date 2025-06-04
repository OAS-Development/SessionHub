import { useState, useEffect, useCallback, useRef } from 'react'

export interface DevSession {
  id: string
  name: string
  description?: string
  startTime: Date
  endTime?: Date
  plannedDuration: number // in minutes
  actualDuration?: number
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED'
  sessionGoals?: string
  accomplishments?: string
  challenges?: string
  nextSteps?: string
  linesAdded: number
  linesDeleted: number
  filesModified: number
  commits: number
  aiToolsUsed: string[]
  totalAIQueries: number
  avgResponseTime?: number
  productivityScore?: number
  satisfactionScore?: number
  flowStateAchieved: boolean
  projectId: string
  project: {
    name: string
  }
}

export interface SessionMetrics {
  currentDuration: number
  goalProgress: number
  aiInteractionsCount: number
  productivityIndicator: 'low' | 'medium' | 'high'
  flowState: boolean
}

export interface UseDevSessionsReturn {
  // Current session management
  currentSession: DevSession | null
  sessionMetrics: SessionMetrics | null
  isSessionActive: boolean
  
  // Session operations
  startSession: (data: {
    projectId: string
    name: string
    description?: string
    goals?: string
    plannedDuration?: number
  }) => Promise<DevSession | null>
  pauseSession: () => Promise<void>
  resumeSession: () => Promise<void>
  endSession: (data: {
    accomplishments?: string
    challenges?: string
    nextSteps?: string
    satisfactionScore?: number
    flowStateAchieved?: boolean
  }) => Promise<void>
  
  // Real-time tracking
  logAIInteraction: (tool: string, responseTime: number) => void
  updateCodeMetrics: (linesAdded: number, linesDeleted: number, filesModified: number) => void
  addCommit: () => void
  
  // Session history and analytics
  sessions: DevSession[]
  loadingSessions: boolean
  fetchSessions: () => Promise<void>
  
  // Error handling
  error: string | null
  clearError: () => void
}

export function useDevSessions(): UseDevSessionsReturn {
  const [currentSession, setCurrentSession] = useState<DevSession | null>(null)
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetrics | null>(null)
  const [sessions, setSessions] = useState<DevSession[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Timer management
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)

  // Start real-time timer when session is active
  useEffect(() => {
    if (currentSession?.status === 'ACTIVE') {
      const startTime = new Date(currentSession.startTime).getTime()
      
      timerRef.current = setInterval(() => {
        const now = Date.now()
        const elapsed = Math.floor((now - startTime) / 1000 / 60) // minutes
        setElapsedTime(elapsed)
        
        // Update session metrics
        if (currentSession) {
          updateSessionMetrics(elapsed)
        }
      }, 60000) // Update every minute
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
    }
  }, [currentSession])

  // Calculate real-time session metrics
  const updateSessionMetrics = useCallback((duration: number) => {
    if (!currentSession) return

    const goalProgress = currentSession.plannedDuration > 0 
      ? Math.min((duration / currentSession.plannedDuration) * 100, 100)
      : 0

    const aiInteractionsRate = duration > 0 ? currentSession.totalAIQueries / duration : 0
    
    let productivityIndicator: 'low' | 'medium' | 'high' = 'medium'
    if (aiInteractionsRate > 2) productivityIndicator = 'high'
    else if (aiInteractionsRate < 0.5) productivityIndicator = 'low'

    setSessionMetrics({
      currentDuration: duration,
      goalProgress,
      aiInteractionsCount: currentSession.totalAIQueries,
      productivityIndicator,
      flowState: currentSession.flowStateAchieved
    })
  }, [currentSession])

  // Start a new development session
  const startSession = async (data: {
    projectId: string
    name: string
    description?: string
    goals?: string
    plannedDuration?: number
  }): Promise<DevSession | null> => {
    try {
      setError(null)
      
      const response = await fetch('/api/dev-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          plannedDuration: data.plannedDuration || 60
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to start session: ${response.statusText}`)
      }

      const session = await response.json()
      
      // Transform response to match interface
      const newSession: DevSession = {
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined
      }

      setCurrentSession(newSession)
      setElapsedTime(0)
      setSessionMetrics({
        currentDuration: 0,
        goalProgress: 0,
        aiInteractionsCount: 0,
        productivityIndicator: 'medium',
        flowState: false
      })

      return newSession
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start session'
      setError(errorMessage)
      return null
    }
  }

  // Pause current session
  const pauseSession = async (): Promise<void> => {
    if (!currentSession) return

    try {
      const response = await fetch(`/api/dev-sessions/${currentSession.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'PAUSED'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to pause session')
      }

      setCurrentSession(prev => prev ? { ...prev, status: 'PAUSED' } : null)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause session')
    }
  }

  // Resume paused session
  const resumeSession = async (): Promise<void> => {
    if (!currentSession) return

    try {
      const response = await fetch(`/api/dev-sessions/${currentSession.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'ACTIVE'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to resume session')
      }

      setCurrentSession(prev => prev ? { ...prev, status: 'ACTIVE' } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resume session')
    }
  }

  // End current session
  const endSession = async (data: {
    accomplishments?: string
    challenges?: string
    nextSteps?: string
    satisfactionScore?: number
    flowStateAchieved?: boolean
  }): Promise<void> => {
    if (!currentSession) return

    try {
      const response = await fetch(`/api/dev-sessions/${currentSession.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'COMPLETED',
          endTime: new Date(),
          actualDuration: elapsedTime,
          ...data
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to end session')
      }

      const updatedSession = await response.json()
      
      // Add to sessions history
      setSessions(prev => [
        {
          ...updatedSession,
          startTime: new Date(updatedSession.startTime),
          endTime: new Date(updatedSession.endTime)
        },
        ...prev
      ])

      setCurrentSession(null)
      setSessionMetrics(null)
      setElapsedTime(0)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end session')
    }
  }

  // Log AI interaction during session
  const logAIInteraction = useCallback((tool: string, responseTime: number) => {
    if (!currentSession) return

    // Update local state immediately
    setCurrentSession(prev => {
      if (!prev) return null
      
      const updatedTools = prev.aiToolsUsed.includes(tool) 
        ? prev.aiToolsUsed 
        : [...prev.aiToolsUsed, tool]
      
      const newTotalQueries = prev.totalAIQueries + 1
      const newAvgResponseTime = prev.avgResponseTime 
        ? (prev.avgResponseTime * prev.totalAIQueries + responseTime) / newTotalQueries
        : responseTime

      return {
        ...prev,
        aiToolsUsed: updatedTools,
        totalAIQueries: newTotalQueries,
        avgResponseTime: newAvgResponseTime
      }
    })

    // Update on server
    fetch(`/api/dev-sessions/${currentSession.id}/ai-interaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tool, responseTime }),
    }).catch(err => {
      console.error('Failed to log AI interaction:', err)
    })
  }, [currentSession])

  // Update code metrics (lines added/deleted, files modified)
  const updateCodeMetrics = useCallback((linesAdded: number, linesDeleted: number, filesModified: number) => {
    if (!currentSession) return

    setCurrentSession(prev => {
      if (!prev) return null
      return {
        ...prev,
        linesAdded: prev.linesAdded + linesAdded,
        linesDeleted: prev.linesDeleted + linesDeleted,
        filesModified: Math.max(prev.filesModified, filesModified)
      }
    })

    // Update on server
    fetch(`/api/dev-sessions/${currentSession.id}/code-metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ linesAdded, linesDeleted, filesModified }),
    }).catch(err => {
      console.error('Failed to update code metrics:', err)
    })
  }, [currentSession])

  // Add commit to session
  const addCommit = useCallback(() => {
    if (!currentSession) return

    setCurrentSession(prev => {
      if (!prev) return null
      return {
        ...prev,
        commits: prev.commits + 1
      }
    })

    // Update on server
    fetch(`/api/dev-sessions/${currentSession.id}/commit`, {
      method: 'POST',
    }).catch(err => {
      console.error('Failed to log commit:', err)
    })
  }, [currentSession])

  // Fetch session history
  const fetchSessions = async (): Promise<void> => {
    try {
      setLoadingSessions(true)
      setError(null)

      const response = await fetch('/api/dev-sessions')
      
      if (!response.ok) {
        throw new Error('Failed to fetch sessions')
      }

      const sessionsData = await response.json()
      
      const transformedSessions = sessionsData.map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined
      }))

      setSessions(transformedSessions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions')
    } finally {
      setLoadingSessions(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchSessions()
  }, [])

  const clearError = () => setError(null)

  return {
    // Current session management
    currentSession,
    sessionMetrics,
    isSessionActive: currentSession?.status === 'ACTIVE',
    
    // Session operations
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    
    // Real-time tracking
    logAIInteraction,
    updateCodeMetrics,
    addCommit,
    
    // Session history and analytics
    sessions,
    loadingSessions,
    fetchSessions,
    
    // Error handling
    error,
    clearError
  }
} 