import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/db'
import { getUserByClerkId } from '@/lib/db/user'

// PATCH /api/ai-testing/sessions/[sessionId] - Update session
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
    const { status, endTime, accomplishments, challenges, nextSteps } = body

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
    let actualDuration = existingSession.actualDuration
    if (status === 'COMPLETED' && endTime) {
      const start = new Date(existingSession.startTime)
      const end = new Date(endTime)
      actualDuration = Math.round((end.getTime() - start.getTime()) / (1000 * 60)) // minutes
    }

    // Update session
    const updatedSession = await prisma.session.update({
      where: { id: params.sessionId },
      data: {
        status,
        endTime: endTime ? new Date(endTime) : undefined,
        actualDuration,
        accomplishments,
        challenges,
        nextSteps,
        updatedAt: new Date()
      }
    })

    // Update project's last session time
    if (status === 'COMPLETED') {
      await prisma.project.update({
        where: { id: existingSession.projectId },
        data: {
          lastSessionAt: new Date(),
          totalSessionTime: {
            increment: actualDuration || 0
          }
        }
      })

      // Update user's total development time
      await prisma.user.update({
        where: { id: user.id },
        data: {
          totalDevelopmentTime: {
            increment: actualDuration || 0
          },
          lastActiveAt: new Date()
        }
      })
    }

    return NextResponse.json(updatedSession)
  } catch (error) {
    console.error('Error updating AI testing session:', error)
    return NextResponse.json(
      { error: 'Failed to update AI testing session' }, 
      { status: 500 }
    )
  }
}

// GET /api/ai-testing/sessions/[sessionId] - Get session details
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
            description: true
          }
        },
        aiTests: {
          orderBy: { createdAt: 'desc' },
          include: {
            aiTool: {
              select: {
                name: true,
                category: true
              }
            }
          }
        },
        learnings: {
          orderBy: { createdAt: 'desc' }
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
    console.error('Error fetching AI testing session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI testing session' }, 
      { status: 500 }
    )
  }
} 