import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/db'
import { getUserByClerkId } from '@/lib/db/user'

// POST /api/dev-sessions/[sessionId]/ai-interaction - Log AI interaction
export async function POST(
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
    const { tool, responseTime } = body

    if (!tool || typeof responseTime !== 'number') {
      return NextResponse.json(
        { error: 'Tool name and response time are required' }, 
        { status: 400 }
      )
    }

    // Verify session exists and belongs to user
    const session = await prisma.session.findFirst({
      where: { 
        id: params.sessionId,
        userId: user.id,
        status: 'ACTIVE'
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Active session not found or access denied' }, 
        { status: 404 }
      )
    }

    // Update session with AI interaction
    const currentTools = session.aiToolsUsed || []
    const updatedTools = currentTools.includes(tool) ? currentTools : [...currentTools, tool]
    
    const newTotalQueries = session.totalAIQueries + 1
    const newAvgResponseTime = session.avgResponseTime 
      ? (session.avgResponseTime * session.totalAIQueries + responseTime) / newTotalQueries
      : responseTime

    await prisma.session.update({
      where: { id: params.sessionId },
      data: {
        aiToolsUsed: updatedTools,
        totalAIQueries: newTotalQueries,
        avgResponseTime: newAvgResponseTime,
        updatedAt: new Date()
      }
    })

    // Update user's AI interaction count
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalAIInteractions: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      totalQueries: newTotalQueries,
      avgResponseTime: newAvgResponseTime 
    })
  } catch (error) {
    console.error('Error logging AI interaction:', error)
    return NextResponse.json(
      { error: 'Failed to log AI interaction' }, 
      { status: 500 }
    )
  }
} 