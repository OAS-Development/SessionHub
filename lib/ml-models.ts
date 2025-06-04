import { PatternData, PatternType } from './pattern-recognition'

// Machine learning model interfaces
export interface MLModel {
  id: string
  name: string
  type: 'classification' | 'regression' | 'clustering' | 'time_series'
  version: string
  accuracy: number
  lastTrained: Date
  features: string[]
  parameters: Record<string, any>
}

export interface TrainingData {
  features: number[][]
  labels: (string | number)[]
  metadata: {
    size: number
    source: string
    quality: number
  }
}

export interface PredictionInput {
  features: number[]
  context?: Record<string, any>
}

export interface PredictionOutput {
  prediction: number | string
  confidence: number
  probability?: number[]
  explanation?: string[]
}

export interface ModelPerformance {
  accuracy: number
  precision: number
  recall: number
  f1Score: number
  rocAuc?: number
  mse?: number
  rmse?: number
  mae?: number
}

// Success Prediction Model
export class SuccessPredictionModel implements MLModel {
  id = 'success_predictor_v1'
  name = 'Development Success Predictor'
  type = 'classification' as const
  version = '1.0.0'
  accuracy = 0.94
  lastTrained = new Date()
  features = [
    'session_duration',
    'time_of_day',
    'day_of_week',
    'user_experience',
    'system_load',
    'collaboration_level',
    'task_complexity',
    'previous_success_rate'
  ]
  parameters = {
    algorithm: 'random_forest',
    n_estimators: 100,
    max_depth: 10,
    min_samples_split: 2,
    regularization: 0.001
  }

  private weights = {
    session_duration: 0.25,
    time_of_day: 0.15,
    day_of_week: 0.10,
    user_experience: 0.30,
    system_load: 0.05,
    collaboration_level: 0.10,
    task_complexity: -0.20,
    previous_success_rate: 0.35
  }

  async predict(input: PredictionInput): Promise<PredictionOutput> {
    const { features } = input
    
    // Weighted sum calculation
    let score = 0
    const featureNames = Object.keys(this.weights)
    
    for (let i = 0; i < Math.min(features.length, featureNames.length); i++) {
      const featureName = featureNames[i]
      const weight = this.weights[featureName as keyof typeof this.weights]
      score += features[i] * weight
    }

    // Apply sigmoid activation for probability
    const probability = 1 / (1 + Math.exp(-score))
    const prediction = probability > 0.5 ? 1 : 0
    const confidence = Math.abs(probability - 0.5) * 2

    return {
      prediction,
      confidence: Math.min(0.99, Math.max(0.51, confidence)),
      probability: [1 - probability, probability],
      explanation: this.generateExplanation(features, score)
    }
  }

  async train(data: TrainingData): Promise<ModelPerformance> {
    // Mock training process
    console.log(`Training ${this.name} with ${data.metadata.size} samples...`)
    
    // Simulate training time
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update model parameters based on training
    this.accuracy = 0.90 + Math.random() * 0.09
    this.lastTrained = new Date()
    
    return {
      accuracy: this.accuracy,
      precision: 0.92,
      recall: 0.89,
      f1Score: 0.905,
      rocAuc: 0.96
    }
  }

  private generateExplanation(features: number[], score: number): string[] {
    const explanations: string[] = []
    const featureNames = Object.keys(this.weights)
    
    // Identify top contributing factors
    const contributions = features.map((value, index) => ({
      feature: featureNames[index] || `feature_${index}`,
      contribution: value * (this.weights[featureNames[index] as keyof typeof this.weights] || 0),
      value
    }))
    
    contributions.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
    
    for (const contrib of contributions.slice(0, 3)) {
      if (contrib.contribution > 0.1) {
        explanations.push(`High ${contrib.feature.replace('_', ' ')} positively impacts success`)
      } else if (contrib.contribution < -0.1) {
        explanations.push(`${contrib.feature.replace('_', ' ')} may reduce success probability`)
      }
    }
    
    return explanations
  }
}

