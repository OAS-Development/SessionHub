'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  Activity, 
  Globe, 
  Zap, 
  Server, 
  Database, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Cpu, 
  HardDrive,
  Network,
  BarChart3,
  Settings,
  Play,
  Download,
  RefreshCw
} from 'lucide-react'
import { usePerformance, useRealtimePerformance } from '@/lib/hooks/usePerformance'
import { ScalingControls } from './ScalingControls'

interface PerformanceDashboardProps {
  className?: string
}

export function PerformanceDashboard({ className }: PerformanceDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [realtimeEnabled, setRealtimeEnabled] = useState(false)
  
  const performance = usePerformance({
    autoRefresh: true,
    refreshInterval: 30000,
    includePredictions: true,
    includeRecommendations: true
  })

  const realtime = useRealtimePerformance(realtimeEnabled)

  const handleOptimize = async (type: string) => {
    await performance.optimizePerformance(type)
  }

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const data = await performance.exportMetrics(format)
      const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `performance-metrics-${new Date().toISOString().split('T')[0]}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Global Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time performance monitoring, optimization, and scaling control
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRealtimeEnabled(!realtimeEnabled)}
          >
            <Activity className="h-4 w-4 mr-2" />
            {realtimeEnabled ? 'Disable' : 'Enable'} Real-time
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={performance.refreshMetrics}
            disabled={performance.isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${performance.isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('json')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Performance Alerts */}
      {!performance.isHealthy && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Performance issues detected. {performance.error}
          </AlertDescription>
        </Alert>
      )}

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PerformanceKPICard
          title="Global Load Time"
          value={performance.globalMetrics?.performance?.global?.globalLoadTime}
          unit="ms"
          target={2000}
          icon={<Globe className="h-4 w-4" />}
          trend={-8.3}
        />
        <PerformanceKPICard
          title="API Response Time"
          value={performance.globalMetrics?.performance?.global?.apiResponseTime}
          unit="ms"
          target={100}
          icon={<Zap className="h-4 w-4" />}
          trend={-12.1}
        />
        <PerformanceKPICard
          title="CDN Cache Hit Rate"
          value={performance.globalMetrics?.performance?.global?.cdnCacheHitRate}
          unit="%"
          target={95}
          icon={<Server className="h-4 w-4" />}
          trend={3.7}
          isPercentage
        />
        <PerformanceKPICard
          title="Global Availability"
          value={performance.globalMetrics?.performance?.global?.globalAvailability}
          unit="%"
          target={99.99}
          icon={<CheckCircle className="h-4 w-4" />}
          trend={0.02}
          isPercentage
        />
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="scaling">Auto-Scaling</TabsTrigger>
          <TabsTrigger value="cdn">CDN & Edge</TabsTrigger>
          <TabsTrigger value="regions">Global Regions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Trends (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PerformanceTrendsChart data={performance.globalMetrics?.performance?.trends} />
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Health Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SystemHealthOverview 
                  health={performance.globalMetrics?.health}
                  targetsMet={performance.targetsMet}
                  optimizationScore={performance.optimizationScore}
                />
              </CardContent>
            </Card>
          </div>

          {/* Real-time Metrics */}
          {realtimeEnabled && realtime.metrics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  Live Performance Metrics
                  <Badge variant="outline" className="text-green-600">
                    Live
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RealtimeMetricsDisplay metrics={realtime.metrics} />
              </CardContent>
            </Card>
          )}

          {/* Performance Recommendations */}
          {performance.globalMetrics?.performance?.optimization?.recommendations && (
            <Card>
              <CardHeader>
                <CardTitle>AI Performance Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <RecommendationsList 
                  recommendations={performance.globalMetrics.performance.optimization.recommendations}
                  onApply={handleOptimize}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-6">
          <OptimizationControlPanel 
            optimization={performance.optimization}
            onOptimize={handleOptimize}
            globalMetrics={performance.globalMetrics}
          />
        </TabsContent>

        {/* Scaling Tab */}
        <TabsContent value="scaling" className="space-y-6">
          <ScalingControls 
            scalingMetrics={performance.scalingMetrics}
            onExecuteScaling={performance.executeScaling}
          />
        </TabsContent>

        {/* CDN & Edge Tab */}
        <TabsContent value="cdn" className="space-y-6">
          <CDNDashboard 
            cdnMetrics={performance.cdnMetrics}
            onOptimizeCDN={performance.optimizeCDN}
          />
        </TabsContent>

        {/* Global Regions Tab */}
        <TabsContent value="regions" className="space-y-6">
          <GlobalRegionsView 
            regions={performance.globalMetrics?.regions}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <PerformanceAnalytics 
            globalMetrics={performance.globalMetrics}
            historical={performance.globalMetrics?.historical}
            predictions={performance.globalMetrics?.predictions}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Performance KPI Card Component
function PerformanceKPICard({ title, value, unit, target, icon, trend, isPercentage = false }: any) {
  const displayValue = isPercentage && value ? (value * 100).toFixed(1) : value?.toFixed(0) || '0'
  const targetValue = isPercentage ? target : target
  const isOnTarget = isPercentage 
    ? (value * 100) >= target
    : value <= target

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {displayValue}{unit}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Target: {targetValue}{unit}</span>
          <Badge variant={isOnTarget ? "default" : "destructive"}>
            {isOnTarget ? "On Target" : "Off Target"}
          </Badge>
        </div>
        {trend && (
          <div className={`text-xs mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}% from yesterday
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Performance Trends Chart
function PerformanceTrendsChart({ data }: any) {
  if (!data) return <div>No trend data available</div>

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data.loadTime}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleTimeString()} />
        <YAxis />
        <Tooltip labelFormatter={(value) => new Date(value).toLocaleString()} />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#8884d8" 
          strokeWidth={2}
          name="Load Time (ms)"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

