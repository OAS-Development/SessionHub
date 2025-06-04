import { useState, useEffect } from 'react'
import { CursorAIExecutor, TestResult } from '@/lib/ai/CursorAIExecutor'
import { AITestType } from '@/lib/types/database'

interface AITestSession {
  id: string
  name: string
  projectId: string
  startTime: Date
  endTime?: Date
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED'
  sessionGoals?: string
  accomplishments?: string
  challenges?: string
  aiTests: AITest[]
  project: {
    name: string
  }
}

interface AITest {
  id: string
  name: string
  testType: AITestType
  category?: string
  success?: boolean
  rating?: number
  responseTime?: number
  cost?: number
  createdAt: Date
  aiTool: {
    name: string
    category: string
  }
}

interface AITool {
  id: string
  name: string
  category: string
  description?: string
  isActive: boolean
}

interface TestPrompt {
  id: string
  title: string
  content: string
  category: string
  difficulty: string
}

interface UseAITestingReturn {
  // Session management
  currentSession: AITestSession | null
  sessions: AITestSession[]
  loadingSessions: boolean
  startSession: (projectId: string, sessionName?: string, goals?: string) => Promise<AITestSession | null>
  endSession: (accomplishments?: string, challenges?: string) => Promise<void>
  
  // Test execution
  executor: CursorAIExecutor | null
  testResults: TestResult[]
  runningTest: boolean
  executeTest: (testData: {
    name: string
    prompt: string
    testType: AITestType
    category?: string
    expectedResult?: string
    aiToolId: string
  }) => Promise<TestResult | null>
  
  // Data fetching
  aiTools: AITool[]
  testPrompts: TestPrompt[]
  loadingData: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useAITesting(): UseAITestingReturn {
  const [currentSession, setCurrentSession] = useState<AITestSession | null>(null)
  const [sessions, setSessions] = useState<AITestSession[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  
  const [executor, setExecutor] = useState<CursorAIExecutor | null>(null)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [runningTest, setRunningTest] = useState(false)
  
  const [aiTools, setAITools] = useState<AITool[]>([])
  const [testPrompts, setTestPrompts] = useState<TestPrompt[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize executor
  useEffect(() => {
    const newExecutor = new CursorAIExecutor()
    setExecutor(newExecutor)
  }, [])

  // Fetch initial data
  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      setLoadingData(true)
      setError(null)

      const [toolsResponse, promptsResponse, sessionsResponse] = await Promise.all([
        fetch('/api/ai-testing/tools'),
        fetch('/api/ai-testing/prompts'),
        fetch('/api/ai-testing/sessions')
      ])

      if (toolsResponse.ok) {
        const tools = await toolsResponse.json()
        setAITools(tools)
      }

      if (promptsResponse.ok) {
        const prompts = await promptsResponse.json()
        setTestPrompts(prompts)
      }

      if (sessionsResponse.ok) {
        const sessions = await sessionsResponse.json()
        setSessions(sessions.map((session: any) => ({
          ...session,
          startTime: new Date(session.startTime),
          endTime: session.endTime ? new Date(session.endTime) : undefined
        })))
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch AI testing data'
      setError(errorMessage)
      console.error('Error fetching AI testing data:', err)
    } finally {
      setLoadingData(false)
    }
  }

  const startSession = async (
    projectId: string, 
    sessionName?: string, 
    goals?: string
  ): Promise<AITestSession | null> => {
    if (!executor) {
      setError('AI testing executor not initialized')
      return null
    }

    try {
      setLoadingSessions(true)
      setError(null)

      // Start session via executor
      const session = await executor.startTestSession(
        projectId, 
        'current-user-id', // This would come from auth context
        sessionName
      )

      // Transform to match our interface
      const newSession: AITestSession = {
        id: session.id,
        name: session.name,
        projectId: session.projectId,
        startTime: session.startTime,
        status: session.status,
        sessionGoals: goals,
        aiTests: [],
        project: {
          name: 'Current Project' // This would be fetched from the project
        }
      }

      setCurrentSession(newSession)
      setSessions(prev => [newSession, ...prev])
      setTestResults([])

      return newSession
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start AI testing session'
      setError(errorMessage)
      console.error('Error starting AI testing session:', err)
      return null
    } finally {
      setLoadingSessions(false)
    }
  }

  const endSession = async (accomplishments?: string, challenges?: string): Promise<void> => {
    if (!executor || !currentSession) {
      setError('No active session to end')
      return
    }

    try {
      setLoadingSessions(true)
      setError(null)

      await executor.endTestSession(accomplishments, challenges)

      // Update current session
      const updatedSession = {
        ...currentSession,
        status: 'COMPLETED' as const,
        endTime: new Date(),
        accomplishments,
        challenges
      }

      setCurrentSession(null)
      setSessions(prev => 
        prev.map(session => 
          session.id === currentSession.id ? updatedSession : session
        )
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end AI testing session'
      setError(errorMessage)
      console.error('Error ending AI testing session:', err)
    } finally {
      setLoadingSessions(false)
    }
  }

  const executeTest = async (testData: {
    name: string
    prompt: string
    testType: AITestType
    category?: string
    expectedResult?: string
    aiToolId: string
  }): Promise<TestResult | null> => {
    if (!executor || !currentSession) {
      setError('No active session for testing')
      return null
    }

    try {
      setRunningTest(true)
      setError(null)

      const result = await executor.executeTest(testData)
      
      setTestResults(prev => [result, ...prev])
      
      // Update current session with new test
      if (currentSession) {
        const newTest: AITest = {
          id: result.testId,
          name: testData.name,
          testType: testData.testType,
          category: testData.category,
          success: result.success,
          rating: result.rating,
          responseTime: result.responseTime,
          cost: result.cost,
          createdAt: result.timestamp,
          aiTool: {
            name: result.aiTool,
            category: 'CODE_COMPLETION' // This would be fetched from the actual tool
          }
        }

        setCurrentSession(prev => prev ? {
          ...prev,
          aiTests: [newTest, ...prev.aiTests]
        } : null)
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute AI test'
      setError(errorMessage)
      console.error('Error executing AI test:', err)
      return null
    } finally {
      setRunningTest(false)
    }
  }

  const refetch = async () => {
    await fetchInitialData()
  }

  return {
    // Session management
    currentSession,
    sessions,
    loadingSessions,
    startSession,
    endSession,
    
    // Test execution
    executor,
    testResults,
    runningTest,
    executeTest,
    
    // Data fetching
    aiTools,
    testPrompts,
    loadingData,
    error,
    refetch
  }
} 