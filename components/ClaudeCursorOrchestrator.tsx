'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowRightLeft, 
  Bot, 
  Brain, 
  Code, 
  Command, 
  Eye, 
  GitBranch, 
  MessageSquare, 
  Play, 
  Pause, 
  RefreshCw, 
  Send, 
  Settings, 
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  Users
} from 'lucide-react'

interface AISystemStatus {
  name: string
  status: 'active' | 'busy' | 'idle' | 'error'
  load: number
  latency: number
  lastCommunication: Date
  capabilities: string[]
}

interface CommunicationMessage {
  id: string
  from: string
  to: string
  type: 'task_request' | 'task_response' | 'status_update' | 'coordination' | 'optimization'
  content: string
  timestamp: Date
  latency: number
  success: boolean
}

interface OrchestrationWorkflow {
  id: string
  name: string
  status: 'active' | 'scheduled' | 'completed' | 'failed'
  progress: number
  aiSystems: string[]
  estimatedCompletion: Date
  autonomousDecisions: number
}

export default function ClaudeCursorOrchestrator() {
  const [aiSystems, setAISystems] = useState<AISystemStatus[]>([
    {
      name: 'Claude AI',
      status: 'active',
      load: 0.65,
      latency: 245,
      lastCommunication: new Date(),
      capabilities: ['planning', 'code_generation', 'optimization', 'reasoning']
    },
    {
      name: 'Cursor IDE',
      status: 'active',
      load: 0.58,
      latency: 189,
      lastCommunication: new Date(Date.now() - 120000),
      capabilities: ['file_operations', 'terminal_commands', 'environment_control', 'code_execution']
    },
    {
      name: 'Meta Learning',
      status: 'busy',
      load: 0.82,
      latency: 156,
      lastCommunication: new Date(Date.now() - 30000),
      capabilities: ['algorithm_optimization', 'performance_analysis', 'learning_enhancement']
    },
    {
      name: 'Pattern Recognition',
      status: 'idle',
      load: 0.23,
      latency: 98,
      lastCommunication: new Date(Date.now() - 180000),
      capabilities: ['code_analysis', 'pattern_detection', 'quality_assessment']
    },
    {
      name: 'Intelligent Generator',
      status: 'active',
      load: 0.71,
      latency: 203,
      lastCommunication: new Date(Date.now() - 45000),
      capabilities: ['session_generation', 'requirement_analysis', 'strategic_planning']
    }
  ])

  const [communications, setCommunications] = useState<CommunicationMessage[]>([
    {
      id: 'msg_1',
      from: 'Claude AI',
      to: 'Cursor IDE',
      type: 'task_request',
      content: 'Execute development task: implement user authentication',
      timestamp: new Date(),
      latency: 245,
      success: true
    },
    {
      id: 'msg_2',
      from: 'Cursor IDE',
      to: 'Claude AI',
      type: 'task_response',
      content: 'Task completed successfully. Files created: auth.ts, login.tsx',
      timestamp: new Date(Date.now() - 60000),
      latency: 189,
      success: true
    },
    {
      id: 'msg_3',
      from: 'Meta Learning',
      to: 'Claude AI',
      type: 'optimization',
      content: 'Algorithm optimization suggestions for improved performance',
      timestamp: new Date(Date.now() - 120000),
      latency: 156,
      success: true
    }
  ])

  const [workflows, setWorkflows] = useState<OrchestrationWorkflow[]>([
    {
      id: 'workflow_1',
      name: 'Full-Stack Feature Development',
      status: 'active',
      progress: 73,
      aiSystems: ['Claude AI', 'Cursor IDE', 'Pattern Recognition'],
      estimatedCompletion: new Date(Date.now() + 420000), // 7 minutes
      autonomousDecisions: 12
    },
    {
      id: 'workflow_2',
      name: 'Code Quality Optimization',
      status: 'active',
      progress: 45,
      aiSystems: ['Meta Learning', 'Pattern Recognition', 'Claude AI'],
      estimatedCompletion: new Date(Date.now() + 900000), // 15 minutes
      autonomousDecisions: 8
    },
    {
      id: 'workflow_3',
      name: 'Performance Analysis & Enhancement',
      status: 'scheduled',
      progress: 0,
      aiSystems: ['Meta Learning', 'Intelligent Generator'],
      estimatedCompletion: new Date(Date.now() + 1800000), // 30 minutes
      autonomousDecisions: 0
    }
  ])

  const [newMessage, setNewMessage] = useState({
    from: 'Claude AI',
    to: 'Cursor IDE',
    type: 'task_request' as const,
    content: ''
  })

  const [orchestrationMode, setOrchestrationMode] = useState<'autonomous' | 'guided' | 'manual'>('autonomous')
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(true)

  // Simulate real-time updates
  useEffect(() => {
    if (!realTimeMonitoring) return

    const interval = setInterval(() => {
      // Update AI system loads and latencies
      setAISystems(prev => prev.map(system => ({
        ...system,
        load: Math.min(1, Math.max(0, system.load + (Math.random() - 0.5) * 0.1)),
        latency: Math.max(50, system.latency + (Math.random() - 0.5) * 50),
        status: system.load > 0.9 ? 'busy' : system.load < 0.3 ? 'idle' : 'active'
      })))

      // Update workflow progress
      setWorkflows(prev => prev.map(workflow => ({
        ...workflow,
        progress: workflow.status === 'active' ? 
          Math.min(100, workflow.progress + Math.random() * 3) : workflow.progress,
        autonomousDecisions: workflow.status === 'active' ? 
          workflow.autonomousDecisions + (Math.random() > 0.7 ? 1 : 0) : workflow.autonomousDecisions
      })))

      // Occasionally add new communications
      if (Math.random() > 0.8) {
        const systems = ['Claude AI', 'Cursor IDE', 'Meta Learning', 'Pattern Recognition', 'Intelligent Generator']
        const types: CommunicationMessage['type'][] = ['status_update', 'coordination', 'optimization']
        
        const newComm: CommunicationMessage = {
          id: `msg_${Date.now()}`,
          from: systems[Math.floor(Math.random() * systems.length)],
          to: systems[Math.floor(Math.random() * systems.length)],
          type: types[Math.floor(Math.random() * types.length)],
          content: 'Automated system communication',
          timestamp: new Date(),
          latency: Math.random() * 300 + 100,
          success: Math.random() > 0.1
        }

        setCommunications(prev => [newComm, ...prev.slice(0, 9)]) // Keep last 10
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [realTimeMonitoring])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'busy': return 'bg-yellow-500'
      case 'idle': return 'bg-blue-500'
      case 'error': return 'bg-red-500'
      case 'completed': return 'bg-green-500'
      case 'failed': return 'bg-red-500'
      case 'scheduled': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />
      case 'busy': return <RefreshCw className="w-4 h-4 animate-spin" />
      case 'idle': return <Pause className="w-4 h-4" />
      case 'error': return <AlertCircle className="w-4 h-4" />
      case 'scheduled': return <Clock className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.content.trim()) return

    const message: CommunicationMessage = {
      id: `msg_${Date.now()}`,
      ...newMessage,
      timestamp: new Date(),
      latency: Math.random() * 200 + 100,
      success: true
    }

    setCommunications(prev => [message, ...prev])
    setNewMessage({ ...newMessage, content: '' })
  }

  const handleStartWorkflow = async (workflowId: string) => {
    setWorkflows(prev => prev.map(workflow => 
      workflow.id === workflowId 
        ? { ...workflow, status: 'active' as const, progress: 0 }
        : workflow
    ))
  }

  const handlePauseWorkflow = async (workflowId: string) => {
    setWorkflows(prev => prev.map(workflow => 
      workflow.id === workflowId 
        ? { ...workflow, status: 'scheduled' as const }
        : workflow
    ))
  }

  const formatLatency = (latency: number) => {
    return `${latency.toFixed(0)}ms`
  }

  const formatLoad = (load: number) => {
    return `${(load * 100).toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Claude-Cursor Orchestrator</h1>
          <p className="text-muted-foreground">
            AI-to-AI coordination and autonomous development orchestration
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={orchestrationMode} onValueChange={(value: any) => setOrchestrationMode(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="autonomous">Autonomous</SelectItem>
              <SelectItem value="guided">Guided</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={realTimeMonitoring ? "default" : "outline"}
            size="sm"
            onClick={() => setRealTimeMonitoring(!realTimeMonitoring)}
          >
            <Eye className="w-4 h-4 mr-2" />
            Real-time
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {orchestrationMode === 'autonomous' && (
        <Alert>
          <Bot className="h-4 w-4" />
          <AlertDescription>
            Autonomous orchestration active - AI systems are making decisions independently
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="systems" className="space-y-4">
        <TabsList>
          <TabsTrigger value="systems">AI Systems</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="coordination">Coordination</TabsTrigger>
        </TabsList>

        <TabsContent value="systems">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiSystems.map((system) => (
              <Card key={system.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{system.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(system.status)}
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(system.status)}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Load</span>
                        <p className="font-medium">{formatLoad(system.load)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Latency</span>
                        <p className="font-medium">{formatLatency(system.latency)}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>System Load</span>
                        <span>{formatLoad(system.load)}</span>
                      </div>
                      <Progress value={system.load * 100} className="h-2" />
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Capabilities</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {system.capabilities.slice(0, 2).map((capability) => (
                          <Badge key={capability} variant="secondary" className="text-xs">
                            {capability.replace('_', ' ')}
                          </Badge>
                        ))}
                        {system.capabilities.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{system.capabilities.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Last comm: {system.lastCommunication.toLocaleTimeString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="communication">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Send Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">From</label>
                      <Select value={newMessage.from} onValueChange={(value) => setNewMessage({ ...newMessage, from: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {aiSystems.map((system) => (
                            <SelectItem key={system.name} value={system.name}>
                              {system.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">To</label>
                      <Select value={newMessage.to} onValueChange={(value) => setNewMessage({ ...newMessage, to: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {aiSystems.map((system) => (
                            <SelectItem key={system.name} value={system.name}>
                              {system.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select value={newMessage.type} onValueChange={(value: any) => setNewMessage({ ...newMessage, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="task_request">Task Request</SelectItem>
                        <SelectItem value="task_response">Task Response</SelectItem>
                        <SelectItem value="status_update">Status Update</SelectItem>
                        <SelectItem value="coordination">Coordination</SelectItem>
                        <SelectItem value="optimization">Optimization</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Message</label>
                    <Textarea
                      value={newMessage.content}
                      onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                      placeholder="Enter your message..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <Button onClick={handleSendMessage} className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Communications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {communications.map((comm) => (
                    <div key={comm.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {comm.type.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm font-medium">
                            {comm.from} → {comm.to}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">
                            {formatLatency(comm.latency)}
                          </span>
                          {comm.success ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-red-500" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {comm.content}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {comm.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflows">
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                        {workflow.status}
                      </Badge>
                      {workflow.status === 'active' ? (
                        <Button size="sm" variant="outline" onClick={() => handlePauseWorkflow(workflow.id)}>
                          <Pause className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleStartWorkflow(workflow.id)}>
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{workflow.progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={workflow.progress} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">AI Systems</span>
                        <div className="flex items-center space-x-1 mt-1">
                          <Users className="w-3 h-3" />
                          <span className="font-medium">{workflow.aiSystems.length}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ETA</span>
                        <p className="font-medium">
                          {workflow.estimatedCompletion.toLocaleTimeString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">AI Decisions</span>
                        <p className="font-medium">{workflow.autonomousDecisions}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mode</span>
                        <p className="font-medium capitalize">{orchestrationMode}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Participating Systems</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {workflow.aiSystems.map((system) => (
                          <Badge key={system} variant="outline" className="text-xs">
                            {system}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="coordination">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Orchestration Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Orchestration Mode</label>
                    <Select value={orchestrationMode} onValueChange={(value: any) => setOrchestrationMode(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="autonomous">
                          <div className="flex items-center space-x-2">
                            <Bot className="w-4 h-4" />
                            <span>Autonomous</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="guided">
                          <div className="flex items-center space-x-2">
                            <Brain className="w-4 h-4" />
                            <span>Guided</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="manual">
                          <div className="flex items-center space-x-2">
                            <Settings className="w-4 h-4" />
                            <span>Manual</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Button className="w-full justify-start" variant="outline">
                      <ArrowRightLeft className="w-4 h-4 mr-2" />
                      Sync All AI Systems
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reset Communication Protocols
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Zap className="w-4 h-4 mr-2" />
                      Optimize Performance
                    </Button>
                    <Button className="w-full justify-start" variant="destructive">
                      <Pause className="w-4 h-4 mr-2" />
                      Emergency Stop All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {aiSystems.filter(s => s.status === 'active').length}/{aiSystems.length}
                      </p>
                      <p className="text-sm text-muted-foreground">Active Systems</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {communications.filter(c => c.success).length}
                      </p>
                      <p className="text-sm text-muted-foreground">Successful Comms</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {Math.round(aiSystems.reduce((sum, s) => sum + s.latency, 0) / aiSystems.length)}ms
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Latency</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {workflows.filter(w => w.status === 'active').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Active Workflows</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Overall System Health</span>
                    <Progress value={85} className="h-2 mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">85% - Excellent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 