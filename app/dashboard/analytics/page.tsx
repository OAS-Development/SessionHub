'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Download,
  RefreshCw,
  Monitor,
  Database,
  HardDrive,
  Cpu,
  Zap,
  BarChart3,
  PieChart,
  LineChart,
  Eye,
  Settings
} from 'lucide-react'
import { useAdvancedAnalytics } from '@/lib/hooks/useAdvancedAnalytics'
import { AnalyticsTimeframe } from '@/lib/analytics'

export default function AnalyticsPage() {
  const {
    analyticsData,
    healthData,
    isLoading,
    isRefreshing,
    error,
    refreshAnalytics,
    refreshHealth,
    exportData,
    startMonitoring,
    stopMonitoring,
    setTimeframe,
    setOptions,
    isMonitoringActive,
    lastUpdated
  } = useAdvancedAnalytics({
    timeframe: 'MEDIUM_TERM',
    includeInsights: true,
    includeBaselines: true,
    autoRefresh: true,
    refreshInterval: 30000
  })

  const [selectedTab, setSelectedTab] = useState('overview')

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'critical': return <XCircle className="h-4 w-4 text-red-600" />
      default: return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />
      default: return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`
  const formatDuration = (ms: number) => `${ms.toFixed(0)}ms`

  if (isLoading && !analyticsData) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading analytics dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics & Monitoring</h1>
          <p className="text-gray-600">
            Comprehensive system insights with real-time monitoring and predictive analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={analyticsData?.timeframe || 'MEDIUM_TERM'}
            onChange={(e) => setTimeframe(e.target.value as keyof typeof AnalyticsTimeframe)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="REALTIME">Real-time (5m)</option>
            <option value="SHORT_TERM">Short-term (1h)</option>
            <option value="MEDIUM_TERM">Medium-term (1d)</option>
            <option value="LONG_TERM">Long-term (1w)</option>
          </select>
          <Button
            variant="outline"
            onClick={refreshAnalytics}
            disabled={isRefreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => exportData('json')}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button
            variant={isMonitoringActive ? 'secondary' : 'primary'}
            onClick={isMonitoringActive ? stopMonitoring : startMonitoring}
            className="flex items-center space-x-2"
          >
            <Monitor className="h-4 w-4" />
            <span>{isMonitoringActive ? 'Stop' : 'Start'} Monitoring</span>
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <h3 className="font-semibold text-red-800">Error</h3>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Status Bar */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`h-3 w-3 rounded-full ${isMonitoringActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium">
              Monitoring: {isMonitoringActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          {lastUpdated && (
            <div className="text-sm text-gray-600">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {healthData && (
            <>
              <div className="flex items-center space-x-2">
                {getStatusIcon(healthData.health.overall.status)}
                <span className="text-sm font-medium">
                  System Health: {healthData.health.overall.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Uptime: {healthData.status.uptime}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="space-y-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'systems', 'insights', 'alerts', 'monitoring'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            {analyticsData && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Cache Hit Rate</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analyticsData.summary.keyMetrics.cacheHitRate}
                      </p>
                    </div>
                    <Database className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    {getTrendIcon(analyticsData.summary.trends.performance)}
                    <span className="ml-1 text-gray-600">{analyticsData.summary.trends.performance}</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Learning Success</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analyticsData.summary.keyMetrics.learningSuccessRate}
                      </p>
                    </div>
                    <Cpu className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    {getTrendIcon(analyticsData.summary.trends.reliability)}
                    <span className="ml-1 text-gray-600">{analyticsData.summary.trends.reliability}</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">File Upload Success</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analyticsData.summary.keyMetrics.fileUploadSuccessRate}
                      </p>
                    </div>
                    <HardDrive className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    {getTrendIcon(analyticsData.summary.trends.performance)}
                    <span className="ml-1 text-gray-600">{analyticsData.summary.trends.performance}</span>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Response Time</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analyticsData.summary.keyMetrics.averageResponseTime}
                      </p>
                    </div>
                    <Zap className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    {getTrendIcon(analyticsData.summary.trends.performance)}
                    <span className="ml-1 text-gray-600">{analyticsData.summary.trends.performance}</span>
                  </div>
                </div>
              </div>
            )}

            {/* System Health Overview */}
            {healthData && (
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center space-x-2 mb-4">
                  <Activity className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">System Health Overview</h2>
                </div>
                <p className="text-gray-600 mb-4">Real-time health status across all system components</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {Object.entries(healthData.health.systems).map(([system, health]: [string, any]) => (
                    <div key={system} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{system}</span>
                        {getStatusIcon(health.status)}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${health.score * 100}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-600">
                        Score: {(health.score * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Systems Tab */}
        {selectedTab === 'systems' && analyticsData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Learning System */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center space-x-2 mb-4">
                <Cpu className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Learning System</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                  <div className="text-lg font-semibold">
                    {formatPercentage(analyticsData.systemMetrics.learning.successRate)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Avg Response Time</div>
                  <div className="text-lg font-semibold">
                    {formatDuration(analyticsData.systemMetrics.learning.averageResponseTime)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Pattern Accuracy</div>
                  <div className="text-lg font-semibold">
                    {formatPercentage(analyticsData.systemMetrics.learning.patternAccuracy)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">User Engagement</div>
                  <div className="text-lg font-semibold">
                    {formatPercentage(analyticsData.systemMetrics.learning.userEngagement)}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-2">Total Instructions</div>
                <div className="text-2xl font-bold">
                  {analyticsData.systemMetrics.learning.totalInstructions.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Cache System */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center space-x-2 mb-4">
                <Database className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Cache System</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600">Hit Rate</div>
                  <div className="text-lg font-semibold">
                    {formatPercentage(analyticsData.systemMetrics.cache.hitRate)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Miss Rate</div>
                  <div className="text-lg font-semibold">
                    {formatPercentage(analyticsData.systemMetrics.cache.missRate)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Memory Usage</div>
                  <div className="text-lg font-semibold">
                    {formatPercentage(analyticsData.systemMetrics.cache.memoryUsage)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Error Rate</div>
                  <div className="text-lg font-semibold">
                    {formatPercentage(analyticsData.systemMetrics.cache.errorRate)}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-2">Total Operations</div>
                <div className="text-2xl font-bold">
                  {analyticsData.systemMetrics.cache.totalOperations.toLocaleString()}
                </div>
              </div>
            </div>

            {/* File System */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center space-x-2 mb-4">
                <HardDrive className="h-5 w-5" />
                <h2 className="text-lg font-semibold">File System</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600">Upload Success</div>
                  <div className="text-lg font-semibold">
                    {formatPercentage(analyticsData.systemMetrics.files.uploadSuccessRate)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Avg Upload Time</div>
                  <div className="text-lg font-semibold">
                    {formatDuration(analyticsData.systemMetrics.files.averageUploadTime)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Optimization Rate</div>
                  <div className="text-lg font-semibold">
                    {formatPercentage(analyticsData.systemMetrics.files.optimizationRate)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Storage Efficiency</div>
                  <div className="text-lg font-semibold">
                    {formatPercentage(analyticsData.systemMetrics.files.storageEfficiency)}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-2">Total Files</div>
                <div className="text-2xl font-bold">
                  {analyticsData.systemMetrics.files.totalFiles.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Database System */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center space-x-2 mb-4">
                <Database className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Database System</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600">Connection Health</div>
                  <div className="text-lg font-semibold">
                    {formatPercentage(analyticsData.systemMetrics.database.connectionHealth)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Error Rate</div>
                  <div className="text-lg font-semibold">
                    {formatPercentage(analyticsData.systemMetrics.database.errorRate)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Index Efficiency</div>
                  <div className="text-lg font-semibold">
                    {formatPercentage(analyticsData.systemMetrics.database.indexEfficiency)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Storage Utilization</div>
                  <div className="text-lg font-semibold">
                    {formatPercentage(analyticsData.systemMetrics.database.storageUtilization)}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-2">Avg Query Time</div>
                <div className="text-2xl font-bold">
                  {formatDuration(analyticsData.systemMetrics.database.queryPerformance.averageQueryTime)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {selectedTab === 'insights' && analyticsData?.insights && (
          <div className="space-y-6">
            {/* Predictive Insights */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center space-x-2 mb-4">
                <Eye className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Predictive Insights</h2>
              </div>
              <p className="text-gray-600 mb-4">AI-powered predictions and recommendations for system optimization</p>
              <div className="space-y-4">
                {analyticsData.insights.predictions.map((insight: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          insight.impact === 'positive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {insight.type}
                        </span>
                        <span className="text-sm text-gray-600">
                          {(insight.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                        {insight.timeframe}
                      </span>
                    </div>
                    <h4 className="font-semibold mb-1">{insight.description}</h4>
                    <p className="text-sm text-gray-600 mb-2">{insight.prediction}</p>
                    {insight.recommendation && (
                      <p className="text-sm font-medium text-blue-600">{insight.recommendation}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {selectedTab === 'alerts' && analyticsData?.alerts && (
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Active Alerts</h2>
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                {analyticsData.alerts.active.length}
              </span>
            </div>
            <p className="text-gray-600 mb-4">System alerts requiring attention</p>
            {analyticsData.alerts.active.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <p>No active alerts. All systems operating normally.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {analyticsData.alerts.summary.map((alert: any) => (
                  <div key={alert.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(alert.severity)}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          alert.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {alert.severity}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                          {alert.system}
                        </span>
                      </div>
                      <span className="text-xs text-gray-600">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <h4 className="font-semibold mb-1">{alert.title}</h4>
                    {alert.actionRequired && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        Action Required
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Monitoring Tab */}
        {selectedTab === 'monitoring' && healthData && (
          <div className="space-y-6">
            {/* Monitoring Controls */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Monitoring Controls</h2>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Real-time Monitoring</h4>
                  <p className="text-sm text-gray-600">
                    Continuous system health monitoring with 5-second updates
                  </p>
                </div>
                <Button
                  variant={isMonitoringActive ? 'secondary' : 'primary'}
                  onClick={isMonitoringActive ? stopMonitoring : startMonitoring}
                >
                  {isMonitoringActive ? 'Stop' : 'Start'} Monitoring
                </Button>
              </div>
            </div>

            {/* Recent Events */}
            {healthData.events && (
              <div className="bg-white p-6 rounded-lg shadow border">
                <div className="flex items-center space-x-2 mb-4">
                  <Activity className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Recent Events</h2>
                </div>
                <div className="space-y-3">
                  {healthData.events.recent.slice(0, 10).map((event: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(event.severity)}
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-gray-600">{event.message}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
