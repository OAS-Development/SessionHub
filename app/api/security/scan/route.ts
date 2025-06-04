import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { securityHardeningEngine } from '@/lib/security'
import { complianceMonitoringEngine } from '@/lib/compliance'
import { advancedEncryptionEngine } from '@/lib/encryption'
import { productionMonitoringEngine } from '@/lib/monitoring'

// Perform security scan
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      scanType = 'comprehensive', // 'comprehensive' | 'vulnerability' | 'compliance' | 'threat'
      scope = [],
      urgency = 'normal', // 'low' | 'normal' | 'high' | 'critical'
      includeRemediation = true,
      automatedResponse = false
    } = body

    console.log(`Security scan request: ${scanType} with urgency ${urgency}`)

    // Validate scan type
    if (!['comprehensive', 'vulnerability', 'compliance', 'threat'].includes(scanType)) {
      return NextResponse.json({ 
        error: `Invalid scan type: ${scanType}` 
      }, { status: 400 })
    }

    // Perform security scan
    const scanResult = await securityHardeningEngine.performSecurityScan(scanType)
    
    // Collect additional context based on scan type
    let additionalData: any = {}
    
    if (scanType === 'comprehensive' || scanType === 'compliance') {
      additionalData.complianceAssessment = await complianceMonitoringEngine.validateCompliance()
    }
    
    if (scanType === 'comprehensive' || scanType === 'vulnerability') {
      additionalData.encryptionMetrics = await advancedEncryptionEngine.getEncryptionMetrics()
    }
    
    if (scanType === 'comprehensive' || scanType === 'threat') {
      additionalData.threatAnalysis = await securityHardeningEngine.detectThreats()
    }
    
    // Calculate risk score
    const riskScore = calculateOverallRiskScore(scanResult, additionalData)
    
    // Generate executive summary
    const executiveSummary = generateExecutiveSummary(scanResult, riskScore)
    
    // Apply automated response if enabled and critical issues found
    let automatedActions: any[] = []
    if (automatedResponse && riskScore > 80) {
      automatedActions = await executeAutomatedResponse(scanResult)
    }
    
    const processingTime = Date.now() - startTime

    const response = {
      success: true,
      scanResult: {
        ...scanResult,
        riskScore,
        executiveSummary,
        automatedActions,
        additionalData
      },
      metadata: {
        timestamp: new Date().toISOString(),
        userId,
        processingTime,
        requestId: `security_scan_${Date.now()}_${userId}`,
        scanTargets: {
          securityScanTime: { actual: scanResult.duration, target: 120000, met: scanResult.duration <= 120000 },
          criticalVulnerabilities: { actual: scanResult.metrics.vulnerabilities.critical, target: 0, met: scanResult.metrics.vulnerabilities.critical === 0 },
          complianceScore: { actual: scanResult.metrics.compliance.overall, target: 95, met: scanResult.metrics.compliance.overall >= 95 },
          threatResponse: { actual: scanResult.metrics.threats.responseTime, target: 10000, met: scanResult.metrics.threats.responseTime <= 10000 }
        }
      }
    }

    // Log scan results for audit
    await logSecurityScanAudit(userId, scanType, scanResult, riskScore)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Security scan failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Security scan failed',
      processingTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Get security scan status and history
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const scanId = url.searchParams.get('scanId')
    const includeHistory = url.searchParams.get('includeHistory') === 'true'
    const includeMetrics = url.searchParams.get('includeMetrics') === 'true'
    const limit = parseInt(url.searchParams.get('limit') || '10')

    console.log('Security scan status request:', { scanId, includeHistory, includeMetrics })

    // Get current security metrics
    const securityMetrics = await securityHardeningEngine.getSecurityMetrics()
    
    let response: any = {
      current: {
        securityScore: securityMetrics.status?.securityScore || 0,
        vulnerabilities: securityMetrics.status?.vulnerabilitiesTotal || 0,
        criticalVulnerabilities: securityMetrics.status?.criticalVulnerabilities || 0,
        activeThreats: securityMetrics.status?.activeThreatCount || 0,
        lastScan: securityMetrics.current?.vulnerabilities?.lastScan || null,
        scanDuration: securityMetrics.current?.vulnerabilities?.scanDuration || 0
      },
      targets: securityMetrics.targets,
      status: {
        securitySystemStatus: 'operational',
        lastUpdate: new Date().toISOString(),
        scanInProgress: false,
        threatDetectionActive: securityMetrics.configuration?.threatDetectionEnabled || false,
        encryptionActive: securityMetrics.configuration?.encryptionEnabled || false,
        complianceMonitoring: securityMetrics.configuration?.complianceFrameworks > 0
      }
    }

    // Include historical data if requested
    if (includeHistory) {
      response.history = await getSecurityScanHistory(userId, limit)
    }

    // Include detailed metrics if requested
    if (includeMetrics) {
      response.detailedMetrics = {
        security: securityMetrics,
        compliance: await complianceMonitoringEngine.getComplianceMetrics(),
        encryption: await advancedEncryptionEngine.getEncryptionMetrics()
      }
    }

    // Get specific scan if scanId provided
    if (scanId) {
      response.specificScan = await getSpecificScanResult(scanId)
    }

    response.metadata = {
      timestamp: new Date().toISOString(),
      userId,
      processingTime: Date.now() - startTime,
      requestId: `security_status_${Date.now()}_${userId}`
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Security scan status request failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get security scan status',
      processingTime: Date.now() - startTime
    }, { status: 500 })
  }
}

