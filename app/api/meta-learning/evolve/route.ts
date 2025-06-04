import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { metaLearningEngine } from '@/lib/meta-learning'
import { algorithmOptimizer } from '@/lib/algorithm-optimizer'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      evolutionType = 'capability_enhancement', // 'capability_enhancement' | 'architecture_evolution' | 'learning_optimization' | 'autonomous_adaptation'
      targetAlgorithms = [], // Empty array means evolve all algorithms
      evolutionGoals = ['performance_improvement', 'efficiency_enhancement', 'capability_expansion'],
      evolutionBudget = 1000, // Computational budget for evolution
      parallelEvolution = true,
      autonomousEvolutionEnabled = true,
      crossAlgorithmLearning = true
    } = body

    console.log(`Starting capability evolution: ${evolutionType}`)

    // Initialize evolution results
    const evolutionResults = {
      evolutionType,
      targetAlgorithms: targetAlgorithms.length > 0 ? targetAlgorithms : await getAllAlgorithmIds(),
      evolutions: [],
      crossAlgorithmInsights: [],
      autonomousAdaptations: [],
      capabilityEnhancements: [],
      performanceImprovements: {},
      evolutionMetrics: {}
    }

    // Autonomous capability evolution
    if (autonomousEvolutionEnabled) {
      console.log('Performing autonomous capability evolution...')
      
      try {
        const capabilityEvolutions = await metaLearningEngine.evolveCapabilities()
        evolutionResults.evolutions.push(...capabilityEvolutions)
        
        // Calculate capability enhancements
        for (const evolution of capabilityEvolutions) {
          evolutionResults.capabilityEnhancements.push({
            algorithmId: evolution.evolutionId.split('_')[0], // Extract algorithm ID
            evolutionType: evolution.evolutionType,
            newCapabilities: evolution.newCapabilities,
            enhancedCapabilities: evolution.enhancedCapabilities,
            improvement: evolution.measuredImprovement,
            confidence: evolution.confidence
          })
        }
      } catch (error) {
        console.error('Autonomous capability evolution failed:', error)
        evolutionResults.evolutions.push({
          error: error instanceof Error ? error.message : 'Autonomous capability evolution failed'
        })
      }
    }

    // Algorithm-specific evolution
    if (evolutionType === 'architecture_evolution' || evolutionType === 'capability_enhancement') {
      console.log('Performing algorithm-specific evolution...')
      
      const algorithmEvolutionPromises = evolutionResults.targetAlgorithms.map(async (algorithmId: string) => {
        try {
          // Evolve individual algorithms
          const algorithmEvolutions = await algorithmOptimizer.evolveAlgorithm(algorithmId, 20, 10)
          
          return {
            algorithmId,
            evolutions: algorithmEvolutions,
            success: true,
            bestEvolution: algorithmEvolutions[0] // Assuming first is best
          }
        } catch (error) {
          console.error(`Algorithm evolution failed for ${algorithmId}:`, error)
          return {
            algorithmId,
            error: error instanceof Error ? error.message : 'Algorithm evolution failed',
            success: false
          }
        }
      })

      const algorithmEvolutionResults = parallelEvolution 
        ? await Promise.all(algorithmEvolutionPromises)
        : await sequentiallyExecute(algorithmEvolutionPromises)

      // Process algorithm evolution results
      for (const result of algorithmEvolutionResults) {
        if (result.success && result.evolutions) {
          evolutionResults.evolutions.push(...result.evolutions)
          
          // Track performance improvements
          const bestEvolution = result.bestEvolution
          if (bestEvolution) {
            evolutionResults.performanceImprovements[result.algorithmId] = {
              fitness: bestEvolution.fitness,
              generation: bestEvolution.generation,
              evolutionType: bestEvolution.evolutionType
            }
          }
        }
      }
    }

    // Cross-algorithm learning and knowledge transfer
    if (crossAlgorithmLearning) {
      console.log('Performing cross-algorithm learning...')
      
      try {
        const crossAlgorithmInsights = await performCrossAlgorithmLearning(evolutionResults.targetAlgorithms)
        evolutionResults.crossAlgorithmInsights = crossAlgorithmInsights
        
        // Apply cross-algorithm learning insights
        for (const insight of crossAlgorithmInsights) {
          await applyCrossAlgorithmInsight(insight)
        }
      } catch (error) {
        console.error('Cross-algorithm learning failed:', error)
        evolutionResults.crossAlgorithmInsights.push({
          error: error instanceof Error ? error.message : 'Cross-algorithm learning failed'
        })
      }
    }

    // Learning optimization evolution
    if (evolutionType === 'learning_optimization' || evolutionType === 'capability_enhancement') {
      console.log('Optimizing learning processes...')
      
      try {
        const learningOptimizations = await optimizeLearningProcesses(evolutionResults.targetAlgorithms)
        
        for (const optimization of learningOptimizations) {
          evolutionResults.evolutions.push({
            evolutionId: `learning_opt_${Date.now()}_${optimization.algorithmId}`,
            evolutionType: 'learning_optimization',
            description: optimization.description,
            impact: optimization.improvement,
            confidence: optimization.confidence,
            newCapabilities: optimization.enhancedCapabilities,
            enhancedCapabilities: [],
            measuredImprovement: optimization.improvement
          })
        }
      } catch (error) {
        console.error('Learning optimization failed:', error)
        evolutionResults.evolutions.push({
          error: error instanceof Error ? error.message : 'Learning optimization failed'
        })
      }
    }

    // Autonomous adaptation execution
    if (evolutionType === 'autonomous_adaptation' || evolutionType === 'capability_enhancement') {
      console.log('Executing autonomous adaptations...')
      
      try {
        const autonomousAdaptations = await executeAutonomousAdaptations(evolutionResults.targetAlgorithms)
        evolutionResults.autonomousAdaptations = autonomousAdaptations
      } catch (error) {
        console.error('Autonomous adaptation failed:', error)
        evolutionResults.autonomousAdaptations.push({
          error: error instanceof Error ? error.message : 'Autonomous adaptation failed'
        })
      }
    }

    // Calculate evolution metrics
    const evolutionTime = Date.now() - startTime
    const successfulEvolutions = evolutionResults.evolutions.filter(e => !e.error).length
    const totalEvolutions = evolutionResults.evolutions.length
    const averageImprovement = calculateAverageImprovement(evolutionResults.evolutions)
    const autonomousAdaptationSuccessRate = calculateAutonomousAdaptationSuccessRate(evolutionResults.autonomousAdaptations)

    evolutionResults.evolutionMetrics = {
      evolutionTime,
      successfulEvolutions,
      totalEvolutions,
      successRate: totalEvolutions > 0 ? successfulEvolutions / totalEvolutions : 0,
      averageImprovement,
      autonomousAdaptationSuccessRate,
      capabilityEnhancementsCount: evolutionResults.capabilityEnhancements.length,
      crossAlgorithmInsightsCount: evolutionResults.crossAlgorithmInsights.length
    }

    // Performance validation against targets
    if (autonomousAdaptationSuccessRate < 0.85) { // 85% target
      console.warn(`Autonomous adaptation success rate ${Math.round(autonomousAdaptationSuccessRate * 100)}% below 85% target`)
    }

    if (averageImprovement < 0.15) { // 15% improvement target
      console.warn(`Average improvement ${Math.round(averageImprovement * 100)}% below 15% target`)
    }

    const response = {
      success: true,
      data: {
        evolution: evolutionResults,
        performance: {
          evolutionTime,
          successRate: evolutionResults.evolutionMetrics.successRate,
          averageImprovement,
          autonomousAdaptationSuccessRate,
          targetAchieved: averageImprovement >= 0.15 && autonomousAdaptationSuccessRate >= 0.85,
          capabilityExpansion: evolutionResults.capabilityEnhancements.length
        },
        insights: {
          topEvolutions: getTopEvolutions(evolutionResults.evolutions, 5),
          emergentCapabilities: identifyEmergentCapabilities(evolutionResults.evolutions),
          evolutionPatterns: analyzeEvolutionPatterns(evolutionResults.evolutions),
          crossAlgorithmSynergies: identifyCrossAlgorithmSynergies(evolutionResults.crossAlgorithmInsights)
        },
        metadata: {
          timestamp: new Date().toISOString(),
          userId,
          evolutionId: `evolution_${Date.now()}_${userId}`,
          evolutionType,
          algorithmsEvolved: evolutionResults.targetAlgorithms.length,
          version: '1.0.0'
        }
      }
    }

    console.log(`Capability evolution completed with ${successfulEvolutions}/${totalEvolutions} successful evolutions and ${Math.round(averageImprovement * 100)}% average improvement`)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Capability evolution failed:', error)
    
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Capability evolution failed',
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// Get evolution history and insights
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const algorithmId = url.searchParams.get('algorithmId')
    const evolutionType = url.searchParams.get('evolutionType')
    const timeRange = url.searchParams.get('timeRange') || '7d'
    const includeInsights = url.searchParams.get('includeInsights') === 'true'

    // Get evolution history
    const evolutionHistory = await getEvolutionHistory({
      algorithmId,
      evolutionType,
      timeRange,
      userId
    })

    // Get evolution insights if requested
    let evolutionInsights = null
    if (includeInsights) {
      evolutionInsights = await generateEvolutionInsights(evolutionHistory)
    }

    // Get current capability status
    const capabilityStatus = await getCurrentCapabilityStatus(algorithmId)

    // Get evolution trends
    const evolutionTrends = await analyzeEvolutionTrends(evolutionHistory)

    return NextResponse.json({
      success: true,
      data: {
        evolutionHistory,
        evolutionInsights,
        capabilityStatus,
        evolutionTrends,
        summary: {
          totalEvolutions: evolutionHistory.length,
          successfulEvolutions: evolutionHistory.filter((e: any) => e.success).length,
          averageImprovement: calculateAverageImprovement(evolutionHistory),
          emergentCapabilities: evolutionInsights?.emergentCapabilities?.length || 0,
          autonomousAdaptations: evolutionHistory.filter((e: any) => e.evolutionType === 'autonomous_adaptation').length
        },
        metadata: {
          timestamp: new Date().toISOString(),
          userId,
          queryParameters: { algorithmId, evolutionType, timeRange }
        }
      }
    })
  } catch (error) {
    console.error('Failed to get evolution data:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get evolution data'
    }, { status: 500 })
  }
}

