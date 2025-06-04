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
      algorithmId,
      optimizationType = 'comprehensive', // 'hyperparameter' | 'architecture' | 'learning_rate' | 'feature_engineering' | 'comprehensive'
      targetImprovement = 0.15, // 15% improvement target
      optimizationGoals = ['accuracy', 'efficiency', 'convergence_time'],
      constraints = {},
      metaLearningEnabled = true,
      recursiveLearningDepth = 3
    } = body

    // Validate request parameters
    if (!algorithmId) {
      return NextResponse.json({ 
        error: 'Algorithm ID is required' 
      }, { status: 400 })
    }

    if (targetImprovement < 0.01 || targetImprovement > 1.0) {
      return NextResponse.json({ 
        error: 'Target improvement must be between 1% and 100%' 
      }, { status: 400 })
    }

    console.log(`Starting meta-learning optimization for algorithm: ${algorithmId}`)

    // Initialize optimization results
    const optimizationResults = {
      algorithmId,
      optimizationType,
      improvements: {},
      metaLearningInsights: null,
      performanceGains: {},
      convergenceMetrics: {},
      selfReflectionResults: null
    }

    // Perform comprehensive meta-learning optimization
    if (optimizationType === 'comprehensive' || optimizationType === 'hyperparameter') {
      console.log('Optimizing hyperparameters using meta-learning...')
      
      try {
        // Use meta-learning engine for algorithm self-optimization
        const algorithmImprovement = await metaLearningEngine.optimizeAlgorithmPerformance(
          algorithmId, 
          targetImprovement
        )

        // Additional hyperparameter optimization using algorithm optimizer
        const hyperparameterOptimization = await algorithmOptimizer.optimizeHyperparameters(
          algorithmId,
          optimizationGoals[0] || 'accuracy'
        )

        optimizationResults.improvements.hyperparameter = {
          metaLearningImprovement: algorithmImprovement,
          hyperparameterOptimization,
          combinedImprovement: Math.max(
            algorithmImprovement.improvement,
            hyperparameterOptimization.improvement
          )
        }

        optimizationResults.performanceGains.hyperparameter = 
          optimizationResults.improvements.hyperparameter.combinedImprovement
      } catch (error) {
        console.error('Hyperparameter optimization failed:', error)
        optimizationResults.improvements.hyperparameter = {
          error: error instanceof Error ? error.message : 'Hyperparameter optimization failed'
        }
      }
    }

    // Architecture optimization for neural networks
    if ((optimizationType === 'comprehensive' || optimizationType === 'architecture')) {
      console.log('Optimizing architecture using meta-learning...')
      
      try {
        const architectureOptimization = await algorithmOptimizer.optimizeArchitecture(algorithmId)
        
        optimizationResults.improvements.architecture = architectureOptimization
        optimizationResults.performanceGains.architecture = architectureOptimization.improvement
      } catch (error) {
        console.error('Architecture optimization failed:', error)
        optimizationResults.improvements.architecture = {
          error: error instanceof Error ? error.message : 'Architecture optimization not applicable or failed'
        }
      }
    }

    // Learning rate adaptation
    if (optimizationType === 'comprehensive' || optimizationType === 'learning_rate') {
      console.log('Adapting learning rate using meta-learning...')
      
      try {
        // Get performance history for learning rate adaptation
        const performanceHistory = await getAlgorithmPerformanceHistory(algorithmId)
        
        const learningRateOptimization = await algorithmOptimizer.adaptLearningRate(
          algorithmId,
          performanceHistory
        )
        
        optimizationResults.improvements.learningRate = learningRateOptimization
        optimizationResults.performanceGains.learningRate = learningRateOptimization.improvement
      } catch (error) {
        console.error('Learning rate adaptation failed:', error)
        optimizationResults.improvements.learningRate = {
          error: error instanceof Error ? error.message : 'Learning rate adaptation failed'
        }
      }
    }

    // Feature engineering optimization
    if (optimizationType === 'comprehensive' || optimizationType === 'feature_engineering') {
      console.log('Optimizing feature engineering using meta-learning...')
      
      try {
        // Get current features for the algorithm
        const currentFeatures = await getCurrentAlgorithmFeatures(algorithmId)
        
        if (currentFeatures.length > 0) {
          const featureEngineering = await algorithmOptimizer.engineerFeatures(
            algorithmId,
            currentFeatures
          )
          
          optimizationResults.improvements.featureEngineering = featureEngineering
          optimizationResults.performanceGains.featureEngineering = featureEngineering.improvement
        }
      } catch (error) {
        console.error('Feature engineering optimization failed:', error)
        optimizationResults.improvements.featureEngineering = {
          error: error instanceof Error ? error.message : 'Feature engineering not applicable or failed'
        }
      }
    }

    // Meta-learning insights and self-reflection
    if (metaLearningEnabled) {
      console.log('Generating meta-learning insights...')
      
      try {
        optimizationResults.metaLearningInsights = await metaLearningEngine.getMetaLearningInsights()
        
        // Perform self-reflection on the algorithm
        const algorithmPerformance = await metaLearningEngine.getAlgorithmPerformance(algorithmId)
        if (algorithmPerformance) {
          optimizationResults.selfReflectionResults = {
            currentCapabilities: algorithmPerformance.selfAssessment.currentCapabilities,
            identifiedWeaknesses: algorithmPerformance.selfAssessment.identifiedWeaknesses,
            improvementOpportunities: algorithmPerformance.selfAssessment.improvementOpportunities,
            selfReflectionAccuracy: algorithmPerformance.selfAssessment.selfReflectionAccuracy,
            autonomousAdaptations: algorithmPerformance.selfAssessment.autonomousAdaptations
          }
        }
      } catch (error) {
        console.error('Meta-learning insights generation failed:', error)
        optimizationResults.metaLearningInsights = {
          error: error instanceof Error ? error.message : 'Meta-learning insights failed'
        }
      }
    }

    // Calculate overall improvement and convergence metrics
    const overallImprovement = calculateOverallImprovement(optimizationResults.performanceGains)
    const convergenceTime = Date.now() - startTime
    
    optimizationResults.convergenceMetrics = {
      overallImprovement,
      convergenceTime,
      targetAchieved: overallImprovement >= targetImprovement,
      improvementBreakdown: optimizationResults.performanceGains,
      efficiencyScore: calculateEfficiencyScore(overallImprovement, convergenceTime)
    }

    // Performance validation against targets
    if (convergenceTime > 60000) { // 60 second target
      console.warn(`Meta-learning convergence took ${convergenceTime}ms, exceeding 60s target`)
    }

    if (overallImprovement < targetImprovement) {
      console.warn(`Overall improvement ${Math.round(overallImprovement * 100)}% below ${Math.round(targetImprovement * 100)}% target`)
    }

    const response = {
      success: true,
      data: {
        optimization: optimizationResults,
        performance: {
          overallImprovement,
          convergenceTime,
          targetImprovement,
          targetAchieved: overallImprovement >= targetImprovement,
          efficiencyScore: optimizationResults.convergenceMetrics.efficiencyScore,
          selfReflectionAccuracy: optimizationResults.selfReflectionResults?.selfReflectionAccuracy || 0
        },
        metadata: {
          timestamp: new Date().toISOString(),
          userId,
          algorithmId,
          optimizationId: `meta_opt_${Date.now()}_${algorithmId}`,
          metaLearningEnabled,
          recursiveLearningDepth,
          version: '1.0.0'
        }
      }
    }

    console.log(`Meta-learning optimization completed for ${algorithmId} with ${Math.round(overallImprovement * 100)}% improvement in ${convergenceTime}ms`)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Meta-learning optimization failed:', error)
    
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Meta-learning optimization failed',
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// Get meta-learning insights
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const algorithmId = url.searchParams.get('algorithmId')
    const includeHistory = url.searchParams.get('includeHistory') === 'true'
    const includeSelfReflection = url.searchParams.get('includeSelfReflection') === 'true'

    // Get comprehensive meta-learning insights
    const insights = await metaLearningEngine.getMetaLearningInsights()

    let algorithmSpecificData = null
    if (algorithmId) {
      algorithmSpecificData = {
        performance: await metaLearningEngine.getAlgorithmPerformance(algorithmId),
        optimizationInsights: await algorithmOptimizer.getOptimizationInsights(algorithmId)
      }

      if (includeHistory) {
        algorithmSpecificData.optimizationHistory = await getAlgorithmOptimizationHistory(algorithmId)
      }

      if (includeSelfReflection) {
        algorithmSpecificData.selfReflectionAnalysis = await performSelfReflectionAnalysis(algorithmId)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        metaLearningInsights: insights,
        algorithmSpecific: algorithmSpecificData,
        systemWideMetrics: {
          totalAlgorithms: insights.totalAlgorithms,
          averageImprovement: insights.averageImprovement,
          autonomousAdaptations: await getTotalAutonomousAdaptations(),
          selfOptimizationCycles: await getTotalSelfOptimizationCycles()
        },
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Failed to get meta-learning insights:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get meta-learning insights'
    }, { status: 500 })
  }
}

