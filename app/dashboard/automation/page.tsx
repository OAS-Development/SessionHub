'use client'

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AutomationDashboard from '@/components/AutomationDashboard'
import ClaudeCursorOrchestrator from '@/components/ClaudeCursorOrchestrator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  useAutonomousDevelopment, 
  useAISystemsStatus, 
  useWorkflowOrchestration,
  useCommunicationMonitoring,
  AutomationUtils
} from '@/lib/hooks/useAutonomousDevelopment'
import { 
  Activity, 
  Bot, 
  Brain, 
  Clock, 
  Command, 
  Eye, 
  GitBranch, 
  MessageSquare, 
  Play, 
  Pause, 
  Settings, 
  Target, 
  Users, 
  Zap,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Cpu,
  MemoryStick,
  HardDrive
} from 'lucide-react'

export default function AutomationPage() {
  const {
    metrics,
    activeCycle,
    isAutonomousMode,
    loading,
    error,
    startDevelopmentCycle,
    toggleAutonomousMode,
    emergencyStop,
    isActive,
    cycleProgress,
    estimatedTimeRemaining
  } = useAutonomousDevelopment()

  const {
    systems,
    activeSystems,
    averageLoad,
    averageLatency
  } = useAISystemsStatus()

  const {
    workflows,
    workflowState,
    createWorkflow,
    activeWorkflowCount,
    totalAutonomousActions
  } = useWorkflowOrchestration()

  const {
    communications,
    communicationMetrics,
    sendCommunication,
    communicationHealth
  } = useCommunicationMonitoring()

  const handleQuickStart = async () => {
    try {
      const requirements = {
        type: 'full_stack_feature',
        description: 'Create a new user dashboard component with authentication',
        features: ['user_profile', 'authentication', 'dashboard_layout'],
        priority: 'high'
      }
      
      await startDevelopmentCycle(requirements)
    } catch (err) {
      console.error('Failed to start quick development cycle:', err)
    }
  }

  const handleCreateWorkflow = async () => {
    try {
      const requirements = {
        name: 'Code Quality Enhancement',
        description: 'Analyze and improve code quality across the project',
        scope: 'project_wide'
      }
      
      await createWorkflow(requirements, ['Claude AI', 'Pattern Recognition', 'Meta Learning'])
    } catch (err) {
      console.error('Failed to create workflow:', err)
    }
  }

  const getSystemHealthColor = () => {
    const health = AutomationUtils.getSystemHealthStatus(systems)
    switch (health) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      default: return 'text-orange-600'
    }
  }

  const getAutomationEfficiency = () => {
    return AutomationUtils.calculateAutomationEfficiency(metrics)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Automation Control Center</h1>
          <p className="text-xl text-muted-foreground mt-2">
            Session 12: Claude-Cursor Automation - Ultimate AI → AI Development
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant={isAutonomousMode ? "default" : "destructive"} className="text-sm px-3 py-1">
            {isAutonomousMode ? 'Autonomous Active' : 'Manual Mode'}
          </Badge>
          <Button
            onClick={toggleAutonomousMode}
            variant={isAutonomousMode ? "outline" : "default"}
            disabled={loading}
          >
            <Bot className="w-4 h-4 mr-2" />
            {isAutonomousMode ? 'Switch to Manual' : 'Enable Autonomous'}
          </Button>
          <Button
            onClick={emergencyStop}
            variant="destructive"
            disabled={loading}
          >
            <Pause className="w-4 h-4 mr-2" />
            Emergency Stop
          </Button>
        </div>
      </div>

      {/* Status Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isActive && (
        <Alert>
          <Activity className="h-4 w-4" />
          <AlertDescription>
            Development cycle active - Progress: {cycleProgress.toFixed(0)}% | 
            ETA: {AutomationUtils.formatTime(estimatedTimeRemaining)}
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cycle Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {AutomationUtils.formatTime(metrics.cycleTime)}
            </div>
            <p className="text-xs text-muted-foreground">
              Target: &lt;30min {metrics.cycleTime <= 1800000 ? '✓' : '⚠️'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {AutomationUtils.formatPercentage(metrics.successRate)}
            </div>
            <p className="text-xs text-muted-foreground">
              Target: &gt;90% {metrics.successRate >= 0.9 ? '✓' : '⚠️'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Latency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.communicationLatency.toFixed(0)}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Target: &lt;500ms {metrics.communicationLatency <= 500 ? '✓' : '⚠️'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Systems</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeSystems}/{systems.length}
            </div>
            <p className={`text-xs ${getSystemHealthColor()}`}>
              System Health: {AutomationUtils.getSystemHealthStatus(systems)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automation</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(getAutomationEfficiency() * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Efficiency Score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Decisions</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics.autonomousDecisions + totalAutonomousActions).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total autonomous decisions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleQuickStart} disabled={loading || isActive}>
              <Play className="w-4 h-4 mr-2" />
              Quick Start Development
            </Button>
            <Button onClick={handleCreateWorkflow} disabled={loading} variant="outline">
              <GitBranch className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
            <Button 
              onClick={() => sendCommunication('Claude AI', 'Cursor IDE', 'optimization', 'Optimize current codebase')}
              disabled={loading}
              variant="outline"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Send AI Communication
            </Button>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              System Configuration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Development Cycle */}
      {activeCycle && (
        <Card>
          <CardHeader>
            <CardTitle>Active Development Cycle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{activeCycle.requirements.description}</h3>
                  <p className="text-sm text-muted-foreground">
                    Started: {activeCycle.startTime.toLocaleTimeString()}
                  </p>
                </div>
                <Badge variant={activeCycle.status === 'completed' ? 'default' : 'secondary'}>
                  {activeCycle.status}
                </Badge>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{activeCycle.progress.toFixed(0)}%</span>
                </div>
                <Progress value={activeCycle.progress} className="h-2" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">AI Systems</span>
                  <p className="font-medium">{activeCycle.aiSystems.length}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Autonomous Actions</span>
                  <p className="font-medium">{activeCycle.autonomousActions}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">ETA</span>
                  <p className="font-medium">
                    {AutomationUtils.formatTime(estimatedTimeRemaining)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Quality Score</span>
                  <p className="font-medium">
                    {((activeCycle.qualityMetrics.codeQuality + activeCycle.qualityMetrics.testCoverage) / 2 * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Overview Dashboard</TabsTrigger>
          <TabsTrigger value="orchestrator">AI Orchestrator</TabsTrigger>
          <TabsTrigger value="workflows">Workflow Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics & Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <AutomationDashboard />
        </TabsContent>

        <TabsContent value="orchestrator">
          <ClaudeCursorOrchestrator />
        </TabsContent>

        <TabsContent value="workflows">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Workflow Management</h2>
              <Button onClick={handleCreateWorkflow}>
                <Play className="w-4 h-4 mr-2" />
                Create New Workflow
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Workflows</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{activeWorkflowCount}</div>
                  <p className="text-sm text-muted-foreground">Currently running</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Workflows</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{workflowState.totalWorkflows}</div>
                  <p className="text-sm text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {workflowState.totalWorkflows > 0 ? 
                      Math.round((workflowState.successfulWorkflows / workflowState.totalWorkflows) * 100) : 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Completion rate</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              {workflows.map((workflow) => (
                <Card key={workflow.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{workflow.requirements.name || 'Development Workflow'}</CardTitle>
                      <Badge variant={workflow.status === 'completed' ? 'default' : 'secondary'}>
                        {workflow.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{workflow.progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={workflow.progress} className="h-2" />
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">AI Systems</span>
                          <p className="font-medium">{workflow.aiSystems.length}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Started</span>
                          <p className="font-medium">{workflow.startTime.toLocaleTimeString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Autonomous Actions</span>
                          <p className="font-medium">{workflow.autonomousActions}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">ETA</span>
                          <p className="font-medium">{workflow.estimatedCompletion.toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Analytics & Insights</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Automation Efficiency</span>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">
                          {(getAutomationEfficiency() * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Success Rate Trend</span>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">
                          {AutomationUtils.formatPercentage(metrics.successRate)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Communication Health</span>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium capitalize">
                          {communicationHealth}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Cpu className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Avg System Load</span>
                          <span>{AutomationUtils.formatPercentage(averageLoad)}</span>
                        </div>
                        <Progress value={averageLoad * 100} className="h-2" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Zap className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Avg Latency</span>
                          <span>{averageLatency.toFixed(0)}ms</span>
                        </div>
                        <Progress value={Math.min(100, (averageLatency / 500) * 100)} className="h-2" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Activity className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Communication Rate</span>
                          <span>{communicationMetrics.totalMessages}/hr</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Decision Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">
                        {(metrics.autonomousDecisions + totalAutonomousActions).toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground">Total AI Decisions</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Planning Decisions</span>
                        <span className="font-medium">35%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Implementation Decisions</span>
                        <span className="font-medium">40%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Optimization Decisions</span>
                        <span className="font-medium">25%</span>
                      </div>
                    </div>
                    <div className="text-center pt-2">
                      <Badge variant="outline">
                        {AutomationUtils.formatPercentage(metrics.automationLevel)} Autonomous
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent AI Communications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {communications.slice(0, 5).map((comm) => (
                    <div key={comm.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {comm.from} → {comm.to}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {comm.content.substring(0, 50)}...
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {comm.latency?.toFixed(0)}ms
                        </span>
                        {comm.success ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-red-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 