import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { intelligentSessionGenerator, GenerationRequest } from '@/lib/intelligent-generator'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      sessionType = 'development',
      targetDuration,
      difficulty = 'intermediate',
      objectives = [],
      context = {},
      preferences = {},
      constraints = {},
      optimizationLevel = 'comprehensive' // 'quick' | 'standard' | 'comprehensive'
    } = body

    // Validate request parameters
    if (!Array.isArray(objectives) || objectives.length === 0) {
      return NextResponse.json({ 
        error: 'At least one objective is required' 
      }, { status: 400 })
    }

    if (targetDuration && (targetDuration < 15 || targetDuration > 480)) {
      return NextResponse.json({ 
        error: 'Target duration must be between 15 and 480 minutes' 
      }, { status: 400 })
    }

    // Enhance context with current information
    const enhancedContext = {
      timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening',
      dayOfWeek: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()],
      availableTime: targetDuration || 120,
      energyLevel: 0.8, // Default high energy
      focusLevel: 0.7, // Default good focus
      collaborators: 0,
      environment: 'normal',
      tools: ['computer', 'internet', 'documentation'],
      previousSessions: [],
      ...context
    }

    // Set default preferences
    const defaultPreferences = {
      preferredDuration: targetDuration || 90,
      learningStyle: 'mixed',
      breakFrequency: 30, // minutes
      difficultyPreference: difficulty,
      collaborationPreference: 'solo',
      feedbackFrequency: 'periodic',
      ...preferences
    }

    // Set default constraints
    const defaultConstraints = {
      maxDuration: targetDuration ? targetDuration * 1.2 : 180,
      minDuration: targetDuration ? targetDuration * 0.8 : 45,
      requiredResources: [],
      excludedActivities: [],
      timeBudget: 1000,
      resourceBudget: 1000,
      ...constraints
    }

    // Create generation request
    const generationRequest: GenerationRequest = {
      userId,
      sessionType,
      targetDuration,
      difficulty,
      objectives,
      context: enhancedContext,
      preferences: defaultPreferences,
      constraints: defaultConstraints
    }

    // Generate intelligent session
    console.log(`Starting AI session generation for user ${userId}`)
    const generatedSession = await intelligentSessionGenerator.generateSession(generationRequest)

    const processingTime = Date.now() - startTime

    // Performance validation
    if (processingTime > 10000) { // 10 second target
      console.warn(`Session generation took ${processingTime}ms, exceeding 10s target`)
    }

    if (generatedSession.predictions.successProbability < 0.95) { // 95% target
      console.warn(`Generated session has ${Math.round(generatedSession.predictions.successProbability * 100)}% success prediction, below 95% target`)
    }

    const response = {
      success: true,
      data: {
        session: generatedSession,
        performance: {
          generationTime: processingTime,
          targetTime: 10000,
          efficiency: Math.min(100, (10000 / processingTime) * 100),
          successPrediction: generatedSession.predictions.successProbability,
          optimizationLevel: generatedSession.metadata.optimizationLevel
        },
        metadata: {
          timestamp: new Date().toISOString(),
          userId,
          requestId: generatedSession.id,
          algorithmsUsed: generatedSession.metadata.algorithmsUsed,
          version: generatedSession.metadata.version
        }
      }
    }

    // Log successful generation
    console.log(`Session generated successfully in ${processingTime}ms with ${Math.round(generatedSession.predictions.successProbability * 100)}% predicted success`)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Session generation failed:', error)
    
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Session generation failed',
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// Quick session generation for immediate use
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get URL parameters
    const url = new URL(request.url)
    const sessionType = url.searchParams.get('type') || 'development'
    const duration = parseInt(url.searchParams.get('duration') || '90')
    const difficulty = url.searchParams.get('difficulty') || 'intermediate'
    const objective = url.searchParams.get('objective') || 'general_development'

    // Create quick generation request
    const quickRequest: GenerationRequest = {
      userId,
      sessionType,
      targetDuration: duration,
      difficulty,
      objectives: [objective],
      context: {
        timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening',
        dayOfWeek: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()],
        availableTime: duration,
        energyLevel: 0.8,
        focusLevel: 0.7,
        collaborators: 0,
        environment: 'normal',
        tools: ['computer', 'internet'],
        previousSessions: []
      },
      preferences: {
        preferredDuration: duration,
        learningStyle: 'mixed',
        breakFrequency: 30,
        difficultyPreference: difficulty,
        collaborationPreference: 'solo',
        feedbackFrequency: 'periodic'
      },
      constraints: {
        maxDuration: duration * 1.2,
        minDuration: duration * 0.8,
        requiredResources: [],
        excludedActivities: [],
        timeBudget: 500,
        resourceBudget: 500
      }
    }

    // Generate quick session (optimized for speed)
    const generatedSession = await intelligentSessionGenerator.generateSession(quickRequest)

    const processingTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      data: {
        session: {
          id: generatedSession.id,
          template: generatedSession.template,
          predictions: generatedSession.predictions,
          alternatives: generatedSession.alternatives.slice(0, 2) // Limit alternatives
        },
        performance: {
          generationTime: processingTime,
          successPrediction: generatedSession.predictions.successProbability,
          isQuickGeneration: true
        },
        metadata: {
          timestamp: new Date().toISOString(),
          userId,
          type: 'quick_generation'
        }
      }
    })
  } catch (error) {
    console.error('Quick session generation failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Quick generation failed',
      processingTime: Date.now() - startTime
    }, { status: 500 })
  }
}