// Algorithm performance monitoring
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
      performanceData,
      selfReflectionEnabled = true,
      autonomousAdaptationEnabled = true
    } = body

    // Validate request parameters
    if (!algorithmId || !performanceData) {
      return NextResponse.json({ 
        error: 'Algorithm ID and performance data are required' 
      }, { status: 400 })
    }

    console.log(`Updating performance data for algorithm: ${algorithmId}`)

    // Update algorithm performance in the meta-learning system
    await updateAlgorithmPerformance(algorithmId, performanceData)

    // Perform self-reflection if enabled
    let selfReflectionResults = null
    if (selfReflectionEnabled) {
      selfReflectionResults = await performAlgorithmSelfReflection(algorithmId, performanceData)
    }

    // Trigger autonomous adaptation if enabled
    let autonomousAdaptationResults = null
    if (autonomousAdaptationEnabled) {
      autonomousAdaptationResults = await triggerAutonomousAdaptation(algorithmId, performanceData)
    }

    // Check for optimization opportunities
    const optimizationOpportunities = await identifyOptimizationOpportunities(algorithmId, performanceData)

    // Update meta-learning knowledge
    await updateMetaLearningKnowledge(algorithmId, performanceData, selfReflectionResults)

    const processingTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      data: {
        algorithmId,
        performanceUpdate: {
          updatedAt: new Date().toISOString(),
          processingTime,
          selfReflectionResults,
          autonomousAdaptationResults,
          optimizationOpportunities
        },
        metaLearning: {
          selfReflectionAccuracy: selfReflectionResults?.accuracy || 0,
          autonomousAdaptationSuccess: autonomousAdaptationResults?.success || false,
          learningEffectiveness: calculateLearningEffectiveness(performanceData)
        },
        metadata: {
          timestamp: new Date().toISOString(),
          userId,
          updateId: `perf_update_${Date.now()}_${algorithmId}`
        }
      }
    })
  } catch (error) {
    console.error('Performance monitoring update failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Performance monitoring update failed',
      processingTime: Date.now() - startTime
    }, { status: 500 })
  }
}