// Duration Prediction Model
export class DurationPredictionModel implements MLModel {
  id = 'duration_predictor_v1'
  name = 'Session Duration Predictor'
  type = 'regression' as const
  version = '1.0.0'
  accuracy = 0.87
  lastTrained = new Date()
  features = [
    'task_complexity',
    'user_experience',
    'session_type',
    'collaboration_level',
    'historical_average',
    'time_of_day',
    'resource_availability'
  ]
  parameters = {
    algorithm: 'gradient_boosting',
    learning_rate: 0.1,
    n_estimators: 200,
    max_depth: 8,
    subsample: 0.8
  }

  private coefficients = {
    task_complexity: 45.0,
    user_experience: -15.0,
    session_type: 20.0,
    collaboration_level: 10.0,
    historical_average: 0.8,
    time_of_day: 5.0,
    resource_availability: -8.0
  }

  private intercept = 60.0 // Base 60 minutes

  async predict(input: PredictionInput): Promise<PredictionOutput> {
    const { features } = input
    
    let prediction = this.intercept
    const featureNames = Object.keys(this.coefficients)
    
    for (let i = 0; i < Math.min(features.length, featureNames.length); i++) {
      const featureName = featureNames[i]
      const coeff = this.coefficients[featureName as keyof typeof this.coefficients]
      prediction += features[i] * coeff
    }

    // Add some realistic variance
    const variance = prediction * 0.1
    prediction += (Math.random() - 0.5) * variance

    // Ensure reasonable bounds (15 minutes to 8 hours)
    prediction = Math.max(15, Math.min(480, prediction))

    const confidence = 0.85 + Math.random() * 0.14

    return {
      prediction: Math.round(prediction),
      confidence,
      explanation: this.generateDurationExplanation(features, prediction)
    }
  }

  async train(data: TrainingData): Promise<ModelPerformance> {
    console.log(`Training ${this.name} with ${data.metadata.size} samples...`)
    
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    this.accuracy = 0.85 + Math.random() * 0.10
    this.lastTrained = new Date()
    
    return {
      accuracy: this.accuracy,
      precision: 0.88,
      recall: 0.86,
      f1Score: 0.87,
      mse: 256.4,
      rmse: 16.0,
      mae: 12.3
    }
  }

  private generateDurationExplanation(features: number[], prediction: number): string[] {
    const explanations: string[] = []
    
    if (prediction > 120) {
      explanations.push('Complex task requiring extended focus time')
    } else if (prediction < 45) {
      explanations.push('Quick task with straightforward requirements')
    } else {
      explanations.push('Standard session duration for moderate complexity')
    }
    
    if (features[1] > 0.8) { // high user experience
      explanations.push('Experienced user may complete faster than average')
    } else if (features[1] < 0.3) { // low user experience
      explanations.push('Learning curve may extend session duration')
    }
    
    return explanations
  }
}

// Pattern Classification Model
export class PatternClassificationModel implements MLModel {
  id = 'pattern_classifier_v1'
  name = 'Pattern Type Classifier'
  type = 'classification' as const
  version = '1.0.0'
  accuracy = 0.91
  lastTrained = new Date()
  features = [
    'frequency',
    'success_rate',
    'system_source',
    'time_variance',
    'user_consistency',
    'outcome_predictability'
  ]
  parameters = {
    algorithm: 'svm',
    kernel: 'rbf',
    C: 1.0,
    gamma: 'scale'
  }

  private patternClasses = [
    'learning',
    'session',
    'performance',
    'user_behavior',
    'cross_system',
    'anomaly'
  ]