// Trigger manual evolution
export async function PUT(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      algorithmId,
      evolutionTrigger = 'manual', // 'manual' | 'performance_threshold' | 'time_based' | 'autonomous'
      evolutionScope = 'targeted', // 'targeted' | 'comprehensive' | 'experimental'
      evolutionParameters = {}
    } = body

    // Validate request parameters
    if (!algorithmId) {
      return NextResponse.json({ 
        error: 'Algorithm ID is required for manual evolution' 
      }, { status: 400 })
    }

    console.log(`Triggering manual evolution for algorithm: ${algorithmId}`)

    // Execute targeted evolution based on scope
    let evolutionResult
    
    switch (evolutionScope) {
      case 'targeted':
        evolutionResult = await executeTargetedEvolution(algorithmId, evolutionParameters)
        break
      case 'comprehensive':
        evolutionResult = await executeComprehensiveEvolution(algorithmId, evolutionParameters)
        break
      case 'experimental':
        evolutionResult = await executeExperimentalEvolution(algorithmId, evolutionParameters)
        break
      default:
        throw new Error(`Unknown evolution scope: ${evolutionScope}`)
    }

    // Record evolution trigger and results
    await recordEvolutionTrigger({
      algorithmId,
      evolutionTrigger,
      evolutionScope,
      evolutionResult,
      userId,
      timestamp: new Date()
    })

    const processingTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      data: {
        algorithmId,
        evolution: evolutionResult,
        trigger: {
          type: evolutionTrigger,
          scope: evolutionScope,
          parameters: evolutionParameters,
          triggeredBy: userId,
          triggeredAt: new Date().toISOString()
        },
        performance: {
          processingTime,
          improvement: evolutionResult.improvement || 0,
          success: evolutionResult.success || false,
          newCapabilities: evolutionResult.newCapabilities?.length || 0
        },
        metadata: {
          timestamp: new Date().toISOString(),
          userId,
          evolutionTriggerId: `manual_evo_${Date.now()}_${algorithmId}`
        }
      }
    })
  } catch (error) {
    console.error('Manual evolution trigger failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Manual evolution trigger failed',
      processingTime: Date.now() - startTime
    }, { status: 500 })
  }
}

