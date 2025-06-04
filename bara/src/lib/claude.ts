import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder-key',
})

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface AIAnalysis {
  summary: string
  insights: string[]
  recommendations: string[]
  patterns: string[]
}

export class ClaudeClient {
  private client: Anthropic

  constructor() {
    this.client = anthropic
  }

  async chat(messages: ChatMessage[], systemPrompt?: string): Promise<string> {
    try {
      const formattedMessages = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))

      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        system: systemPrompt || 'You are a helpful AI assistant for personal productivity and task management.',
        messages: formattedMessages
      })

      const responseContent = response.content[0]
      if (responseContent.type === 'text') {
        return responseContent.text
      }
      
      throw new Error('Unexpected response format from Claude')
    } catch (error) {
      console.error('Claude API error:', error)
      throw new Error('Failed to get response from Claude AI')
    }
  }

  async analyzeTask(task: string, context?: string): Promise<AIAnalysis> {
    const prompt = `Analyze this task and provide insights:
    
Task: ${task}
${context ? `Context: ${context}` : ''}

Please provide:
1. A brief summary
2. Key insights about this task
3. Recommendations for completion
4. Any patterns or dependencies you notice

Format your response as JSON with the structure:
{
  "summary": "brief summary",
  "insights": ["insight1", "insight2"],
  "recommendations": ["rec1", "rec2"],
  "patterns": ["pattern1", "pattern2"]
}`

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        system: 'You are an expert productivity consultant. Analyze tasks and provide structured insights.',
        messages: [{ role: 'user', content: prompt }]
      })

      const responseContent = response.content[0]
      if (responseContent.type === 'text') {
        const parsed = JSON.parse(responseContent.text)
        return parsed as AIAnalysis
      }
      
      throw new Error('Unexpected response format from Claude')
    } catch (error) {
      console.error('Claude analysis error:', error)
      // Return fallback analysis
      return {
        summary: `Task: ${task}`,
        insights: ['Task analysis requires manual review'],
        recommendations: ['Break down into smaller steps', 'Set clear deadlines'],
        patterns: ['General productivity patterns apply']
      }
    }
  }

  async analyzeDocument(content: string, type: 'book' | 'article' | 'note'): Promise<AIAnalysis> {
    const prompt = `Analyze this ${type} content and extract key insights:

Content: ${content.substring(0, 3000)}...

Please provide:
1. A comprehensive summary
2. Key insights and learnings
3. Actionable recommendations
4. Important patterns or themes

Format your response as JSON with the structure:
{
  "summary": "comprehensive summary",
  "insights": ["insight1", "insight2"],
  "recommendations": ["rec1", "rec2"],
  "patterns": ["pattern1", "pattern2"]
}`

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        system: `You are an expert knowledge analyst. Extract valuable insights from ${type} content.`,
        messages: [{ role: 'user', content: prompt }]
      })

      const responseContent = response.content[0]
      if (responseContent.type === 'text') {
        const parsed = JSON.parse(responseContent.text)
        return parsed as AIAnalysis
      }
      
      throw new Error('Unexpected response format from Claude')
    } catch (error) {
      console.error('Claude document analysis error:', error)
      return {
        summary: `Analysis of ${type} content`,
        insights: ['Content requires manual review'],
        recommendations: ['Review key sections', 'Take notes on important points'],
        patterns: ['Standard content patterns apply']
      }
    }
  }

  async generateProductivityInsights(tasks: Array<{
    id: string
    title: string
    status: string
    priority: string
  }>, patterns: Array<{
    type: string
    value: number
    description: string
  }>): Promise<string[]> {
    const prompt = `Based on this user's task data and behavioral patterns, generate personalized productivity insights:

Tasks: ${JSON.stringify(tasks.slice(0, 10))}
Patterns: ${JSON.stringify(patterns)}

Provide 3-5 specific, actionable insights that would help improve their productivity.`

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 800,
        system: 'You are a productivity coach. Generate personalized, actionable insights.',
        messages: [{ role: 'user', content: prompt }]
      })

      const responseContent = response.content[0]
      if (responseContent.type === 'text') {
        // Parse insights from the response
        const insights = responseContent.text.split('\n')
          .filter(line => line.trim())
          .filter(line => line.includes('.') || line.includes('-'))
          .slice(0, 5)
        
        return insights.length > 0 ? insights : ['Focus on consistent daily progress', 'Break large tasks into smaller steps']
      }
      
      return ['Focus on consistent daily progress', 'Break large tasks into smaller steps']
    } catch (error) {
      console.error('Claude insights error:', error)
      return ['Focus on consistent daily progress', 'Break large tasks into smaller steps']
    }
  }
}

export const claude = new ClaudeClient() 