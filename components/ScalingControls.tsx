'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
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
  Bar
} from 'recharts'
import { 
  Zap, 
  TrendingUp, 
  Server, 
  Cpu, 
  HardDrive, 
  Network, 
  Activity, 
  Settings, 
  Play, 
  Pause, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Target,
  Layers,
  Globe
} from 'lucide-react'

interface ScalingControlsProps {
  scalingMetrics?: any
  onExecuteScaling?: () => Promise<void>
  className?: string
}

export function ScalingControls({ scalingMetrics, onExecuteScaling, className }: ScalingControlsProps) {
  const [scalingConfig, setScalingConfig] = useState({
    autoScalingEnabled: true,
    predictiveScaling: true,
    aiOptimization: true,
    cpuThreshold: [70],
    memoryThreshold: [80],
    responseTimeThreshold: [100],
    scalingCooldown: [300]
  })

  const [activeScaling, setActiveScaling] = useState(false)
  const [scalingHistory, setScalingHistory] = useState<any[]>([])

  const handleScalingToggle = (key: string, value: boolean) => {
    setScalingConfig(prev => ({ ...prev, [key]: value }))
  }

  const handleThresholdChange = (key: string, value: number[]) => {
    setScalingConfig(prev => ({ ...prev, [key]: value }))
  }

  const executeManualScaling = async () => {
    if (onExecuteScaling) {
      setActiveScaling(true)
      try {
        await onExecuteScaling()
        // Add to scaling history
        setScalingHistory(prev => [...prev, {
          timestamp: new Date(),
          type: 'manual',
          action: 'scale_decision',
          success: true
        }].slice(-10))
      } catch (error) {
        console.error('Manual scaling failed:', error)
      } finally {
        setActiveScaling(false)
      }
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Scaling Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScalingMetricCard
          title="Scaling Efficiency"
          value={scalingMetrics?.performance?.efficiency || 92}
          unit="%"
          icon={<Target className="h-4 w-4" />}
          status={scalingMetrics?.performance?.efficiency >= 90 ? 'optimal' : 'warning'}
        />
        <ScalingMetricCard
          title="Response Time"
          value={scalingMetrics?.performance?.averageResponseTime || 45}
          unit="s"
          target={60}
          icon={<Clock className="h-4 w-4" />}
          status={scalingMetrics?.performance?.averageResponseTime <= 60 ? 'optimal' : 'warning'}
        />
        <ScalingMetricCard
          title="Active Instances"
          value={scalingMetrics?.resources?.instances?.current || 8}
          unit=""
          icon={<Server className="h-4 w-4" />}
          status="optimal"
        />
        <ScalingMetricCard
          title="Cost Optimization"
          value={75}
          unit="%"
          icon={<TrendingUp className="h-4 w-4" />}
          status="optimal"
        />
      </div>

      {/* Scaling Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Auto-Scaling Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Auto-Scaling Configuration
            </CardTitle>
            <CardDescription>
              Configure automatic scaling policies and thresholds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable/Disable Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-scaling">Auto-Scaling</Label>
                <Switch
                  id="auto-scaling"
                  checked={scalingConfig.autoScalingEnabled}
                  onCheckedChange={(checked) => handleScalingToggle('autoScalingEnabled', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="predictive-scaling">Predictive Scaling</Label>
                <Switch
                  id="predictive-scaling"
                  checked={scalingConfig.predictiveScaling}
                  onCheckedChange={(checked) => handleScalingToggle('predictiveScaling', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="ai-optimization">AI Optimization</Label>
                <Switch
                  id="ai-optimization"
                  checked={scalingConfig.aiOptimization}
                  onCheckedChange={(checked) => handleScalingToggle('aiOptimization', checked)}
                />
              </div>
            </div>

            {/* Threshold Configuration */}
            <div className="space-y-4">
              <div>
                <Label>CPU Threshold: {scalingConfig.cpuThreshold[0]}%</Label>
                <Slider
                  value={scalingConfig.cpuThreshold}
                  onValueChange={(value) => handleThresholdChange('cpuThreshold', value)}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Memory Threshold: {scalingConfig.memoryThreshold[0]}%</Label>
                <Slider
                  value={scalingConfig.memoryThreshold}
                  onValueChange={(value) => handleThresholdChange('memoryThreshold', value)}
                  max={100}
                  step={5}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Response Time Threshold: {scalingConfig.responseTimeThreshold[0]}ms</Label>
                <Slider
                  value={scalingConfig.responseTimeThreshold}
                  onValueChange={(value) => handleThresholdChange('responseTimeThreshold', value)}
                  max={500}
                  step={10}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Scaling Cooldown: {scalingConfig.scalingCooldown[0]}s</Label>
                <Slider
                  value={scalingConfig.scalingCooldown}
                  onValueChange={(value) => handleThresholdChange('scalingCooldown', value)}
                  max={600}
                  step={30}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Manual Scaling Controls */}
            <div className="pt-4 border-t">
              <Button 
                onClick={executeManualScaling}
                disabled={activeScaling || !scalingConfig.autoScalingEnabled}
                className="w-full"
              >
                {activeScaling ? (
                  <>
                    <Activity className="h-4 w-4 mr-2 animate-spin" />
                    Executing Scaling Decision...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Execute Scaling Decision
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resource Utilization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Resource Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceUtilizationChart 
              resources={scalingMetrics?.resources}
              thresholds={scalingConfig}
            />
          </CardContent>
        </Card>
      </div>

      {/* Scaling Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scaling History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Scaling Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScalingHistoryList 
              history={scalingMetrics?.recentEvents || scalingHistory}
            />
          </CardContent>
        </Card>

        {/* Predictive Scaling */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Predictive Scaling Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PredictiveScalingInsights 
              predictions={scalingMetrics?.predictions}
              recommendations={scalingMetrics?.recommendations}
            />
          </CardContent>
        </Card>
      </div>

      {/* Load Balancing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Intelligent Load Balancing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadBalancingControls 
            loadBalancing={scalingMetrics?.loadBalancing}
          />
        </CardContent>
      </Card>

      {/* Scaling Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Scaling Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScalingPerformanceChart 
            data={scalingMetrics?.trends}
          />
        </CardContent>
      </Card>
    </div>
  )
}

// Scaling Metric Card Component
function ScalingMetricCard({ title, value, unit, target, icon, status }: any) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'optimal': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === 'number' ? value.toFixed(value < 10 ? 1 : 0) : value}{unit}
        </div>
        <div className="flex items-center justify-between mt-2">
          {target && (
            <span className="text-xs text-muted-foreground">Target: {target}{unit}</span>
          )}
          <div className="flex items-center gap-1">
            {getStatusBadge(status)}
            <span className={`text-xs capitalize ${getStatusColor(status)}`}>
              {status}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Resource Utilization Chart
function ResourceUtilizationChart({ resources, thresholds }: any) {
  const data = [
    {
      resource: 'CPU',
      current: resources?.cpu?.current || 65,
      threshold: thresholds?.cpuThreshold?.[0] || 70,
      max: resources?.cpu?.max || 100
    },
    {
      resource: 'Memory',
      current: resources?.memory?.current || 72,
      threshold: thresholds?.memoryThreshold?.[0] || 80,
      max: resources?.memory?.max || 100
    },
    {
      resource: 'Network',
      current: resources?.network?.current || 45,
      threshold: 60,
      max: resources?.network?.max || 100
    },
    {
      resource: 'Storage',
      current: resources?.storage?.current || 58,
      threshold: 70,
      max: resources?.storage?.max || 100
    }
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="resource" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <Bar dataKey="current" fill="#8884d8" name="Current Usage %" />
        <Bar dataKey="threshold" fill="#ff7c7c" name="Threshold %" />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Scaling History List
function ScalingHistoryList({ history }: any) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No recent scaling events
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {history.slice(-5).map((event: any, index: number) => (
        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
          <div>
            <div className="font-medium">{event.action || 'Scaling Decision'}</div>
            <div className="text-sm text-muted-foreground">
              {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'Recent'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={event.success ? "default" : "destructive"}>
              {event.success ? "Success" : "Failed"}
            </Badge>
            {event.type && (
              <Badge variant="outline">
                {event.type}
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// Predictive Scaling Insights
function PredictiveScalingInsights({ predictions, recommendations }: any) {
  return (
    <div className="space-y-4">
      {/* Predictions */}
      {predictions && predictions.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">Upcoming Load Predictions</h4>
          <div className="space-y-2">
            {predictions.slice(0, 3).map((prediction: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm">{prediction.metric}</span>
                <div className="text-right">
                  <div className="text-sm font-medium">{prediction.predicted}</div>
                  <div className="text-xs text-muted-foreground">
                    {(prediction.confidence * 100).toFixed(0)}% confidence
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div>
          <h4 className="font-medium mb-2">AI Recommendations</h4>
          <div className="space-y-2">
            {recommendations.slice(0, 3).map((rec: any, index: number) => (
              <div key={index} className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                <div className="font-medium">{rec.action}</div>
                <div className="text-muted-foreground">{rec.reasoning}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs">Impact: {rec.performanceImpact}%</span>
                  <span className="text-xs">Confidence: {(rec.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fallback when no data */}
      {(!predictions || predictions.length === 0) && (!recommendations || recommendations.length === 0) && (
        <div className="text-center py-4 text-muted-foreground">
          <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Predictive insights will appear here</p>
          <p className="text-xs">Enable predictive scaling to see AI-powered recommendations</p>
        </div>
      )}
    </div>
  )
}

// Load Balancing Controls
function LoadBalancingControls({ loadBalancing }: any) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{loadBalancing?.loadBalancers || 2}</div>
          <div className="text-sm text-muted-foreground">Load Balancers</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{loadBalancing?.totalTargets || 8}</div>
          <div className="text-sm text-muted-foreground">Total Targets</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{loadBalancing?.healthyTargets || 7}</div>
          <div className="text-sm text-muted-foreground">Healthy Targets</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">
            {loadBalancing?.algorithms?.length || 1}
          </div>
          <div className="text-sm text-muted-foreground">Algorithms</div>
        </div>
      </div>

      {loadBalancing?.algorithms && (
        <div>
          <h4 className="font-medium mb-2">Load Balancing Algorithms</h4>
          <div className="flex flex-wrap gap-2">
            {loadBalancing.algorithms.map((algorithm: string, index: number) => (
              <Badge key={index} variant="outline">
                {algorithm.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Scaling Performance Chart
function ScalingPerformanceChart({ data }: any) {
  // Generate mock data if none provided
  const mockData = Array.from({ length: 24 }, (_, i) => ({
    time: new Date(Date.now() - (23 - i) * 3600000).toLocaleTimeString(),
    efficiency: 88 + Math.random() * 10,
    responseTime: 40 + Math.random() * 20,
    instances: 6 + Math.floor(Math.random() * 4)
  }))

  const chartData = data || mockData

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Line 
          yAxisId="left"
          type="monotone" 
          dataKey="efficiency" 
          stroke="#8884d8" 
          strokeWidth={2}
          name="Efficiency %"
        />
        <Line 
          yAxisId="right"
          type="monotone" 
          dataKey="responseTime" 
          stroke="#82ca9d" 
          strokeWidth={2}
          name="Response Time (s)"
        />
        <Line 
          yAxisId="right"
          type="monotone" 
          dataKey="instances" 
          stroke="#ffc658" 
          strokeWidth={2}
          name="Instances"
        />
      </LineChart>
    </ResponsiveContainer>
  )
} 