// System Health Overview
function SystemHealthOverview({ health, targetsMet, optimizationScore }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {targetsMet?.toFixed(0) || 0}%
          </div>
          <div className="text-sm text-muted-foreground">Targets Met</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {optimizationScore?.toFixed(0) || 0}
          </div>
          <div className="text-sm text-muted-foreground">Optimization Score</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Performance Health</span>
          <Badge variant={health?.performance?.status === 'healthy' ? 'default' : 'destructive'}>
            {health?.performance?.status || 'Unknown'}
          </Badge>
        </div>
        <div className="flex justify-between text-sm">
          <span>Scaling Health</span>
          <Badge variant={health?.scaling?.status === 'healthy' ? 'default' : 'destructive'}>
            {health?.scaling?.status || 'Unknown'}
          </Badge>
        </div>
        <div className="flex justify-between text-sm">
          <span>CDN Health</span>
          <Badge variant={health?.cdn?.status === 'optimal' ? 'default' : 'destructive'}>
            {health?.cdn?.status || 'Unknown'}
          </Badge>
        </div>
      </div>
    </div>
  )
}

// Realtime Metrics Display
function RealtimeMetricsDisplay({ metrics }: any) {
  if (!metrics) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center">
        <div className="text-lg font-semibold">{metrics.metrics?.currentLoad || 0}</div>
        <div className="text-sm text-muted-foreground">Current Load</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold">{metrics.metrics?.activeConnections || 0}</div>
        <div className="text-sm text-muted-foreground">Active Connections</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold">{metrics.metrics?.requestsPerSecond || 0}</div>
        <div className="text-sm text-muted-foreground">Requests/sec</div>
      </div>
      <div className="text-center">
        <div className="text-lg font-semibold">{metrics.metrics?.averageResponseTime || 0}ms</div>
        <div className="text-sm text-muted-foreground">Avg Response Time</div>
      </div>
    </div>
  )
}

// Recommendations List
function RecommendationsList({ recommendations, onApply }: any) {
  return (
    <div className="space-y-3">
      {recommendations?.map((rec: string, index: number) => (
        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
          <span className="text-sm">{rec}</span>
          <Button size="sm" variant="outline" onClick={() => onApply('ai_optimization')}>
            Apply
          </Button>
        </div>
      ))}
    </div>
  )
}

