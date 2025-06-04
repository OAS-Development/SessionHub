'use client'

import React, { useState, useEffect } from 'react'
import { 
  ClockIcon, 
  PlayIcon, 
  PauseIcon,
  StopIcon,
  PlusIcon,
  ChartBarIcon,
  CodeBracketIcon,
  BoltIcon,
  BeakerIcon,
  FireIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrophyIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { useProjects } from '@/lib/hooks/useProjects'
import { useDevSessions } from '@/lib/hooks/useDevSessions'

export default function DevSessionsPage() {
  const { projects } = useProjects()
  const {
    currentSession,
    sessionMetrics,
    isSessionActive,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    sessions,
    loadingSessions,
    error,
    clearError
  } = useDevSessions()

  const [showStartModal, setShowStartModal] = useState(false)
  const [showEndModal, setShowEndModal] = useState(false)
  
  const [sessionForm, setSessionForm] = useState({
    projectId: '',
    name: '',
    description: '',
    goals: '',
    plannedDuration: 60
  })

  const [endForm, setEndForm] = useState({
    accomplishments: '',
    challenges: '',
    nextSteps: '',
    satisfactionScore: 5,
    flowStateAchieved: false
  })

  // Auto-dismiss errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  const formatDuration = (minutes: number) => {
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

  const getProductivityColor = (indicator: 'low' | 'medium' | 'high') => {
    switch (indicator) {
      case 'high': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!sessionForm.projectId || !sessionForm.name) {
      return
    }

    const session = await startSession(sessionForm)

    if (session) {
      setShowStartModal(false)
      setSessionForm({
        projectId: '',
        name: '',
        description: '',
        goals: '',
        plannedDuration: 60
      })
    }
  }

  const handleEndSession = async (e: React.FormEvent) => {
    e.preventDefault()
    
    await endSession(endForm)
    setShowEndModal(false)
    setEndForm({
      accomplishments: '',
      challenges: '',
      nextSteps: '',
      satisfactionScore: 5,
      flowStateAchieved: false
    })
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-900">Error Loading Sessions</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <button 
                onClick={clearError}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Dismiss
              </button>
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
          <h1 className="text-2xl font-bold text-gray-900">Development Sessions</h1>
          <p className="text-gray-600">Track your development sessions with goals, metrics, and insights</p>
        </div>
        <div className="flex gap-3">
          {currentSession ? (
            <div className="flex gap-2">
              {currentSession.status === 'ACTIVE' ? (
                <button
                  onClick={pauseSession}
                  className="inline-flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
                >
                  <PauseIcon className="h-5 w-5" />
                  Pause Session
                </button>
              ) : (
                <button
                  onClick={resumeSession}
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  <PlayIcon className="h-5 w-5" />
                  Resume Session
                </button>
              )}
              <button
                onClick={() => setShowEndModal(true)}
                className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                <StopIcon className="h-5 w-5" />
                End Session
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowStartModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlayIcon className="h-5 w-5" />
              Start New Session
            </button>
          )}
        </div>
      </div>

      {/* Active Session Panel */}
      {currentSession && sessionMetrics && (
        <div className={`border-l-4 rounded-lg p-6 ${
          currentSession.status === 'ACTIVE' 
            ? 'bg-green-50 border-green-400' 
            : 'bg-yellow-50 border-yellow-400'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{currentSession.name}</h3>
              <p className="text-gray-600">
                Project: {currentSession.project.name} • Started {formatRelativeTime(currentSession.startTime)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                currentSession.status === 'ACTIVE' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {currentSession.status === 'ACTIVE' ? 'Active' : 'Paused'}
              </span>
            </div>
          </div>

          {/* Real-time Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-lg font-semibold">{formatDuration(sessionMetrics.currentDuration)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Goal Progress</p>
                  <p className="text-lg font-semibold">{Math.round(sessionMetrics.goalProgress)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <BeakerIcon className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">AI Queries</p>
                  <p className="text-lg font-semibold">{sessionMetrics.aiInteractionsCount}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <BoltIcon className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Productivity</p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getProductivityColor(sessionMetrics.productivityIndicator)}`}>
                    {sessionMetrics.productivityIndicator.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <FireIcon className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Flow State</p>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${sessionMetrics.flowState ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm">{sessionMetrics.flowState ? 'In Flow' : 'Not Active'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Session Goals */}
          {currentSession.sessionGoals && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
              <h4 className="font-medium text-gray-900 mb-2">Session Goals</h4>
              <p className="text-gray-700">{currentSession.sessionGoals}</p>
            </div>
          )}
        </div>
      )}

      {/* Session Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClockIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-3xl font-bold text-gray-900">
                {loadingSessions ? '...' : sessions.length}
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
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-gray-900">
                {loadingSessions ? '...' : sessions.filter(s => s.status === 'COMPLETED').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Time</p>
              <p className="text-3xl font-bold text-gray-900">
                {loadingSessions ? '...' : formatDuration(
                  sessions
                    .filter(s => s.actualDuration)
                    .reduce((sum, s) => sum + (s.actualDuration || 0), 0)
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrophyIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Score</p>
              <p className="text-3xl font-bold text-gray-900">
                {loadingSessions ? '...' : sessions.filter(s => s.productivityScore).length > 0 
                  ? Math.round(sessions.filter(s => s.productivityScore).reduce((sum, s) => sum + (s.productivityScore || 0), 0) / sessions.filter(s => s.productivityScore).length)
                  : '0'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Sessions</h3>
        </div>
        <div className="p-6">
          {sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.slice(0, 10).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">{session.name}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        session.status === 'COMPLETED' 
                          ? 'bg-green-100 text-green-800'
                          : session.status === 'ACTIVE'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Project: {session.project.name}</span>
                      <span>Duration: {session.actualDuration ? formatDuration(session.actualDuration) : formatDuration(session.plannedDuration)}</span>
                      <span>AI Queries: {session.totalAIQueries}</span>
                      {session.productivityScore && (
                        <span>Score: {session.productivityScore}/100</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {session.satisfactionScore && (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon 
                            key={i} 
                            className={`h-4 w-4 ${
                              i < session.satisfactionScore! 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h4 className="mt-4 text-sm font-medium text-gray-900">No sessions yet</h4>
              <p className="mt-2 text-sm text-gray-500">
                Start your first development session to begin tracking your productivity.
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
              <h3 className="text-lg font-semibold text-gray-900">Start Development Session</h3>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  value={sessionForm.name}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Feature development session"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  value={sessionForm.description}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of what you'll work on"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What do you want to accomplish in this session?"
                />
              </div>

              <div>
                <label htmlFor="plannedDuration" className="block text-sm font-medium text-gray-700 mb-1">
                  Planned Duration (minutes)
                </label>
                <select
                  id="plannedDuration"
                  value={sessionForm.plannedDuration}
                  onChange={(e) => setSessionForm(prev => ({ ...prev, plannedDuration: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                  <option value={180}>3 hours</option>
                  <option value={240}>4 hours</option>
                </select>
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
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Start Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* End Session Modal */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">End Development Session</h3>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Features completed, bugs fixed, progress made..."
                />
              </div>

              <div>
                <label htmlFor="challenges" className="block text-sm font-medium text-gray-700 mb-1">
                  Any challenges or blockers?
                </label>
                <textarea
                  id="challenges"
                  value={endForm.challenges}
                  onChange={(e) => setEndForm(prev => ({ ...prev, challenges: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Problems encountered, areas for improvement..."
                />
              </div>

              <div>
                <label htmlFor="nextSteps" className="block text-sm font-medium text-gray-700 mb-1">
                  Next steps
                </label>
                <textarea
                  id="nextSteps"
                  value={endForm.nextSteps}
                  onChange={(e) => setEndForm(prev => ({ ...prev, nextSteps: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What to work on next..."
                />
              </div>

              <div>
                <label htmlFor="satisfactionScore" className="block text-sm font-medium text-gray-700 mb-1">
                  Session satisfaction (1-5 stars)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setEndForm(prev => ({ ...prev, satisfactionScore: rating }))}
                      className={`p-1 ${endForm.satisfactionScore >= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      <StarIcon className="h-6 w-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="flowState"
                  checked={endForm.flowStateAchieved}
                  onChange={(e) => setEndForm(prev => ({ ...prev, flowStateAchieved: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="flowState" className="ml-2 block text-sm text-gray-700">
                  I achieved flow state during this session
                </label>
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
                >
                  End Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 