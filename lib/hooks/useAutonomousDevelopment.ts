'use client'

import { useState, useEffect, useCallback } from 'react'

// Core automation interfaces
export interface AutomationMetrics {
  cycleTime: number
  successRate: number
  communicationLatency: number
  qualityScore: number
  automationLevel: number
  autonomousDecisions: number
}

export interface DevelopmentCycle {
  id: string
  status: 'planning' | 'implementing' | 'testing' | 'optimizing' | 'completed' | 'failed'
  progress: number
  startTime: Date
  estimatedCompletion: Date
  requirements: any
  aiSystems: string[]
  autonomousActions: number
  qualityMetrics: {
    codeQuality: number
    testCoverage: number
    performance: number
    maintainability: number
  }
}

export interface AISystemStatus {
  name: string
  status: 'active' | 'busy' | 'idle' | 'error'
  load: number
  latency: number
  capabilities: string[]
  lastCommunication: Date
}

export interface WorkflowState {
  activeWorkflows: DevelopmentCycle[]
  totalWorkflows: number
  successfulWorkflows: number
  failedWorkflows: number
  averageCompletionTime: number
}

// Main autonomous development hook
export function useAutonomousDevelopment() {
  const [metrics, setMetrics] = useState<AutomationMetrics>({
    cycleTime: 1680000, // 28 minutes
    successRate: 0.93,
    communicationLatency: 387,
    qualityScore: 0.89,
    automationLevel: 0.94,
    autonomousDecisions: 1847
  })

  const [activeCycle, setActiveCycle] = useState<DevelopmentCycle | null>(null)
  const [isAutonomousMode, setIsAutonomousMode] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Start autonomous development cycle
  const startDevelopmentCycle = useCallback(async (requirements: any) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/automation/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'autonomous_development',
          requirements,
          autonomousMode: isAutonomousMode
        })
      })

      if (!response.ok) {
        throw new Error('Failed to start development cycle')
      }

      const data = await response.json()
      
      if (data.success) {
        const newCycle: DevelopmentCycle = {
          id: `cycle_${Date.now()}`,
          status: 'planning',
          progress: 0,
          startTime: new Date(),
          estimatedCompletion: new Date(Date.now() + data.data.cycle.estimatedDuration),
          requirements,
          aiSystems: ['Claude AI', 'Cursor IDE', 'Meta Learning'],
          autonomousActions: 0,
          qualityMetrics: {
            codeQuality: 0,
            testCoverage: 0,
            performance: 0,
            maintainability: 0
          }
        }
        
        setActiveCycle(newCycle)
        return newCycle
      } else {
        throw new Error(data.error || 'Failed to start development cycle')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [isAutonomousMode])

  // Monitor development cycle progress
  const monitorCycleProgress = useCallback(async (cycleId: string) => {
    try {
      const response = await fetch('/api/automation/claude', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('Failed to monitor cycle progress')
      }

      const data = await response.json()
      
      if (data.success && data.data.autonomousDevelopment) {
        // Update metrics from response
        setMetrics(prev => ({
          ...prev,
          cycleTime: data.data.autonomousDevelopment.averageCycleTime || prev.cycleTime,
          successRate: data.data.autonomousDevelopment.successRate || prev.successRate,
          communicationLatency: data.data.systemWideMetrics.averageAICommunicationLatency || prev.communicationLatency,
          autonomousDecisions: data.data.systemWideMetrics.autonomousDecisions || prev.autonomousDecisions
        }))

        // Update active cycle if exists
        if (activeCycle) {
          setActiveCycle(prev => prev ? {
            ...prev,
            progress: Math.min(100, prev.progress + Math.random() * 10),
            autonomousActions: prev.autonomousActions + (Math.random() > 0.7 ? 1 : 0),
            status: prev.progress >= 90 ? 'completed' : 
                   prev.progress >= 70 ? 'optimizing' :
                   prev.progress >= 40 ? 'testing' :
                   prev.progress >= 20 ? 'implementing' : 'planning'
          } : null)
        }
      }
    } catch (err) {
      console.error('Failed to monitor cycle progress:', err)
    }
  }, [activeCycle])

  // Pause/resume autonomous development
  const toggleAutonomousMode = useCallback(async () => {
    setLoading(true)
    try {
      const newMode = !isAutonomousMode
      setIsAutonomousMode(newMode)
      
      // If disabling autonomous mode and there's an active cycle, pause it
      if (!newMode && activeCycle) {
        setActiveCycle(prev => prev ? { ...prev, status: 'planning' } : null)
      }
      
      return newMode
    } catch (err) {
      setError('Failed to toggle autonomous mode')
      throw err
    } finally {
      setLoading(false)
    }
  }, [isAutonomousMode, activeCycle])

  // Emergency stop all automation
  const emergencyStop = useCallback(async () => {
    setLoading(true)
    try {
      await fetch('/api/automation/claude', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'manual_override',
          overrideParameters: { type: 'emergency_stop' }
        })
      })

      setIsAutonomousMode(false)
      setActiveCycle(null)
      setError(null)
    } catch (err) {
      setError('Failed to execute emergency stop')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Real-time metrics updates
  useEffect(() => {
    if (!isAutonomousMode) return

    const interval = setInterval(() => {
      monitorCycleProgress('current')
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [isAutonomousMode, monitorCycleProgress])

  return {
    // State
    metrics,
    activeCycle,
    isAutonomousMode,
    loading,
    error,
    
    // Actions
    startDevelopmentCycle,
    monitorCycleProgress,
    toggleAutonomousMode,
    emergencyStop,
    
    // Utilities
    isActive: !!activeCycle && activeCycle.status !== 'completed' && activeCycle.status !== 'failed',
    cycleProgress: activeCycle?.progress || 0,
    estimatedTimeRemaining: activeCycle ? 
      Math.max(0, activeCycle.estimatedCompletion.getTime() - Date.now()) : 0
  }
}

// AI Systems monitoring hook
export function useAISystemsStatus() {
  const [systems, setSystems] = useState<AISystemStatus[]>([
    {
      name: 'Claude AI',
      status: 'active',
      load: 0.65,
      latency: 245,
      capabilities: ['planning', 'code_generation', 'optimization', 'reasoning'],
      lastCommunication: new Date()
    },
    {
      name: 'Cursor IDE',
      status: 'active',
      load: 0.58,
      latency: 189,
      capabilities: ['file_operations', 'terminal_commands', 'environment_control'],
      lastCommunication: new Date(Date.now() - 120000)
    },
    {
      name: 'Meta Learning',
      status: 'busy',
      load: 0.82,
      latency: 156,
      capabilities: ['algorithm_optimization', 'performance_analysis'],
      lastCommunication: new Date(Date.now() - 30000)
    }
  ])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch AI systems status
  const fetchSystemsStatus = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/automation/claude?includeInsights=true')
      
      if (!response.ok) {
        throw new Error('Failed to fetch systems status')
      }

      const data = await response.json()
      
      if (data.success && data.data.aiSystemStatus) {
        const statusData = data.data.aiSystemStatus
        setSystems(prev => prev.map(system => ({
          ...system,
          status: statusData[system.name.toLowerCase().replace(' ', '')]?.status || system.status,
          load: statusData[system.name.toLowerCase().replace(' ', '')]?.load || system.load
        })))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch systems status')
    } finally {
      setLoading(false)
    }
  }, [])

  // Real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      setSystems(prev => prev.map(system => ({
        ...system,
        load: Math.min(1, Math.max(0, system.load + (Math.random() - 0.5) * 0.1)),
        latency: Math.max(50, system.latency + (Math.random() - 0.5) * 50),
        status: system.load > 0.9 ? 'busy' : system.load < 0.3 ? 'idle' : 'active',
        lastCommunication: Math.random() > 0.8 ? new Date() : system.lastCommunication
      })))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return {
    systems,
    loading,
    error,
    fetchSystemsStatus,
    activeSystems: systems.filter(s => s.status === 'active').length,
    averageLoad: systems.reduce((sum, s) => sum + s.load, 0) / systems.length,
    averageLatency: systems.reduce((sum, s) => sum + s.latency, 0) / systems.length
  }
}

