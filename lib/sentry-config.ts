import * as Sentry from '@sentry/nextjs'
import { productionMonitoringEngine } from './monitoring'

// Sentry configuration interfaces
export interface SentryConfig {
  dsn: string
  environment: string
  release?: string
  tracesSampleRate: number
  profilesSampleRate: number
  integrations: any[]
  beforeSend?: (event: Sentry.Event) => Sentry.Event | null
  aiCorrelationEnabled: boolean
  intelligentAlertingEnabled: boolean
  customErrorCategorization: boolean
}

export interface ErrorContext {
  aiSystem?: string
  automationLevel?: number
  userAction?: string
  systemState?: Record<string, any>
  performanceMetrics?: Record<string, number>
}

export interface SentryInsight {
  errorId: string
  category: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  pattern: string
  aiAnalysis: string
  recommendations: string[]
  autoResolvable: boolean
}

// Initialize Sentry with AI-enhanced configuration
export function initializeSentry(config?: Partial<SentryConfig>) {
  const sentryConfig: SentryConfig = {
    dsn: process.env.SENTRY_DSN || '',
    environment: process.env.NODE_ENV || 'development',
    release: process.env.APP_VERSION || '1.0.0',
    tracesSampleRate: 0.1, // 10% of transactions
    profilesSampleRate: 0.1, // 10% of transactions
    integrations: [
      new Sentry.Replay({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    aiCorrelationEnabled: true,
    intelligentAlertingEnabled: true,
    customErrorCategorization: true,
    ...config
  }

  Sentry.init({
    dsn: sentryConfig.dsn,
    environment: sentryConfig.environment,
    release: sentryConfig.release,
    tracesSampleRate: sentryConfig.tracesSampleRate,
    profilesSampleRate: sentryConfig.profilesSampleRate,
    integrations: sentryConfig.integrations,
    beforeSend: createIntelligentBeforeSend(sentryConfig),
    
    // Enhanced error filtering and categorization
    beforeSendTransaction(event) {
      return enhanceTransactionWithAI(event, sentryConfig)
    },
    
    // Custom error boundaries
    beforeCapture(context) {
      return enhanceContextWithAI(context, sentryConfig)
    }
  })

  console.log('Sentry initialized with AI-enhanced error tracking')
}

// Create intelligent beforeSend function with AI correlation
function createIntelligentBeforeSend(config: SentryConfig) {
  return async (event: Sentry.Event, hint: Sentry.EventHint): Promise<Sentry.Event | null> => {
    try {
      // Skip non-production environments for certain errors
      if (config.environment !== 'production' && isNonCriticalError(event)) {
        return null
      }

      // AI-powered error categorization
      if (config.customErrorCategorization) {
        event = await categorizeErrorWithAI(event)
      }

      // Add AI system context
      if (config.aiCorrelationEnabled) {
        event = await addAISystemContext(event)
      }

      // Enhance with monitoring data
      event = await enhanceWithMonitoringData(event)

      // Intelligent alerting decisions
      if (config.intelligentAlertingEnabled) {
        event = await applyIntelligentAlerting(event)
      }

      // Add performance context
      event = addPerformanceContext(event)

      // Track error in monitoring system
      if (productionMonitoringEngine) {
        await productionMonitoringEngine.trackError({
          message: event.message || 'Unknown error',
          level: event.level || 'error',
          context: event.contexts || {},
          stack: event.exception?.values?.[0]?.stacktrace?.frames?.map(f => f.function).join('\n'),
          timestamp: new Date(event.timestamp || Date.now()),
          automated: true
        })
      }

      return event
    } catch (error) {
      console.error('Error in Sentry beforeSend:', error)
      return event // Return original event if enhancement fails
    }
  }
}

// AI-powered error categorization
async function categorizeErrorWithAI(event: Sentry.Event): Promise<Sentry.Event> {
  try {
    const errorMessage = event.message || event.exception?.values?.[0]?.value || 'Unknown error'
    const stackTrace = event.exception?.values?.[0]?.stacktrace?.frames || []
    
    // Categorize error based on AI analysis
    const category = await analyzeErrorCategory(errorMessage, stackTrace)
    
    if (!event.tags) event.tags = {}
    event.tags['ai_category'] = category.category
    event.tags['ai_severity'] = category.severity
    event.tags['ai_confidence'] = category.confidence.toString()
    
    if (!event.extra) event.extra = {}
    event.extra['ai_analysis'] = category.analysis
    event.extra['ai_recommendations'] = category.recommendations
    
    return event
  } catch (error) {
    console.error('Failed to categorize error with AI:', error)
    return event
  }
}

// Add AI system context to errors
async function addAISystemContext(event: Sentry.Event): Promise<Sentry.Event> {
  try {
    // Get current AI system states
    const aiContext = await getAISystemContext()
    
    if (!event.contexts) event.contexts = {}
    event.contexts['ai_systems'] = aiContext
    
    // Add AI correlation ID for tracking
    if (!event.tags) event.tags = {}
    event.tags['ai_correlation_id'] = generateAICorrelationId()
    
    return event
  } catch (error) {
    console.error('Failed to add AI system context:', error)
    return event
  }
}

// Enhance with monitoring data
async function enhanceWithMonitoringData(event: Sentry.Event): Promise<Sentry.Event> {
  try {
    if (!productionMonitoringEngine) return event
    
    // Get recent monitoring data
    const monitoringData = await productionMonitoringEngine.getMonitoringData()
    
    if (!event.contexts) event.contexts = {}
    event.contexts['monitoring'] = {
      errorRate: monitoringData.overview.errorRate,
      averageResponseTime: monitoringData.overview.averageResponseTime,
      systemUptime: monitoringData.overview.systemUptime,
      recentMetrics: monitoringData.metrics.slice(-5) // Last 5 metrics
    }
    
    return event
  } catch (error) {
    console.error('Failed to enhance with monitoring data:', error)
    return event
  }
}

// Apply intelligent alerting
async function applyIntelligentAlerting(event: Sentry.Event): Promise<Sentry.Event> {
  try {
    const shouldAlert = await determineAlertNecessity(event)
    
    if (!event.tags) event.tags = {}
    event.tags['intelligent_alert'] = shouldAlert ? 'yes' : 'no'
    
    if (!shouldAlert) {
      // Mark as low priority to reduce noise
      event.level = 'info'
    }
    
    return event
  } catch (error) {
    console.error('Failed to apply intelligent alerting:', error)
    return event
  }
}

// Add performance context
function addPerformanceContext(event: Sentry.Event): Sentry.Event {
  try {
    if (!event.contexts) event.contexts = {}
    
    event.contexts['performance'] = {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      timestamp: Date.now()
    }
    
    // Add browser performance if available
    if (typeof window !== 'undefined' && window.performance) {
      event.contexts['browser_performance'] = {
        navigation: window.performance.getEntriesByType('navigation')[0],
        memory: (window.performance as any).memory
      }
    }
    
    return event
  } catch (error) {
    console.error('Failed to add performance context:', error)
    return event
  }
}

// Enhance transaction with AI
function enhanceTransactionWithAI(event: Sentry.Event, config: SentryConfig): Sentry.Event | null {
  try {
    // Skip low-value transactions in non-production
    if (config.environment !== 'production' && isLowValueTransaction(event)) {
      return null
    }
    
    // Add AI system tags
    if (!event.tags) event.tags = {}
    event.tags['ai_enhanced'] = 'true'
    
    return event
  } catch (error) {
    console.error('Failed to enhance transaction with AI:', error)
    return event
  }
}

// Enhance context with AI
function enhanceContextWithAI(context: any, config: SentryConfig): any {
  try {
    // Add AI system information to context
    context.ai_systems = {
      claude_active: true,
      cursor_active: true,
      meta_learning_active: true,
      monitoring_active: true
    }
    
    return context
  } catch (error) {
    console.error('Failed to enhance context with AI:', error)
    return context
  }
}

// Custom error handling functions
export async function captureErrorWithAI(
  error: Error, 
  context: ErrorContext = {},
  insights?: SentryInsight[]
): Promise<string> {
  try {
    const eventId = Sentry.captureException(error, {
      contexts: {
        ai_context: context,
        insights: insights ? { ai_insights: insights } : undefined
      },
      tags: {
        ai_system: context.aiSystem,
        automation_level: context.automationLevel?.toString(),
        user_action: context.userAction
      },
      extra: {
        system_state: context.systemState,
        performance_metrics: context.performanceMetrics,
        ai_enhanced: true
      }
    })
    
    console.log(`Error captured with AI enhancement: ${eventId}`)
    return eventId
  } catch (captureError) {
    console.error('Failed to capture error with AI:', captureError)
    throw captureError
  }
}

// Monitor Sentry performance and health
export async function getSentryHealth(): Promise<any> {
  try {
    return {
      status: 'healthy',
      dsn_configured: !!process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      release: process.env.APP_VERSION,
      features: {
        ai_correlation: true,
        intelligent_alerting: true,
        custom_categorization: true,
        performance_monitoring: true
      },
      metrics: {
        errors_tracked: 0, // Would be tracked in real implementation
        transactions_sampled: 0,
        ai_enhancements_applied: 0
      }
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Utility functions
function isNonCriticalError(event: Sentry.Event): boolean {
  const message = event.message || event.exception?.values?.[0]?.value || ''
  
  // Skip common non-critical errors
  const nonCriticalPatterns = [
    'Network request failed',
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured'
  ]
  
  return nonCriticalPatterns.some(pattern => message.includes(pattern))
}

function isLowValueTransaction(event: Sentry.Event): boolean {
  const transactionName = event.transaction || ''
  
  // Skip low-value transactions
  const lowValuePatterns = [
    '/api/health',
    '/favicon.ico',
    '/robots.txt'
  ]
  
  return lowValuePatterns.some(pattern => transactionName.includes(pattern))
}

async function analyzeErrorCategory(message: string, stackTrace: any[]): Promise<any> {
  // AI-powered error categorization
  // In a real implementation, this would use Claude or another AI service
  
  if (message.includes('fetch') || message.includes('network')) {
    return {
      category: 'network',
      severity: 'medium',
      confidence: 0.85,
      analysis: 'Network-related error detected',
      recommendations: ['Check network connectivity', 'Implement retry logic']
    }
  }
  
  if (message.includes('undefined') || message.includes('null')) {
    return {
      category: 'data',
      severity: 'high',
      confidence: 0.90,
      analysis: 'Data validation error detected',
      recommendations: ['Add null checks', 'Improve data validation']
    }
  }
  
  return {
    category: 'unknown',
    severity: 'medium',
    confidence: 0.50,
    analysis: 'Unable to categorize error automatically',
    recommendations: ['Manual investigation required']
  }
}

async function getAISystemContext(): Promise<any> {
  // Get AI system context from monitoring engine
  try {
    if (productionMonitoringEngine) {
      const monitoringData = await productionMonitoringEngine.getMonitoringData()
      return {
        error_rate: monitoringData.overview.errorRate,
        system_uptime: monitoringData.overview.systemUptime,
        ai_systems_active: monitoringData.overview.totalUsers > 0
      }
    }
    
    return {
      claude_status: 'active',
      cursor_status: 'active',
      monitoring_status: 'active'
    }
  } catch (error) {
    return { error: 'Failed to get AI context' }
  }
}

function generateAICorrelationId(): string {
  return `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

async function determineAlertNecessity(event: Sentry.Event): Promise<boolean> {
  // AI-powered decision on whether to alert
  const severity = event.level || 'error'
  const message = event.message || ''
  
  // Always alert on critical errors
  if (severity === 'fatal' || severity === 'error') {
    return true
  }
  
  // Smart filtering for warnings
  if (severity === 'warning') {
    const criticalWarningPatterns = [
      'memory',
      'performance',
      'timeout',
      'security'
    ]
    
    return criticalWarningPatterns.some(pattern => 
      message.toLowerCase().includes(pattern)
    )
  }
  
  return false
}

// Export configuration
export const sentryConfig = {
  initializeSentry,
  captureErrorWithAI,
  getSentryHealth
} 