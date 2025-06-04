'use client'

import { useState, useEffect } from 'react'
import { usePatternRecognition, usePrediction, usePatternMonitoring, PatternUtils } from '@/lib/hooks/usePatternRecognition'
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
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Zap, 
  Search, 
  RefreshCw, 
  BarChart3, 
  LineChart, 
  PieChart, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Settings,
  Download,
  Play,
  Pause,
  Eye,
  Lightbulb,
  Activity,
  Cpu,
  Database
} from 'lucide-react'

interface PatternDashboardProps {}

export default function PatternDashboard({}: PatternDashboardProps) {
  // State management
  const [selectedSystems, setSelectedSystems] = useState(['learning', 'sessions', 'analytics'])
  const [timeRange, setTimeRange] = useState('7d')
  const [minConfidence, setMinConfidence] = useState(0.7)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [predictionMetric, setPredictionMetric] = useState('success_rate')
  const [predictionHorizon, setPredictionHorizon] = useState(24)

  // Hooks
  const patternAnalysis = usePatternRecognition({
    systems: selectedSystems,
    timeRange: {
      start: new Date(Date.now() - (timeRange === '1d' ? 24 : timeRange === '7d' ? 168 : 720) * 60 * 60 * 1000),
      end: new Date()
    },
    minConfidence,
    maxResults: 50,
    autoRefresh,
    refreshInterval: 60 // 1 minute
  })

  const prediction = usePrediction({
    targetMetric: predictionMetric,
    timeHorizon: predictionHorizon,
    predictionType: 'comprehensive'
  })

  const monitoring = usePatternMonitoring(autoRefresh, 60)

  // System options
  const systemOptions = [
    { id: 'learning', name: 'Learning System', icon: Brain },
    { id: 'sessions', name: 'Session Management', icon: Clock },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'cache', name: 'Cache System', icon: Database },
    { id: 'files', name: 'File System', icon: Activity }
  ]

  // Handle analysis
  const handleAnalyze = async () => {
    try {
      await patternAnalysis.analyzePatterns()
    } catch (error) {
      console.error('Analysis failed:', error)
    }
  }

  // Handle prediction
  const handlePredict = async () => {
    try {
      await prediction.predict()
    } catch (error) {
      console.error('Prediction failed:', error)
    }
  }

  // Pattern statistics
  const patternStats = PatternUtils.calculateStats(patternAnalysis.patterns)
  const patternsByType = PatternUtils.groupByType(patternAnalysis.patterns)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Brain className="w-8 h-8 text-purple-600" />
              Pattern Recognition Engine
            </h1>
            <p className="text-gray-600 mt-1">
              AI-powered pattern analysis and predictive insights across all Development Hub systems
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
                id="auto-refresh"
              />
              <Label htmlFor="auto-refresh" className="text-sm">Real-time</Label>
            </div>
            {monitoring.isMonitoring && (
              <Badge variant="secondary" className="animate-pulse">
                <Activity className="w-4 h-4 mr-1" />
                Live Monitoring
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Patterns</p>
                  <p className="text-2xl font-bold">{patternStats.totalPatterns}</p>
                </div>
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Confidence</p>
                  <p className="text-2xl font-bold">
                    {PatternUtils.formatConfidence(patternStats.averageConfidence)}
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
                  <p className="text-sm text-gray-600">Anomalies</p>
                  <p className="text-2xl font-bold text-red-600">{patternAnalysis.anomalies.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Processing Time</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {PatternUtils.formatProcessingTime(patternAnalysis.metadata.processingTime)}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {prediction.predictions?.ensemble?.prediction ? 
                      Math.round(prediction.predictions.ensemble.prediction * 100) + '%' : 
                      '—'
                    }
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Control Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Analysis Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Systems Selection */}
              <div className="space-y-2">
                <Label>Systems to Analyze</Label>
                <div className="grid grid-cols-2 gap-2">
                  {systemOptions.map((system) => (
                    <div key={system.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={system.id}
                        checked={selectedSystems.includes(system.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSystems([...selectedSystems, system.id])
                          } else {
                            setSelectedSystems(selectedSystems.filter(s => s !== system.id))
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={system.id} className="text-sm">{system.name}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Range */}
              <div className="space-y-2">
                <Label>Time Range</Label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1d">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Confidence Threshold */}
              <div className="space-y-2">
                <Label>Min Confidence: {Math.round(minConfidence * 100)}%</Label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Label>Actions</Label>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAnalyze}
                    disabled={patternAnalysis.loading}
                    size="sm"
                    className="flex-1"
                  >
                    {patternAnalysis.loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                    ) : (
                      <Search className="w-4 h-4 mr-1" />
                    )}
                    Analyze
                  </Button>
                  <Button
                    onClick={handlePredict}
                    disabled={prediction.loading}
                    size="sm"
                    variant="outline"
                    className="flex-1"
                  >
                    {prediction.loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                    ) : (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    )}
                    Predict
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {(patternAnalysis.error || prediction.error) && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {patternAnalysis.error || prediction.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="patterns" className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="patterns" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Patterns
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Predictions
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="anomalies" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Anomalies
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Recommendations
            </TabsTrigger>
          </TabsList>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pattern List */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Identified Patterns</span>
                      <Badge variant="secondary">{patternAnalysis.patterns.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {patternAnalysis.loading ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
                        <span className="ml-2">Analyzing patterns...</span>
                      </div>
                    ) : patternAnalysis.patterns.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No patterns found. Try adjusting your filters or time range.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {PatternUtils.sortPatterns(patternAnalysis.patterns, 'confidence').slice(0, 10).map((pattern, index) => (
                          <div key={pattern.id} className="border rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="outline" className="text-xs">
                                    {pattern.type}
                                  </Badge>
                                  <Badge 
                                    variant={pattern.confidence > 0.8 ? "default" : "secondary"}
                                    className="text-xs"
                                  >
                                    {PatternUtils.formatConfidence(pattern.confidence)}
                                  </Badge>
                                </div>
                                <h4 className="font-medium text-gray-900">{pattern.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">{pattern.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span>Frequency: {pattern.frequency?.toFixed(1) || 'N/A'}</span>
                                  <span>Success Rate: {Math.round((pattern.successRate || 0) * 100)}%</span>
                                  <span>Impact: {Math.round((pattern.impact || 0) * 100)}%</span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <Progress 
                                  value={pattern.confidence * 100} 
                                  className="w-16 h-2"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Pattern Statistics */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Pattern Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(patternStats.typeDistribution).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={(count / patternStats.totalPatterns) * 100} 
                              className="w-20 h-2"
                            />
                            <span className="text-sm text-gray-600">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Metadata</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Data Points:</span>
                      <span>{patternAnalysis.metadata.dataPointsAnalyzed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing Time:</span>
                      <span>{PatternUtils.formatProcessingTime(patternAnalysis.metadata.processingTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Updated:</span>
                      <span>
                        {patternAnalysis.metadata.lastUpdated?.toLocaleTimeString() || 'Never'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Overall Confidence:</span>
                      <span>{PatternUtils.formatConfidence(patternAnalysis.metadata.confidence)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Prediction Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Prediction Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Target Metric</Label>
                    <Select value={predictionMetric} onValueChange={setPredictionMetric}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="success_rate">Success Rate</SelectItem>
                        <SelectItem value="duration">Session Duration</SelectItem>
                        <SelectItem value="completion_probability">Completion Probability</SelectItem>
                        <SelectItem value="performance_score">Performance Score</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Time Horizon: {predictionHorizon} hours</Label>
                    <input
                      type="range"
                      min="1"
                      max="168"
                      value={predictionHorizon}
                      onChange={(e) => setPredictionHorizon(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Prediction Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Prediction Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {prediction.loading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
                      <span className="ml-2">Generating predictions...</span>
                    </div>
                  ) : prediction.predictions ? (
                    <div className="space-y-4">
                      {/* Primary Prediction */}
                      {prediction.predictions.primary && (
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">Primary Prediction</h4>
                          <div className="flex items-center gap-4">
                            <div className="text-2xl font-bold text-purple-600">
                              {typeof prediction.predictions.primary.predictedValue === 'number' ?
                                `${Math.round(prediction.predictions.primary.predictedValue * 100)}%` :
                                prediction.predictions.primary.predictedValue
                              }
                            </div>
                            <div className="text-sm text-gray-600">
                              Confidence: {PatternUtils.formatConfidence(prediction.predictions.primary.confidence)}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Ensemble Prediction */}
                      {prediction.predictions.ensemble && (
                        <div className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">Ensemble Prediction</h4>
                          <div className="flex items-center gap-4">
                            <div className="text-2xl font-bold text-emerald-600">
                              {Math.round(prediction.predictions.ensemble.prediction * 100)}%
                            </div>
                            <div className="text-sm text-gray-600">
                              From {prediction.predictions.ensemble.modelCount} models
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            {prediction.predictions.ensemble.explanation?.slice(0, 2).join(' • ')}
                          </div>
                        </div>
                      )}

                      {/* Alternative Scenarios */}
                      {prediction.alternatives.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Alternative Scenarios</h4>
                          {prediction.alternatives.map((scenario, index) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">{scenario.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {Math.round(scenario.probability * 100)}% chance
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600">{scenario.description}</div>
                              <div className="mt-2 text-lg font-bold">
                                {Math.round(scenario.value * 100)}%
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Click "Predict" to generate predictions
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {patternAnalysis.insights.length === 0 ? (
                <div className="lg:col-span-2 text-center py-8 text-gray-500">
                  No insights available. Run pattern analysis to generate insights.
                </div>
              ) : (
                patternAnalysis.insights.map((insight, index) => (
                  <Card key={insight.id} className="h-fit">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-600" />
                        {insight.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-gray-700">{insight.description}</p>
                        
                        <div className="flex items-center gap-4">
                          <Badge variant="outline">
                            {insight.type}
                          </Badge>
                          <Badge variant={insight.confidence > 0.8 ? "default" : "secondary"}>
                            {PatternUtils.formatConfidence(insight.confidence)} confidence
                          </Badge>
                          <div className="text-sm text-gray-600">
                            Impact: {Math.round(insight.impact * 100)}%
                          </div>
                        </div>

                        {insight.evidence && insight.evidence.length > 0 && (
                          <div>
                            <h5 className="font-medium text-sm mb-2">Supporting Evidence:</h5>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                              {insight.evidence.map((evidence: string, idx: number) => (
                                <li key={idx}>{evidence}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Anomalies Tab */}
          <TabsContent value="anomalies" className="space-y-4">
            {patternAnalysis.anomalies.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No Anomalies Detected</h3>
                  <p className="text-gray-600">All systems are operating within normal parameters.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {patternAnalysis.anomalies.map((anomaly, index) => (
                  <Card key={anomaly.id} className="border-red-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-700">
                        <AlertTriangle className="w-5 h-5" />
                        {anomaly.description}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <Badge 
                            variant={anomaly.severity === 'critical' ? "destructive" : 
                                   anomaly.severity === 'high' ? "destructive" : "secondary"}
                          >
                            {anomaly.severity} severity
                          </Badge>
                          <Badge variant="outline">
                            {anomaly.type}
                          </Badge>
                        </div>

                        <div>
                          <h5 className="font-medium text-sm mb-2">Affected Systems:</h5>
                          <div className="flex flex-wrap gap-1">
                            {anomaly.affectedSystems.map((system: string) => (
                              <Badge key={system} variant="outline" className="text-xs">
                                {system}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium text-sm mb-2">Possible Causes:</h5>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {anomaly.possibleCauses.map((cause: string, idx: number) => (
                              <li key={idx}>{cause}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="font-medium text-sm mb-2">Recommended Actions:</h5>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {anomaly.recommendedActions.map((action: string, idx: number) => (
                              <li key={idx}>{action}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="text-xs text-gray-500">
                          Detected: {new Date(anomaly.detectedAt).toLocaleString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-4">
            {patternAnalysis.recommendations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No recommendations available. Run pattern analysis to get AI-powered suggestions.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {patternAnalysis.recommendations.slice(0, 6).map((rec, index) => (
                  <Card key={rec.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          {rec.title}
                        </span>
                        <Badge 
                          variant={rec.priority === 'critical' ? "destructive" : 
                                 rec.priority === 'high' ? "destructive" : "secondary"}
                        >
                          {rec.priority}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-gray-700">{rec.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Impact: </span>
                            <span className="font-medium">{Math.round(rec.estimatedImpact * 100)}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Effort: </span>
                            <span className="font-medium">{Math.round(rec.implementationEffort * 100)}%</span>
                          </div>
                          <Badge variant="outline">{rec.type}</Badge>
                        </div>

                        {rec.evidence && rec.evidence.length > 0 && (
                          <div>
                            <h5 className="font-medium text-sm mb-2">Evidence:</h5>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                              {rec.evidence.slice(0, 3).map((evidence: string, idx: number) => (
                                <li key={idx}>{evidence}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {rec.actionItems && rec.actionItems.length > 0 && (
                          <div>
                            <h5 className="font-medium text-sm mb-2">Action Items:</h5>
                            <div className="space-y-2">
                              {rec.actionItems.slice(0, 2).map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                  <span>{item.description}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {item.estimatedTime}min
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 