// Workflow management hook
export function useWorkflowOrchestration() {
  const [workflows, setWorkflows] = useState<DevelopmentCycle[]>([])
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    activeWorkflows: [],
    totalWorkflows: 0,
    successfulWorkflows: 0,
    failedWorkflows: 0,
    averageCompletionTime: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create new workflow
  const createWorkflow = useCallback(async (requirements: any, aiSystems: string[]) => {
    setLoading(true)
    try {
      const newWorkflow: DevelopmentCycle = {
        id: `workflow_${Date.now()}`,
        status: 'planning',
        progress: 0,
        startTime: new Date(),
        estimatedCompletion: new Date(Date.now() + 1800000), // 30 minutes
        requirements,
        aiSystems,
        autonomousActions: 0,
        qualityMetrics: {
          codeQuality: 0,
          testCoverage: 0,
          performance: 0,
          maintainability: 0
        }
      }

      setWorkflows(prev => [...prev, newWorkflow])
      setWorkflowState(prev => ({
        ...prev,
        activeWorkflows: [...prev.activeWorkflows, newWorkflow],
        totalWorkflows: prev.totalWorkflows + 1
      }))

      return newWorkflow
    } catch (err) {
      setError('Failed to create workflow')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Update workflow status
  const updateWorkflowStatus = useCallback((workflowId: string, status: DevelopmentCycle['status']) => {
    setWorkflows(prev => prev.map(workflow => 
      workflow.id === workflowId ? { ...workflow, status } : workflow
    ))

    setWorkflowState(prev => {
      const updatedWorkflows = prev.activeWorkflows.map(workflow => 
        workflow.id === workflowId ? { ...workflow, status } : workflow
      )
      
      return {
        ...prev,
        activeWorkflows: updatedWorkflows.filter(w => w.status !== 'completed' && w.status !== 'failed'),
        successfulWorkflows: status === 'completed' ? prev.successfulWorkflows + 1 : prev.successfulWorkflows,
        failedWorkflows: status === 'failed' ? prev.failedWorkflows + 1 : prev.failedWorkflows
      }
    })
  }, [])

  // Real-time workflow updates
  useEffect(() => {
    const interval = setInterval(() => {
      setWorkflows(prev => prev.map(workflow => {
        if (workflow.status === 'planning' || workflow.status === 'implementing' || 
            workflow.status === 'testing' || workflow.status === 'optimizing') {
          const newProgress = Math.min(100, workflow.progress + Math.random() * 5)
          const newStatus = newProgress >= 95 ? 'completed' :
                           newProgress >= 75 ? 'optimizing' :
                           newProgress >= 50 ? 'testing' :
                           newProgress >= 25 ? 'implementing' : 'planning'
          
          return {
            ...workflow,
            progress: newProgress,
            status: newStatus,
            autonomousActions: workflow.autonomousActions + (Math.random() > 0.7 ? 1 : 0)
          }
        }
        return workflow
      }))
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return {
    workflows,
    workflowState,
    loading,
    error,
    createWorkflow,
    updateWorkflowStatus,
    activeWorkflowCount: workflowState.activeWorkflows.length,
    totalAutonomousActions: workflows.reduce((sum, w) => sum + w.autonomousActions, 0)
  }
}

// Communication monitoring hook
export function useCommunicationMonitoring() {
  const [communications, setCommunications] = useState<any[]>([])
  const [communicationMetrics, setCommunicationMetrics] = useState({
    totalMessages: 0,
    successRate: 0.95,
    averageLatency: 245,
    activeConnections: 5
  })
  const [loading, setLoading] = useState(false)

  // Send communication between AI systems
  const sendCommunication = useCallback(async (from: string, to: string, type: string, content: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/automation/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'communication',
          requirements: { message: content },
          communicationType: type,
          targetSystem: to
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send communication')
      }

      const data = await response.json()
      
      if (data.success) {
        const newCommunication = {
          id: `comm_${Date.now()}`,
          from,
          to,
          type,
          content,
          timestamp: new Date(),
          latency: data.data.latency,
          success: data.data.success
        }

        setCommunications(prev => [newCommunication, ...prev.slice(0, 9)]) // Keep last 10
        setCommunicationMetrics(prev => ({
          ...prev,
          totalMessages: prev.totalMessages + 1,
          averageLatency: (prev.averageLatency + data.data.latency) / 2
        }))

        return newCommunication
      }
    } catch (err) {
      console.error('Failed to send communication:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch communication log
  const fetchCommunicationLog = useCallback(async () => {
    try {
      const response = await fetch('/api/automation/claude?includeCommunicationLog=true')
      
      if (!response.ok) return

      const data = await response.json()
      
      if (data.success && data.data.communicationLog) {
        setCommunications(data.data.communicationLog)
      }
    } catch (err) {
      console.error('Failed to fetch communication log:', err)
    }
  }, [])

  // Real-time communication updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate incoming communications
      if (Math.random() > 0.7) {
        const systems = ['Claude AI', 'Cursor IDE', 'Meta Learning', 'Pattern Recognition']
        const types = ['status_update', 'coordination', 'optimization']
        
        const newComm = {
          id: `comm_${Date.now()}`,
          from: systems[Math.floor(Math.random() * systems.length)],
          to: systems[Math.floor(Math.random() * systems.length)],
          type: types[Math.floor(Math.random() * types.length)],
          content: 'Automated system communication',
          timestamp: new Date(),
          latency: Math.random() * 300 + 100,
          success: Math.random() > 0.1
        }

        setCommunications(prev => [newComm, ...prev.slice(0, 9)])
        setCommunicationMetrics(prev => ({
          ...prev,
          totalMessages: prev.totalMessages + 1
        }))
      }
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  return {
    communications,
    communicationMetrics,
    loading,
    sendCommunication,
    fetchCommunicationLog,
    recentCommunications: communications.slice(0, 5),
    communicationHealth: communicationMetrics.successRate > 0.9 ? 'excellent' : 
                        communicationMetrics.successRate > 0.8 ? 'good' : 'needs_attention'
  }
}

// Utilities for automation analytics
export const AutomationUtils = {
  formatTime: (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  },

  formatPercentage: (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  },

  calculateAutomationEfficiency: (metrics: AutomationMetrics) => {
    return (metrics.successRate * 0.4 + 
            metrics.automationLevel * 0.3 + 
            (1 - Math.min(1, metrics.cycleTime / 1800000)) * 0.3)
  },

  getSystemHealthStatus: (systems: AISystemStatus[]) => {
    const activeCount = systems.filter(s => s.status === 'active').length
    const averageLoad = systems.reduce((sum, s) => sum + s.load, 0) / systems.length
    
    if (activeCount === systems.length && averageLoad < 0.8) return 'excellent'
    if (activeCount >= systems.length * 0.8 && averageLoad < 0.9) return 'good'
    return 'needs_attention'
  },

  predictCycleCompletion: (cycle: DevelopmentCycle) => {
    if (!cycle || cycle.progress === 0) return null
    
    const elapsed = Date.now() - cycle.startTime.getTime()
    const estimated = (elapsed / cycle.progress) * 100
    return new Date(cycle.startTime.getTime() + estimated)
  }
} 