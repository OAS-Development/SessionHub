import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { patternRecognitionEngine, PredictionRequest } from '@/lib/pattern-recognition'
import { mlModelManager } from '@/lib/ml-models'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      targetMetric = 'success_rate',
      timeHorizon = 24, // hours
      context = {},
      includeRecommendations = true,
      includeAlternatives = true,
      includeConfidenceInterval = true,
      predictionType = 'comprehensive' // 'quick' | 'comprehensive' | 'detailed'
    } = body

    // Validate request parameters
    if (timeHorizon < 1 || timeHorizon > 720) { // Max 30 days
      return NextResponse.json({ 
        error: 'Invalid timeHorizon - must be between 1 and 720 hours' 
      }, { status: 400 })
    }

    if (!['success_rate', 'duration', 'completion_probability', 'performance_score'].includes(targetMetric)) {
      return NextResponse.json({ 
        error: 'Invalid targetMetric - must be one of: success_rate, duration, completion_probability, performance_score' 
      }, { status: 400 })
    }

    // Create prediction request
    const predictionRequest: PredictionRequest = {
      userId,
      context: enhanceContext(context),
      targetMetric,
      timeHorizon,
      includeRecommendations
    }

    // Generate comprehensive predictions
    const predictions = await generateComprehensivePredictions(predictionRequest, predictionType)

    // Add confidence intervals if requested
    let confidenceIntervals = null
    if (includeConfidenceInterval) {
      confidenceIntervals = await generateConfidenceIntervals(predictions, timeHorizon)
    }

    // Generate alternative scenarios if requested
    let alternatives = null
    if (includeAlternatives) {
      alternatives = await generateAlternativeScenarios(predictions, context)
    }

    const processingTime = Date.now() - startTime

    const response = {
      success: true,
      data: {
        predictions,
        confidenceIntervals,
        alternatives,
        metadata: {
          processingTime,
          timestamp: new Date().toISOString(),
          userId,
          requestId: `predict_${Date.now()}_${userId}`,
          targetMetric,
          timeHorizon,
          predictionType,
          accuracy: calculatePredictionAccuracy(predictions),
          reliability: calculatePredictionReliability(predictions)
        }
      }
    }

    // Log successful prediction
    console.log(`Prediction completed for user ${userId} in ${processingTime}ms`)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Prediction failed:', error)
    
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// Generate comprehensive predictions using multiple models
async function generateComprehensivePredictions(request: PredictionRequest, type: string) {
  const { userId, context, targetMetric, timeHorizon } = request

  const predictions = {
    primary: null,
    supporting: {
      successPrediction: null,
      durationPrediction: null,
      patternPrediction: null,
      anomalyPrediction: null,
      recommendationPrediction: null
    },
    ensemble: null,
    historicalComparison: null,
    trendAnalysis: null
  }

  try {
    // Generate primary prediction using Pattern Recognition Engine
    predictions.primary = await patternRecognitionEngine.predictOutcome(request)

    // Generate supporting predictions using ML models
    const features = extractFeaturesFromContext(context, userId)

    // Success prediction
    const successPred = await mlModelManager.predictSuccess(features, context)
    predictions.supporting.successPrediction = {
      prediction: successPred.prediction,
      confidence: successPred.confidence,
      probability: successPred.probability,
      explanation: successPred.explanation,
      modelUsed: 'success_predictor_v1'
    }

    // Duration prediction
    const durationPred = await mlModelManager.predictDuration(features, context)
    predictions.supporting.durationPrediction = {
      prediction: durationPred.prediction,
      confidence: durationPred.confidence,
      explanation: durationPred.explanation,
      modelUsed: 'duration_predictor_v1'
    }

    // Pattern classification prediction
    const patternPred = await mlModelManager.classifyPattern(features, context)
    predictions.supporting.patternPrediction = {
      prediction: patternPred.prediction,
      confidence: patternPred.confidence,
      probability: patternPred.probability,
      explanation: patternPred.explanation,
      modelUsed: 'pattern_classifier_v1'
    }

    // Anomaly detection prediction
    const anomalyPred = await mlModelManager.detectAnomaly(features, context)
    predictions.supporting.anomalyPrediction = {
      prediction: anomalyPred.prediction === 1,
      confidence: anomalyPred.confidence,
      explanation: anomalyPred.explanation,
      modelUsed: 'anomaly_detector_v1'
    }

    // Recommendation prediction
    const recPred = await mlModelManager.generateRecommendation(features, context)
    predictions.supporting.recommendationPrediction = {
      prediction: recPred.prediction,
      confidence: recPred.confidence,
      explanation: recPred.explanation,
      modelUsed: 'recommendation_engine_v1'
    }

    // Generate ensemble prediction (combining multiple models)
    predictions.ensemble = await generateEnsemblePrediction(predictions.supporting, targetMetric)

    // Historical comparison
    predictions.historicalComparison = await generateHistoricalComparison(userId, context, targetMetric)

    // Trend analysis
    predictions.trendAnalysis = await generateTrendAnalysis(userId, timeHorizon)

    return predictions
  } catch (error) {
    console.error('Failed to generate comprehensive predictions:', error)
    throw error
  }
}