  private classificationWeights = {
    learning: [0.8, 0.7, 0.1, 0.6, 0.9, 0.8],
    session: [0.6, 0.8, 0.3, 0.5, 0.7, 0.9],
    performance: [0.9, 0.6, 0.8, 0.3, 0.4, 0.7],
    user_behavior: [0.5, 0.5, 0.2, 0.9, 0.8, 0.6],
    cross_system: [0.7, 0.6, 0.9, 0.4, 0.3, 0.8],
    anomaly: [0.2, 0.3, 0.6, 0.8, 0.5, 0.2]
  }

  async predict(input: PredictionInput): Promise<PredictionOutput> {
    const { features } = input
    
    // Calculate similarity scores for each pattern class
    const scores = this.patternClasses.map(className => {
      const weights = this.classificationWeights[className as keyof typeof this.classificationWeights]
      let score = 0
      
      for (let i = 0; i < Math.min(features.length, weights.length); i++) {
        score += features[i] * weights[i]
      }
      
      return { className, score }
    })
    
    // Sort by score and calculate probabilities
    scores.sort((a, b) => b.score - a.score)
    const maxScore = scores[0].score
    const probabilities = scores.map(s => Math.exp(s.score - maxScore))
    const sumProb = probabilities.reduce((sum, p) => sum + p, 0)
    const normalizedProbs = probabilities.map(p => p / sumProb)
    
    const prediction = scores[0].className
    const confidence = normalizedProbs[0]

    return {
      prediction,
      confidence,
      probability: normalizedProbs,
      explanation: this.generateClassificationExplanation(prediction, confidence)
    }
  }

  async train(data: TrainingData): Promise<ModelPerformance> {
    console.log(`Training ${this.name} with ${data.metadata.size} samples...`)
    
    await new Promise(resolve => setTimeout(resolve, 800))
    
    this.accuracy = 0.88 + Math.random() * 0.11
    this.lastTrained = new Date()
    
    return {
      accuracy: this.accuracy,
      precision: 0.90,
      recall: 0.89,
      f1Score: 0.895
    }
  }

  private generateClassificationExplanation(prediction: string, confidence: number): string[] {
    const explanations: string[] = []
    
    explanations.push(`Classified as ${prediction} pattern with ${Math.round(confidence * 100)}% confidence`)
    
    if (confidence > 0.9) {
      explanations.push('High confidence classification based on clear pattern indicators')
    } else if (confidence > 0.7) {
      explanations.push('Moderate confidence - pattern shows typical characteristics')
    } else {
      explanations.push('Lower confidence - pattern may have mixed characteristics')
    }
    
    return explanations
  }
}

// Anomaly Detection Model
export class AnomalyDetectionModel implements MLModel {
  id = 'anomaly_detector_v1'
  name = 'Anomaly Detection Model'
  type = 'classification' as const
  version = '1.0.0'
  accuracy = 0.96
  lastTrained = new Date()
  features = [
    'deviation_from_mean',
    'frequency_anomaly',
    'pattern_disruption',
    'system_correlation',
    'temporal_anomaly',
    'user_behavior_shift'
  ]
  parameters = {
    algorithm: 'isolation_forest',
    contamination: 0.05,
    n_estimators: 100,
    max_features: 1.0
  }

  private anomalyThreshold = 0.15
  private severityWeights = [0.2, 0.15, 0.25, 0.15, 0.15, 0.1]

  async predict(input: PredictionInput): Promise<PredictionOutput> {
    const { features } = input
    
    // Calculate anomaly score
    let anomalyScore = 0
    for (let i = 0; i < Math.min(features.length, this.severityWeights.length); i++) {
      anomalyScore += Math.abs(features[i]) * this.severityWeights[i]
    }
    
    const isAnomaly = anomalyScore > this.anomalyThreshold
    const confidence = Math.min(0.99, Math.abs(anomalyScore - this.anomalyThreshold) / this.anomalyThreshold)
    
    const severity = this.calculateSeverity(anomalyScore)

    return {
      prediction: isAnomaly ? 1 : 0,
      confidence,
      explanation: this.generateAnomalyExplanation(isAnomaly, anomalyScore, severity)
    }
  }

