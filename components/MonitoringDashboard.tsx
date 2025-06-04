'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Server, 
  Database, 
  Cpu, 
  MemoryStick, 
  Network, 
  BarChart3,
  LineChart,
  PieChart,
  Gauge,
  Brain,
  Zap,
  Shield,
  Eye,
  RefreshCw,
  Settings,
  Download,
  Filter,
  Search,
  Calendar
} from 'lucide-react'
import { useMonitoring } from '@/lib/hooks/useMonitoring'

interface MonitoringDashboardProps {
  className?: string
  compact?: boolean
  showControls?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export function MonitoringDashboard({ 
  className = '',
  compact = false,
  showControls = true,
  autoRefresh = true,
  refreshInterval = 30000
}: MonitoringDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('1h')
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(new Date())
  
  const { 
    monitoringData, 
    healthStatus, 
    metrics, 
    alerts, 
    insights,
    isLoading, 
    error,
    refreshMonitoring,
    getSystemHealth,
    getMetrics,
    getAlerts
  } = useMonitoring()

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(async () => {
        setRefreshing(true)
        await refreshMonitoring()
        setLastRefresh(new Date())
        setRefreshing(false)
      }, refreshInterval)

      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, refreshMonitoring])

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshMonitoring()
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setRefreshing(false)
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'degraded': return 'text-yellow-600'
      case 'unhealthy': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />
      case 'degraded': return <AlertTriangle className="h-4 w-4" />
      case 'unhealthy': return <AlertTriangle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Monitoring Dashboard Error</AlertTitle>
          <AlertDescription>
            Failed to load monitoring data: {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Production Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time system health, performance metrics, and AI insights
          </p>
        </div>
        
        {showControls && (
          <div className="flex items-center space-x-4">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="15m">Last 15 minutes</option>
              <option value="1h">Last hour</option>
              <option value="6h">Last 6 hours</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
            </select>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        )}
      </div>

      {/* System Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
            {getStatusIcon(healthStatus?.overall?.status || 'unknown')}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getStatusColor(healthStatus?.overall?.status || 'unknown')}>
                {healthStatus?.overall?.status || 'Unknown'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {healthStatus?.overall?.score ? `${(healthStatus.overall.score * 100).toFixed(1)}% healthy` : 'Checking...'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.performance?.responseTime?.average || 0}ms
            </div>
            <p className="text-xs text-muted-foreground">
              P95: {metrics?.performance?.responseTime?.p95 || 0}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.errors?.rate ? `${(metrics.errors.rate * 100).toFixed(2)}%` : '0.00%'}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.errors?.total || 0} total errors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automation Level</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.automation?.efficiency?.automationLevel || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              AI-powered operations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="ai_systems">AI Systems</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {healthStatus?.systems && Object.entries(healthStatus.systems).map(([system, health]: [string, any]) => (
                  <div key={system} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(health?.status)}
                      <span className="capitalize">{system.replace('_', ' ')}</span>
                    </div>
                    <Badge 
                      variant={health?.status === 'healthy' ? 'default' : 'destructive'}
                      className={getStatusColor(health?.status)}
                    >
                      {health?.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {alerts && alerts.length > 0 ? (
                  <div className="space-y-2">
                    {alerts.slice(0, 5).map((alert: any, index: number) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div>
                          <p className="text-sm font-medium">{alert.title}</p>
                          <p className="text-xs text-muted-foreground">{alert.system}</p>
                        </div>
                        <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                          {alert.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No recent alerts</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Availability</span>
                    <span className="text-sm font-medium">{metrics?.performance?.availability?.percentage || 0}%</span>
                  </div>
                  <Progress value={metrics?.performance?.availability?.percentage || 0} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Cache Hit Rate</span>
                    <span className="text-sm font-medium">{metrics?.performance?.cachePerformance?.hitRate || 0}%</span>
                  </div>
                  <Progress value={metrics?.performance?.cachePerformance?.hitRate || 0} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">CPU Usage</span>
                    <span className="text-sm font-medium">{metrics?.infrastructure?.system?.cpuUsage || 0}%</span>
                  </div>
                  <Progress value={metrics?.infrastructure?.system?.cpuUsage || 0} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <span>Average</span>
                      <span className="font-medium">{metrics?.performance?.responseTime?.average || 0}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>P50</span>
                      <span className="font-medium">{metrics?.performance?.responseTime?.p50 || 0}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>P95</span>
                      <span className="font-medium">{metrics?.performance?.responseTime?.p95 || 0}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>P99</span>
                      <span className="font-medium">{metrics?.performance?.responseTime?.p99 || 0}ms</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Throughput Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <span>Current RPS</span>
                      <span className="font-medium">{metrics?.performance?.throughput?.requestsPerSecond || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Peak RPS</span>
                      <span className="font-medium">{metrics?.performance?.throughput?.peakRps || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average RPS</span>
                      <span className="font-medium">{metrics?.performance?.throughput?.averageRps || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resource Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Cpu className="h-4 w-4" />
                      <span className="text-sm">CPU</span>
                    </div>
                    <span className="text-sm font-medium">{metrics?.infrastructure?.system?.cpuUsage || 0}%</span>
                  </div>
                  <Progress value={metrics?.infrastructure?.system?.cpuUsage || 0} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MemoryStick className="h-4 w-4" />
                      <span className="text-sm">Memory</span>
                    </div>
                    <span className="text-sm font-medium">{metrics?.infrastructure?.system?.memoryUsage || 0}%</span>
                  </div>
                  <Progress value={metrics?.infrastructure?.system?.memoryUsage || 0} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Server className="h-4 w-4" />
                      <span className="text-sm">Disk</span>
                    </div>
                    <span className="text-sm font-medium">{metrics?.infrastructure?.system?.diskUsage || 0}%</span>
                  </div>
                  <Progress value={metrics?.infrastructure?.system?.diskUsage || 0} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Network className="h-4 w-4" />
                      <span className="text-sm">Network</span>
                    </div>
                    <span className="text-sm font-medium">{metrics?.infrastructure?.system?.networkUtilization || 0}%</span>
                  </div>
                  <Progress value={metrics?.infrastructure?.system?.networkUtilization || 0} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Systems Tab */}
        <TabsContent value="ai_systems" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2" />
                  Claude Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Status</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Success Rate</span>
                    <span className="font-medium">{metrics?.ai_systems?.claude_cursor_integration?.successRate ? `${(metrics.ai_systems.claude_cursor_integration.successRate * 100).toFixed(1)}%` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Cycle Time</span>
                    <span className="font-medium">{metrics?.ai_systems?.claude_cursor_integration?.averageCycleTime || 0}min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Autonomous Development
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Status</span>
                    <Badge variant="default">Running</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Workflows</span>
                    <span className="font-medium">{metrics?.ai_systems?.overall?.activeWorkflows || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed Tasks</span>
                    <span className="font-medium">{metrics?.ai_systems?.overall?.completedTasks || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Meta Learning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Status</span>
                    <Badge variant="default">Learning</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Learning Rate</span>
                    <span className="font-medium">{metrics?.ai_systems?.meta_learning?.learningRate ? `${(metrics.ai_systems.meta_learning.learningRate * 100).toFixed(1)}%` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Optimization Cycles</span>
                    <span className="font-medium">{metrics?.ai_systems?.meta_learning?.optimizationCycles || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AI System Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Overall Health Score</span>
                    <span className="font-medium">{metrics?.ai_systems?.overall?.healthScore ? `${(metrics.ai_systems.overall.healthScore * 100).toFixed(1)}%` : 'N/A'}</span>
                  </div>
                  <Progress value={(metrics?.ai_systems?.overall?.healthScore || 0) * 100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>AI Response Time</span>
                    <span className="font-medium">{metrics?.ai_systems?.overall?.aiResponseTime || 0}ms</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Intelligence Level</span>
                    <Badge variant="default">{metrics?.ai_systems?.overall?.intelligenceLevel || 'Unknown'}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Infrastructure Tab */}
        <TabsContent value="infrastructure" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Database Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Connection Pool</span>
                    <span className="font-medium">{metrics?.infrastructure?.database?.connectionPool || 0}/20</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Query Response</span>
                    <span className="font-medium">{metrics?.infrastructure?.database?.queryResponseTime || 0}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Slow Queries</span>
                    <span className="font-medium">{metrics?.infrastructure?.database?.slowQueries || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage Usage</span>
                    <span className="font-medium">{metrics?.infrastructure?.database?.storageUtilization || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="h-5 w-5 mr-2" />
                  Cache Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Hit Rate</span>
                    <span className="font-medium">{metrics?.infrastructure?.cache?.hitRate || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Memory Usage</span>
                    <span className="font-medium">{metrics?.infrastructure?.cache?.memoryUsage || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Key Count</span>
                    <span className="font-medium">{metrics?.infrastructure?.cache?.keyCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Eviction Rate</span>
                    <span className="font-medium">{metrics?.infrastructure?.cache?.evictionRate || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Network className="h-5 w-5 mr-2" />
                Network Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{metrics?.infrastructure?.network?.bandwidth || 0}</div>
                  <div className="text-sm text-muted-foreground">Mbps Bandwidth</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{metrics?.infrastructure?.network?.latency || 0}</div>
                  <div className="text-sm text-muted-foreground">ms Latency</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{metrics?.infrastructure?.network?.packetLoss || 0}</div>
                  <div className="text-sm text-muted-foreground">% Packet Loss</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{metrics?.infrastructure?.network?.connections || 0}</div>
                  <div className="text-sm text-muted-foreground">Active Connections</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Active Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                {alerts && alerts.filter((alert: any) => !alert.resolved).length > 0 ? (
                  <div className="space-y-2">
                    {alerts.filter((alert: any) => !alert.resolved).map((alert: any, index: number) => (
                      <Alert key={index} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{alert.title}</AlertTitle>
                        <AlertDescription>
                          {alert.description} - {alert.system}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No active alerts</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alert Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <span>Total Alerts</span>
                      <span className="font-medium">{metrics?.errors?.total || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Critical</span>
                      <span className="font-medium text-red-600">{metrics?.errors?.critical || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Warnings</span>
                      <span className="font-medium text-yellow-600">{metrics?.errors?.warnings || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Info</span>
                      <span className="font-medium text-blue-600">{metrics?.errors?.info || 0}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <span>Avg Detection Time</span>
                      <span className="font-medium">{metrics?.errors?.detection?.averageDetectionTime || 0}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Auto Resolution</span>
                      <span className="font-medium">{metrics?.errors?.detection?.automatedResolution || 0}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2" />
                AI-Powered Insights
              </CardTitle>
              <CardDescription>
                Intelligent analysis and recommendations based on system data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {insights && insights.length > 0 ? (
                <div className="space-y-4">
                  {insights.map((insight: any, index: number) => (
                    <Alert key={index}>
                      <Brain className="h-4 w-4" />
                      <AlertTitle>AI Insight #{index + 1}</AlertTitle>
                      <AlertDescription>{insight.message}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No AI insights available</p>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Predictive Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Next Week Traffic</span>
                    <span className="font-medium">+15% increase expected</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Resource Needs</span>
                    <Badge variant="secondary">Scale Up Recommended</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Performance Trend</span>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Improving</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Error Trend</span>
                    <div className="flex items-center space-x-1">
                      <TrendingDown className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Decreasing</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                    <p className="text-sm">Increase cache size by 20% for better performance</p>
                  </div>
                  <div className="p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                    <p className="text-sm">Schedule maintenance during low traffic window</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded border-l-4 border-green-400">
                    <p className="text-sm">Consider auto-scaling for expected traffic increase</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer with refresh info */}
      <div className="text-center text-sm text-muted-foreground">
        Last updated: {lastRefresh.toLocaleTimeString()} • 
        {autoRefresh ? ` Auto-refresh every ${refreshInterval / 1000}s` : ' Auto-refresh disabled'}
      </div>
    </div>
  )
} 