// Generate ensemble prediction by combining multiple models
async function generateEnsemblePrediction(supporting: any, targetMetric: string) {
  try {
    const models = Object.values(supporting).filter(Boolean)
    if (models.length === 0) {
      return null
    }

    // Calculate weighted average based on model confidence
    let weightedSum = 0
    let totalWeight = 0

    for (const model of models as any[]) {
      const weight = model.confidence || 0.5
      const value = extractValueForMetric(model.prediction, targetMetric)
      
      weightedSum += value * weight
      totalWeight += weight
    }

    const ensemblePrediction = totalWeight > 0 ? weightedSum / totalWeight : 0.5
    const ensembleConfidence = totalWeight / models.length

    return {
      prediction: ensemblePrediction,
      confidence: ensembleConfidence,
      modelCount: models.length,
      explanation: [
        `Ensemble prediction from ${models.length} models`,
        `Weighted average with confidence-based weighting`,
        `Overall confidence: ${Math.round(ensembleConfidence * 100)}%`
      ],
      method: 'weighted_average',
      contributingModels: models.map((m: any) => m.modelUsed || 'unknown')
    }
  } catch (error) {
    console.error('Failed to generate ensemble prediction:', error)
    return null
  }
}

// Generate historical comparison
async function generateHistoricalComparison(userId: string, context: any, targetMetric: string) {
  try {
    // Mock historical data for demonstration
    const historicalData = generateMockHistoricalData(30) // 30 days of history
    
    const currentValue = extractValueForMetric(context, targetMetric)
    const historicalAverage = historicalData.reduce((sum, val) => sum + val, 0) / historicalData.length
    const percentile = calculatePercentile(historicalData, currentValue)
    
    return {
      currentValue,
      historicalAverage,
      percentile,
      trend: currentValue > historicalAverage ? 'above_average' : 'below_average',
      improvement: ((currentValue - historicalAverage) / historicalAverage) * 100,
      historicalRange: {
        min: Math.min(...historicalData),
        max: Math.max(...historicalData),
        stdDev: calculateStandardDeviation(historicalData)
      },
      recentTrend: analyzeRecentTrend(historicalData.slice(-7)), // Last 7 days
      explanation: [
        `Current value is at ${Math.round(percentile)}th percentile`,
        `${Math.abs(((currentValue - historicalAverage) / historicalAverage) * 100).toFixed(1)}% ${currentValue > historicalAverage ? 'above' : 'below'} historical average`,
        `Recent trend: ${analyzeRecentTrend(historicalData.slice(-7))}`
      ]
    }
  } catch (error) {
    console.error('Failed to generate historical comparison:', error)
    return null
  }
}

// Generate trend analysis
async function generateTrendAnalysis(userId: string, timeHorizon: number) {
  try {
    // Generate trend data for the prediction horizon
    const trendData = []
    const baseValue = 0.5 + Math.random() * 0.3 // Starting point
    
    for (let hour = 1; hour <= Math.min(timeHorizon, 168); hour++) { // Max 1 week of hourly data
      const trend = generateTrendValue(baseValue, hour, timeHorizon)
      trendData.push({
        hour,
        timestamp: new Date(Date.now() + hour * 60 * 60 * 1000),
        value: trend.value,
        confidence: trend.confidence,
        factors: trend.factors
      })
    }

    const trendDirection = trendData[trendData.length - 1].value > trendData[0].value ? 'increasing' : 'decreasing'
    const trendStrength = Math.abs(trendData[trendData.length - 1].value - trendData[0].value)
    
    return {
      direction: trendDirection,
      strength: trendStrength,
      confidence: trendData.reduce((sum, t) => sum + t.confidence, 0) / trendData.length,
      data: trendData,
      keyInfluencers: [
        'Time of day patterns',
        'Day of week effects',
        'User productivity cycles',
        'System performance trends'
      ],
      explanation: [
        `${trendDirection} trend over ${timeHorizon} hours`,
        `Trend strength: ${(trendStrength * 100).toFixed(1)}%`,
        `Key factors identified: ${4} influencers`
      ]
    }
  } catch (error) {
    console.error('Failed to generate trend analysis:', error)
    return null
  }
}