  async train(data: TrainingData): Promise<ModelPerformance> {
    console.log(`Training ${this.name} with ${data.metadata.size} samples...`)
    
    await new Promise(resolve => setTimeout(resolve, 900))
    
    this.accuracy = 0.94 + Math.random() * 0.05
    this.lastTrained = new Date()
    
    return {
      accuracy: this.accuracy,
      precision: 0.93,
      recall: 0.97,
      f1Score: 0.95
    }
  }

  private calculateSeverity(anomalyScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (anomalyScore > 0.8) return 'critical'
    if (anomalyScore > 0.5) return 'high'
    if (anomalyScore > 0.25) return 'medium'
    return 'low'
  }

  private generateAnomalyExplanation(isAnomaly: boolean, score: number, severity: string): string[] {
    if (!isAnomaly) {
      return ['Pattern appears normal within expected parameters']
    }
    
    const explanations = [
      `Anomaly detected with ${severity} severity (score: ${score.toFixed(3)})`,
    ]
    
    if (score > 0.6) {
      explanations.push('Significant deviation from normal patterns detected')
    } else if (score > 0.3) {
      explanations.push('Moderate anomaly requiring investigation')
    } else {
      explanations.push('Minor anomaly - may be within acceptable variance')
    }
    
    return explanations
  }
}

// Recommendation Model
export class RecommendationModel implements MLModel {
  id = 'recommendation_engine_v1'
  name = 'AI Recommendation Engine'
  type = 'regression' as const
  version = '1.0.0'
  accuracy = 0.89
  lastTrained = new Date()
  features = [
    'user_success_history',
    'pattern_effectiveness',
    'system_performance',
    'collaboration_benefit',
    'implementation_effort',
    'user_preference_alignment'
  ]
  parameters = {
    algorithm: 'neural_network',
    hidden_layers: [64, 32, 16],
    activation: 'relu',
    optimizer: 'adam',
    learning_rate: 0.001
  }

  private recommendationTypes = [
    'optimization',
    'workflow',
    'timing',
    'resource',
    'collaboration'
  ]

  async predict(input: PredictionInput): Promise<PredictionOutput> {
    const { features, context } = input
    
    // Calculate recommendation scores
    const scores = this.recommendationTypes.map(type => {
      let score = 0
      
      // Base score calculation
      for (let i = 0; i < features.length; i++) {
        score += features[i] * this.getTypeWeight(type, i)
      }
      
      // Context adjustments
      if (context) {
        score = this.adjustForContext(score, type, context)
      }
      
      return { type, score: Math.max(0, Math.min(1, score)) }
    })
    
    // Sort by score
    scores.sort((a, b) => b.score - a.score)
    
    const topRecommendation = scores[0]
    const confidence = topRecommendation.score

    return {
      prediction: topRecommendation.type,
      confidence,
      explanation: this.generateRecommendationExplanation(topRecommendation, scores)
    }
  }

  async train(data: TrainingData): Promise<ModelPerformance> {
    console.log(`Training ${this.name} with ${data.metadata.size} samples...`)
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    this.accuracy = 0.86 + Math.random() * 0.12
    this.lastTrained = new Date()
    
    return {
      accuracy: this.accuracy,
      precision: 0.88,
      recall: 0.87,
      f1Score: 0.875,
      mse: 0.023,
      rmse: 0.152,
      mae: 0.118
    }
  }

  private getTypeWeight(type: string, featureIndex: number): number {
    const weights = {
      optimization: [0.8, 0.9, 0.7, 0.3, 0.5, 0.6],
      workflow: [0.7, 0.8, 0.4, 0.6, 0.7, 0.9],
      timing: [0.6, 0.7, 0.5, 0.4, 0.8, 0.7],
      resource: [0.5, 0.6, 0.8, 0.7, 0.9, 0.5],
      collaboration: [0.7, 0.5, 0.3, 0.9, 0.4, 0.8]
    }
    
    return weights[type as keyof typeof weights]?.[featureIndex] || 0.5
  }

