import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/db'
import { getUserByClerkId } from '@/lib/db/user'

// POST /api/ai-testing/results - Store AI test result
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
      testType,
      category,
      context,
      expectedResult,
      actualResult,
      success,
      rating,
      confidence,
      responseTime,
      tokensUsed,
      cost,
      notes,
      improvements,
      environment,
      browserUsed,
      osUsed,
      sessionId,
      aiToolId,
      promptId
    } = body

    // Verify session exists and belongs to user
    const session = await prisma.session.findFirst({
      where: { 
        id: sessionId,
        userId: user.id 
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found or access denied' }, 
        { status: 404 }
      )
    }

    // Verify AI tool exists
    const aiTool = await prisma.aiTool.findUnique({
      where: { id: aiToolId }
    })

    if (!aiTool) {
      return NextResponse.json(
        { error: 'AI tool not found' }, 
        { status: 404 }
      )
    }

    // Create AI test record
    const aiTest = await prisma.aiTest.create({
      data: {
        name,
        testType,
        category,
        context,
        expectedResult,
        actualResult,
        success,
        rating,
        confidence,
        responseTime,
        tokensUsed,
        cost,
        notes,
        improvements,
        environment,
        browserUsed,
        osUsed,
        userId: user.id,
        sessionId,
        aiToolId,
        promptId
      }
    })

    // Update session AI tools used
    const currentAITools = session.aiToolsUsed || []
    if (!currentAITools.includes(aiTool.name)) {
      await prisma.session.update({
        where: { id: sessionId },
        data: {
          aiToolsUsed: [...currentAITools, aiTool.name],
          totalAIQueries: {
            increment: 1
          }
        }
      })
    }

    // Update user's total AI interactions
    await prisma.user.update({
      where: { id: user.id },
      data: {
        totalAIInteractions: {
          increment: 1
        }
      }
    })

    // Update AI tool statistics
    await prisma.aiTool.update({
      where: { id: aiToolId },
      data: {
        totalTests: {
          increment: 1
        }
      }
    })

    return NextResponse.json(aiTest, { status: 201 })
  } catch (error) {
    console.error('Error storing AI test result:', error)
    return NextResponse.json(
      { error: 'Failed to store AI test result' }, 
      { status: 500 }
    )
  }
}

// GET /api/ai-testing/results - Get AI test results
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
    const sessionId = searchParams.get('sessionId')
    const testType = searchParams.get('testType')
    const aiToolId = searchParams.get('aiToolId')
    const limit = parseInt(searchParams.get('limit') || '50')

    const whereClause: any = { userId: user.id }
    
    if (sessionId) whereClause.sessionId = sessionId
    if (testType) whereClause.testType = testType
    if (aiToolId) whereClause.aiToolId = aiToolId

    const aiTests = await prisma.aiTest.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        session: {
          select: {
            name: true,
            project: {
              select: {
                name: true
              }
            }
          }
        },
        aiTool: {
          select: {
            name: true,
            category: true
          }
        },
        prompt: {
          select: {
            title: true,
            category: true
          }
        }
      }
    })

    return NextResponse.json(aiTests)
  } catch (error) {
    console.error('Error fetching AI test results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch AI test results' }, 
      { status: 500 }
    )
  }
} 