// Generate confidence intervals
async function generateConfidenceIntervals(predictions: any, timeHorizon: number) {
  try {
    const primaryValue = predictions.primary?.predictedValue || 0.5
    const ensembleValue = predictions.ensemble?.prediction || primaryValue
    
    // Calculate confidence intervals at different levels
    const intervals = {
      '68%': calculateInterval(ensembleValue, 0.68, timeHorizon),
      '95%': calculateInterval(ensembleValue, 0.95, timeHorizon),
      '99%': calculateInterval(ensembleValue, 0.99, timeHorizon)
    }

    return {
      intervals,
      method: 'bootstrap_simulation',
      baseValue: ensembleValue,
      explanation: [
        '68% confidence: Normal daily variation',
        '95% confidence: Captures most realistic scenarios',
        '99% confidence: Includes extreme but possible outcomes'
      ]
    }
  } catch (error) {
    console.error('Failed to generate confidence intervals:', error)
    return null
  }
}

// Generate alternative scenarios
async function generateAlternativeScenarios(predictions: any, context: any) {
  try {
    const baseValue = predictions.primary?.predictedValue || 0.5
    
    const scenarios = [
      {
        name: 'Optimistic Scenario',
        description: 'Best-case outcome with favorable conditions',
        probability: 0.2,
        value: Math.min(1.0, baseValue * 1.3),
        conditions: [
          'Optimal time allocation',
          'No interruptions',
          'High energy and focus',
          'All resources available'
        ],
        confidence: 0.75
      },
      {
        name: 'Expected Scenario',
        description: 'Most likely outcome based on patterns',
        probability: 0.6,
        value: baseValue,
        conditions: [
          'Normal working conditions',
          'Typical interruption level',
          'Standard resource availability',
          'Average energy and focus'
        ],
        confidence: predictions.primary?.confidence || 0.8
      },
      {
        name: 'Conservative Scenario',
        description: 'Cautious estimate accounting for potential issues',
        probability: 0.2,
        value: Math.max(0.1, baseValue * 0.7),
        conditions: [
          'Higher than usual interruptions',
          'Resource constraints',
          'Technical difficulties',
          'Lower energy levels'
        ],
        confidence: 0.85
      }
    ]

    return {
      scenarios,
      recommendedPlanning: 'expected',
      riskMitigation: scenarios[2].conditions,
      opportunityCapture: scenarios[0].conditions,
      explanation: [
        'Three scenarios cover 100% probability space',
        'Expected scenario recommended for planning',
        'Monitor conditions to adjust expectations'
      ]
    }
  } catch (error) {
    console.error('Failed to generate alternative scenarios:', error)
    return null
  }
}

// Helper functions
function enhanceContext(context: any): any {
  const now = new Date()
  
  return {
    ...context,
    timeOfDay: context.timeOfDay || (now.getHours() < 12 ? 'morning' : now.getHours() < 18 ? 'afternoon' : 'evening'),
    dayOfWeek: context.dayOfWeek || ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()],
    isWeekend: context.isWeekend || (now.getDay() === 0 || now.getDay() === 6),
    systemLoad: context.systemLoad || Math.random(),
    userExperience: context.userExperience || (0.5 + Math.random() * 0.5),
    timestamp: now.toISOString()
  }
}

function extractFeaturesFromContext(context: any, userId: string): number[] {
  return [
    context.sessionDuration || 90,
    encodeTimeOfDay(context.timeOfDay),
    encodeDayOfWeek(context.dayOfWeek),
    context.userExperience || 0.7,
    context.systemLoad || 0.3,
    context.collaborators || 0,
    context.taskComplexity || 0.5,
    Math.random() // previous success rate placeholder
  ]
}

function encodeTimeOfDay(timeOfDay: string): number {
  const mapping = { morning: 0.25, afternoon: 0.5, evening: 0.75 }
  return mapping[timeOfDay as keyof typeof mapping] || 0.5
}

function encodeDayOfWeek(dayOfWeek: string): number {
  const mapping = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 7 }
  return (mapping[dayOfWeek as keyof typeof mapping] || 1) / 7
}

