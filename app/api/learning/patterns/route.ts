import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { LearningPattern, PatternRecognitionResult } from '@/lib/types/learning'
import { withLearningCache, withCacheTracking } from '@/lib/middleware/cache'
import { learningDataCache } from '@/lib/cache'

// Mock learning patterns data
const mockPatterns: LearningPattern[] = [
  {
    id: '1',
    pattern_type: 'successful_instruction',
    pattern_description: 'Step-by-step API implementation requests with specific file paths',
    instruction_keywords: ['create', 'api', 'endpoint', 'route.ts', 'step-by-step'],
    context_factors: { 
      hasFileContext: true, 
      includesTypeScript: true,
      specifiesFramework: 'Next.js'
    },
    success_rate: 0.92,
    sample_size: 47,
    created_at: new Date('2024-01-01'),
    updated_at: new Date()
  },
  {
    id: '2',
    pattern_type: 'successful_instruction',
    pattern_description: 'Component creation with specific styling requirements',
    instruction_keywords: ['component', 'create', 'styling', 'tailwind', 'responsive'],
    context_factors: { 
      includesStyling: true, 
      hasDesignSpecs: true,
      specifiesFramework: 'React'
    },
    success_rate: 0.85,
    sample_size: 32,
    created_at: new Date('2024-01-05'),
    updated_at: new Date()
  },
  {
    id: '3',
    pattern_type: 'failed_instruction',
    pattern_description: 'Vague refactoring requests without clear objectives',
    instruction_keywords: ['refactor', 'improve', 'better', 'optimize'],
    context_factors: { 
      lacksSpecificity: true, 
      missingContext: true 
    },
    success_rate: 0.23,
    sample_size: 18,
    created_at: new Date('2024-01-10'),
    updated_at: new Date()
  },
  {
    id: '4',
    pattern_type: 'context_dependency',
    pattern_description: 'Database operations require environment setup context',
    instruction_keywords: ['database', 'prisma', 'query', 'model'],
    context_factors: { 
      requiresEnvSetup: true, 
      needsSchemaContext: true 
    },
    success_rate: 0.67,
    sample_size: 25,
    created_at: new Date('2024-01-15'),
    updated_at: new Date()
  }
]

async function getPatternsHandler(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Check authentication
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const patternType = searchParams.get('type')
    const minSuccessRate = parseFloat(searchParams.get('minSuccessRate') || '0')

    // Use cache for patterns data
    const allPatterns = await learningDataCache.getLearningPatterns(async () => {
      // Fallback function to generate patterns data
      return mockPatterns
    })

    let filteredPatterns = allPatterns

    // Filter by pattern type if specified
    if (patternType) {
      filteredPatterns = filteredPatterns.filter(p => p.pattern_type === patternType)
    }

    // Filter by minimum success rate
    if (minSuccessRate > 0) {
      filteredPatterns = filteredPatterns.filter(p => p.success_rate >= minSuccessRate)
    }

    // Sort by success rate descending
    filteredPatterns.sort((a, b) => b.success_rate - a.success_rate)

    const responseTime = Date.now() - startTime
    console.log(`Learning patterns GET - Response time: ${responseTime}ms`)

    return NextResponse.json({
      success: true,
      data: {
        patterns: filteredPatterns,
        summary: {
          totalPatterns: filteredPatterns.length,
          avgSuccessRate: filteredPatterns.reduce((sum, p) => sum + p.success_rate, 0) / filteredPatterns.length,
          topPattern: filteredPatterns[0],
          lastUpdated: new Date().toISOString()
        },
        _performance: {
          responseTime,
          cached: true, // Will be overridden by cache middleware if not cached
          filterApplied: Boolean(patternType || minSuccessRate > 0)
        }
      }
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`Patterns fetch error after ${responseTime}ms:`, error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch patterns' 
      }, 
      { status: 500 }
    )
  }
}

async function analyzePatternHandler(request: NextRequest) {
  const startTime = Date.now()
  
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
    const { instructionText, context } = body

    if (!instructionText) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: instructionText'
      }, { status: 400 })
    }

    // Use cache for pattern analysis
    const result = await learningDataCache.getPatternAnalysis(
      instructionText, 
      context || {}, 
      async () => {
        // Fallback function to perform pattern recognition
        return recognizePatterns(instructionText, context || {})
      }
    )

    const responseTime = Date.now() - startTime
    console.log(`Pattern analysis POST - Response time: ${responseTime}ms`)

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        _performance: {
          responseTime,
          cached: false, // POST requests typically aren't cached
          analysisComplexity: instructionText.length > 500 ? 'high' : 'normal'
        }
      }
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`Pattern recognition error after ${responseTime}ms:`, error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to analyze patterns' 
      }, 
      { status: 500 }
    )
  }
}

function recognizePatterns(instructionText: string, context: Record<string, any>): PatternRecognitionResult {
  const instruction = instructionText.toLowerCase()
  const matchedPatterns: LearningPattern[] = []
  const recommendedImprovements: string[] = []
  
  // Check against known patterns
  for (const pattern of mockPatterns) {
    const keywordMatches = pattern.instruction_keywords.filter(keyword => 
      instruction.includes(keyword.toLowerCase())
    ).length
    
    const keywordScore = keywordMatches / pattern.instruction_keywords.length
    const contextScore = calculateContextSimilarity(context, pattern.context_factors)
    
    if (keywordScore > 0.3 || contextScore > 0.5) {
      matchedPatterns.push(pattern)
    }
  }

  // Generate recommendations based on failed patterns
  const failedPatterns = matchedPatterns.filter(p => p.pattern_type === 'failed_instruction')
  if (failedPatterns.length > 0) {
    recommendedImprovements.push('Consider being more specific in your request')
    recommendedImprovements.push('Include relevant file paths or context')
    recommendedImprovements.push('Break down complex requests into smaller steps')
  }

  // Check for vague instructions
  if (instruction.length < 50) {
    recommendedImprovements.push('Provide more detailed instructions for better results')
  }

  // Calculate success prediction
  const avgSuccessRate = matchedPatterns.length > 0 
    ? matchedPatterns.reduce((sum, p) => sum + p.success_rate, 0) / matchedPatterns.length
    : 0.5

  return {
    matchedPatterns: matchedPatterns.slice(0, 5), // Top 5 matches
    recommendedImprovements,
    successPrediction: avgSuccessRate,
    contextSimilarity: context ? 0.8 : 0.3
  }
}

function calculateContextSimilarity(context1: Record<string, any>, context2: Record<string, any>): number {
  const keys1 = Object.keys(context1)
  const keys2 = Object.keys(context2)
  
  if (keys1.length === 0 && keys2.length === 0) return 1.0
  if (keys1.length === 0 || keys2.length === 0) return 0.0
  
  const commonKeys = keys1.filter(key => keys2.includes(key))
  return commonKeys.length / Math.max(keys1.length, keys2.length)
}

// Apply caching and tracking middleware
export const GET = withCacheTracking(withLearningCache(getPatternsHandler))
export const POST = withCacheTracking(analyzePatternHandler) 