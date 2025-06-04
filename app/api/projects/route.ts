import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/db'
import { getUserByClerkId } from '@/lib/db/user'
import { ProjectStatus } from '@/lib/types/database'

// GET /api/projects - Fetch user's projects
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

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: {
            sessions: true
          }
        }
      }
    })

    // Transform projects to match frontend interface
    const projectsWithStats = projects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      language: project.language,
      framework: project.framework,
      techStack: project.techStack,
      status: project.status as ProjectStatus,
      createdAt: project.createdAt,
      lastSessionAt: project.lastSessionAt,
      totalSessions: project._count.sessions,
      totalSessionTime: project.totalSessionTime,
      totalAIInteractions: project.totalAIInteractions,
      avgSessionDuration: project.avgSessionDuration,
      totalLinesAdded: project.totalLinesAdded,
      totalLinesDeleted: project.totalLinesDeleted,
      totalCommits: project.totalCommits
    }))

    return NextResponse.json(projectsWithStats)
  } catch (error) {
    console.error('Projects fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' }, 
      { status: 500 }
    )
  }
}

// POST /api/projects - Create new project
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
      name, 
      description, 
      language, 
      framework, 
      techStack, 
      repositoryUrl,
      targetGoal 
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' }, 
        { status: 400 }
      )
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name,
        description,
        language,
        framework,
        techStack: techStack || [],
        repositoryUrl,
        targetGoal,
        status: 'ACTIVE',
        userId: user.id
      }
    })

    // Update user project count
    await prisma.user.update({
      where: { id: user.id },
      data: {
        updatedAt: new Date(),
        lastActiveAt: new Date()
      }
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Project creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create project' }, 
      { status: 500 }
    )
  }
} 