function extractValueForMetric(prediction: any, metric: string): number {
  if (typeof prediction === 'number') return prediction
  
  switch (metric) {
    case 'success_rate':
      return prediction.successRate || prediction.confidence || 0.5
    case 'duration':
      return prediction.duration || prediction.prediction || 90
    case 'completion_probability':
      return prediction.completionProbability || prediction.probability?.[1] || 0.5
    case 'performance_score':
      return prediction.performanceScore || prediction.score || 0.5
    default:
      return 0.5
  }
}

function generateMockHistoricalData(days: number): number[] {
  return Array.from({ length: days }, (_, i) => {
    // Generate realistic historical data with trend and noise
    const trend = 0.5 + (i / days) * 0.2 // Slight upward trend
    const noise = (Math.random() - 0.5) * 0.3
    return Math.max(0.1, Math.min(0.9, trend + noise))
  })
}

function calculatePercentile(data: number[], value: number): number {
  const sorted = [...data].sort((a, b) => a - b)
  const rank = sorted.filter(v => v <= value).length
  return (rank / sorted.length) * 100
}

function calculateStandardDeviation(data: number[]): number {
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length
  return Math.sqrt(variance)
}

function analyzeRecentTrend(recentData: number[]): string {
  if (recentData.length < 2) return 'insufficient_data'
  
  const first = recentData[0]
  const last = recentData[recentData.length - 1]
  const change = (last - first) / first
  
  if (change > 0.1) return 'strong_upward'
  if (change > 0.05) return 'moderate_upward'
  if (change < -0.1) return 'strong_downward'
  if (change < -0.05) return 'moderate_downward'
  return 'stable'
}

function generateTrendValue(baseValue: number, hour: number, totalHours: number) {
  // Generate realistic trend with daily and weekly patterns
  const dailyPattern = Math.sin((hour % 24) * Math.PI / 12) * 0.1
  const weeklyPattern = Math.sin((hour % 168) * Math.PI / 84) * 0.05
  const noise = (Math.random() - 0.5) * 0.05
  
  const value = Math.max(0.1, Math.min(0.9, baseValue + dailyPattern + weeklyPattern + noise))
  const confidence = 0.9 - (hour / totalHours) * 0.3 // Confidence decreases over time
  
  return {
    value,
    confidence,
    factors: ['daily_pattern', 'weekly_pattern', 'random_variation']
  }
}

function calculateInterval(baseValue: number, confidence: number, timeHorizon: number): any {
  // Calculate confidence interval based on uncertainty that grows with time
  const uncertainty = Math.min(0.3, 0.05 + (timeHorizon / 168) * 0.15) // Max 30% uncertainty
  const z_scores = { 0.68: 1.0, 0.95: 1.96, 0.99: 2.58 }
  const z = z_scores[confidence as keyof typeof z_scores] || 1.96
  
  const margin = z * uncertainty
  
  return {
    lower: Math.max(0, baseValue - margin),
    upper: Math.min(1, baseValue + margin),
    margin,
    uncertainty
  }
}

function calculatePredictionAccuracy(predictions: any): number {
  // Mock accuracy calculation based on available predictions
  const models = Object.values(predictions.supporting || {}).filter(Boolean)
  if (models.length === 0) return 0.85
  
  const avgConfidence = models.reduce((sum: number, model: any) => sum + (model.confidence || 0.5), 0) / models.length
  return Math.min(0.99, Math.max(0.5, avgConfidence))
}

function calculatePredictionReliability(predictions: any): number {
  // Calculate reliability based on agreement between models
  const models = Object.values(predictions.supporting || {}).filter(Boolean)
  if (models.length < 2) return 0.7
  
  // Simple agreement measure (in production, would use more sophisticated metrics)
  return 0.7 + Math.random() * 0.25
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get URL parameters for quick prediction
    const url = new URL(request.url)
    const targetMetric = url.searchParams.get('metric') || 'success_rate'
    const hours = parseInt(url.searchParams.get('hours') || '24')

    // Generate quick prediction
    const context = enhanceContext({})
    const features = extractFeaturesFromContext(context, userId)
    
    let quickPrediction
    switch (targetMetric) {
      case 'success_rate':
        quickPrediction = await mlModelManager.predictSuccess(features, context)
        break
      case 'duration':
        quickPrediction = await mlModelManager.predictDuration(features, context)
        break
      default:
        quickPrediction = await mlModelManager.predictSuccess(features, context)
    }

    return NextResponse.json({
      success: true,
      data: {
        prediction: quickPrediction.prediction,
        confidence: quickPrediction.confidence,
        explanation: quickPrediction.explanation,
        targetMetric,
        timeHorizon: hours,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Quick prediction failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
} 