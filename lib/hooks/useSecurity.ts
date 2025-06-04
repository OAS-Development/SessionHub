import { useState, useEffect, useCallback, useMemo } from 'react'
import { enhancedRedis } from '../redis'

// Security hook interfaces
export interface SecurityMetrics {
  current: {
    securityScore: number
    vulnerabilities: number
    criticalVulnerabilities: number
    activeThreats: number
    complianceScore: number
    encryptionCoverage: number
    lastScan: Date | null
    scanDuration: number
  }
  targets: {
    securityScore: { target: number; actual: number; met: boolean }
    vulnerabilities: { target: number; actual: number; met: boolean }
    threatResponse: { target: number; actual: number; met: boolean }
    complianceScore: { target: number; actual: number; met: boolean }
  }
  trends: {
    securityScore: Array<{ date: string; value: number }>
    vulnerabilities: Array<{ date: string; value: number }>
    threats: Array<{ date: string; value: number }>
    compliance: Array<{ date: string; value: number }>
  }
  status: {
    systemStatus: 'operational' | 'degraded' | 'maintenance' | 'offline'
    lastUpdate: string
    scanInProgress: boolean
    threatDetectionActive: boolean
    encryptionActive: boolean
    complianceMonitoring: boolean
  }
}

export interface SecurityScanOptions {
  scanType: 'comprehensive' | 'vulnerability' | 'compliance' | 'threat'
  scope?: string[]
  urgency?: 'low' | 'normal' | 'high' | 'critical'
  includeRemediation?: boolean
  automatedResponse?: boolean
}

export interface SecurityScanResult {
  scanId: string
  scanType: string
  startTime: Date
  endTime: Date
  duration: number
  riskScore: number
  vulnerabilities: {
    total: number
    critical: number
    high: number
    medium: number
    low: number
  }
  threats: {
    active: number
    detected: number
    resolved: number
    topThreats: Array<{
      type: string
      severity: string
      source: string
      description: string
    }>
  }
  compliance: {
    overall: number
    frameworks: { [key: string]: number }
  }
  executiveSummary: {
    overallRiskLevel: string
    keyFindings: string[]
    immediateActions: string[]
    securityPosture: string
    complianceStatus: string
    recommendations: string[]
  }
  automatedActions: Array<{
    type: string
    target: string
    action: string
    timestamp: string
    status: string
  }>
}

export interface ComplianceMetrics {
  current: {
    overallScore: number
    frameworksCompliant: number
    totalFrameworks: number
    pendingActions: number
    criticalFindings: number
    lastAssessment: Date | null
  }
  frameworks: Array<{
    name: string
    score: number
    status: 'compliant' | 'non_compliant' | 'pending'
    lastAssessment: Date
    controls: {
      total: number
      implemented: number
      inProgress: number
      notImplemented: number
    }
  }>
  dataProtection: {
    dataSubjectRequests: number
    breachNotifications: number
    privacyImpactAssessments: number
    dataRetentionCompliance: number
  }
  recentAssessments: Array<{
    assessmentId: string
    framework: string
    date: Date
    score: number
    findings: number
  }>
}

export interface ThreatDetectionData {
  realTimeThreats: Array<{
    threatId: string
    type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    source: string
    target: string
    detectedAt: Date
    status: 'active' | 'investigating' | 'mitigated' | 'resolved'
    description: string
    confidence: number
  }>
  threatStatistics: {
    threatsDetected24h: number
    threatsBlocked24h: number
    averageResponseTime: number
    topThreatTypes: Array<{ type: string; count: number }>
    topSources: Array<{ source: string; count: number }>
  }
  securityAlerts: Array<{
    alertId: string
    type: string
    severity: string
    message: string
    timestamp: Date
    acknowledged: boolean
  }>
  intrusionAttempts: Array<{
    attemptId: string
    source: string
    target: string
    method: string
    timestamp: Date
    blocked: boolean
    riskScore: number
  }>
}