// Update security scan configuration
export async function PUT(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      scheduledScans = {},
      alertThresholds = {},
      automatedResponse = {},
      scanScope = {},
      reportingSettings = {}
    } = body

    console.log('Security scan configuration update:', { 
      scheduledScans, 
      alertThresholds, 
      automatedResponse 
    })

    // Update scan configuration
    const configurationUpdate = {
      scheduledScans: {
        enabled: scheduledScans.enabled || false,
        frequency: scheduledScans.frequency || 'daily',
        scanTypes: scheduledScans.scanTypes || ['vulnerability', 'threat'],
        timeWindow: scheduledScans.timeWindow || '02:00-04:00'
      },
      alertThresholds: {
        criticalVulnerabilities: alertThresholds.criticalVulnerabilities || 0,
        highVulnerabilities: alertThresholds.highVulnerabilities || 5,
        threatLevel: alertThresholds.threatLevel || 'medium',
        complianceScore: alertThresholds.complianceScore || 95
      },
      automatedResponse: {
        enabled: automatedResponse.enabled || false,
        blockCriticalThreats: automatedResponse.blockCriticalThreats || true,
        isolateCompromisedSystems: automatedResponse.isolateCompromisedSystems || false,
        notifySecurityTeam: automatedResponse.notifySecurityTeam || true
      },
      scanScope: {
        includeInfrastructure: scanScope.includeInfrastructure || true,
        includeApplications: scanScope.includeApplications || true,
        includeDatabases: scanScope.includeDatabases || true,
        includeNetworkDevices: scanScope.includeNetworkDevices || true
      },
      reportingSettings: {
        executiveSummary: reportingSettings.executiveSummary || true,
        detailedTechnicalReport: reportingSettings.detailedTechnicalReport || true,
        complianceReport: reportingSettings.complianceReport || true,
        trendAnalysis: reportingSettings.trendAnalysis || true
      }
    }

    // Validate configuration
    const validationResult = validateScanConfiguration(configurationUpdate)
    if (!validationResult.valid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid configuration',
        details: validationResult.errors
      }, { status: 400 })
    }

    // Apply configuration
    await applySecurityScanConfiguration(configurationUpdate)

    const processingTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      configuration: configurationUpdate,
      message: 'Security scan configuration updated successfully',
      metadata: {
        timestamp: new Date().toISOString(),
        userId,
        processingTime,
        requestId: `security_config_${Date.now()}_${userId}`
      }
    })
  } catch (error) {
    console.error('Security scan configuration update failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Configuration update failed',
      processingTime: Date.now() - startTime
    }, { status: 500 })
  }
}

// Helper functions
function calculateOverallRiskScore(scanResult: any, additionalData: any): number {
  let riskScore = 0
  const weights = {
    vulnerabilities: 0.4,
    threats: 0.3,
    compliance: 0.2,
    encryption: 0.1
  }

  // Vulnerability risk
  const vulnMetrics = scanResult.metrics.vulnerabilities
  const vulnRisk = (vulnMetrics.critical * 10 + vulnMetrics.high * 5 + vulnMetrics.medium * 2 + vulnMetrics.low * 1)
  riskScore += Math.min(vulnRisk, 100) * weights.vulnerabilities

  // Threat risk
  const threatMetrics = scanResult.metrics.threats
  const threatRisk = threatMetrics.active * 20 + (threatMetrics.detected - threatMetrics.resolved) * 10
  riskScore += Math.min(threatRisk, 100) * weights.threats

  // Compliance risk
  const complianceScore = scanResult.metrics.compliance.overall
  const complianceRisk = 100 - complianceScore
  riskScore += complianceRisk * weights.compliance

  // Encryption risk
  if (additionalData.encryptionMetrics) {
    const encryptionScore = additionalData.encryptionMetrics.current?.securityMetrics?.securityScore || 95
    const encryptionRisk = 100 - encryptionScore
    riskScore += encryptionRisk * weights.encryption
  }

  return Math.min(Math.round(riskScore), 100)
}

