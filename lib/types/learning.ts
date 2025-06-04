export interface ClaudeInstruction {
  id: string
  session_id: string
  user_id: string
  instruction_text: string
  instruction_type: 'code_generation' | 'debugging' | 'refactoring' | 'analysis' | 'explanation' | 'other'
  context: Record<string, any>
  timestamp: Date
  success_score?: number
  effectiveness_rating?: number
  follow_up_needed: boolean
}

export interface CursorResponse {
  id: string
  instruction_id: string
  session_id: string
  response_text: string
  response_type: 'code' | 'explanation' | 'error' | 'guidance'
  execution_time_ms: number
  tokens_used?: number
  files_modified: string[]
  success: boolean
  error_message?: string
  timestamp: Date
}

export interface LearningPattern {
  id: string
  pattern_type: 'successful_instruction' | 'failed_instruction' | 'context_dependency' | 'optimization'
  pattern_description: string
  instruction_keywords: string[]
  context_factors: Record<string, any>
  success_rate: number
  sample_size: number
  created_at: Date
  updated_at: Date
}

export interface SessionAnalytics {
  id: string
  session_id: string
  user_id: string
  total_instructions: number
  successful_instructions: number
  avg_response_time_ms: number
  total_tokens_used: number
  files_created: number
  files_modified: number
  errors_encountered: number
  session_duration_ms: number
  learning_score: number
  started_at: Date
  ended_at?: Date
}

export interface LearningMetrics {
  totalInstructions: number
  successfulInstructions: number
  successRate: number
  avgResponseTime: number
  topPatterns: LearningPattern[]
  recentSessions: SessionAnalytics[]
  instructionTypeDistribution: Record<string, number>
  effectivenessTrends: Array<{
    date: string
    successRate: number
    avgEffectiveness: number
  }>
}

export interface InteractionCapture {
  instruction: Omit<ClaudeInstruction, 'id' | 'timestamp'>
  response: Omit<CursorResponse, 'id' | 'timestamp'>
}

export interface PatternRecognitionResult {
  matchedPatterns: LearningPattern[]
  recommendedImprovements: string[]
  successPrediction: number
  contextSimilarity: number
} 