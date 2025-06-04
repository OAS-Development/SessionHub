// app/api/analytics/overview/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { advancedAnalyticsEngine, AnalyticsTimeframe } from '@/lib/analytics'

export const runtime = 'nodejs'

// Analytics overview endpoint
export async function GET(request: NextRequest) {
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
    const timeframe = searchParams.get('timeframe') as keyof typeof AnalyticsTimeframe || 'MEDIUM_TERM'
    const includeInsights = searchParams.get('insights') === 'true'
    const includeBaselines = searchParams.get('baselines') === 'true'

    // Validate timeframe
    if (!Object.keys(AnalyticsTimeframe).includes(timeframe)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid timeframe. Must be one of: REALTIME, SHORT_TERM, MEDIUM_TERM, LONG_TERM'
      }, { status: 400 })
    }

    // Get system metrics
    const [systemMetrics, alerts] = await Promise.all([
      advancedAnalyticsEngine.getSystemMetrics(timeframe),
      advancedAnalyticsEngine.generateAlerts(await advancedAnalyticsEngine.getSystemMetrics('REALTIME'))
    ])

    // Get optional data based on query parameters
    const [insights, baselines] = await Promise.all([
      includeInsights ? advancedAnalyticsEngine.generatePredictiveInsights(systemMetrics) : Promise.resolve([]),
      includeBaselines ? advancedAnalyticsEngine.getPerformanceBaselines() : Promise.resolve([])
    ])

    // Track analytics usage
    await advancedAnalyticsEngine.trackAnalyticsUsage(
      userId,
      'view_dashboard',
      {
        timeframe,
        includeInsights,
        includeBaselines,
        sessionId: request.headers.get('x-session-id') || 'unknown'
      }
    )

    const responseTime = Date.now() - startTime

    // Comprehensive analytics response
    const analyticsData = {
      timeframe,
      timestamp: new Date().toISOString(),
      
      // Core system metrics
      systemMetrics: {
        learning: {
          totalInstructions: systemMetrics.learning.totalInstructions,
          successRate: systemMetrics.learning.successRate,
          averageResponseTime: systemMetrics.learning.averageResponseTime,
          patternAccuracy: systemMetrics.learning.patternRecognitionAccuracy,
          userEngagement: systemMetrics.learning.userEngagementScore,
          adaptationRate: systemMetrics.learning.adaptationRate,
          contextualRelevance: systemMetrics.learning.contextualRelevance,
          improvements: systemMetrics.learning.improvements,
          predictions: systemMetrics.learning.predictions
        },
        cache: {
          hitRate: systemMetrics.cache.hitRate,
          missRate: systemMetrics.cache.missRate,
          averageResponseTime: systemMetrics.cache.averageResponseTime,
          totalOperations: systemMetrics.cache.totalOperations,
          errorRate: systemMetrics.cache.errorRate,
          memoryUsage: systemMetrics.cache.memoryUsage,
          evictionRate: systemMetrics.cache.evictionRate,
          hotKeys: systemMetrics.cache.hotKeys,
          performance: systemMetrics.cache.performance
        },
        files: {
          totalFiles: systemMetrics.files.totalFiles,
          totalSize: systemMetrics.files.totalSize,
          uploadSuccessRate: systemMetrics.files.uploadSuccessRate,
          averageUploadTime: systemMetrics.files.averageUploadTime,
          optimizationRate: systemMetrics.files.optimizationRate,
          storageEfficiency: systemMetrics.files.storageEfficiency,
          categoryDistribution: systemMetrics.files.categoryDistribution,
          accessPatterns: systemMetrics.files.accessPatterns,
          userBehavior: systemMetrics.files.userBehavior
        },
        database: {
          queryPerformance: systemMetrics.database.queryPerformance,
          connectionHealth: systemMetrics.database.connectionHealth,
          errorRate: systemMetrics.database.errorRate,
          dataConsistency: systemMetrics.database.dataConsistency,
          indexEfficiency: systemMetrics.database.indexEfficiency,
          storageUtilization: systemMetrics.database.storageUtilization
        }
      },

      // Cross-system correlations and health analysis
      correlations: {
        learningCacheCorrelation: systemMetrics.correlations.learningCacheCorrelation,
        fileUsageLearningCorrelation: systemMetrics.correlations.fileUsageLearningCorrelation,
        cachePerformanceFileCorrelation: systemMetrics.correlations.cachePerformanceFileCorrelation,
        overallSystemHealth: systemMetrics.correlations.overallSystemHealth,
        bottlenecks: systemMetrics.correlations.bottleneckAnalysis,
        optimizationOpportunities: systemMetrics.correlations.optimizationOpportunities
      },

      // Active alerts and issues
      alerts: {
        active: alerts.filter(alert => !alert.resolved),
        total: alerts.length,
        critical: alerts.filter(alert => alert.severity === 'critical').length,
        warnings: alerts.filter(alert => alert.severity === 'warning').length,
        summary: alerts.map(alert => ({
          id: alert.id,
          type: alert.type,
          severity: alert.severity,
          title: alert.title,
          system: alert.system,
          timestamp: alert.timestamp,
          actionRequired: alert.actionRequired
        }))
      },

      // Optional predictive insights
      ...(includeInsights && {
        insights: {
          predictions: insights,
          count: insights.length,
          highConfidence: insights.filter(insight => insight.confidence > 0.8),
          actionableRecommendations: insights.filter(insight => insight.impact !== 'neutral')
        }
      }),

      // Optional performance baselines
      ...(includeBaselines && {
        baselines: {
          metrics: baselines,
          improving: baselines.filter(baseline => baseline.trend === 'improving'),
          declining: baselines.filter(baseline => baseline.trend === 'declining'),
          stable: baselines.filter(baseline => baseline.trend === 'stable')
        }
      }),

      // Analytics summary
      summary: {
        overallHealthScore: systemMetrics.correlations.overallSystemHealth,
        systemStatus: getSystemStatus(systemMetrics.correlations.overallSystemHealth),
        keyMetrics: {
          cacheHitRate: `${(systemMetrics.cache.hitRate * 100).toFixed(1)}%`,
          learningSuccessRate: `${(systemMetrics.learning.successRate * 100).toFixed(1)}%`,
          fileUploadSuccessRate: `${(systemMetrics.files.uploadSuccessRate * 100).toFixed(1)}%`,
          averageResponseTime: `${systemMetrics.learning.averageResponseTime.toFixed(0)}ms`
        },
        trends: {
          performance: getPerformanceTrend(systemMetrics),
          capacity: getCapacityTrend(systemMetrics),
          reliability: getReliabilityTrend(systemMetrics)
        }
      },

      // Performance metadata
      _performance: {
        responseTime,
        cached: responseTime < 500,
        timestamp: new Date().toISOString(),
        timeframe,
        dataPoints: {
          learning: systemMetrics.learning.totalInstructions,
          cache: systemMetrics.cache.totalOperations,
          files: systemMetrics.files.totalFiles
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: analyticsData
    })

  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`Analytics API error after ${responseTime}ms:`, error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Analytics data processing failed',
        _performance: {
          responseTime,
          cached: false,
          error: true
        }
      }, 
      { status: 500 }
    )
  }
}

