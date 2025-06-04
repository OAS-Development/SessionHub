import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/db'
import { getUserByClerkId } from '@/lib/db/user'

// PATCH /api/dev-sessions/[sessionId] - Update session
export async function PATCH(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { userId: clerkUserId } = auth()
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserByClerkId(clerkUserId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { 
      status, 
      endTime, 
      actualDuration,
      accomplishments, 
      challenges, 
      nextSteps,
      satisfactionScore,
      flowStateAchieved,
      productivityScore
    } = body

    // Verify session exists and belongs to user
    const existingSession = await prisma.session.findFirst({
      where: { 
        id: params.sessionId,
        userId: user.id 
      }
    })

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Session not found or access denied' }, 
        { status: 404 }
      )
    }

    // Calculate actual duration if ending session
    let calculatedDuration = actualDuration
    if (status === 'COMPLETED' && endTime && !actualDuration) {
      const start = new Date(existingSession.startTime)
      const end = new Date(endTime)
      calculatedDuration = Math.round((end.getTime() - start.getTime()) / (1000 * 60)) // minutes
    }

    // Calculate productivity score based on metrics
    let calculatedProductivityScore = productivityScore
    if (status === 'COMPLETED' && !productivityScore) {
      const metrics = {
        duration: calculatedDuration || 0,
        aiQueries: existingSession.totalAIQueries,
        commits: existingSession.commits,
        linesAdded: existingSession.linesAdded,
        filesModified: existingSession.filesModified
      }
      
      // Simple productivity scoring algorithm
      const durationScore = Math.min(metrics.duration / 60, 1) * 25 // Max 25 points for 1+ hours
      const aiScore = Math.min(metrics.aiQueries / 10, 1) * 25 // Max 25 points for 10+ AI queries
      const codeScore = Math.min((metrics.linesAdded + metrics.commits * 10) / 100, 1) * 25 // Max 25 points
      const fileScore = Math.min(metrics.filesModified / 5, 1) * 25 // Max 25 points for 5+ files
      
      calculatedProductivityScore = Math.round(durationScore + aiScore + codeScore + fileScore)
    }

    // Update session
    const updatedSession = await prisma.session.update({
      where: { id: params.sessionId },
      data: {
        status,
        endTime: endTime ? new Date(endTime) : undefined,
        actualDuration: calculatedDuration,
        accomplishments,
        challenges,
        nextSteps,
        satisfactionScore,
        flowStateAchieved,
        productivityScore: calculatedProductivityScore,
        updatedAt: new Date()
      },
      include: {
        project: {
          select: {
            name: true
          }
        }
      }
    })

    // Update project statistics if session is completed
    if (status === 'COMPLETED') {
      await prisma.project.update({
        where: { id: existingSession.projectId },
        data: {
          lastSessionAt: new Date(),
          totalSessionTime: {
            increment: calculatedDuration || 0
          },
          avgSessionDuration: {
            // This would need a more complex calculation in a real app
            // For now, we'll let the database handle averages
          }
        }
      })

      // Update user's total development time
      await prisma.user.update({
        where: { id: user.id },
        data: {
          totalDevelopmentTime: {
            increment: calculatedDuration || 0
          },
          lastActiveAt: new Date()
        }
      })
    }

    return NextResponse.json(updatedSession)
  } catch (error) {
    console.error('Error updating development session:', error)
    return NextResponse.json(
      { error: 'Failed to update development session' }, 
      { status: 500 }
    )
  }
}

// GET /api/dev-sessions/[sessionId] - Get session details
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { userId: clerkUserId } = auth()
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserByClerkId(clerkUserId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const session = await prisma.session.findFirst({
      where: { 
        id: params.sessionId,
        userId: user.id 
      },
      include: {
        project: {
          select: {
            name: true,
            description: true,
            language: true,
            framework: true
          }
        }
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or access denied' }, 
        { status: 404 }
      )
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error('Error fetching development session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch development session' }, 
      { status: 500 }
    )
  }
} 