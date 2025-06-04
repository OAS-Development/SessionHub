import { NextRequest, NextResponse } from 'next/server'
import { claude, ChatMessage } from '@/lib/claude'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Get the last few messages to maintain context
    const contextMessages = messages.slice(-10) as ChatMessage[]

    const systemPrompt = `You are Bara's AI assistant, a helpful productivity and personal intelligence companion. Your role is to:

1. Help users with task analysis and organization
2. Provide productivity insights and recommendations
3. Assist with goal setting and tracking
4. Analyze documents and books for key insights
5. Suggest automation opportunities
6. Offer personalized advice based on user patterns

Keep responses concise but helpful. Be encouraging and focused on actionable advice. Ask clarifying questions when needed to provide better assistance.`

    const response = await claude.chat(contextMessages, systemPrompt)

    return NextResponse.json({
      content: response,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Chat API error:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'AI service configuration error' },
          { status: 500 }
        )
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Too many requests. Please wait a moment.' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to process your request' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'AI Chat API is running',
    timestamp: new Date().toISOString(),
    capabilities: [
      'Natural conversations',
      'Task analysis',
      'Productivity insights',
      'Document analysis',
      'Goal tracking assistance'
    ]
  })
} 