import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { InteractionCapture } from '@/lib/types/learning'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const body: InteractionCapture = await request.json()
    
    // Validate required fields
    if (!body.instruction || !body.response) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: instruction and response'
      }, { status: 400 })
    }

    // Generate IDs and timestamps
    const interactionId = crypto.randomUUID()
    const responseId = crypto.randomUUID()
    const timestamp = new Date()

    // In a real implementation, this would save to Supabase
    // For now, we'll simulate the storage and return success
    const instructionData = {
      id: interactionId,
      user_id: userId,
      timestamp,
      ...body.instruction
    }

    const responseData = {
      id: responseId,
      instruction_id: interactionId,
      timestamp,
      ...body.response
    }

    console.log('Captured interaction:', {
      instruction: instructionData,
      response: responseData
    })

    // Simulate basic pattern recognition
    const patternAnalysis = {
      instructionComplexity: body.instruction.instruction_text.length > 500 ? 'high' : 'medium',
      likelySuccess: body.response.success,
      contextRichness: Object.keys(body.instruction.context || {}).length,
      responseTime: body.response.execution_time_ms
    }

    return NextResponse.json({
      success: true,
      data: {
        interactionId,
        responseId,
        patternAnalysis,
        timestamp: timestamp.toISOString()
      }
    })
  } catch (error) {
    console.error('Interaction capture error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to capture interaction' 
      }, 
      { status: 500 }
    )
  }
} 