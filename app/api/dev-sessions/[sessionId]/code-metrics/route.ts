import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/db'
import { getUserByClerkId } from '@/lib/db/user'

// POST /api/dev-sessions/[sessionId]/code-metrics - Update code metrics
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
    const { linesAdded, linesDeleted, filesModified } = body

    if (typeof linesAdded !== 'number' || typeof linesDeleted !== 'number' || typeof filesModified !== 'number') {
      return NextResponse.json(
        { error: 'Invalid metrics data' }, 
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

    // Update session with code metrics
    const updatedSession = await prisma.session.update({
      where: { id: params.sessionId },
      data: {
        linesAdded: {
          increment: linesAdded
        },
        linesDeleted: {
          increment: linesDeleted
        },
        filesModified: Math.max(session.filesModified, filesModified),
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true,
      totalLinesAdded: updatedSession.linesAdded,
      totalLinesDeleted: updatedSession.linesDeleted,
      totalFilesModified: updatedSession.filesModified
    })
  } catch (error) {
    console.error('Error updating code metrics:', error)
    return NextResponse.json(
      { error: 'Failed to update code metrics' }, 
      { status: 500 }
    )
  }
} 