// Helper functions
async function getAllAlgorithmIds(): Promise<string[]> {
  // In practice, this would query the database for all algorithm IDs
  return ['genetic_algorithm', 'neural_network', 'reinforcement_learning', 'pattern_recognition', 'ml_models']
}

async function sequentiallyExecute(promises: Promise<any>[]): Promise<any[]> {
  const results = []
  for (const promise of promises) {
    results.push(await promise)
  }
  return results
}

async function performCrossAlgorithmLearning(algorithmIds: string[]): Promise<any[]> {
  const insights = []
  
  // Analyze patterns across algorithms
  for (let i = 0; i < algorithmIds.length; i++) {
    for (let j = i + 1; j < algorithmIds.length; j++) {
      const algorithmA = algorithmIds[i]
      const algorithmB = algorithmIds[j]
      
      const crossInsight = await analyzeCrossAlgorithmPatterns(algorithmA, algorithmB)
      if (crossInsight.transferPotential > 0.5) {
        insights.push(crossInsight)
      }
    }
  }
  
  return insights
}

async function analyzeCrossAlgorithmPatterns(algorithmA: string, algorithmB: string): Promise<any> {
  // Mock cross-algorithm pattern analysis
  return {
    sourceAlgorithm: algorithmA,
    targetAlgorithm: algorithmB,
    transferPotential: Math.random() * 0.8 + 0.2, // 0.2 to 1.0
    sharedPatterns: ['optimization_convergence', 'feature_importance'],
    transferableCapabilities: ['adaptive_learning_rate', 'regularization_techniques'],
    expectedImprovement: Math.random() * 0.2 + 0.1, // 0.1 to 0.3
    implementationComplexity: 'medium'
  }
}

