import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { sessionManager, CreateSessionRequest, SessionSearchCriteria, SessionStatusType, SessionPriorityType } from '@/lib/session-management'

export const runtime = 'nodejs'

// Create new session
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body: CreateSessionRequest = await request.json()
    
    // Validate required fields
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Session name is required'
      }, { status: 400 })
    }

    if (body.name.length > 100) {
      return NextResponse.json({
        success: false,
        error: 'Session name must be 100 characters or less'
      }, { status: 400 })
    }

    if (body.estimatedDuration && body.estimatedDuration < 1) {
      return NextResponse.json({
        success: false,
        error: 'Estimated duration must be at least 1 minute'
      }, { status: 400 })
    }

    // Create session
    const session = await sessionManager.createSession(userId, body)
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create session'
      }, { status: 500 })
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
          estimatedDuration: session.estimatedDuration,
          progress: session.progress,
          goals: session.goals,
          milestones: session.milestones,
          settings: session.settings,
          metadata: session.metadata
        },
        summary: {
          goalCount: session.goals.length,
          milestoneCount: session.milestones.length,
          estimatedDuration: session.estimatedDuration,
          templateName: session.metadata.category || 'Custom'
        }
      },
      _performance: {
        responseTime,
        cached: false,
        created: true
      }
    })

  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`Session creation error after ${responseTime}ms:`, error)
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Session creation failed',
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

// Get sessions with search and filtering
export async function GET(request: NextRequest) {
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

    // Parse search parameters
    const { searchParams } = new URL(request.url)
    
    const criteria: SessionSearchCriteria = {
      query: searchParams.get('query') || undefined,
      status: searchParams.get('status') ? [searchParams.get('status') as SessionStatusType] : undefined,
      type: searchParams.get('type') ? [searchParams.get('type')!] : undefined,
      priority: searchParams.get('priority') ? [searchParams.get('priority') as SessionPriorityType] : undefined,
      tags: searchParams.get('tags') ? searchParams.get('tags')!.split(',') : undefined,
      dateRange: searchParams.get('startDate') && searchParams.get('endDate') ? {
        start: new Date(searchParams.get('startDate')!),
        end: new Date(searchParams.get('endDate')!)
      } : undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'updated',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0')
    }

    // Validate pagination parameters
    if (criteria.limit! < 1 || criteria.limit! > 100) {
      criteria.limit = 20
    }
    
    if (criteria.offset! < 0) {
      criteria.offset = 0
    }

    // Search sessions
    const result = await sessionManager.searchSessions(userId, criteria)
    
    const responseTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      data: {
        sessions: result.sessions.map(session => ({
          id: session.id,
          name: session.name,
          type: session.type,
          status: session.status,
          priority: session.priority,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          estimatedDuration: session.estimatedDuration,
          actualDuration: session.actualDuration,
          progress: {
            percentage: session.progress,
            goalCompletionRate: session.goalCompletionRate
          },
          collaborators: session.collaboratorCount,
          summary: {
            goalCompletionRate: session.goalCompletionRate,
            collaboratorCount: session.collaboratorCount
          }
        })),
        pagination: {
          total: result.total,
          limit: criteria.limit!,
          offset: criteria.offset!,
          hasMore: result.hasMore,
          totalPages: Math.ceil(result.total / criteria.limit!),
          currentPage: Math.floor(criteria.offset! / criteria.limit!) + 1
        },
        filters: {
          applied: Object.keys(criteria).filter(key => 
            criteria[key as keyof SessionSearchCriteria] !== undefined && 
            key !== 'limit' && 
            key !== 'offset' && 
            key !== 'sortBy' && 
            key !== 'sortOrder'
          ).length,
          available: {
            statuses: ['draft', 'active', 'paused', 'completed', 'archived'],
            types: ['bug-fix', 'feature', 'research', 'maintenance', 'custom'],
            priorities: ['low', 'medium', 'high', 'critical']
          }
        }
      },
      _performance: {
        responseTime,
        cached: responseTime < 100,
        resultCount: result.sessions.length,
        totalResults: result.total
      }
    })

  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`Session search error after ${responseTime}ms:`, error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to search sessions',
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