'use client'

import { useState, useEffect } from 'react'
import { 
  useIntelligentGeneration, 
  useSessionOptimization, 
  useContinuousLearning,
  GenerationUtils 
} from '@/lib/hooks/useIntelligentGeneration'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { 
  Brain, 
  Zap, 
  Target, 
  Clock, 
  TrendingUp, 
  Settings, 
  Play, 
  RotateCcw,
  Sparkles,
  Cpu,
  Network,
  BarChart3,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Download,
  Share,
  Save,
  RefreshCw,
  Gauge,
  Bot,
  Layers,
  GitBranch,
  Activity
} from 'lucide-react'

export default function AIGeneratorDashboard() {
  // State management
  const [sessionType, setSessionType] = useState('development')
  const [targetDuration, setTargetDuration] = useState(90)
  const [difficulty, setDifficulty] = useState('intermediate')
  const [objectives, setObjectives] = useState(['general_development'])
  const [optimizationLevel, setOptimizationLevel] = useState<'quick' | 'standard' | 'comprehensive'>('standard')
  const [selectedAlgorithms, setSelectedAlgorithms] = useState(['genetic', 'neural', 'reinforcement'])
  const [newObjective, setNewObjective] = useState('')

  // Hooks
  const generation = useIntelligentGeneration({
    sessionType,
    targetDuration,
    difficulty,
    objectives,
    optimizationLevel
  })

  const optimization = useSessionOptimization()
  const learning = useContinuousLearning()

  // Session type options
  const sessionTypes = [
    { id: 'development', name: 'Development Session', icon: Cpu },
    { id: 'learning', name: 'Learning Session', icon: Brain },
    { id: 'collaboration', name: 'Collaboration Session', icon: Network },
    { id: 'review', name: 'Review Session', icon: CheckCircle },
    { id: 'optimization', name: 'Optimization Session', icon: TrendingUp }
  ]

  // Difficulty levels
  const difficultyLevels = [
    { id: 'beginner', name: 'Beginner', color: 'green' },
    { id: 'intermediate', name: 'Intermediate', color: 'blue' },
    { id: 'advanced', name: 'Advanced', color: 'orange' },
    { id: 'expert', name: 'Expert', color: 'red' }
  ]

  // AI algorithms
  const algorithms = [
    { id: 'genetic', name: 'Genetic Algorithm', description: 'Evolutionary optimization for session structure' },
    { id: 'neural', name: 'Neural Networks', description: 'Deep learning for pattern recognition' },
    { id: 'reinforcement', name: 'Reinforcement Learning', description: 'Continuous improvement through feedback' }
  ]

  // Handle session generation
  const handleGenerate = async () => {
    try {
      await generation.generateSession({
        sessionType,
        targetDuration,
        difficulty,
        objectives,
        optimizationLevel
      })
    } catch (error) {
      console.error('Generation failed:', error)
    }
  }

  // Handle quick generation
  const handleQuickGenerate = async () => {
    try {
      await generation.quickGenerate(sessionType, targetDuration, difficulty, objectives[0])
    } catch (error) {
      console.error('Quick generation failed:', error)
    }
  }

  // Handle session optimization
  const handleOptimize = async () => {
    if (!generation.generatedSession) return

    try {
      await optimization.optimizeSession({
        sessionTemplate: generation.generatedSession.template,
        optimizationGoals: ['success_rate', 'time_efficiency', 'user_satisfaction'],
        algorithms: selectedAlgorithms,
        constraints: {},
        optimizationLevel: optimizationLevel === 'comprehensive' ? 'intensive' : optimizationLevel
      })
    } catch (error) {
      console.error('Optimization failed:', error)
    }
  }

  // Add objective
  const handleAddObjective = () => {
    if (newObjective.trim() && !objectives.includes(newObjective.trim())) {
      setObjectives([...objectives, newObjective.trim()])
      setNewObjective('')
    }
  }

  // Remove objective
  const handleRemoveObjective = (objective: string) => {
    setObjectives(objectives.filter(o => o !== objective))
  }

  // Calculate performance metrics
  const performanceMetrics = generation.generatedSession ? GenerationUtils.calculateMetrics([generation.generatedSession]) : null

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Bot className="w-8 h-8 text-purple-600" />
              AI Session Generator
            </h1>
            <p className="text-gray-600 mt-1">
              Intelligent session generation powered by genetic algorithms, neural networks, and reinforcement learning
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="px-3 py-1">
              <Sparkles className="w-4 h-4 mr-1" />
              AI-Powered
            </Badge>
            {generation.performance.generationTime > 0 && (
              <Badge variant={generation.performance.efficiency > 80 ? "default" : "secondary"}>
                {Math.round(generation.performance.efficiency)}% Efficiency
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Generation Time</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {generation.performance.generationTime > 0 ? 
                      `${(generation.performance.generationTime / 1000).toFixed(1)}s` : 
                      '—'
                    }
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Prediction</p>
                  <p className="text-2xl font-bold text-green-600">
                    {generation.performance.successPrediction > 0 ? 
                      `${Math.round(generation.performance.successPrediction * 100)}%` : 
                      '—'
                    }
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">AI Algorithms</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {generation.metadata.algorithmsUsed.length || '—'}
                  </p>
                </div>
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Optimization Level</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.round(generation.metadata.optimizationLevel * 100)}%
                  </p>
                </div>
                <Gauge className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="generate" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="optimize" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Optimize
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Results
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Learning
            </TabsTrigger>
          </TabsList>

          {/* Generation Tab */}
          <TabsContent value="generate" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Generation Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Session Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Session Type */}
                  <div className="space-y-2">
                    <Label>Session Type</Label>
                    <Select value={sessionType} onValueChange={setSessionType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sessionTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex items-center gap-2">
                              <type.icon className="w-4 h-4" />
                              {type.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Target Duration */}
                  <div className="space-y-2">
                    <Label>Target Duration: {targetDuration} minutes</Label>
                    <input
                      type="range"
                      min="15"
                      max="240"
                      step="15"
                      value={targetDuration}
                      onChange={(e) => setTargetDuration(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>15min</span>
                      <span>2hr</span>
                      <span>4hr</span>
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div className="space-y-2">
                    <Label>Difficulty Level</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {difficultyLevels.map((level) => (
                          <SelectItem key={level.id} value={level.id}>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full bg-${level.color}-500`} />
                              {level.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Objectives */}
                  <div className="space-y-2">
                    <Label>Session Objectives</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add objective..."
                        value={newObjective}
                        onChange={(e) => setNewObjective(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddObjective()}
                      />
                      <Button onClick={handleAddObjective} size="sm">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {objectives.map((objective) => (
                        <Badge 
                          key={objective} 
                          variant="secondary" 
                          className="cursor-pointer"
                          onClick={() => handleRemoveObjective(objective)}
                        >
                          {objective} ×
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Optimization Level */}
                  <div className="space-y-2">
                    <Label>AI Optimization Level</Label>
                    <Select value={optimizationLevel} onValueChange={setOptimizationLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quick">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Quick (2-5s generation)
                          </div>
                        </SelectItem>
                        <SelectItem value="standard">
                          <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4" />
                            Standard (5-10s generation)
                          </div>
                        </SelectItem>
                        <SelectItem value="comprehensive">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4" />
                            Comprehensive (10-15s generation)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* AI Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI Algorithm Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {algorithms.map((algorithm) => (
                    <div key={algorithm.id} className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id={algorithm.id}
                        checked={selectedAlgorithms.includes(algorithm.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAlgorithms([...selectedAlgorithms, algorithm.id])
                          } else {
                            setSelectedAlgorithms(selectedAlgorithms.filter(a => a !== algorithm.id))
                          }
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor={algorithm.id} className="font-medium">
                          {algorithm.name}
                        </Label>
                        <p className="text-sm text-gray-600 mt-1">
                          {algorithm.description}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 space-y-2">
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleGenerate} 
                        disabled={generation.loading}
                        className="flex-1"
                      >
                        {generation.loading ? (
                          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Sparkles className="w-4 h-4 mr-2" />
                        )}
                        Generate AI Session
                      </Button>
                      <Button 
                        onClick={handleQuickGenerate} 
                        disabled={generation.loading}
                        variant="outline"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Quick
                      </Button>
                    </div>
                    
                    {generation.loading && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Generating AI session...</span>
                          <span>{optimizationLevel} mode</span>
                        </div>
                        <Progress value={45} className="h-2" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Error Display */}
            {generation.error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{generation.error}</AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Optimization Tab */}
          <TabsContent value="optimize" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Optimization Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Session Optimization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {generation.generatedSession ? (
                    <>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Current Session</h4>
                        <div className="space-y-1 text-sm">
                          <div>Type: {generation.generatedSession.template?.type}</div>
                          <div>Duration: {generation.generatedSession.template?.estimatedDuration} minutes</div>
                          <div>Difficulty: {generation.generatedSession.template?.difficulty}</div>
                          <div>Success Prediction: {Math.round((generation.generatedSession.predictions?.successProbability || 0) * 100)}%</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Optimization Goals</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {['Success Rate', 'Time Efficiency', 'User Satisfaction', 'Learning Effectiveness'].map((goal) => (
                            <div key={goal} className="flex items-center space-x-2">
                              <input type="checkbox" id={goal} defaultChecked />
                              <Label htmlFor={goal} className="text-sm">{goal}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button 
                        onClick={handleOptimize}
                        disabled={optimization.loading}
                        className="w-full"
                      >
                        {optimization.loading ? (
                          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <TrendingUp className="w-4 h-4 mr-2" />
                        )}
                        Optimize Session
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Generate a session first to enable optimization</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Optimization Results */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Optimization Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {optimization.loading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
                      <span className="ml-2">Optimizing session...</span>
                    </div>
                  ) : optimization.improvement ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="text-sm text-green-600">Improvement</div>
                          <div className="text-2xl font-bold text-green-700">
                            +{Math.round(optimization.improvement.improvementPercentage)}%
                          </div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm text-blue-600">Efficiency</div>
                          <div className="text-2xl font-bold text-blue-700">
                            {Math.round(optimization.performance.efficiency)}%
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Recommendations</h4>
                        <div className="space-y-2">
                          {optimization.recommendations.slice(0, 3).map((rec, index) => (
                            <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                              <div className="font-medium">{rec.description}</div>
                              <div className="text-gray-600">Impact: {Math.round((rec.improvement || 0) * 100)}%</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Optimization results will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {generation.generatedSession ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Session Overview */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Generated Session
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share className="w-4 h-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Session Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">Type</div>
                          <div className="font-medium capitalize">{generation.generatedSession.template?.type}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Duration</div>
                          <div className="font-medium">{generation.generatedSession.template?.estimatedDuration}min</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Difficulty</div>
                          <div className="font-medium capitalize">{generation.generatedSession.template?.difficulty}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Success Rate</div>
                          <div className="font-medium text-green-600">
                            {Math.round((generation.generatedSession.predictions?.successProbability || 0) * 100)}%
                          </div>
                        </div>
                      </div>

                      {/* Session Phases */}
                      <div>
                        <h4 className="font-medium mb-3">Session Structure</h4>
                        <div className="space-y-2">
                          {generation.generatedSession.template?.structure?.phases?.slice(0, 5).map((phase: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-purple-600">{index + 1}</span>
                                </div>
                                <div>
                                  <div className="font-medium">{phase.name || `Phase ${index + 1}`}</div>
                                  <div className="text-sm text-gray-600">{phase.type}</div>
                                </div>
                              </div>
                              <div className="text-sm text-gray-600">
                                {phase.duration || 20}min
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Success Prediction</span>
                          <span className="text-sm font-medium">
                            {Math.round((generation.generatedSession.predictions?.successProbability || 0) * 100)}%
                          </span>
                        </div>
                        <Progress value={(generation.generatedSession.predictions?.successProbability || 0) * 100} />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Learning Effectiveness</span>
                          <span className="text-sm font-medium">
                            {Math.round((generation.generatedSession.predictions?.learningEffectiveness || 0.8) * 100)}%
                          </span>
                        </div>
                        <Progress value={(generation.generatedSession.predictions?.learningEffectiveness || 0.8) * 100} />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Resource Utilization</span>
                          <span className="text-sm font-medium">
                            {Math.round((generation.generatedSession.predictions?.resourceUtilization || 0.75) * 100)}%
                          </span>
                        </div>
                        <Progress value={(generation.generatedSession.predictions?.resourceUtilization || 0.75) * 100} />
                      </div>
                    </div>

                    <div className="pt-4 space-y-2">
                      <h4 className="font-medium">AI Algorithms Used</h4>
                      <div className="space-y-1">
                        {generation.metadata.algorithmsUsed.map((algorithm) => (
                          <Badge key={algorithm} variant="outline" className="text-xs">
                            {algorithm.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Alternatives */}
                {generation.alternatives.length > 0 && (
                  <Card className="lg:col-span-3">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <GitBranch className="w-5 h-5" />
                        Alternative Sessions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {generation.alternatives.slice(0, 3).map((alt, index) => (
                          <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <h4 className="font-medium mb-2">{alt.name}</h4>
                            <p className="text-sm text-gray-600 mb-3">{alt.description}</p>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Suitability:</span>
                                <span className="font-medium">{Math.round((alt.suitability || 0.8) * 100)}%</span>
                              </div>
                              <div className="space-y-1">
                                {alt.advantages?.slice(0, 2).map((adv: string, i: number) => (
                                  <div key={i} className="text-xs text-green-600">+ {adv}</div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Session Generated Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Use the AI generator to create an intelligent session optimized for your needs.
                  </p>
                  <Button onClick={() => window.scrollTo(0, 0)}>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Go to Generator
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Learning Tab */}
          <TabsContent value="learning" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Learning Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Continuous Learning
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {learning.learningData.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-sm text-blue-600">Sessions Analyzed</div>
                          <div className="text-2xl font-bold text-blue-700">{learning.learningData.length}</div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="text-sm text-green-600">Learning Effectiveness</div>
                          <div className="text-2xl font-bold text-green-700">
                            {Math.round(learning.effectiveness * 100)}%
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Recent Improvements</h4>
                        <div className="space-y-2">
                          {learning.improvements.slice(0, 3).map((improvement, index) => (
                            <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                              <div className="font-medium">{improvement.type}</div>
                              <div className="text-gray-600">{improvement.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Adaptive Changes</h4>
                        <div className="text-sm text-gray-600">
                          The AI has made {learning.adaptations.length} automatic adaptations based on your usage patterns.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Generate and use sessions to enable continuous learning</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Learning Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Learning Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Pattern Recognition</h4>
                      <div className="text-sm text-gray-600">
                        AI has identified patterns in your session preferences and performance.
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Optimization History</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Genetic Algorithm</span>
                          <span className="text-sm font-medium">85% avg improvement</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Neural Networks</span>
                          <span className="text-sm font-medium">78% avg improvement</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Reinforcement Learning</span>
                          <span className="text-sm font-medium">82% avg improvement</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Future Predictions</h4>
                      <div className="text-sm text-gray-600">
                        Based on learning data, the AI predicts continued improvement in session effectiveness.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 