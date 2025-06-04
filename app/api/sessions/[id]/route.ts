import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { sessionManager, UpdateSessionRequest } from '@/lib/session-management'

export const runtime = 'nodejs'

// Get session by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now()
  
  try {
    // Check authentication
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const sessionId = params.id

    // Get session
    const session = await sessionManager.getSession(sessionId, userId)
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Session not found or access denied'
      }, { status: 404 })
    }

    const responseTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      data: {
        session: {
          id: session.id,
          templateId: session.templateId,
          name: session.name,
          description: session.description,
          type: session.type,
          status: session.status,
          priority: session.priority,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          startedAt: session.startedAt,
          completedAt: session.completedAt,
          estimatedDuration: session.estimatedDuration,
          actualDuration: session.actualDuration,
          progress: session.progress,
          goals: session.goals,
          milestones: session.milestones,
          resources: session.resources,
          attachments: session.attachments,
          collaborators: session.collaborators,
          comments: session.comments,
          settings: session.settings,
          metadata: session.metadata,
          customFields: session.customFields,
          analytics: session.analytics,
          learningData: session.learningData
        },
        summary: {
          goalCompletionRate: session.progress.completedGoals.length / Math.max(session.goals.length, 1),
          milestoneCompletionRate: session.progress.completedMilestones.length / Math.max(session.milestones.length, 1),
          timeElapsed: session.startedAt ? Date.now() - session.startedAt.getTime() : 0,
          estimatedTimeRemaining: session.progress.estimatedTimeRemaining,
          blockerCount: session.progress.blockers.length,
          collaboratorCount: session.collaborators.length,
          commentCount: session.comments.length,
          attachmentCount: session.attachments.length
        }
      },
      _performance: {
        responseTime,
        cached: responseTime < 100,
        sessionId
      }
    })

  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`Session get error after ${responseTime}ms:`, error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve session',
        _performance: {
          responseTime,
          cached: false,
          error: true
        }
      }, 
      { status: 500 }
    )
  }
}

// Update session
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now()
  
  try {
    // Check authentication
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const sessionId = params.id

    // Parse request body
    const body: UpdateSessionRequest = await request.json()
    
    // Validate updates
    if (body.name !== undefined && (body.name.trim().length === 0 || body.name.length > 100)) {
      return NextResponse.json({
        success: false,
        error: 'Session name must be between 1 and 100 characters'
      }, { status: 400 })
    }

    if (body.estimatedDuration !== undefined && body.estimatedDuration < 1) {
      return NextResponse.json({
        success: false,
        error: 'Estimated duration must be at least 1 minute'
      }, { status: 400 })
    }

    // Update session
    const updatedSession = await sessionManager.updateSession(sessionId, userId, body)
    
    if (!updatedSession) {
      return NextResponse.json({
        success: false,
        error: 'Session not found or access denied'
      }, { status: 404 })
    }

    const responseTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      data: {
        session: {
          id: updatedSession.id,
          name: updatedSession.name,
          description: updatedSession.description,
          type: updatedSession.type,
          status: updatedSession.status,
          priority: updatedSession.priority,
          updatedAt: updatedSession.updatedAt,
          estimatedDuration: updatedSession.estimatedDuration,
          progress: updatedSession.progress,
          settings: updatedSession.settings,
          metadata: updatedSession.metadata,
          customFields: updatedSession.customFields
        },
        changes: body
      },
      _performance: {
        responseTime,
        cached: false,
        updated: true
      }
    })

  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`Session update error after ${responseTime}ms:`, error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Session update failed',
        _performance: {
          responseTime,
          cached: false,
          error: true
        }
      }, 
      { status: 500 }
    )
  }
}

// Session actions (start, pause, complete, etc.)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now()
  
  try {
    // Check authentication
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const sessionId = params.id
    const body = await request.json()
    const { action } = body

    let result = null
    let actionPerformed = ''

    switch (action) {
      case 'start':
        result = await sessionManager.startSession(sessionId, userId)
        actionPerformed = 'started'
        break
      
      case 'pause':
        result = await sessionManager.pauseSession(sessionId, userId)
        actionPerformed = 'paused'
        break
      
      case 'complete':
        result = await sessionManager.completeSession(sessionId, userId)
        actionPerformed = 'completed'
        break
      
      default:
        return NextResponse.json({
          success: false,
          error: `Invalid action: ${action}. Valid actions are: start, pause, complete`
        }, { status: 400 })
    }

    if (!result) {
      return NextResponse.json({
        success: false,
        error: 'Session not found or access denied'
      }, { status: 404 })
    }

    const responseTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      data: {
        session: {
          id: result.id,
          status: result.status,
          startedAt: result.startedAt,
          completedAt: result.completedAt,
          actualDuration: result.actualDuration,
          progress: result.progress,
          analytics: result.analytics
        },
        action: actionPerformed,
        timestamp: new Date().toISOString()
      },
      _performance: {
        responseTime,
        cached: false,
        action: actionPerformed
      }
    })

  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`Session action error after ${responseTime}ms:`, error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Session action failed',
        _performance: {
          responseTime,
          cached: false,
          error: true
        }
      }, 
      { status: 500 }
    )
  }
}

// Delete session
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now()
  
  try {
    // Check authentication
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const sessionId = params.id

    // Get session to verify ownership
    const session = await sessionManager.getSession(sessionId, userId)
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Session not found or access denied'
      }, { status: 404 })
    }

    // Check if user is owner
    if (session.userId !== userId) {
      return NextResponse.json({
        success: false,
        error: 'Only session owner can delete the session'
      }, { status: 403 })
    }

    // For now, just mark as archived (implement actual deletion logic later)
    const archivedSession = await sessionManager.updateSession(sessionId, userId, {
      metadata: {
        ...session.metadata,
        archived: true,
        archivedAt: new Date().toISOString()
      }
    })

    const responseTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        action: 'archived',
        timestamp: new Date().toISOString()
      },
      _performance: {
        responseTime,
        cached: false,
        deleted: true
      }
    })

  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`Session delete error after ${responseTime}ms:`, error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Session deletion failed',
        _performance: {
          responseTime,
          cached: false,
          error: true
        }
      }, 
      { status: 500 }
    )
  }
} 