'use client'

import React, { useState, useEffect } from 'react'
import { 
  ClockIcon, 
  PlayIcon, 
  PauseIcon,
  StopIcon,
  FireIcon
} from '@heroicons/react/24/outline'
import { useDevSessions } from '@/lib/hooks/useDevSessions'

interface SessionTimerProps {
  className?: string
  showControls?: boolean
  compact?: boolean
}

export function SessionTimer({ className = '', showControls = false, compact = false }: SessionTimerProps) {
  const {
    currentSession,
    sessionMetrics,
    isSessionActive,
    pauseSession,
    resumeSession,
    endSession
  } = useDevSessions()

  const [elapsedTime, setElapsedTime] = useState<string>('00:00')

  // Update elapsed time every second
  useEffect(() => {
    if (!currentSession) return

    const updateTimer = () => {
      const now = new Date()
      const start = new Date(currentSession.startTime)
      const diff = now.getTime() - start.getTime()
      
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      if (hours > 0) {
        setElapsedTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      } else {
        setElapsedTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
      }
    }

    // Update immediately
    updateTimer()

    // Update every second only if session is active
    const interval = currentSession.status === 'ACTIVE' 
      ? setInterval(updateTimer, 1000) 
      : null

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [currentSession])

  if (!currentSession) {
    return null
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className={`w-2 h-2 rounded-full ${
          currentSession.status === 'ACTIVE' 
            ? 'bg-green-500 animate-pulse' 
            : 'bg-yellow-500'
        }`} />
        <span className="text-sm font-mono text-gray-700">{elapsedTime}</span>
        {sessionMetrics?.flowState && (
          <FireIcon className="h-4 w-4 text-orange-500" title="Flow state active" />
        )}
      </div>
    )
  }

  const handleEndSession = async () => {
    await endSession({
      accomplishments: '',
      challenges: '',
      nextSteps: '',
      satisfactionScore: 5,
      flowStateAchieved: sessionMetrics?.flowState || false
    })
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            currentSession.status === 'ACTIVE' 
              ? 'bg-green-100' 
              : 'bg-yellow-100'
          }`}>
            <ClockIcon className={`h-5 w-5 ${
              currentSession.status === 'ACTIVE' 
                ? 'text-green-600' 
                : 'text-yellow-600'
            }`} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">{currentSession.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-lg font-mono text-gray-900">{elapsedTime}</span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                currentSession.status === 'ACTIVE' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {currentSession.status === 'ACTIVE' ? 'Active' : 'Paused'}
              </span>
              {sessionMetrics?.flowState && (
                <div className="flex items-center gap-1">
                  <FireIcon className="h-4 w-4 text-orange-500" />
                  <span className="text-xs text-orange-600">Flow</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {showControls && (
          <div className="flex items-center gap-2">
            {currentSession.status === 'ACTIVE' ? (
              <button
                onClick={pauseSession}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
              >
                <PauseIcon className="h-3 w-3" />
                Pause
              </button>
            ) : (
              <button
                onClick={resumeSession}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
              >
                <PlayIcon className="h-3 w-3" />
                Resume
              </button>
            )}
            <button
              onClick={handleEndSession}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              <StopIcon className="h-3 w-3" />
              End
            </button>
          </div>
        )}
      </div>

      {/* Session metrics (if available) */}
      {sessionMetrics && !compact && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Progress:</span>
              <span className="ml-1 font-medium">{Math.round(sessionMetrics.goalProgress)}%</span>
            </div>
            <div>
              <span className="text-gray-600">AI Queries:</span>
              <span className="ml-1 font-medium">{sessionMetrics.aiInteractionsCount}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 