'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Session, SessionSummary, CreateSessionRequest, UpdateSessionRequest, SessionSearchCriteria } from '@/lib/session-management'

interface SessionManagementState {
  sessions: SessionSummary[]
  currentSession: Session | null
  loading: boolean
  error: string | null
  searchCriteria: SessionSearchCriteria
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
    totalPages: number
    currentPage: number
  }
}

interface SessionManagementActions {
  // Session CRUD operations
  createSession: (request: CreateSessionRequest) => Promise<Session | null>
  getSession: (sessionId: string) => Promise<Session | null>
  updateSession: (sessionId: string, updates: UpdateSessionRequest) => Promise<Session | null>
  deleteSession: (sessionId: string) => Promise<boolean>
  
  // Session lifecycle actions
  startSession: (sessionId: string) => Promise<Session | null>
  pauseSession: (sessionId: string) => Promise<Session | null>
  completeSession: (sessionId: string) => Promise<Session | null>
  
  // Search and filtering
  searchSessions: (criteria?: Partial<SessionSearchCriteria>) => Promise<void>
  clearSearch: () => void
  
  // Real-time updates
  startRealTimeUpdates: () => void
  stopRealTimeUpdates: () => void
  
  // State management
  setCurrentSession: (session: Session | null) => void
  clearError: () => void
  refreshSessions: () => Promise<void>
}