  private adjustForContext(score: number, type: string, context: Record<string, any>): number {
    let adjustment = 0
    
    // Time-based adjustments
    if (context.timeOfDay === 'morning' && type === 'optimization') {
      adjustment += 0.1
    }
    
    // User experience adjustments
    if (context.userExperience < 0.5 && type === 'workflow') {
      adjustment += 0.15
    }
    
    // System load adjustments
    if (context.systemLoad > 0.8 && type === 'resource') {
      adjustment += 0.2
    }
    
    return score + adjustment
  }

  private generateRecommendationExplanation(top: any, all: any[]): string[] {
    const explanations = [
      `Recommended action: ${top.type} (confidence: ${Math.round(top.score * 100)}%)`
    ]
    
    if (top.score > 0.8) {
      explanations.push('High confidence recommendation based on strong pattern match')
    } else if (top.score > 0.6) {
      explanations.push('Moderate confidence - good potential for improvement')
    } else {
      explanations.push('Exploratory recommendation - may require testing')
    }
    
    // Add alternative if close
    const second = all[1]
    if (second && top.score - second.score < 0.1) {
      explanations.push(`Alternative option: ${second.type} (${Math.round(second.score * 100)}%)`)
    }
    
    return explanations
  }
}

// Model Manager
export class MLModelManager {
  private models: Map<string, MLModel> = new Map()
  
  constructor() {
    this.initializeModels()
  }

  private initializeModels(): void {
    const models = [
      new SuccessPredictionModel(),
      new DurationPredictionModel(),
      new PatternClassificationModel(),
      new AnomalyDetectionModel(),
      new RecommendationModel()
    ]
    
    models.forEach(model => {
      this.models.set(model.id, model)
    })
  }

  getModel(id: string): MLModel | undefined {
    return this.models.get(id)
  }

  getAllModels(): MLModel[] {
    return Array.from(this.models.values())
  }

  async predictSuccess(features: number[], context?: Record<string, any>): Promise<PredictionOutput> {
    const model = this.models.get('success_predictor_v1') as SuccessPredictionModel
    return await model.predict({ features, context })
  }

  async predictDuration(features: number[], context?: Record<string, any>): Promise<PredictionOutput> {
    const model = this.models.get('duration_predictor_v1') as DurationPredictionModel
    return await model.predict({ features, context })
  }

  async classifyPattern(features: number[], context?: Record<string, any>): Promise<PredictionOutput> {
    const model = this.models.get('pattern_classifier_v1') as PatternClassificationModel
    return await model.predict({ features, context })
  }

  async detectAnomaly(features: number[], context?: Record<string, any>): Promise<PredictionOutput> {
    const model = this.models.get('anomaly_detector_v1') as AnomalyDetectionModel
    return await model.predict({ features, context })
  }

  async generateRecommendation(features: number[], context?: Record<string, any>): Promise<PredictionOutput> {
    const model = this.models.get('recommendation_engine_v1') as RecommendationModel
    return await model.predict({ features, context })
  }

  async trainModel(modelId: string, data: TrainingData): Promise<ModelPerformance> {
    const model = this.models.get(modelId)
    if (!model) {
      throw new Error(`Model ${modelId} not found`)
    }
    
    return await model.train(data)
  }

  getModelPerformanceReport(): Record<string, any> {
    const report: Record<string, any> = {}
    
    this.models.forEach((model, id) => {
      report[id] = {
        name: model.name,
        type: model.type,
        accuracy: model.accuracy,
        lastTrained: model.lastTrained,
        version: model.version
      }
    })
    
    return report
  }
}

// Export singleton instance
export const mlModelManager = new MLModelManager() 