export interface EncryptionStatus {
  coverage: {
    dataAtRest: number
    dataInTransit: number
    endToEnd: number
    backup: number
    overall: number
  }
  keyManagement: {
    totalKeys: number
    activeKeys: number
    expiredKeys: number
    rotationsDue: number
    averageKeyAge: number
  }
  algorithms: Array<{
    name: string
    strength: string
    usage: number
    compliance: string[]
    deprecated: boolean
  }>
  performance: {
    encryptionThroughput: number
    decryptionThroughput: number
    keyRotationTime: number
    averageLatency: number
  }
}

// Main security monitoring hook
export const useSecurity = (autoRefresh: boolean = true, refreshInterval: number = 30000) => {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchSecurityMetrics = useCallback(async (): Promise<SecurityMetrics> => {
    try {
      console.log('Fetching security metrics...')
      
      const response = await fetch('/api/security/scan', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch security metrics: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Transform API response to SecurityMetrics format
      const securityMetrics: SecurityMetrics = {
        current: {
          securityScore: data.current?.securityScore || 0,
          vulnerabilities: data.current?.vulnerabilities || 0,
          criticalVulnerabilities: data.current?.criticalVulnerabilities || 0,
          activeThreats: data.current?.activeThreats || 0,
          complianceScore: 95 + Math.random() * 5, // Simulated
          encryptionCoverage: 98 + Math.random() * 2, // Simulated
          lastScan: data.current?.lastScan ? new Date(data.current.lastScan) : null,
          scanDuration: data.current?.scanDuration || 0
        },
        targets: data.targets || {
          securityScore: { target: 95, actual: 0, met: false },
          vulnerabilities: { target: 0, actual: 0, met: true },
          threatResponse: { target: 10000, actual: 0, met: true },
          complianceScore: { target: 95, actual: 0, met: false }
        },
        trends: {
          securityScore: generateMockTrend(85, 95),
          vulnerabilities: generateMockTrend(0, 10),
          threats: generateMockTrend(0, 5),
          compliance: generateMockTrend(92, 98)
        },
        status: data.status || {
          systemStatus: 'operational',
          lastUpdate: new Date().toISOString(),
          scanInProgress: false,
          threatDetectionActive: true,
          encryptionActive: true,
          complianceMonitoring: true
        }
      }
      
      console.log('Security metrics fetched successfully')
      return securityMetrics
    } catch (error) {
      console.error('Failed to fetch security metrics:', error)
      throw error
    }
  }, [])

  const refreshMetrics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const newMetrics = await fetchSecurityMetrics()
      setMetrics(newMetrics)
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error refreshing security metrics:', error)
      setError(error instanceof Error ? error.message : 'Failed to refresh security metrics')
    } finally {
      setLoading(false)
    }
  }, [fetchSecurityMetrics])

  // Auto-refresh effect
  useEffect(() => {
    refreshMetrics()

    if (autoRefresh) {
      const interval = setInterval(refreshMetrics, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, refreshMetrics])

  // Check for critical security alerts
  const criticalAlerts = useMemo(() => {
    if (!metrics) return []
    
    const alerts = []
    
    if (metrics.current.criticalVulnerabilities > 0) {
      alerts.push({
        type: 'critical_vulnerabilities',
        message: `${metrics.current.criticalVulnerabilities} critical vulnerabilities detected`,
        severity: 'critical',
        timestamp: new Date()
      })
    }
    
    if (metrics.current.activeThreats > 0) {
      alerts.push({
        type: 'active_threats',
        message: `${metrics.current.activeThreats} active threats detected`,
        severity: 'high',
        timestamp: new Date()
      })
    }
    
    if (metrics.current.securityScore < metrics.targets.securityScore.target) {
      alerts.push({
        type: 'security_score_low',
        message: `Security score ${metrics.current.securityScore} below target ${metrics.targets.securityScore.target}`,
        severity: 'medium',
        timestamp: new Date()
      })
    }
    
    return alerts
  }, [metrics])

  // Export security data
  const exportSecurityData = useCallback(async (format: 'json' | 'csv') => {
    if (!metrics) return

    const exportData = {
      timestamp: new Date().toISOString(),
      securityMetrics: metrics,
      exportFormat: format
    }

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `security-metrics-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      // Convert to CSV format
      const csvData = convertSecurityMetricsToCSV(metrics)
      const blob = new Blob([csvData], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `security-metrics-${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
  }, [metrics])

  return {
    metrics,
    loading,
    error,
    lastRefresh,
    refreshMetrics,
    criticalAlerts,
    exportSecurityData,
    hasData: !!metrics
  }
}

// Security scanning hook
export const useSecurityScanning = () => {
  const [scanResult, setScanResult] = useState<SecurityScanResult | null>(null)
  const [scanning, setScanning] = useState(false)
  const [scanHistory, setScanHistory] = useState<SecurityScanResult[]>([])
  const [error, setError] = useState<string | null>(null)

  const performScan = useCallback(async (options: SecurityScanOptions): Promise<SecurityScanResult> => {
    try {
      setScanning(true)
      setError(null)
      
      console.log(`Starting ${options.scanType} security scan...`)
      
      const response = await fetch('/api/security/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      })

      if (!response.ok) {
        throw new Error(`Security scan failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Security scan failed')
      }

      const scanResult = data.scanResult
      setScanResult(scanResult)
      
      // Add to scan history
      setScanHistory(prev => [scanResult, ...prev.slice(0, 9)])
      
      console.log(`${options.scanType} scan completed successfully`)
      
      return scanResult
    } catch (error) {
      console.error('Security scan failed:', error)
      setError(error instanceof Error ? error.message : 'Security scan failed')
      throw error
    } finally {
      setScanning(false)
    }
  }, [])

  const getScanHistory = useCallback(async (limit: number = 10) => {
    try {
      const response = await fetch(`/api/security/scan?includeHistory=true&limit=${limit}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch scan history: ${response.statusText}`)
      }

      const data = await response.json()
      setScanHistory(data.history || [])
      
      return data.history || []
    } catch (error) {
      console.error('Failed to fetch scan history:', error)
      throw error
    }
  }, [])

  return {
    scanResult,
    scanning,
    scanHistory,
    error,
    performScan,
    getScanHistory,
    hasScanResult: !!scanResult
  }
}

// Compliance monitoring hook
export const useCompliance = (autoRefresh: boolean = true, refreshInterval: number = 60000) => {
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchComplianceMetrics = useCallback(async (): Promise<ComplianceMetrics> => {
    try {
      console.log('Fetching compliance metrics...')
      
      const response = await fetch('/api/security/compliance', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch compliance metrics: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Transform API response to ComplianceMetrics format
      const complianceMetrics: ComplianceMetrics = {
        current: data.current || {
          overallScore: 0,
          frameworksCompliant: 0,
          totalFrameworks: 0,
          pendingActions: 0,
          criticalFindings: 0,
          lastAssessment: null
        },
        frameworks: data.frameworks || [],
        dataProtection: data.dataProtection || {
          dataSubjectRequests: 0,
          breachNotifications: 0,
          privacyImpactAssessments: 0,
          dataRetentionCompliance: 0
        },
        recentAssessments: data.recentAssessments || []
      }
      
      console.log('Compliance metrics fetched successfully')
      return complianceMetrics
    } catch (error) {
      console.error('Failed to fetch compliance metrics:', error)
      throw error
    }
  }, [])

  const refreshMetrics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const newMetrics = await fetchComplianceMetrics()
      setMetrics(newMetrics)
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error refreshing compliance metrics:', error)
      setError(error instanceof Error ? error.message : 'Failed to refresh compliance metrics')
    } finally {
      setLoading(false)
    }
  }, [fetchComplianceMetrics])

  // Auto-refresh effect
  useEffect(() => {
    refreshMetrics()

    if (autoRefresh) {
      const interval = setInterval(refreshMetrics, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, refreshMetrics])

  const performComplianceAssessment = useCallback(async (framework?: string) => {
    try {
      const response = await fetch('/api/security/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'validate_compliance',
          framework,
          includeRemediation: true
        })
      })

      if (!response.ok) {
        throw new Error(`Compliance assessment failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Compliance assessment failed')
      }

      // Refresh metrics after assessment
      await refreshMetrics()
      
      return data.result
    } catch (error) {
      console.error('Compliance assessment failed:', error)
      throw error
    }
  }, [refreshMetrics])

  const submitDataSubjectRequest = useCallback(async (requestData: any) => {
    try {
      const response = await fetch('/api/security/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_dsr',
          dataSubjectRequest: requestData
        })
      })

      if (!response.ok) {
        throw new Error(`Data subject request failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Data subject request failed')
      }

      return data.result
    } catch (error) {
      console.error('Data subject request failed:', error)
      throw error
    }
  }, [])

  return {
    metrics,
    loading,
    error,
    lastRefresh,
    refreshMetrics,
    performComplianceAssessment,
    submitDataSubjectRequest,
    hasData: !!metrics
  }
}

// Threat detection hook
export const useThreatDetection = (autoRefresh: boolean = true, refreshInterval: number = 5000) => {
  const [threatData, setThreatData] = useState<ThreatDetectionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchThreatData = useCallback(async (): Promise<ThreatDetectionData> => {
    try {
      console.log('Fetching threat detection data...')
      
      // Simulate real-time threat data (in production, connect to actual threat detection systems)
      const threatData: ThreatDetectionData = {
        realTimeThreats: generateMockThreats(),
        threatStatistics: {
          threatsDetected24h: Math.floor(Math.random() * 50) + 10,
          threatsBlocked24h: Math.floor(Math.random() * 45) + 8,
          averageResponseTime: Math.floor(Math.random() * 5000) + 2000,
          topThreatTypes: [
            { type: 'Malware', count: Math.floor(Math.random() * 20) + 5 },
            { type: 'Phishing', count: Math.floor(Math.random() * 15) + 3 },
            { type: 'DDoS', count: Math.floor(Math.random() * 10) + 1 }
          ],
          topSources: [
            { source: 'Unknown IP', count: Math.floor(Math.random() * 25) + 10 },
            { source: 'Suspicious Domain', count: Math.floor(Math.random() * 15) + 5 },
            { source: 'Compromised System', count: Math.floor(Math.random() * 10) + 2 }
          ]
        },
        securityAlerts: generateMockAlerts(),
        intrusionAttempts: generateMockIntrusionAttempts()
      }
      
      console.log('Threat detection data fetched successfully')
      return threatData
    } catch (error) {
      console.error('Failed to fetch threat detection data:', error)
      throw error
    }
  }, [])

  const refreshThreatData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const newThreatData = await fetchThreatData()
      setThreatData(newThreatData)
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error refreshing threat data:', error)
      setError(error instanceof Error ? error.message : 'Failed to refresh threat data')
    } finally {
      setLoading(false)
    }
  }, [fetchThreatData])

  // Auto-refresh effect
  useEffect(() => {
    refreshThreatData()

    if (autoRefresh) {
      const interval = setInterval(refreshThreatData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, refreshThreatData])

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      // Simulate acknowledging alert (in production, call actual API)
      if (threatData) {
        const updatedAlerts = threatData.securityAlerts.map(alert =>
          alert.alertId === alertId ? { ...alert, acknowledged: true } : alert
        )
        setThreatData({
          ...threatData,
          securityAlerts: updatedAlerts
        })
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
      throw error
    }
  }, [threatData])

  const blockThreat = useCallback(async (threatId: string) => {
    try {
      // Simulate blocking threat (in production, call actual API)
      if (threatData) {
        const updatedThreats = threatData.realTimeThreats.map(threat =>
          threat.threatId === threatId ? { ...threat, status: 'mitigated' } : threat
        )
        setThreatData({
          ...threatData,
          realTimeThreats: updatedThreats
        })
      }
    } catch (error) {
      console.error('Failed to block threat:', error)
      throw error
    }
  }, [threatData])

  return {
    threatData,
    loading,
    error,
    lastRefresh,
    refreshThreatData,
    acknowledgeAlert,
    blockThreat,
    hasData: !!threatData
  }
}

// Encryption management hook
export const useEncryption = (autoRefresh: boolean = true, refreshInterval: number = 30000) => {
  const [encryptionStatus, setEncryptionStatus] = useState<EncryptionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchEncryptionStatus = useCallback(async (): Promise<EncryptionStatus> => {
    try {
      console.log('Fetching encryption status...')
      
      // Simulate encryption status (in production, connect to encryption systems)
      const encryptionStatus: EncryptionStatus = {
        coverage: {
          dataAtRest: 100,
          dataInTransit: 100,
          endToEnd: 95 + Math.random() * 5,
          backup: 100,
          overall: 98 + Math.random() * 2
        },
        keyManagement: {
          totalKeys: Math.floor(Math.random() * 500) + 100,
          activeKeys: Math.floor(Math.random() * 450) + 90,
          expiredKeys: Math.floor(Math.random() * 10),
          rotationsDue: Math.floor(Math.random() * 5),
          averageKeyAge: Math.floor(Math.random() * 30) + 15
        },
        algorithms: [
          {
            name: 'AES-256-GCM',
            strength: 'high',
            usage: 85,
            compliance: ['FIPS-140-2', 'Common Criteria'],
            deprecated: false
          },
          {
            name: 'RSA-4096',
            strength: 'high',
            usage: 60,
            compliance: ['FIPS-140-2'],
            deprecated: false
          },
          {
            name: 'ECDSA-P384',
            strength: 'high',
            usage: 40,
            compliance: ['NSA Suite B'],
            deprecated: false
          }
        ],
        performance: {
          encryptionThroughput: 950 + Math.random() * 100,
          decryptionThroughput: 980 + Math.random() * 50,
          keyRotationTime: Math.floor(Math.random() * 30) + 15,
          averageLatency: 1 + Math.random() * 2
        }
      }
      
      console.log('Encryption status fetched successfully')
      return encryptionStatus
    } catch (error) {
      console.error('Failed to fetch encryption status:', error)
      throw error
    }
  }, [])

  const refreshEncryptionStatus = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const newEncryptionStatus = await fetchEncryptionStatus()
      setEncryptionStatus(newEncryptionStatus)
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Error refreshing encryption status:', error)
      setError(error instanceof Error ? error.message : 'Failed to refresh encryption status')
    } finally {
      setLoading(false)
    }
  }, [fetchEncryptionStatus])

  // Auto-refresh effect
  useEffect(() => {
    refreshEncryptionStatus()

    if (autoRefresh) {
      const interval = setInterval(refreshEncryptionStatus, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, refreshEncryptionStatus])

  const rotateKeys = useCallback(async (keyType?: string) => {
    try {
      // Simulate key rotation (in production, call encryption API)
      console.log(`Rotating ${keyType || 'all'} keys...`)
      
      // Update key management metrics
      if (encryptionStatus) {
        setEncryptionStatus({
          ...encryptionStatus,
          keyManagement: {
            ...encryptionStatus.keyManagement,
            rotationsDue: Math.max(0, encryptionStatus.keyManagement.rotationsDue - 1)
          }
        })
      }
      
      return { success: true, rotatedKeys: keyType ? 1 : 5 }
    } catch (error) {
      console.error('Key rotation failed:', error)
      throw error
    }
  }, [encryptionStatus])

  return {
    encryptionStatus,
    loading,
    error,
    lastRefresh,
    refreshEncryptionStatus,
    rotateKeys,
    hasData: !!encryptionStatus
  }
}

// Helper functions
function generateMockTrend(min: number, max: number): Array<{ date: string; value: number }> {
  const trend = []
  const days = 7
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    trend.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * (max - min + 1)) + min
    })
  }
  
  return trend
}

function generateMockThreats(): ThreatDetectionData['realTimeThreats'] {
  const threatTypes = ['Malware', 'Phishing', 'DDoS', 'Intrusion', 'Data Breach', 'Ransomware']
  const severities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical']
  const statuses: Array<'active' | 'investigating' | 'mitigated' | 'resolved'> = ['active', 'investigating', 'mitigated', 'resolved']
  
  return Array.from({ length: Math.floor(Math.random() * 10) + 2 }, (_, i) => ({
    threatId: `threat_${Date.now()}_${i}`,
    type: threatTypes[Math.floor(Math.random() * threatTypes.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    source: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    target: `server_${Math.floor(Math.random() * 10) + 1}`,
    detectedAt: new Date(Date.now() - Math.random() * 3600000),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    description: `${threatTypes[Math.floor(Math.random() * threatTypes.length)]} detected targeting system resources`,
    confidence: Math.floor(Math.random() * 40) + 60
  }))
}

function generateMockAlerts(): ThreatDetectionData['securityAlerts'] {
  const alertTypes = ['Security Policy Violation', 'Unusual Login Activity', 'Failed Authentication', 'Data Access Anomaly']
  const severities = ['low', 'medium', 'high', 'critical']
  
  return Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => ({
    alertId: `alert_${Date.now()}_${i}`,
    type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    message: `Security alert: ${alertTypes[Math.floor(Math.random() * alertTypes.length)]} detected`,
    timestamp: new Date(Date.now() - Math.random() * 1800000),
    acknowledged: Math.random() > 0.7
  }))
}

function generateMockIntrusionAttempts(): ThreatDetectionData['intrusionAttempts'] {
  const methods = ['Brute Force', 'SQL Injection', 'XSS', 'CSRF', 'Buffer Overflow']
  
  return Array.from({ length: Math.floor(Math.random() * 8) + 2 }, (_, i) => ({
    attemptId: `intrusion_${Date.now()}_${i}`,
    source: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    target: `/api/endpoint_${Math.floor(Math.random() * 20) + 1}`,
    method: methods[Math.floor(Math.random() * methods.length)],
    timestamp: new Date(Date.now() - Math.random() * 7200000),
    blocked: Math.random() > 0.2,
    riskScore: Math.floor(Math.random() * 100)
  }))
}

function convertSecurityMetricsToCSV(metrics: SecurityMetrics): string {
  const csvHeaders = [
    'Metric',
    'Current Value',
    'Target Value',
    'Target Met',
    'Last Updated'
  ]
  
  const csvRows = [
    csvHeaders.join(','),
    `Security Score,${metrics.current.securityScore},${metrics.targets.securityScore.target},${metrics.targets.securityScore.met},${metrics.status.lastUpdate}`,
    `Vulnerabilities,${metrics.current.vulnerabilities},${metrics.targets.vulnerabilities.target},${metrics.targets.vulnerabilities.met},${metrics.status.lastUpdate}`,
    `Critical Vulnerabilities,${metrics.current.criticalVulnerabilities},0,${metrics.current.criticalVulnerabilities === 0},${metrics.status.lastUpdate}`,
    `Active Threats,${metrics.current.activeThreats},0,${metrics.current.activeThreats === 0},${metrics.status.lastUpdate}`,
    `Compliance Score,${metrics.current.complianceScore},${metrics.targets.complianceScore.target},${metrics.targets.complianceScore.met},${metrics.status.lastUpdate}`
  ]
  
  return csvRows.join('\n')
} 