// Optimization Control Panel
function OptimizationControlPanel({ optimization, onOptimize, globalMetrics }: any) {
  const optimizationTypes = [
    { 
      id: 'comprehensive_optimization', 
      name: 'Comprehensive Optimization',
      description: 'Run all optimization engines simultaneously',
      icon: <Settings className="h-4 w-4" />
    },
    { 
      id: 'cdn_optimization', 
      name: 'CDN Optimization',
      description: 'Optimize CDN cache and edge performance',
      icon: <Server className="h-4 w-4" />
    },
    { 
      id: 'bundle_optimization', 
      name: 'Bundle Optimization',
      description: 'Code splitting and compression optimization',
      icon: <Database className="h-4 w-4" />
    },
    { 
      id: 'database_optimization', 
      name: 'Database Optimization',
      description: 'Query and index optimization',
      icon: <HardDrive className="h-4 w-4" />
    },
    { 
      id: 'edge_optimization', 
      name: 'Edge Optimization',
      description: 'Edge computing and routing optimization',
      icon: <Network className="h-4 w-4" />
    }
  ]

  return (
    <div className="space-y-6">
      {/* Optimization Status */}
      <Card>
        <CardHeader>
          <CardTitle>Optimization Status</CardTitle>
        </CardHeader>
        <CardContent>
          {optimization.isOptimizing ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Optimizing: {optimization.currentOperation}</span>
                <span>{optimization.progress}%</span>
              </div>
              <Progress value={optimization.progress} className="w-full" />
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Ready for optimization</p>
              <p className="text-sm">Last optimization: {optimization.results?.length > 0 ? 'Recently' : 'Never'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optimization Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {optimizationTypes.map((type) => (
          <Card key={type.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                {type.icon}
                {type.name}
              </CardTitle>
              <CardDescription>{type.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                onClick={() => onOptimize(type.id)}
                disabled={optimization.isOptimizing}
              >
                <Play className="h-4 w-4 mr-2" />
                Optimize
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Optimization Results */}
      {optimization.results?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Optimization Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {optimization.results.slice(-5).map((result: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">{result.action}</span>
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? "Success" : "Failed"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// CDN Dashboard
function CDNDashboard({ cdnMetrics, onOptimizeCDN }: any) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            CDN Performance Overview
            <Button onClick={onOptimizeCDN} size="sm">
              <Zap className="h-4 w-4 mr-2" />
              Optimize CDN
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {((cdnMetrics?.current?.cacheHitRate || 0) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Cache Hit Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {cdnMetrics?.current?.responseTime || 0}ms
              </div>
              <div className="text-sm text-muted-foreground">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {cdnMetrics?.current?.edgeLocations || 0}
              </div>
              <div className="text-sm text-muted-foreground">Edge Locations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {(cdnMetrics?.current?.bandwidth || 0).toFixed(1)} Gbps
              </div>
              <div className="text-sm text-muted-foreground">Bandwidth</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Global Regions View
function GlobalRegionsView({ regions }: any) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Global Regional Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regions?.active?.map((region: string) => (
              <Card key={region}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{region}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Load Time</span>
                      <span className="text-sm font-semibold">
                        {regions?.performance?.[region]?.loadTime || 0}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">API Response</span>
                      <span className="text-sm font-semibold">
                        {regions?.performance?.[region]?.apiResponseTime || 0}ms
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Availability</span>
                      <span className="text-sm font-semibold">
                        {(regions?.performance?.[region]?.availability || 0).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Performance Analytics
function PerformanceAnalytics({ globalMetrics, historical, predictions }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Historical Trends */}
        {historical && (
          <Card>
            <CardHeader>
              <CardTitle>Historical Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={historical.metrics?.loadTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                  <YAxis />
                  <Tooltip labelFormatter={(value) => new Date(value).toLocaleString()} />
                  <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Predictions */}
        {predictions && (
          <Card>
            <CardHeader>
              <CardTitle>Performance Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictions.map((prediction: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">{prediction.metric}</div>
                      <div className="text-sm text-muted-foreground">
                        Confidence: {(prediction.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{prediction.predicted}</div>
                      <Badge variant={prediction.trend === 'improving' ? 'default' : 'secondary'}>
                        {prediction.trend}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 