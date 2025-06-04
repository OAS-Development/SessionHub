import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { CursorResponse } from '@/lib/types/learning'

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

    const body = await request.json()
    
    // Validate required fields
    if (!body.instruction_id || !body.session_id || !body.response_text) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: instruction_id, session_id, response_text'
      }, { status: 400 })
    }

    // Generate response data
    const responseData: CursorResponse = {
      id: crypto.randomUUID(),
      instruction_id: body.instruction_id,
      session_id: body.session_id,
      response_text: body.response_text,
      response_type: body.response_type || 'code',
      execution_time_ms: body.execution_time_ms || 0,
      tokens_used: body.tokens_used,
      files_modified: body.files_modified || [],
      success: body.success || true,
      error_message: body.error_message,
      timestamp: new Date()
    }

    console.log('Captured response:', responseData)

    // Simulate effectiveness analysis
    const effectivenessScore = calculateEffectivenessScore(responseData)
    
    return NextResponse.json({
      success: true,
      data: {
        responseId: responseData.id,
        effectivenessScore,
        timestamp: responseData.timestamp.toISOString(),
        analysis: {
          responseTime: responseData.execution_time_ms,
          filesAffected: responseData.files_modified.length,
          success: responseData.success,
          complexity: responseData.response_text.length > 1000 ? 'high' : 'medium'
        }
      }
    })
  } catch (error) {
    console.error('Response capture error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to capture response' 
      }, 
      { status: 500 }
    )
  }
}

function calculateEffectivenessScore(response: CursorResponse): number {
  let score = 0.5 // Base score
  
  // Success bonus
  if (response.success) score += 0.3
  
  // Response time bonus (faster is better)
  if (response.execution_time_ms < 1000) score += 0.1
  else if (response.execution_time_ms > 5000) score -= 0.1
  
  // Files modified (productivity indicator)
  if (response.files_modified.length > 0) score += 0.1
  
  // No errors bonus
  if (!response.error_message) score += 0.1
  
  return Math.min(1.0, Math.max(0.0, score))
} 