async function applyCrossAlgorithmInsight(insight: any): Promise<void> {
  console.log(`Applying cross-algorithm insight from ${insight.sourceAlgorithm} to ${insight.targetAlgorithm}`)
  // Implementation would transfer capabilities between algorithms
}

async function optimizeLearningProcesses(algorithmIds: string[]): Promise<any[]> {
  const optimizations = []
  
  for (const algorithmId of algorithmIds) {
    // Mock learning process optimization
    optimizations.push({
      algorithmId,
      description: `Optimized learning process for ${algorithmId}`,
      improvement: Math.random() * 0.25 + 0.05, // 5% to 30% improvement
      confidence: Math.random() * 0.3 + 0.7, // 70% to 100% confidence
      enhancedCapabilities: ['faster_convergence', 'better_generalization'],
      optimizationType: 'learning_rate_adaptation'
    })
  }
  
  return optimizations
}

async function executeAutonomousAdaptations(algorithmIds: string[]): Promise<any[]> {
  const adaptations = []
  
  for (const algorithmId of algorithmIds) {
    // Mock autonomous adaptation
    const adaptationSuccess = Math.random() > 0.15 // 85% success rate
    
    adaptations.push({
      algorithmId,
      success: adaptationSuccess,
      adaptationType: 'performance_optimization',
      adaptationsApplied: adaptationSuccess ? ['hyperparameter_tuning', 'architecture_adjustment'] : [],
      improvement: adaptationSuccess ? Math.random() * 0.2 + 0.1 : 0, // 10% to 30% if successful
      confidence: adaptationSuccess ? Math.random() * 0.2 + 0.8 : 0.3, // High confidence if successful
      autonomousDecisions: adaptationSuccess ? 3 : 0,
      timestamp: new Date()
    })
  }
  
  return adaptations
}

function calculateAverageImprovement(evolutions: any[]): number {
  const validEvolutions = evolutions.filter(e => e.improvement && !e.error)
  if (validEvolutions.length === 0) return 0
  
  return validEvolutions.reduce((sum, e) => sum + (e.improvement || e.measuredImprovement || 0), 0) / validEvolutions.length
}

function calculateAutonomousAdaptationSuccessRate(adaptations: any[]): number {
  if (adaptations.length === 0) return 0
  
  const successfulAdaptations = adaptations.filter(a => a.success && !a.error).length
  return successfulAdaptations / adaptations.length
}