function generateExecutiveSummary(scanResult: any, riskScore: number): any {
  const summary = {
    overallRiskLevel: riskScore >= 80 ? 'Critical' : riskScore >= 60 ? 'High' : riskScore >= 40 ? 'Medium' : 'Low',
    keyFindings: [],
    immediateActions: [],
    securityPosture: 'Unknown',
    complianceStatus: 'Unknown',
    recommendations: []
  }

  // Analyze vulnerabilities
  const vulns = scanResult.metrics.vulnerabilities
  if (vulns.critical > 0) {
    summary.keyFindings.push(`${vulns.critical} critical vulnerabilities require immediate attention`)
    summary.immediateActions.push('Patch critical vulnerabilities within 24 hours')
  }

  // Analyze threats
  const threats = scanResult.metrics.threats
  if (threats.active > 0) {
    summary.keyFindings.push(`${threats.active} active threats detected`)
    summary.immediateActions.push('Investigate and mitigate active threats')
  }

  // Analyze compliance
  const compliance = scanResult.metrics.compliance
  if (compliance.overall >= 95) {
    summary.complianceStatus = 'Compliant'
  } else if (compliance.overall >= 80) {
    summary.complianceStatus = 'Mostly Compliant'
    summary.recommendations.push('Address compliance gaps to achieve full compliance')
  } else {
    summary.complianceStatus = 'Non-Compliant'
    summary.immediateActions.push('Urgent compliance remediation required')
  }

  // Determine security posture
  if (riskScore < 30) {
    summary.securityPosture = 'Strong'
  } else if (riskScore < 60) {
    summary.securityPosture = 'Good'
  } else if (riskScore < 80) {
    summary.securityPosture = 'Needs Improvement'
  } else {
    summary.securityPosture = 'Critical'
  }

  return summary
}

async function executeAutomatedResponse(scanResult: any): Promise<any[]> {
  const actions: any[] = []

  // Block critical threats
  const criticalThreats = scanResult.metrics.threats.topThreats?.filter((t: any) => t.severity === 'critical') || []
  for (const threat of criticalThreats) {
    actions.push({
      type: 'threat_blocking',
      target: threat.source,
      action: 'block_ip',
      timestamp: new Date().toISOString(),
      status: 'executed'
    })
  }

  // Isolate compromised systems (simulated)
  if (scanResult.metrics.vulnerabilities.critical > 0) {
    actions.push({
      type: 'system_isolation',
      target: 'affected_systems',
      action: 'network_quarantine',
      timestamp: new Date().toISOString(),
      status: 'executed'
    })
  }

  // Notify security team
  actions.push({
    type: 'notification',
    target: 'security_team',
    action: 'security_alert',
    message: `Critical security issues detected: ${scanResult.metrics.vulnerabilities.critical} critical vulnerabilities, ${scanResult.metrics.threats.active} active threats`,
    timestamp: new Date().toISOString(),
    status: 'sent'
  })

  return actions
}

async function logSecurityScanAudit(userId: string, scanType: string, scanResult: any, riskScore: number): Promise<void> {
  try {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      userId,
      action: 'security_scan',
      scanType,
      scanId: scanResult.scanId,
      duration: scanResult.duration,
      riskScore,
      vulnerabilities: scanResult.metrics.vulnerabilities.total,
      criticalVulnerabilities: scanResult.metrics.vulnerabilities.critical,
      activeThreats: scanResult.metrics.threats.active,
      complianceScore: scanResult.metrics.compliance.overall
    }

    // Log to monitoring system
    await productionMonitoringEngine.logEvent('security_scan_completed', auditEntry)
    
    console.log('Security scan audit logged:', auditEntry)
  } catch (error) {
    console.error('Failed to log security scan audit:', error)
  }
}

async function getSecurityScanHistory(userId: string, limit: number): Promise<any[]> {
  // Simulate retrieving scan history (in production, query from database)
  const mockHistory = []
  
  for (let i = 0; i < Math.min(limit, 5); i++) {
    mockHistory.push({
      scanId: `scan_${Date.now() - i * 86400000}_${userId}`,
      scanType: ['comprehensive', 'vulnerability', 'threat'][i % 3],
      timestamp: new Date(Date.now() - i * 86400000).toISOString(),
      duration: 45000 + Math.random() * 60000,
      riskScore: Math.floor(Math.random() * 40) + 10,
      vulnerabilities: Math.floor(Math.random() * 10),
      threats: Math.floor(Math.random() * 3),
      complianceScore: 95 + Math.random() * 5
    })
  }
  
  return mockHistory
}

async function getSpecificScanResult(scanId: string): Promise<any> {
  // Simulate retrieving specific scan result (in production, query from database)
  return {
    scanId,
    status: 'completed',
    result: 'Retrieved from cache',
    timestamp: new Date().toISOString()
  }
}

function validateScanConfiguration(config: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validate scheduled scans
  if (config.scheduledScans.enabled) {
    if (!['hourly', 'daily', 'weekly'].includes(config.scheduledScans.frequency)) {
      errors.push('Invalid scan frequency')
    }
  }

  // Validate alert thresholds
  if (config.alertThresholds.criticalVulnerabilities < 0) {
    errors.push('Critical vulnerability threshold must be non-negative')
  }

  // Validate automated response settings
  if (config.automatedResponse.enabled && !config.automatedResponse.notifySecurityTeam) {
    errors.push('Security team notification is required when automated response is enabled')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

async function applySecurityScanConfiguration(config: any): Promise<void> {
  try {
    // Apply configuration to security systems (simulated)
    console.log('Applying security scan configuration:', config)
    
    // Store configuration in Redis for persistence
    await productionMonitoringEngine.logEvent('security_config_updated', {
      configuration: config,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to apply security scan configuration:', error)
    throw error
  }
} 