export function useSessionManagement(): SessionManagementState & SessionManagementActions {
  const [state, setState] = useState<SessionManagementState>({
    sessions: [],
    currentSession: null,
    loading: false,
    error: null,
    searchCriteria: {
      sortBy: 'updated',
      sortOrder: 'desc',
      limit: 20,
      offset: 0
    },
    pagination: {
      total: 0,
      limit: 20,
      offset: 0,
      hasMore: false,
      totalPages: 0,
      currentPage: 1
    }
  })

  const realTimeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Create session
  const createSession = useCallback(async (request: CreateSessionRequest): Promise<Session | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: abortControllerRef.current?.signal
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create session')
      }

      if (data.success) {
        const newSession = data.data.session
        
        // Add to sessions list
        setState(prev => ({
          ...prev,
          sessions: [newSession, ...prev.sessions],
          currentSession: newSession,
          loading: false,
          pagination: {
            ...prev.pagination,
            total: prev.pagination.total + 1
          }
        }))

        return newSession
      }

      return null
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }))
      }
      return null
    }
  }, [])

  // Get session by ID
  const getSession = useCallback(async (sessionId: string): Promise<Session | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        signal: abortControllerRef.current?.signal
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get session')
      }

      if (data.success) {
        const session = data.data.session
        setState(prev => ({
          ...prev,
          currentSession: session,
          loading: false
        }))
        return session
      }

      return null
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }))
      }
      return null
    }
  }, [])

  // Update session
  const updateSession = useCallback(async (sessionId: string, updates: UpdateSessionRequest): Promise<Session | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
        signal: abortControllerRef.current?.signal
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update session')
      }

      if (data.success) {
        const updatedSession = data.data.session
        
        // Update in sessions list
        setState(prev => ({
          ...prev,
          sessions: prev.sessions.map(s => 
            s.id === sessionId ? { ...s, ...updatedSession } : s
          ),
          currentSession: prev.currentSession?.id === sessionId 
            ? { ...prev.currentSession, ...updatedSession }
            : prev.currentSession,
          loading: false
        }))

        return updatedSession
      }

      return null
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }))
      }
      return null
    }
  }, [])

  // Delete session
  const deleteSession = useCallback(async (sessionId: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
        signal: abortControllerRef.current?.signal
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete session')
      }

      if (data.success) {
        // Remove from sessions list
        setState(prev => ({
          ...prev,
          sessions: prev.sessions.filter(s => s.id !== sessionId),
          currentSession: prev.currentSession?.id === sessionId ? null : prev.currentSession,
          loading: false,
          pagination: {
            ...prev.pagination,
            total: Math.max(0, prev.pagination.total - 1)
          }
        }))

        return true
      }

      return false
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }))
      }
      return false
    }
  }, [])

  // Session lifecycle actions
  const performSessionAction = useCallback(async (sessionId: string, action: string): Promise<Session | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
        signal: abortControllerRef.current?.signal
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} session`)
      }

      if (data.success) {
        const updatedSession = data.data.session
        
        // Update session status in state
        setState(prev => ({
          ...prev,
          sessions: prev.sessions.map(s => 
            s.id === sessionId ? { ...s, status: updatedSession.status } : s
          ),
          currentSession: prev.currentSession?.id === sessionId 
            ? { ...prev.currentSession, ...updatedSession }
            : prev.currentSession,
          loading: false
        }))

        return updatedSession
      }

      return null
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }))
      }
      return null
    }
  }, [])

  const startSession = useCallback((sessionId: string) => performSessionAction(sessionId, 'start'), [performSessionAction])
  const pauseSession = useCallback((sessionId: string) => performSessionAction(sessionId, 'pause'), [performSessionAction])
  const completeSession = useCallback((sessionId: string) => performSessionAction(sessionId, 'complete'), [performSessionAction])

  // Search sessions
  const searchSessions = useCallback(async (criteria?: Partial<SessionSearchCriteria>): Promise<void> => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    const searchCriteria = {
      ...state.searchCriteria,
      ...criteria
    }

    try {
      const params = new URLSearchParams()
      
      if (searchCriteria.query) params.append('query', searchCriteria.query)
      if (searchCriteria.status?.length) params.append('status', searchCriteria.status.join(','))
      if (searchCriteria.type?.length) params.append('type', searchCriteria.type.join(','))
      if (searchCriteria.priority?.length) params.append('priority', searchCriteria.priority.join(','))
      if (searchCriteria.tags?.length) params.append('tags', searchCriteria.tags.join(','))
      if (searchCriteria.sortBy) params.append('sortBy', searchCriteria.sortBy)
      if (searchCriteria.sortOrder) params.append('sortOrder', searchCriteria.sortOrder)
      if (searchCriteria.limit) params.append('limit', searchCriteria.limit.toString())
      if (searchCriteria.offset) params.append('offset', searchCriteria.offset.toString())
      
      if (searchCriteria.dateRange) {
        params.append('startDate', searchCriteria.dateRange.start.toISOString())
        params.append('endDate', searchCriteria.dateRange.end.toISOString())
      }

      const response = await fetch(`/api/sessions?${params.toString()}`, {
        signal: abortControllerRef.current?.signal
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search sessions')
      }

      if (data.success) {
        setState(prev => ({
          ...prev,
          sessions: data.data.sessions,
          searchCriteria,
          pagination: data.data.pagination,
          loading: false
        }))
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }))
      }
    }
  }, [state.searchCriteria])

  // Clear search
  const clearSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      searchCriteria: {
        sortBy: 'updated',
        sortOrder: 'desc',
        limit: 20,
        offset: 0
      }
    }))
  }, [])

  // Refresh sessions
  const refreshSessions = useCallback(async () => {
    await searchSessions()
  }, [searchSessions])

  // Real-time updates
  const startRealTimeUpdates = useCallback(() => {
    if (realTimeIntervalRef.current) return

    realTimeIntervalRef.current = setInterval(() => {
      // Refresh current session if active
      if (state.currentSession && state.currentSession.status === 'active') {
        getSession(state.currentSession.id)
      }
      
      // Refresh sessions list periodically
      refreshSessions()
    }, 10000) // Update every 10 seconds
  }, [state.currentSession, getSession, refreshSessions])

  const stopRealTimeUpdates = useCallback(() => {
    if (realTimeIntervalRef.current) {
      clearInterval(realTimeIntervalRef.current)
      realTimeIntervalRef.current = null
    }
  }, [])

  // Set current session
  const setCurrentSession = useCallback((session: Session | null) => {
    setState(prev => ({ ...prev, currentSession: session }))
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // Initialize and cleanup
  useEffect(() => {
    abortControllerRef.current = new AbortController()
    
    // Load initial sessions
    searchSessions()

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      stopRealTimeUpdates()
    }
  }, [])

  // Auto-start real-time updates when there's an active session
  useEffect(() => {
    if (state.currentSession && state.currentSession.status === 'active') {
      startRealTimeUpdates()
    } else {
      stopRealTimeUpdates()
    }
  }, [state.currentSession?.status, startRealTimeUpdates, stopRealTimeUpdates])

  return {
    ...state,
    createSession,
    getSession,
    updateSession,
    deleteSession,
    startSession,
    pauseSession,
    completeSession,
    searchSessions,
    clearSearch,
    startRealTimeUpdates,
    stopRealTimeUpdates,
    setCurrentSession,
    clearError,
    refreshSessions
  }
} 