function getTopEvolutions(evolutions: any[], count: number): any[] {
  return evolutions
    .filter(e => !e.error && (e.improvement || e.measuredImprovement))
    .sort((a, b) => (b.improvement || b.measuredImprovement) - (a.improvement || a.measuredImprovement))
    .slice(0, count)
}

function identifyEmergentCapabilities(evolutions: any[]): string[] {
  const emergentCapabilities = new Set<string>()
  
  for (const evolution of evolutions) {
    if (evolution.newCapabilities) {
      evolution.newCapabilities.forEach((cap: string) => emergentCapabilities.add(cap))
    }
  }
  
  return Array.from(emergentCapabilities)
}

function analyzeEvolutionPatterns(evolutions: any[]): any {
  return {
    mostCommonEvolutionType: 'capability_enhancement',
    averageImprovementByType: {
      capability_enhancement: 0.18,
      architecture_evolution: 0.22,
      learning_optimization: 0.15,
      autonomous_adaptation: 0.12
    },
    evolutionFrequency: evolutions.length,
    successPatterns: ['gradual_improvement', 'targeted_optimization']
  }
}

function identifyCrossAlgorithmSynergies(insights: any[]): any[] {
  return insights
    .filter(insight => insight.transferPotential > 0.7)
    .map(insight => ({
      synergy: `${insight.sourceAlgorithm} → ${insight.targetAlgorithm}`,
      potential: insight.transferPotential,
      capabilities: insight.transferableCapabilities
    }))
}

// Additional helper functions for GET and PUT endpoints
async function getEvolutionHistory(params: any): Promise<any[]> {
  // Mock evolution history
  return [
    {
      id: `evo_${Date.now()}_1`,
      algorithmId: params.algorithmId || 'genetic_algorithm',
      evolutionType: 'capability_enhancement',
      timestamp: new Date(),
      improvement: 0.18,
      success: true,
      newCapabilities: ['adaptive_mutation_rate']
    },
    {
      id: `evo_${Date.now()}_2`,
      algorithmId: params.algorithmId || 'neural_network',
      evolutionType: 'architecture_evolution',
      timestamp: new Date(Date.now() - 86400000),
      improvement: 0.22,
      success: true,
      newCapabilities: ['attention_mechanism', 'skip_connections']
    }
  ]
}

async function generateEvolutionInsights(history: any[]): Promise<any> {
  return {
    emergentCapabilities: identifyEmergentCapabilities(history),
    evolutionTrends: analyzeEvolutionPatterns(history),
    performanceGains: calculateAverageImprovement(history),
    autonomousDecisions: history.reduce((sum, h) => sum + (h.autonomousDecisions || 0), 0)
  }
}

async function getCurrentCapabilityStatus(algorithmId?: string | null): Promise<any> {
  return {
    totalCapabilities: 15,
    newCapabilities: 3,
    enhancedCapabilities: 7,
    autonomousAdaptations: 5,
    lastEvolution: new Date()
  }
}

async function analyzeEvolutionTrends(history: any[]): Promise<any> {
  return {
    improvementTrend: 'increasing',
    averageImprovementRate: 0.16,
    evolutionFrequency: 'weekly',
    mostSuccessfulType: 'architecture_evolution'
  }
}

async function executeTargetedEvolution(algorithmId: string, parameters: any): Promise<any> {
  return {
    success: true,
    improvement: 0.15,
    evolutionType: 'targeted',
    newCapabilities: ['optimized_convergence'],
    processingTime: 30000
  }
}

async function executeComprehensiveEvolution(algorithmId: string, parameters: any): Promise<any> {
  return {
    success: true,
    improvement: 0.25,
    evolutionType: 'comprehensive',
    newCapabilities: ['advanced_optimization', 'meta_learning_integration'],
    processingTime: 60000
  }
}

async function executeExperimentalEvolution(algorithmId: string, parameters: any): Promise<any> {
  return {
    success: Math.random() > 0.3, // 70% success rate for experimental
    improvement: Math.random() * 0.4, // 0-40% improvement
    evolutionType: 'experimental',
    newCapabilities: ['experimental_feature_' + Date.now()],
    processingTime: 45000
  }
}

async function recordEvolutionTrigger(record: any): Promise<void> {
  console.log('Recording evolution trigger:', record)
  // In practice, this would save to database
} 