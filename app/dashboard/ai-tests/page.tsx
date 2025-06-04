'use client'

import React, { useState } from 'react'
import { 
  BeakerIcon, 
  PlayIcon, 
  StopIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CodeBracketIcon,
  BugAntIcon,
  DocumentTextIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import { useProjects } from '@/lib/hooks/useProjects'
import { useAITesting } from '@/lib/hooks/useAITesting'

const testTypeIcons = {
  CODE_GENERATION: CodeBracketIcon,
  CODE_COMPLETION: CodeBracketIcon,
  DEBUGGING: BugAntIcon,
  REFACTORING: CogIcon,
  EXPLANATION: DocumentTextIcon,
  DOCUMENTATION: DocumentTextIcon,
  TESTING: BeakerIcon,
  OPTIMIZATION: ChartBarIcon,
  ARCHITECTURE: CogIcon,
  REVIEW: DocumentTextIcon
}

const testTypeColors = {
  CODE_GENERATION: 'bg-blue-100 text-blue-800',
  CODE_COMPLETION: 'bg-green-100 text-green-800',
  DEBUGGING: 'bg-red-100 text-red-800',
  REFACTORING: 'bg-purple-100 text-purple-800',
  EXPLANATION: 'bg-yellow-100 text-yellow-800',
  DOCUMENTATION: 'bg-indigo-100 text-indigo-800',
  TESTING: 'bg-pink-100 text-pink-800',
  OPTIMIZATION: 'bg-orange-100 text-orange-800',
  ARCHITECTURE: 'bg-gray-100 text-gray-800',
  REVIEW: 'bg-cyan-100 text-cyan-800'
}

export default function AITestsPage() {
  const { projects } = useProjects()
  const {
    currentSession,
    sessions,
    loadingSessions,
    startSession,
    endSession,
    testResults,
    runningTest,
    executeTest,
    aiTools,
    testPrompts,
    loadingData,
    error
  } = useAITesting()

  const [showStartModal, setShowStartModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [showEndModal, setShowEndModal] = useState(false)
  
  const [sessionForm, setSessionForm] = useState({
    projectId: '',
    sessionName: '',
    goals: ''
  })
  
  const [testForm, setTestForm] = useState({
    name: '',
    prompt: '',
    testType: 'CODE_GENERATION' as any,
    category: '',
    expectedResult: '',
    aiToolId: ''
  })

  const [endForm, setEndForm] = useState({
    accomplishments: '',
    challenges: '',
    nextSteps: ''
  })

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatRelativeTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (hours > 0) {
      return `${hours} hour${hours === 1 ? '' : 's'} ago`
    } else if (minutes > 0) {
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
    } else {
      return 'Just now'
    }
  }

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!sessionForm.projectId || !sessionForm.sessionName) {
      return
    }

    const session = await startSession(
      sessionForm.projectId,
      sessionForm.sessionName,
      sessionForm.goals
    )

    if (session) {
      setShowStartModal(false)
      setSessionForm({ projectId: '', sessionName: '', goals: '' })
    }
  }

  const handleExecuteTest = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!testForm.name || !testForm.prompt || !testForm.aiToolId) {
      return
    }

    const result = await executeTest(testForm)

    if (result) {
      setShowTestModal(false)
      setTestForm({
        name: '',
        prompt: '',
        testType: 'CODE_GENERATION',
        category: '',
        expectedResult: '',
        aiToolId: ''
      })
    }
  }

  const handleEndSession = async (e: React.FormEvent) => {
    e.preventDefault()
    
    await endSession(endForm.accomplishments, endForm.challenges)
    setShowEndModal(false)
    setEndForm({ accomplishments: '', challenges: '', nextSteps: '' })
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">Error Loading AI Testing</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Testing</h1>
          <p className="text-gray-600">Test AI tools, track performance, and capture learnings</p>
        </div>
        <div className="flex gap-3">
          {currentSession ? (
            <>
              <button
                onClick={() => setShowTestModal(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                disabled={runningTest}
              >
                <BeakerIcon className="h-5 w-5" />
                {runningTest ? 'Running Test...' : 'Run Test'}
              </button>
              <button
                onClick={() => setShowEndModal(true)}
                className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                disabled={loadingSessions}
              >
                <StopIcon className="h-5 w-5" />
                End Session
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowStartModal(true)}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              disabled={loadingSessions}
            >
              <PlayIcon className="h-5 w-5" />
              Start AI Testing Session
            </button>
          )}
        </div>
      </div>

      {/* Current Session Status */}
      {currentSession && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <PlayIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-900">{currentSession.name}</h3>
                <p className="text-green-700">
                  Project: {currentSession.project.name} • Started {formatRelativeTime(currentSession.startTime)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-green-600">
              <span>Tests: {currentSession.aiTests.length}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BeakerIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tests</p>
              <p className="text-3xl font-bold text-gray-900">
                {loadingData ? '...' : testResults.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-3xl font-bold text-gray-900">
                {loadingData ? '...' : testResults.length > 0 
                  ? Math.round((testResults.filter(t => t.success).length / testResults.length) * 100) + '%'
                  : '0%'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ClockIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Response</p>
              <p className="text-3xl font-bold text-gray-900">
                {loadingData ? '...' : testResults.length > 0 
                  ? Math.round(testResults.reduce((sum, t) => sum + t.responseTime, 0) / testResults.length) + 'ms'
                  : '0ms'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ChartBarIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sessions</p>
              <p className="text-3xl font-bold text-gray-900">
                {loadingData ? '...' : sessions.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Test Results */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Test Results</h3>
        </div>
        <div className="p-6">
          {testResults.length > 0 ? (
            <div className="space-y-4">
              {testResults.slice(0, 10).map((result) => {
                const IconComponent = testTypeIcons[result.testType] || BeakerIcon
                return (
                  <div key={result.testId} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <IconComponent className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{result.prompt.slice(0, 60)}...</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${testTypeColors[result.testType]}`}>
                          {result.testType.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>AI Tool: {result.aiTool}</span>
                        <span>Response: {result.responseTime}ms</span>
                        <span>Rating: {result.rating}/5</span>
                        <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                          {result.success ? 'Success' : 'Failed'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {result.success ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircleIcon className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <BeakerIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h4 className="mt-4 text-sm font-medium text-gray-900">No test results yet</h4>
              <p className="mt-2 text-sm text-gray-500">
                Start an AI testing session to begin running tests and tracking results.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Start Session Modal */}
      {showStartModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Start AI Testing Session</h3>
            </div>
            <form onSubmit={handleStartSession} className="p-6 space-y-4">
              <div>
                <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
                  Project *
                </label>
                <select
                  id="projectId"
                  value={sessionForm.projectId}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, projectId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="sessionName" className="block text-sm font-medium text-gray-700 mb-1">
                  Session Name *
                </label>
                <input
                  type="text"
                  id="sessionName"
                  value={sessionForm.sessionName}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, sessionName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="AI Testing Session"
                  required
                />
              </div>

              <div>
                <label htmlFor="goals" className="block text-sm font-medium text-gray-700 mb-1">
                  Session Goals
                </label>
                <textarea
                  id="goals"
                  value={sessionForm.goals}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, goals: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="What do you want to test and learn?"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStartModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  disabled={loadingSessions}
                >
                  {loadingSessions ? 'Starting...' : 'Start Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Execute Test Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Execute AI Test</h3>
            </div>
            <form onSubmit={handleExecuteTest} className="p-6 space-y-4">
              <div>
                <label htmlFor="testName" className="block text-sm font-medium text-gray-700 mb-1">
                  Test Name *
                </label>
                <input
                  type="text"
                  id="testName"
                  value={testForm.name}
                  onChange={(e) => setTestForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Test name"
                  required
                />
              </div>

              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
                  Test Prompt *
                </label>
                <textarea
                  id="prompt"
                  value={testForm.prompt}
                  onChange={(e) => setTestForm(prev => ({ ...prev, prompt: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your test prompt here..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="testType" className="block text-sm font-medium text-gray-700 mb-1">
                    Test Type *
                  </label>
                  <select
                    id="testType"
                    value={testForm.testType}
                    onChange={(e) => setTestForm(prev => ({ ...prev, testType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="CODE_GENERATION">Code Generation</option>
                    <option value="CODE_COMPLETION">Code Completion</option>
                    <option value="DEBUGGING">Debugging</option>
                    <option value="REFACTORING">Refactoring</option>
                    <option value="EXPLANATION">Explanation</option>
                    <option value="DOCUMENTATION">Documentation</option>
                    <option value="TESTING">Testing</option>
                    <option value="OPTIMIZATION">Optimization</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="aiTool" className="block text-sm font-medium text-gray-700 mb-1">
                    AI Tool *
                  </label>
                  <select
                    id="aiTool"
                    value={testForm.aiToolId}
                    onChange={(e) => setTestForm(prev => ({ ...prev, aiToolId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select AI tool</option>
                    {aiTools.map((tool) => (
                      <option key={tool.id} value={tool.id}>
                        {tool.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  value={testForm.category}
                  onChange={(e) => setTestForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., React Components, API Integration"
                />
              </div>

              <div>
                <label htmlFor="expectedResult" className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Result
                </label>
                <textarea
                  id="expectedResult"
                  value={testForm.expectedResult}
                  onChange={(e) => setTestForm(prev => ({ ...prev, expectedResult: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="What do you expect the AI to produce?"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                  disabled={runningTest}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  disabled={runningTest}
                >
                  {runningTest ? 'Running...' : 'Execute Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* End Session Modal */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">End Testing Session</h3>
            </div>
            <form onSubmit={handleEndSession} className="p-6 space-y-4">
              <div>
                <label htmlFor="accomplishments" className="block text-sm font-medium text-gray-700 mb-1">
                  What did you accomplish?
                </label>
                <textarea
                  id="accomplishments"
                  value={endForm.accomplishments}
                  onChange={(e) => setEndForm(prev => ({ ...prev, accomplishments: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Tests completed, insights gained..."
                />
              </div>

              <div>
                <label htmlFor="challenges" className="block text-sm font-medium text-gray-700 mb-1">
                  Any challenges or issues?
                </label>
                <textarea
                  id="challenges"
                  value={endForm.challenges}
                  onChange={(e) => setEndForm(prev => ({ ...prev, challenges: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Problems encountered, areas for improvement..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEndModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  disabled={loadingSessions}
                >
                  {loadingSessions ? 'Ending...' : 'End Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 