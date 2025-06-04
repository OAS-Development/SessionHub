import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/db'
import { getUserByClerkId } from '@/lib/db/user'

// POST /api/dev-sessions - Create new development session
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
    const { 
      projectId, 
      name, 
      description, 
      goals, 
      plannedDuration 
    } = body

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

    // Check if user has an active session
    const activeSession = await prisma.session.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE'
      }
    })

    if (activeSession) {
      return NextResponse.json(
        { error: 'You already have an active session. Please end it before starting a new one.' }, 
        { status: 409 }
      )
    }

    // Create new session
    const session = await prisma.session.create({
      data: {
        name,
        description,
        startTime: new Date(),
        plannedDuration: plannedDuration || 60,
        status: 'ACTIVE',
        sessionGoals: goals,
        linesAdded: 0,
        linesDeleted: 0,
        filesModified: 0,
        commits: 0,
        aiToolsUsed: [],
        totalAIQueries: 0,
        flowStateAchieved: false,
        projectId,
        userId: user.id
      },
      include: {
        project: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    console.error('Error creating development session:', error)
    return NextResponse.json(
      { error: 'Failed to create development session' }, 
      { status: 500 }
    )
  }
}

// GET /api/dev-sessions - Get user's development sessions
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
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    const whereClause: any = { userId: user.id }
    if (projectId) whereClause.projectId = projectId
    if (status) whereClause.status = status

    const sessions = await prisma.session.findMany({
      where: whereClause,
      orderBy: { startTime: 'desc' },
      take: limit,
      include: {
        project: {
          select: {
            name: true,
            language: true,
            framework: true
          }
        }
      }
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Error fetching development sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch development sessions' }, 
      { status: 500 }
    )
  }
} 