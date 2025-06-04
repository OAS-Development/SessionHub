import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/db'
import { getUserByClerkId } from '@/lib/db/user'

// POST /api/dev-sessions/[sessionId]/commit - Log commit
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

    // Increment commit count
    const updatedSession = await prisma.session.update({
      where: { id: params.sessionId },
      data: {
        commits: {
          increment: 1
        },
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true,
      totalCommits: updatedSession.commits
    })
  } catch (error) {
    console.error('Error logging commit:', error)
    return NextResponse.json(
      { error: 'Failed to log commit' }, 
      { status: 500 }
    )
  }
} 