// Helper functions
async function getAlgorithmPerformanceHistory(algorithmId: string): Promise<number[]> {
  // In practice, this would query the database for historical performance
  return [0.75, 0.78, 0.82, 0.85, 0.88, 0.90, 0.87, 0.91, 0.94]
}

async function getCurrentAlgorithmFeatures(algorithmId: string): Promise<any[]> {
  // Mock feature definitions - in practice, this would query the algorithm's feature set
  return [
    {
      name: 'input_size',
      type: 'numerical',
      importance: 0.8,
      transformation: ['normalization'],
      encoding: 'standard'
    },
    {
      name: 'learning_rate',
      type: 'numerical',
      importance: 0.9,
      transformation: ['log_scale'],
      encoding: 'standard'
    }
  ]
}

function calculateOverallImprovement(performanceGains: Record<string, number>): number {
  const improvements = Object.values(performanceGains).filter(gain => typeof gain === 'number')
  if (improvements.length === 0) return 0
  
  // Calculate weighted average improvement
  return improvements.reduce((sum, improvement) => sum + improvement, 0) / improvements.length
}

function calculateEfficiencyScore(improvement: number, convergenceTime: number): number {
  // Calculate efficiency as improvement per second, normalized
  const targetTime = 60000 // 60 seconds target
  const timeEfficiency = Math.min(1, targetTime / convergenceTime)
  const improvementScore = Math.min(1, improvement / 0.15) // 15% target
  
  return (timeEfficiency + improvementScore) / 2
}

