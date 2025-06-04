'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Shield, AlertTriangle, Lock, Eye, FileText, Activity, Zap, Settings, Download, RefreshCw, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react'
import { useSecurity, useSecurityScanning, useCompliance, useThreatDetection, useEncryption } from '@/lib/hooks/useSecurity'
import SecurityDashboard from '@/components/SecurityDashboard'
import ThreatDetection from '@/components/ThreatDetection'

export default function SecurityHardeningPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  
  // Security hooks
  const { metrics, loading, error, refreshMetrics, criticalAlerts, exportSecurityData } = useSecurity()
  const { scanResult, scanning, performScan, scanHistory } = useSecurityScanning()
  const { metrics: complianceMetrics, performComplianceAssessment } = useCompliance()
  const { threatData, acknowledgeAlert, blockThreat } = useThreatDetection()
  const { encryptionStatus, rotateKeys } = useEncryption()

  // Update last refresh time
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])

  // Handle scan execution
  const handleScan = async (scanType: 'comprehensive' | 'vulnerability' | 'compliance' | 'threat') => {
    try {
      await performScan({
        scanType,
        urgency: 'normal',
        includeRemediation: true,
        automatedResponse: false
      })
    } catch (error) {
      console.error('Scan failed:', error)
    }
  }

  // Handle compliance assessment
  const handleComplianceAssessment = async (framework?: string) => {
    try {
      await performComplianceAssessment(framework)
    } catch (error) {
      console.error('Compliance assessment failed:', error)
    }
  }

  // Handle key rotation
  const handleKeyRotation = async () => {
    try {
      await rotateKeys()
    } catch (error) {
      console.error('Key rotation failed:', error)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading security dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Security Dashboard</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Security Hardening & Compliance
          </h1>
          <p className="text-muted-foreground mt-2">
            Enterprise-grade security monitoring, threat detection, and compliance management
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportSecurityData('json')}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshMetrics}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="space-y-2">
          {criticalAlerts.map((alert, index) => (
            <Alert key={index} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Security Alert</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.current.securityScore || 0}</div>
            <Progress value={metrics?.current.securityScore || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Target: {metrics?.targets.securityScore.target || 95}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vulnerabilities</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics?.current.criticalVulnerabilities || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Critical vulnerabilities detected
            </p>
            <div className="flex justify-between text-xs mt-2">
              <span>Total: {metrics?.current.vulnerabilities || 0}</span>
              <Badge variant={metrics?.current.criticalVulnerabilities === 0 ? 'default' : 'destructive'}>
                {metrics?.current.criticalVulnerabilities === 0 ? 'Clean' : 'Action Required'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metrics?.current.activeThreats || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Threats detected in last 24h
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs">Response time</span>
              <Badge variant="outline">
                {threatData?.threatStatistics.averageResponseTime 
                  ? `${(threatData.threatStatistics.averageResponseTime / 1000).toFixed(1)}s`
                  : '0s'
                }
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceMetrics?.current.overallScore.toFixed(1) || '0.0'}</div>
            <Progress value={complianceMetrics?.current.overallScore || 0} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {complianceMetrics?.current.frameworksCompliant || 0}/{complianceMetrics?.current.totalFrameworks || 0} frameworks compliant
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Security Actions
          </CardTitle>
          <CardDescription>
            Perform immediate security operations and scans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => handleScan('comprehensive')}
              disabled={scanning}
              className="flex flex-col items-center gap-2 h-auto p-4"
            >
              <Shield className="h-6 w-6" />
              <span>Comprehensive Scan</span>
              {scanning && <div className="text-xs">Scanning...</div>}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleScan('vulnerability')}
              disabled={scanning}
              className="flex flex-col items-center gap-2 h-auto p-4"
            >
              <AlertTriangle className="h-6 w-6" />
              <span>Vulnerability Scan</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleComplianceAssessment()}
              className="flex flex-col items-center gap-2 h-auto p-4"
            >
              <FileText className="h-6 w-6" />
              <span>Compliance Check</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleKeyRotation}
              className="flex flex-col items-center gap-2 h-auto p-4"
            >
              <Lock className="h-6 w-6" />
              <span>Rotate Keys</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="threats">Threats</TabsTrigger>
          <TabsTrigger value="scanning">Scanning</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="encryption">Encryption</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <SecurityDashboard />
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <ThreatDetection />
        </TabsContent>

        <TabsContent value="scanning" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scan Results */}
            <Card>
              <CardHeader>
                <CardTitle>Latest Scan Results</CardTitle>
                <CardDescription>
                  Results from the most recent security scans
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scanResult ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{scanResult.scanType}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {scanResult.duration}ms
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Risk Score</span>
                        <Badge variant={scanResult.riskScore > 70 ? 'destructive' : scanResult.riskScore > 40 ? 'secondary' : 'default'}>
                          {scanResult.riskScore}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Vulnerabilities</span>
                        <span>{scanResult.vulnerabilities.total}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Active Threats</span>
                        <span>{scanResult.threats.active}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Compliance</span>
                        <span>{scanResult.compliance.overall}%</span>
                      </div>
                    </div>

                    {scanResult.executiveSummary && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <h4 className="font-semibold mb-2">Executive Summary</h4>
                        <p className="text-sm text-muted-foreground">
                          Security Posture: {scanResult.executiveSummary.securityPosture}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Compliance Status: {scanResult.executiveSummary.complianceStatus}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No scan results available</p>
                    <p className="text-sm text-muted-foreground">Run a security scan to see results</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scan History */}
            <Card>
              <CardHeader>
                <CardTitle>Scan History</CardTitle>
                <CardDescription>
                  Previous security scan results and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scanHistory.length > 0 ? (
                  <div className="space-y-3">
                    {scanHistory.slice(0, 5).map((scan, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {scan.scanType}
                            </Badge>
                            <span className="text-sm font-medium">
                              Risk Score: {scan.riskScore}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(scan.startTime).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">{scan.duration}ms</div>
                          <div className="text-xs text-muted-foreground">
                            {scan.vulnerabilities.total} vulns
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No scan history available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Frameworks</CardTitle>
                <CardDescription>
                  Current compliance status across all frameworks
                </CardDescription>
              </CardHeader>
              <CardContent>
                {complianceMetrics?.frameworks.map((framework, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg mb-3">
                    <div>
                      <div className="font-medium">{framework.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {framework.controls.implemented}/{framework.controls.total} controls
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={framework.status === 'compliant' ? 'default' : 'destructive'}>
                        {framework.score.toFixed(1)}%
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {framework.status}
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No compliance frameworks configured</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Data Protection */}
            <Card>
              <CardHeader>
                <CardTitle>Data Protection</CardTitle>
                <CardDescription>
                  Privacy and data protection metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Data Subject Requests</span>
                    <span>{complianceMetrics?.dataProtection.dataSubjectRequests || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Breach Notifications</span>
                    <span>{complianceMetrics?.dataProtection.breachNotifications || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Privacy Impact Assessments</span>
                    <span>{complianceMetrics?.dataProtection.privacyImpactAssessments || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data Retention Compliance</span>
                    <span>{complianceMetrics?.dataProtection.dataRetentionCompliance || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="encryption" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Encryption Coverage */}
            <Card>
              <CardHeader>
                <CardTitle>Encryption Coverage</CardTitle>
                <CardDescription>
                  Data encryption status across all systems
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Data at Rest</span>
                      <span>{encryptionStatus?.coverage.dataAtRest || 0}%</span>
                    </div>
                    <Progress value={encryptionStatus?.coverage.dataAtRest || 0} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Data in Transit</span>
                      <span>{encryptionStatus?.coverage.dataInTransit || 0}%</span>
                    </div>
                    <Progress value={encryptionStatus?.coverage.dataInTransit || 0} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>End-to-End</span>
                      <span>{encryptionStatus?.coverage.endToEnd.toFixed(1) || '0.0'}%</span>
                    </div>
                    <Progress value={encryptionStatus?.coverage.endToEnd || 0} />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Backup Encryption</span>
                      <span>{encryptionStatus?.coverage.backup || 0}%</span>
                    </div>
                    <Progress value={encryptionStatus?.coverage.backup || 0} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Management */}
            <Card>
              <CardHeader>
                <CardTitle>Key Management</CardTitle>
                <CardDescription>
                  Encryption key lifecycle and management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Keys</span>
                    <span>{encryptionStatus?.keyManagement.totalKeys || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Keys</span>
                    <span>{encryptionStatus?.keyManagement.activeKeys || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expired Keys</span>
                    <Badge variant={encryptionStatus?.keyManagement.expiredKeys === 0 ? 'default' : 'destructive'}>
                      {encryptionStatus?.keyManagement.expiredKeys || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Rotations Due</span>
                    <Badge variant={encryptionStatus?.keyManagement.rotationsDue === 0 ? 'default' : 'secondary'}>
                      {encryptionStatus?.keyManagement.rotationsDue || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Key Age</span>
                    <span>{encryptionStatus?.keyManagement.averageKeyAge || 0} days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Analytics</CardTitle>
              <CardDescription>
                Advanced security metrics and trend analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {metrics?.current.securityScore || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Security Score</div>
                  <TrendingUp className="h-4 w-4 text-green-500 mx-auto mt-1" />
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {threatData?.threatStatistics.threatsDetected24h || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Threats (24h)</div>
                  <Activity className="h-4 w-4 text-orange-500 mx-auto mt-1" />
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {complianceMetrics?.current.overallScore.toFixed(1) || '0.0'}
                  </div>
                  <div className="text-sm text-muted-foreground">Compliance</div>
                  <CheckCircle className="h-4 w-4 text-green-500 mx-auto mt-1" />
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {encryptionStatus?.coverage.overall.toFixed(1) || '0.0'}%
                  </div>
                  <div className="text-sm text-muted-foreground">Encryption</div>
                  <Lock className="h-4 w-4 text-blue-500 mx-auto mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Status Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Security System: Operational</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Threat Detection: Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Compliance Monitoring: Active</span>
              </div>
            </div>
            <div>
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 