// Export data endpoint
export async function POST(request: NextRequest) {
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
    const { format = 'json', timeframe = 'MEDIUM_TERM', includeRawData = false } = body

    // Get comprehensive data
    const systemMetrics = await advancedAnalyticsEngine.getSystemMetrics(timeframe as keyof typeof AnalyticsTimeframe)
    const insights = await advancedAnalyticsEngine.generatePredictiveInsights(systemMetrics)
    const baselines = await advancedAnalyticsEngine.getPerformanceBaselines()

    // Track export usage
    await advancedAnalyticsEngine.trackAnalyticsUsage(
      userId,
      'export_data',
      {
        format,
        timeframe,
        includeRawData,
        sessionId: body.sessionId || 'unknown'
      }
    )

    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        timeframe,
        format,
        userId: userId.substring(0, 8) + '***', // Partially anonymized
        version: '1.0'
      },
      systemMetrics,
      insights,
      baselines,
      ...(includeRawData && {
        rawData: {
          note: 'Raw data would include detailed operation logs and metrics',
          available: true
        }
      })
    }

    const responseTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      data: exportData,
      _performance: {
        responseTime,
        dataSize: JSON.stringify(exportData).length,
        format
      }
    })

  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`Analytics export error after ${responseTime}ms:`, error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Analytics export failed',
        _performance: {
          responseTime,
          error: true
        }
      }, 
      { status: 500 }
    )
  }
}

// Helper functions
function getSystemStatus(healthScore: number): string {
  if (healthScore >= 0.9) return 'excellent'
  if (healthScore >= 0.8) return 'good'
  if (healthScore >= 0.7) return 'fair'
  if (healthScore >= 0.5) return 'poor'
  return 'critical'
}

function getPerformanceTrend(metrics: any): 'improving' | 'stable' | 'declining' {
  // Simplified trend analysis based on key metrics
  const cacheScore = metrics.cache.hitRate
  const learningScore = metrics.learning.successRate
  const fileScore = metrics.files.uploadSuccessRate

  const averageScore = (cacheScore + learningScore + fileScore) / 3

  if (averageScore > 0.85) return 'improving'
  if (averageScore < 0.75) return 'declining'
  return 'stable'
}

function getCapacityTrend(metrics: any): 'increasing' | 'stable' | 'decreasing' {
  // Analyze capacity utilization trends
  const memoryUsage = metrics.cache.memoryUsage
  const storageUsage = metrics.database.storageUtilization

  const averageUsage = (memoryUsage + storageUsage) / 2

  if (averageUsage > 0.8) return 'increasing'
  if (averageUsage < 0.6) return 'decreasing'
  return 'stable'
}

function getReliabilityTrend(metrics: any): 'improving' | 'stable' | 'declining' {
  // Assess system reliability based on error rates and success rates
  const cacheErrorRate = metrics.cache.errorRate
  const dbConnectionHealth = metrics.database.connectionHealth
  const fileSuccessRate = metrics.files.uploadSuccessRate

  const reliabilityScore = (1 - cacheErrorRate) * dbConnectionHealth * fileSuccessRate

  if (reliabilityScore > 0.9) return 'improving'
  if (reliabilityScore < 0.8) return 'declining'
  return 'stable'
}
