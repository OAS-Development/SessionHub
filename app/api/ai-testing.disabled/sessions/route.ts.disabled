import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/db'
import { getUserByClerkId } from '@/lib/db/user'

// POST /api/ai-testing/sessions - Create new AI testing session
export async function POST(request: NextRequest) {
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
    const { projectId, name, goals } = body

    if (!projectId || !name) {
      return NextResponse.json(
        { error: 'Project ID and session name are required' }, 
        { status: 400 }
      )
    }

    // Verify project exists and belongs to user
    const project = await prisma.project.findFirst({
      where: { 
        id: projectId,
        userId: user.id 
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or access denied' }, 
        { status: 404 }
      )
    }

    // Create new session
    const session = await prisma.session.create({
      data: {
        name,
        description: 'AI Testing Session',
        startTime: new Date(),
        plannedDuration: 60, // Default 60 minutes
        status: 'ACTIVE',
        sessionGoals: goals,
        aiToolsUsed: [],
        projectId,
        userId: user.id
      }
    })

    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    console.error('Error creating AI testing session:', error)
    return NextResponse.json(
      { error: 'Failed to create AI testing session' }, 
      { status: 500 }
    )
  }
}

// GET /api/ai-testing/sessions - Get user's AI testing sessions
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = auth()
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserByClerkId(clerkUserId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    const whereClause: any = { userId: user.id }
    if (projectId) {
      whereClause.projectId = projectId
    }

    const sessions = await prisma.session.findMany({
      where: whereClause,
      orderBy: { startTime: 'desc' },
      include: {
        project: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            aiTests: true
          }
        }
      }
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Error fetching AI testing sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI testing sessions' }, 
      { status: 500 }
    )
  }
} 