// Batch generation for multiple sessions
export async function PUT(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { requests, parallelExecution = true } = body

    if (!Array.isArray(requests) || requests.length === 0) {
      return NextResponse.json({ 
        error: 'At least one generation request is required' 
      }, { status: 400 })
    }

    if (requests.length > 5) {
      return NextResponse.json({ 
        error: 'Maximum 5 sessions can be generated in batch' 
      }, { status: 400 })
    }

    // Prepare generation requests
    const generationRequests = requests.map((req: any) => ({
      userId,
      sessionType: req.sessionType || 'development',
      targetDuration: req.targetDuration || 90,
      difficulty: req.difficulty || 'intermediate',
      objectives: req.objectives || ['general_development'],
      context: {
        timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening',
        dayOfWeek: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()],
        availableTime: req.targetDuration || 90,
        energyLevel: 0.8,
        focusLevel: 0.7,
        collaborators: 0,
        environment: 'normal',
        tools: ['computer', 'internet'],
        previousSessions: [],
        ...req.context
      },
      preferences: {
        preferredDuration: req.targetDuration || 90,
        learningStyle: 'mixed',
        breakFrequency: 30,
        difficultyPreference: req.difficulty || 'intermediate',
        collaborationPreference: 'solo',
        feedbackFrequency: 'periodic',
        ...req.preferences
      },
      constraints: {
        maxDuration: (req.targetDuration || 90) * 1.2,
        minDuration: (req.targetDuration || 90) * 0.8,
        requiredResources: [],
        excludedActivities: [],
        timeBudget: 500,
        resourceBudget: 500,
        ...req.constraints
      }
    }))

    let generatedSessions
    
    if (parallelExecution) {
      // Generate all sessions in parallel
      generatedSessions = await Promise.all(
        generationRequests.map(req => intelligentSessionGenerator.generateSession(req))
      )
    } else {
      // Generate sessions sequentially
      generatedSessions = []
      for (const req of generationRequests) {
        const session = await intelligentSessionGenerator.generateSession(req)
        generatedSessions.push(session)
      }
    }

    const processingTime = Date.now() - startTime
    const averageSuccessPrediction = generatedSessions.reduce(
      (sum, session) => sum + session.predictions.successProbability, 0
    ) / generatedSessions.length

    return NextResponse.json({
      success: true,
      data: {
        sessions: generatedSessions,
        batchMetrics: {
          totalSessions: generatedSessions.length,
          totalProcessingTime: processingTime,
          averageProcessingTime: processingTime / generatedSessions.length,
          averageSuccessPrediction,
          parallelExecution
        },
        metadata: {
          timestamp: new Date().toISOString(),
          userId,
          batchId: `batch_${Date.now()}_${userId}`
        }
      }
    })
  } catch (error) {
    console.error('Batch session generation failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Batch generation failed',
      processingTime: Date.now() - startTime
    }, { status: 500 })
  }
} 