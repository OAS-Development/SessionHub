'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Brain, Zap, TrendingUp, Settings, Play, Pause, Target, Activity } from 'lucide-react'
import { useMetaLearning, useAlgorithmPerformance, useEvolutionHistory, MetaLearningUtils } from '@/lib/hooks/useMetaLearning'
import { cn } from '@/lib/utils'

export default function MetaLearningPage() {
  const {
    algorithms,
    optimizationInProgress,
    lastOptimization,
    improvements,
    selfReflection,
    autonomousAdaptations,
    loading,
    error,
    optimizeAlgorithm,
    evolveCapabilities,
    monitorAlgorithm,
    triggerManualEvolution
  } = useMetaLearning()

  const { evolutionHistory, evolutionInsights } = useEvolutionHistory()

  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | undefined>()
  const [activeTab, setActiveTab] = useState('overview')
  const [evolutionMode, setEvolutionMode] = useState<'capability_enhancement' | 'architecture_evolution' | 'learning_optimization' | 'autonomous_adaptation'>('capability_enhancement')

  // Calculate system-wide metrics
  const systemMetrics = {
    totalAlgorithms: algorithms.length,
    averageAccuracy: algorithms.length > 0 ? algorithms.reduce((sum, algo) => sum + algo.performance.accuracy, 0) / algorithms.length : 0,
    averageSelfReflectionAccuracy: algorithms.length > 0 ? algorithms.reduce((sum, algo) => sum + algo.performance.selfReflectionAccuracy, 0) / algorithms.length : 0,
    autonomousAdaptationsCount: autonomousAdaptations.length,
    improvementTrend: MetaLearningUtils.calculateImprovementTrend(improvements),
    metaLearningEffectiveness: MetaLearningUtils.calculateMetaLearningEffectiveness(algorithms)
  }

  // Handle optimization
  const handleOptimization = async (algorithmId?: string) => {
    try {
      await optimizeAlgorithm({
        algorithmId,
        optimizationType: 'comprehensive',
        targetImprovement: 0.15,
        metaLearningEnabled: true,
        recursiveLearningDepth: 3
      })
    } catch (error) {
      console.error('Optimization failed:', error)
    }
  }

  // Handle evolution
  const handleEvolution = async () => {
    try {
      await evolveCapabilities({
        evolutionType: evolutionMode,
        targetAlgorithms: selectedAlgorithm ? [selectedAlgorithm] : [],
        parallelEvolution: true,
        autonomousEvolutionEnabled: true,
        crossAlgorithmLearning: true
      })
    } catch (error) {
      console.error('Evolution failed:', error)
    }
  }

  // Handle manual evolution
  const handleManualEvolution = async (algorithmId: string, scope: 'targeted' | 'comprehensive' | 'experimental') => {
    try {
      await triggerManualEvolution(algorithmId, scope)
    } catch (error) {
      console.error('Manual evolution failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Brain className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Meta-Learning Control Center</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Advanced AI self-improvement system enabling autonomous algorithm optimization, 
            capability evolution, and recursive learning enhancement
          </p>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Algorithms</CardTitle>
              <Brain className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemMetrics.totalAlgorithms}</div>
              <p className="text-xs text-muted-foreground">
                {algorithms.filter(a => a.performance.accuracy > 0.9).length} high-performing
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Self-Reflection Accuracy</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(systemMetrics.averageSelfReflectionAccuracy * 100)}%</div>
              <p className="text-xs text-muted-foreground">
                Target: >90% accuracy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Autonomous Adaptations</CardTitle>
              <Zap className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemMetrics.autonomousAdaptationsCount}</div>
              <p className="text-xs text-muted-foreground">
                {autonomousAdaptations.filter(a => a.success).length} successful
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Improvement Trend</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Badge variant={
                  systemMetrics.improvementTrend === 'improving' ? 'default' :
                  systemMetrics.improvementTrend === 'stable' ? 'secondary' : 'destructive'
                }>
                  {systemMetrics.improvementTrend}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Based on recent optimizations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center space-x-2 pt-6">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </CardContent>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="optimize">Optimize</TabsTrigger>
            <TabsTrigger value="evolve">Evolve</TabsTrigger>
            <TabsTrigger value="monitor">Monitor</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Algorithm Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Algorithm Performance</CardTitle>
                  <CardDescription>Real-time performance metrics for all algorithms</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {algorithms.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No algorithms detected</p>
                  ) : (
                    algorithms.map(algorithm => (
                      <div key={algorithm.algorithmId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <div className="font-medium">{algorithm.algorithmId}</div>
                          <div className="text-sm text-muted-foreground">
                            Accuracy: {Math.round(algorithm.performance.accuracy * 100)}% | 
                            Efficiency: {Math.round(algorithm.performance.efficiency * 100)}%
                          </div>
                        </div>
                        <div className="space-x-2">
                          <Badge variant={algorithm.performance.accuracy > 0.9 ? 'default' : 'secondary'}>
                            {algorithm.performance.accuracy > 0.9 ? 'High' : 'Medium'} Performance
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => setSelectedAlgorithm(algorithm.algorithmId)}
                            variant="outline"
                          >
                            Select
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Self-Reflection Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Self-Reflection Analysis</CardTitle>
                  <CardDescription>AI system's self-assessment and insights</CardDescription>
                </CardHeader>
                <CardContent>
                  {selfReflection ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Overall Accuracy</span>
                        <Badge variant={selfReflection.overallAccuracy > 0.9 ? 'default' : 'secondary'}>
                          {Math.round(selfReflection.overallAccuracy * 100)}%
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Improvement Opportunities</span>
                        <div className="space-y-1">
                          {selfReflection.improvementOpportunities.slice(0, 3).map((opportunity, index) => (
                            <div key={index} className="text-sm text-muted-foreground">
                              • {opportunity}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Confidence Level</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(selfReflection.confidenceLevel * 100)}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Self-reflection data will appear after first optimization
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common meta-learning operations</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <Button
                  onClick={() => handleOptimization()}
                  disabled={optimizationInProgress || loading}
                  className="flex items-center space-x-2"
                >
                  {optimizationInProgress ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  <span>System-Wide Optimization</span>
                </Button>

                <Button
                  onClick={handleEvolution}
                  disabled={loading}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Zap className="h-4 w-4" />
                  <span>Trigger Evolution</span>
                </Button>

                <Button
                  onClick={() => setActiveTab('insights')}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <Activity className="h-4 w-4" />
                  <span>View Insights</span>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Optimization Tab */}
          <TabsContent value="optimize" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Algorithm Optimization</CardTitle>
                <CardDescription>Optimize individual algorithms or the entire system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Algorithm</label>
                    <select
                      value={selectedAlgorithm || ''}
                      onChange={(e) => setSelectedAlgorithm(e.target.value || undefined)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">All Algorithms</option>
                      {algorithms.map(algo => (
                        <option key={algo.algorithmId} value={algo.algorithmId}>
                          {algo.algorithmId}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Optimization Type</label>
                    <select className="w-full p-2 border rounded-md">
                      <option value="comprehensive">Comprehensive</option>
                      <option value="hyperparameter">Hyperparameter Only</option>
                      <option value="architecture">Architecture Only</option>
                      <option value="learning_rate">Learning Rate Only</option>
                      <option value="feature_engineering">Feature Engineering</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={() => handleOptimization(selectedAlgorithm)}
                    disabled={optimizationInProgress || loading}
                    className="flex items-center space-x-2"
                  >
                    <Target className="h-4 w-4" />
                    <span>Start Optimization</span>
                  </Button>

                  {selectedAlgorithm && (
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleManualEvolution(selectedAlgorithm, 'targeted')}
                        variant="outline"
                        size="sm"
                      >
                        Targeted Evolution
                      </Button>
                      <Button
                        onClick={() => handleManualEvolution(selectedAlgorithm, 'comprehensive')}
                        variant="outline"
                        size="sm"
                      >
                        Comprehensive Evolution
                      </Button>
                      <Button
                        onClick={() => handleManualEvolution(selectedAlgorithm, 'experimental')}
                        variant="outline"
                        size="sm"
                      >
                        Experimental Evolution
                      </Button>
                    </div>
                  )}
                </div>

                {optimizationInProgress && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-blue-700">Optimization in progress...</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Improvements */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Improvements</CardTitle>
                <CardDescription>Latest optimization results</CardDescription>
              </CardHeader>
              <CardContent>
                {improvements.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No improvements recorded yet</p>
                ) : (
                  <div className="space-y-3">
                    {improvements.slice(-5).reverse().map((improvement, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{improvement.algorithmId}</div>
                          <div className="text-sm text-muted-foreground">
                            {improvement.improvementType} • {improvement.method}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-green-600">
                            +{Math.round(improvement.improvement * 100)}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {Math.round(improvement.confidence * 100)}% confidence
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Evolution Tab */}
          <TabsContent value="evolve" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Capability Evolution</CardTitle>
                <CardDescription>Evolve algorithm capabilities and discover new patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Evolution Type</label>
                    <select
                      value={evolutionMode}
                      onChange={(e) => setEvolutionMode(e.target.value as any)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="capability_enhancement">Capability Enhancement</option>
                      <option value="architecture_evolution">Architecture Evolution</option>
                      <option value="learning_optimization">Learning Optimization</option>
                      <option value="autonomous_adaptation">Autonomous Adaptation</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Algorithms</label>
                    <select
                      value={selectedAlgorithm || ''}
                      onChange={(e) => setSelectedAlgorithm(e.target.value || undefined)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">All Algorithms</option>
                      {algorithms.map(algo => (
                        <option key={algo.algorithmId} value={algo.algorithmId}>
                          {algo.algorithmId}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button
                  onClick={handleEvolution}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <Zap className="h-4 w-4" />
                  <span>Start Evolution</span>
                </Button>

                {loading && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                      <span className="text-purple-700">Evolution in progress...</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Evolution History */}
            <Card>
              <CardHeader>
                <CardTitle>Evolution History</CardTitle>
                <CardDescription>Track capability evolution over time</CardDescription>
              </CardHeader>
              <CardContent>
                {evolutionHistory.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No evolution history available</p>
                ) : (
                  <div className="space-y-3">
                    {evolutionHistory.slice(-5).reverse().map((evolution, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{evolution.algorithmId}</div>
                          <div className="text-sm text-muted-foreground">
                            {evolution.evolutionType} • {new Date(evolution.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={evolution.success ? 'default' : 'secondary'}>
                            {evolution.success ? 'Success' : 'Failed'}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            +{Math.round(evolution.improvement * 100)}% improvement
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitor Tab */}
          <TabsContent value="monitor" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Algorithm Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Algorithm Monitor</CardTitle>
                  <CardDescription>Real-time performance monitoring</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <select
                      value={selectedAlgorithm || ''}
                      onChange={(e) => setSelectedAlgorithm(e.target.value || undefined)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select Algorithm</option>
                      {algorithms.map(algo => (
                        <option key={algo.algorithmId} value={algo.algorithmId}>
                          {algo.algorithmId}
                        </option>
                      ))}
                    </select>

                    {selectedAlgorithm && (
                      <AlgorithmPerformanceMonitor algorithmId={selectedAlgorithm} />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Autonomous Adaptations */}
              <Card>
                <CardHeader>
                  <CardTitle>Autonomous Adaptations</CardTitle>
                  <CardDescription>Self-directed algorithm improvements</CardDescription>
                </CardHeader>
                <CardContent>
                  {autonomousAdaptations.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No autonomous adaptations yet</p>
                  ) : (
                    <div className="space-y-3">
                      {autonomousAdaptations.slice(-5).reverse().map((adaptation, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{adaptation.algorithmId}</span>
                            <Badge variant={adaptation.success ? 'default' : 'secondary'}>
                              {adaptation.success ? 'Success' : 'Failed'}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {adaptation.description}
                          </div>
                          <div className="flex justify-between text-sm mt-2">
                            <span>Improvement: +{Math.round(adaptation.improvement * 100)}%</span>
                            <span>Confidence: {Math.round(adaptation.confidence * 100)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>System Insights</CardTitle>
                  <CardDescription>Meta-learning analytics and patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Meta-Learning Effectiveness</span>
                      <Badge variant={systemMetrics.metaLearningEffectiveness > 0.9 ? 'default' : 'secondary'}>
                        {Math.round(systemMetrics.metaLearningEffectiveness * 100)}%
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Accuracy</span>
                      <span className="text-sm font-medium">
                        {Math.round(systemMetrics.averageAccuracy * 100)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Last Optimization</span>
                      <span className="text-sm text-muted-foreground">
                        {lastOptimization ? new Date(lastOptimization).toLocaleString() : 'Never'}
                      </span>
                    </div>

                    {evolutionInsights && (
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Emergent Capabilities</span>
                        <div className="space-y-1">
                          {evolutionInsights.emergentCapabilities.slice(0, 3).map((capability: string, index: number) => (
                            <Badge key={index} variant="outline" className="mr-2">
                              {capability}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>Historical improvement patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Improvement Trend</span>
                      <Badge variant={
                        systemMetrics.improvementTrend === 'improving' ? 'default' :
                        systemMetrics.improvementTrend === 'stable' ? 'secondary' : 'destructive'
                      }>
                        {systemMetrics.improvementTrend}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm font-medium">Recent Improvements</span>
                      <div className="text-2xl font-bold text-green-600">
                        {improvements.length > 0 
                          ? `+${Math.round(improvements.slice(-1)[0]?.improvement * 100 || 0)}%`
                          : 'N/A'
                        }
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-sm font-medium">Success Rate</span>
                      <div className="text-sm text-muted-foreground">
                        {autonomousAdaptations.length > 0
                          ? `${Math.round((autonomousAdaptations.filter(a => a.success).length / autonomousAdaptations.length) * 100)}%`
                          : 'N/A'
                        }
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

// Algorithm Performance Monitor Component
function AlgorithmPerformanceMonitor({ algorithmId }: { algorithmId: string }) {
  const { performance, loading, error } = useAlgorithmPerformance(algorithmId)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm text-center py-4">
        Error loading performance data: {error}
      </div>
    )
  }

  if (!performance) {
    return (
      <div className="text-muted-foreground text-center py-4">
        No performance data available
      </div>
    )
  }

  const formattedMetrics = MetaLearningUtils.formatPerformanceMetrics(performance)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium">Accuracy</div>
          <div className="text-lg font-bold">{formattedMetrics.accuracy}%</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium">Efficiency</div>
          <div className="text-lg font-bold">{formattedMetrics.efficiency}%</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium">Convergence</div>
          <div className="text-lg font-bold">{formattedMetrics.convergenceTime}</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium">Self-Reflection</div>
          <div className="text-lg font-bold">{formattedMetrics.selfReflectionAccuracy}%</div>
        </div>
      </div>
    </div>
  )
} 