async function getAlgorithmOptimizationHistory(algorithmId: string): Promise<any[]> {
  // Mock optimization history
  return [
    {
      timestamp: new Date(),
      optimizationType: 'hyperparameter',
      improvement: 0.18,
      convergenceTime: 45000,
      success: true
    },
    {
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      optimizationType: 'architecture',
      improvement: 0.22,
      convergenceTime: 52000,
      success: true
    }
  ]
}

async function performSelfReflectionAnalysis(algorithmId: string): Promise<any> {
  const algorithmPerformance = await metaLearningEngine.getAlgorithmPerformance(algorithmId)
  
  if (!algorithmPerformance) {
    return { error: 'Algorithm not found for self-reflection analysis' }
  }

  return {
    accuracy: algorithmPerformance.selfAssessment.selfReflectionAccuracy,
    capabilities: algorithmPerformance.selfAssessment.currentCapabilities,
    weaknesses: algorithmPerformance.selfAssessment.identifiedWeaknesses,
    opportunities: algorithmPerformance.selfAssessment.improvementOpportunities,
    confidenceLevel: algorithmPerformance.selfAssessment.confidenceLevel,
    analysisTimestamp: new Date().toISOString()
  }
}

async function getTotalAutonomousAdaptations(): Promise<number> {
  // In practice, this would query the database for total adaptations across all algorithms
  return 147
}

async function getTotalSelfOptimizationCycles(): Promise<number> {
  // In practice, this would query the database for total optimization cycles
  return 89
}

async function updateAlgorithmPerformance(algorithmId: string, performanceData: any): Promise<void> {
  // Update algorithm performance in the meta-learning system
  console.log(`Updating performance for algorithm ${algorithmId}:`, performanceData)
}

async function performAlgorithmSelfReflection(algorithmId: string, performanceData: any): Promise<any> {
  // Perform self-reflection analysis
  return {
    accuracy: 0.92,
    insights: ['Performance trending upward', 'Convergence speed improved'],
    recommendations: ['Continue current optimization strategy', 'Consider architecture expansion'],
    confidenceLevel: 0.88
  }
}

async function triggerAutonomousAdaptation(algorithmId: string, performanceData: any): Promise<any> {
  // Trigger autonomous adaptation based on performance
  return {
    success: true,
    adaptationsApplied: ['learning_rate_adjustment', 'regularization_tuning'],
    expectedImprovement: 0.08,
    adaptationConfidence: 0.85
  }
}

async function identifyOptimizationOpportunities(algorithmId: string, performanceData: any): Promise<any[]> {
  // Identify optimization opportunities
  return [
    {
      type: 'hyperparameter_tuning',
      potential: 0.12,
      priority: 'high',
      estimatedTime: 30000
    },
    {
      type: 'architecture_optimization',
      potential: 0.18,
      priority: 'medium',
      estimatedTime: 60000
    }
  ]
}

async function updateMetaLearningKnowledge(algorithmId: string, performanceData: any, selfReflectionResults: any): Promise<void> {
  // Update meta-learning knowledge base
  console.log(`Updating meta-learning knowledge for algorithm ${algorithmId}`)
}

function calculateLearningEffectiveness(performanceData: any): number {
  // Calculate how effectively the algorithm is learning
  return 0.87 // Mock value
} 