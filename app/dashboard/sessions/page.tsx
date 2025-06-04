'use client'

import { useState, useEffect } from 'react'
import { useSessionManagement } from '@/lib/hooks/useSessionManagement'
import { sessionTemplateManager } from '@/lib/session-templates'
import { Button } from '@/components/ui/button'

interface SessionTemplate {
  id: string
  name: string
  description: string
  type: string
  estimatedDuration: number
  difficulty: string
  tags: string[]
}

export default function SessionsPage() {
  const {
    sessions,
    currentSession,
    loading,
    error,
    searchCriteria,
    pagination,
    createSession,
    searchSessions,
    startSession,
    pauseSession,
    completeSession,
    deleteSession,
    clearError,
    setCurrentSession
  } = useSessionManagement()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [templates, setTemplates] = useState<SessionTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [sessionName, setSessionName] = useState('')
  const [sessionDescription, setSessionDescription] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [typeFilter, setTypeFilter] = useState<string[]>([])

  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const templateList = await sessionTemplateManager.getTemplates()
        setTemplates(templateList)
      } catch (error) {
        console.error('Failed to load templates:', error)
      }
    }
    loadTemplates()
  }, [])

  // Handle session creation
  const handleCreateSession = async () => {
    if (!sessionName.trim()) return

    const template = templates.find(t => t.id === selectedTemplate)
    
    const newSession = await createSession({
      templateId: selectedTemplate || undefined,
      name: sessionName,
      description: sessionDescription,
      type: template?.type || 'custom',
      estimatedDuration: template?.estimatedDuration || 60
    })

    if (newSession) {
      setShowCreateModal(false)
      setSessionName('')
      setSessionDescription('')
      setSelectedTemplate('')
    }
  }

  // Handle search
  const handleSearch = () => {
    searchSessions({
      query: searchQuery || undefined,
      status: statusFilter.length > 0 ? statusFilter as any : undefined,
      type: typeFilter.length > 0 ? typeFilter : undefined,
      offset: 0
    })
  }

  // Handle session action
  const handleSessionAction = async (sessionId: string, action: string) => {
    try {
      switch (action) {
        case 'start':
          await startSession(sessionId)
          break
        case 'pause':
          await pauseSession(sessionId)
          break
        case 'complete':
          await completeSession(sessionId)
          break
        case 'delete':
          if (confirm('Are you sure you want to delete this session?')) {
            await deleteSession(sessionId)
          }
          break
      }
    } catch (error) {
      console.error(`Failed to ${action} session:`, error)
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'paused': return 'text-yellow-600 bg-yellow-100'
      case 'completed': return 'text-blue-600 bg-blue-100'
      case 'draft': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-blue-600 bg-blue-100'
      case 'low': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Session Management</h1>
          <p className="text-gray-600">Create, track, and manage your development sessions</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button onClick={clearError} className="text-red-500 hover:text-red-700">
                ×
              </button>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              <select
                multiple
                value={statusFilter}
                onChange={(e) => setStatusFilter(Array.from(e.target.selectedOptions, option => option.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>

              <Button onClick={handleSearch} disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {/* Create Session Button */}
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Session
            </Button>
          </div>
        </div>

        {/* Sessions List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Sessions ({pagination.total})
            </h2>
          </div>

          {loading && sessions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No sessions found. Create your first session to get started!
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {sessions.map((session) => (
                <div key={session.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {session.name}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(session.status)}`}>
                          {session.status}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(session.priority)}`}>
                          {session.priority}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        Type: {session.type} • Duration: {session.estimatedDuration}min
                        {session.actualDuration && ` • Actual: ${session.actualDuration}min`}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Progress: {Math.round(session.progress)}%</span>
                        <span>Goals: {Math.round(session.goalCompletionRate * 100)}%</span>
                        <span>Collaborators: {session.collaboratorCount}</span>
                        <span>Updated: {new Date(session.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {session.status === 'draft' && (
                        <Button
                          onClick={() => handleSessionAction(session.id, 'start')}
                          className="bg-green-600 hover:bg-green-700 text-white text-sm"
                        >
                          Start
                        </Button>
                      )}
                      
                      {session.status === 'active' && (
                        <>
                          <Button
                            onClick={() => handleSessionAction(session.id, 'pause')}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm"
                          >
                            Pause
                          </Button>
                          <Button
                            onClick={() => handleSessionAction(session.id, 'complete')}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                          >
                            Complete
                          </Button>
                        </>
                      )}
                      
                      {session.status === 'paused' && (
                        <Button
                          onClick={() => handleSessionAction(session.id, 'start')}
                          className="bg-green-600 hover:bg-green-700 text-white text-sm"
                        >
                          Resume
                        </Button>
                      )}

                      <Button
                        onClick={() => setCurrentSession(session as any)}
                        className="bg-gray-600 hover:bg-gray-700 text-white text-sm"
                      >
                        View
                      </Button>
                      
                      <Button
                        onClick={() => handleSessionAction(session.id, 'delete')}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="p-6 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} sessions
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => searchSessions({ offset: Math.max(0, pagination.offset - pagination.limit) })}
                  disabled={pagination.currentPage === 1}
                  className="text-sm"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => searchSessions({ offset: pagination.offset + pagination.limit })}
                  disabled={!pagination.hasMore}
                  className="text-sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Create Session Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Create New Session</h2>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Template Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template (Optional)
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Custom Session</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} ({template.type}, {template.estimatedDuration}min)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Session Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Name *
                  </label>
                  <input
                    type="text"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="Enter session name..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Session Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={sessionDescription}
                    onChange={(e) => setSessionDescription(e.target.value)}
                    placeholder="Enter session description..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Template Preview */}
                {selectedTemplate && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    {(() => {
                      const template = templates.find(t => t.id === selectedTemplate)
                      return template ? (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">{template.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                          <div className="flex gap-4 text-xs text-gray-500">
                            <span>Type: {template.type}</span>
                            <span>Duration: {template.estimatedDuration}min</span>
                            <span>Difficulty: {template.difficulty}</span>
                          </div>
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">Tags: </span>
                            {template.tags.map((tag, index) => (
                              <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null
                    })()}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <Button
                  onClick={() => setShowCreateModal(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSession}
                  disabled={!sessionName.trim() || loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? 'Creating...' : 'Create Session'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 