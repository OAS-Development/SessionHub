import { metaLearningEngine, AlgorithmPerformance, ImprovementRecord } from './meta-learning'
import { enhancedRedis } from './redis'

// Algorithm optimizer interfaces
export interface OptimizerConfig {
  hyperparameterSearchSpace: SearchSpace
  architectureSearchEnabled: boolean
  learningRateAdaptation: boolean
  featureEngineeringEnabled: boolean
  crossValidationFolds: number
  optimizationBudget: number
  parallelOptimization: boolean
}

export interface SearchSpace {
  parameters: ParameterSpace[]
  constraints: OptimizationConstraint[]
  objectives: OptimizationObjective[]
}

export interface ParameterSpace {
  name: string
  type: 'continuous' | 'discrete' | 'categorical'
  range: [number, number] | number[] | string[]
  scale: 'linear' | 'log' | 'uniform'
  importance: number
}

export interface OptimizationConstraint {
  parameter: string
  constraint: string
  value: number | string
  priority: 'high' | 'medium' | 'low'
}

export interface OptimizationObjective {
  metric: string
  direction: 'maximize' | 'minimize'
  weight: number
  tolerance: number
}

export interface HyperparameterOptimization {
  algorithmId: string
  currentParameters: Record<string, any>
  optimizedParameters: Record<string, any>
  improvement: number
  confidence: number
  validationScore: number
  optimizationMethod: 'bayesian' | 'grid' | 'random' | 'evolutionary' | 'meta_learned'
  iterations: number
  convergenceTime: number
}

export interface ArchitectureOptimization {
  algorithmId: string
  currentArchitecture: NetworkArchitecture
  optimizedArchitecture: NetworkArchitecture
  improvement: number
  complexity: number
  efficiency: number
  searchMethod: 'nas' | 'evolutionary' | 'gradient_based' | 'meta_learned'
}

export interface NetworkArchitecture {
  layers: LayerDefinition[]
  connections: ConnectionDefinition[]
  activationFunctions: string[]
  optimizerConfig: OptimizerConfiguration
  regularization: RegularizationConfig
}

export interface LayerDefinition {
  type: 'dense' | 'conv' | 'lstm' | 'attention' | 'dropout' | 'batch_norm'
  size: number
  parameters: Record<string, any>
  position: number
}

export interface ConnectionDefinition {
  from: number
  to: number
  type: 'forward' | 'skip' | 'recurrent'
  weight: number
}

export interface OptimizerConfiguration {
  type: 'adam' | 'sgd' | 'rmsprop' | 'adagrad'
  learningRate: number
  momentum?: number
  beta1?: number
  beta2?: number
  epsilon?: number
}

export interface RegularizationConfig {
  l1: number
  l2: number
  dropout: number
  batchNorm: boolean
  earlyStoppingPatience: number
}

export interface LearningRateSchedule {
  algorithmId: string
  currentRate: number
  optimizedSchedule: ScheduleDefinition
  improvement: number
  adaptationMethod: 'cosine' | 'exponential' | 'step' | 'adaptive' | 'meta_learned'
}

export interface ScheduleDefinition {
  type: 'constant' | 'decay' | 'cyclic' | 'warm_restart' | 'adaptive'
  parameters: Record<string, any>
  milestones: number[]
  factors: number[]
}

export interface FeatureEngineering {
  algorithmId: string
  originalFeatures: FeatureDefinition[]
  engineeredFeatures: FeatureDefinition[]
  improvement: number
  methods: EngineeringMethod[]
  validationScore: number
}

export interface FeatureDefinition {
  name: string
  type: 'numerical' | 'categorical' | 'text' | 'temporal' | 'derived'
  importance: number
  transformation: string[]
  encoding: string
}

export interface EngineeringMethod {
  method: 'polynomial' | 'interaction' | 'binning' | 'scaling' | 'embedding' | 'auto_feature'
  parameters: Record<string, any>
  impact: number
  computationalCost: number
}

export interface AlgorithmEvolution {
  evolutionId: string
  algorithmId: string
  evolutionType: 'architecture' | 'hyperparameter' | 'learning_strategy' | 'feature_engineering'
  parentVersion: string
  evolvedVersion: string
  mutations: Mutation[]
  crossovers: Crossover[]
  fitness: number
  generation: number
}

export interface Mutation {
  type: 'parameter_mutation' | 'structure_mutation' | 'function_mutation'
  target: string
  change: any
  impact: number
}

export interface Crossover {
  type: 'uniform' | 'single_point' | 'multi_point' | 'semantic'
  parents: string[]
  offspring: string
  inheritedTraits: string[]
}

// Core Algorithm Optimizer
export class AlgorithmOptimizer {
  private config: OptimizerConfig
  private redis = enhancedRedis
  private metaLearningEngine = metaLearningEngine
  private optimizationHistory: Map<string, HyperparameterOptimization[]> = new Map()
  private architectureHistory: Map<string, ArchitectureOptimization[]> = new Map()

  constructor(config?: Partial<OptimizerConfig>) {
    this.config = {
      hyperparameterSearchSpace: this.getDefaultSearchSpace(),
      architectureSearchEnabled: true,
      learningRateAdaptation: true,
      featureEngineeringEnabled: true,
      crossValidationFolds: 5,
      optimizationBudget: 1000, // iterations
      parallelOptimization: true,
      ...config
    }

    this.initializeOptimizer()
  }

  // Initialize algorithm optimizer
  private async initializeOptimizer(): Promise<void> {
    console.log('Initializing Algorithm Optimizer...')
    
    // Load optimization history
    await this.loadOptimizationHistory()
    
    // Initialize meta-learned optimization strategies
    await this.initializeMetaLearningStrategies()
    
    console.log('Algorithm Optimizer initialized successfully')
  }

  // Optimize algorithm hyperparameters
  async optimizeHyperparameters(algorithmId: string, targetMetric: string = 'accuracy'): Promise<HyperparameterOptimization> {
    console.log(`Starting hyperparameter optimization for algorithm: ${algorithmId}`)
    
    try {
      // Get current algorithm performance
      const currentPerformance = await this.metaLearningEngine.getAlgorithmPerformance(algorithmId)
      if (!currentPerformance) {
        throw new Error(`Algorithm ${algorithmId} not found`)
      }

      // Define search space based on algorithm type and meta-learning insights
      const searchSpace = await this.defineSearchSpace(algorithmId, currentPerformance)
      
      // Select optimization method using meta-learning
      const optimizationMethod = await this.selectOptimizationMethod(algorithmId, searchSpace, targetMetric)
      
      // Execute hyperparameter optimization
      const optimization = await this.executeHyperparameterOptimization(
        algorithmId, 
        currentPerformance, 
        searchSpace, 
        optimizationMethod,
        targetMetric
      )
      
      // Validate optimization results
      const validatedOptimization = await this.validateHyperparameterOptimization(algorithmId, optimization)
      
      // Update optimization history
      await this.updateOptimizationHistory(algorithmId, validatedOptimization)
      
      // Apply meta-learning from optimization results
      await this.learnFromOptimization(algorithmId, validatedOptimization)
      
      console.log(`Hyperparameter optimization completed with ${Math.round(validatedOptimization.improvement * 100)}% improvement`)
      
      return validatedOptimization
    } catch (error) {
      console.error('Hyperparameter optimization failed:', error)
      throw new Error(`Hyperparameter optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Optimize neural network architecture
  async optimizeArchitecture(algorithmId: string): Promise<ArchitectureOptimization> {
    console.log(`Starting architecture optimization for algorithm: ${algorithmId}`)
    
    if (!this.config.architectureSearchEnabled) {
      throw new Error('Architecture search is disabled')
    }
    
    try {
      // Get current algorithm performance and architecture
      const currentPerformance = await this.metaLearningEngine.getAlgorithmPerformance(algorithmId)
      if (!currentPerformance || currentPerformance.algorithmType !== 'neural') {
        throw new Error(`Neural network algorithm ${algorithmId} not found or not applicable`)
      }

      // Get current architecture
      const currentArchitecture = await this.getCurrentArchitecture(algorithmId)
      
      // Define architecture search space
      const searchSpace = await this.defineArchitectureSearchSpace(algorithmId, currentArchitecture)
      
      // Select architecture search method using meta-learning
      const searchMethod = await this.selectArchitectureSearchMethod(algorithmId, searchSpace)
      
      // Execute architecture optimization
      const optimization = await this.executeArchitectureOptimization(
        algorithmId,
        currentArchitecture,
        searchSpace,
        searchMethod
      )
      
      // Validate architecture optimization
      const validatedOptimization = await this.validateArchitectureOptimization(algorithmId, optimization)
      
      // Update architecture history
      await this.updateArchitectureHistory(algorithmId, validatedOptimization)
      
      console.log(`Architecture optimization completed with ${Math.round(validatedOptimization.improvement * 100)}% improvement`)
      
      return validatedOptimization
    } catch (error) {
      console.error('Architecture optimization failed:', error)
      throw new Error(`Architecture optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Adapt learning rate using meta-learning
  async adaptLearningRate(algorithmId: string, performanceHistory: number[]): Promise<LearningRateSchedule> {
    console.log(`Adapting learning rate for algorithm: ${algorithmId}`)
    
    if (!this.config.learningRateAdaptation) {
      throw new Error('Learning rate adaptation is disabled')
    }
    
    try {
      // Analyze performance history and current learning dynamics
      const learningDynamics = await this.analyzeLearningDynamics(algorithmId, performanceHistory)
      
      // Use meta-learning to select optimal learning rate schedule
      const adaptationMethod = await this.selectLearningRateAdaptationMethod(algorithmId, learningDynamics)
      
      // Generate optimized learning rate schedule
      const optimizedSchedule = await this.generateOptimizedLearningSchedule(
        algorithmId,
        learningDynamics,
        adaptationMethod
      )
      
      // Validate learning rate adaptation
      const validatedSchedule = await this.validateLearningRateSchedule(algorithmId, optimizedSchedule)
      
      console.log(`Learning rate adaptation completed with ${adaptationMethod} method`)
      
      return validatedSchedule
    } catch (error) {
      console.error('Learning rate adaptation failed:', error)
      throw new Error(`Learning rate adaptation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Automatic feature engineering
  async engineerFeatures(algorithmId: string, currentFeatures: FeatureDefinition[]): Promise<FeatureEngineering> {
    console.log(`Starting feature engineering for algorithm: ${algorithmId}`)
    
    if (!this.config.featureEngineeringEnabled) {
      throw new Error('Feature engineering is disabled')
    }
    
    try {
      // Analyze current features and identify improvement opportunities
      const featureAnalysis = await this.analyzeCurrentFeatures(currentFeatures)
      
      // Use meta-learning to select optimal feature engineering methods
      const engineeringMethods = await this.selectFeatureEngineeringMethods(algorithmId, featureAnalysis)
      
      // Generate engineered features
      const engineeredFeatures = await this.generateEngineeredFeatures(
        currentFeatures,
        engineeringMethods
      )
      
      // Validate feature engineering results
      const validatedEngineering = await this.validateFeatureEngineering(algorithmId, {
        algorithmId,
        originalFeatures: currentFeatures,
        engineeredFeatures,
        improvement: 0, // Will be calculated during validation
        methods: engineeringMethods,
        validationScore: 0 // Will be calculated during validation
      })
      
      console.log(`Feature engineering completed with ${Math.round(validatedEngineering.improvement * 100)}% improvement`)
      
      return validatedEngineering
    } catch (error) {
      console.error('Feature engineering failed:', error)
      throw new Error(`Feature engineering failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Evolve algorithm using evolutionary strategies
  async evolveAlgorithm(algorithmId: string, populationSize: number = 20, generations: number = 10): Promise<AlgorithmEvolution[]> {
    console.log(`Starting algorithm evolution for ${algorithmId} with ${populationSize} individuals and ${generations} generations`)
    
    try {
      const evolutions: AlgorithmEvolution[] = []
      let currentGeneration = 0
      
      // Initialize population
      let population = await this.initializeEvolutionPopulation(algorithmId, populationSize)
      
      while (currentGeneration < generations) {
        console.log(`Evolution generation ${currentGeneration + 1}/${generations}`)
        
        // Evaluate fitness for each individual
        const fitnessScores = await this.evaluatePopulationFitness(population)
        
        // Selection
        const selectedParents = await this.selectParentsForEvolution(population, fitnessScores)
        
        // Crossover and mutation
        const newGeneration = await this.createNewEvolutionGeneration(selectedParents, currentGeneration)
        
        // Track evolutions
        for (const individual of newGeneration) {
          evolutions.push(individual)
        }
        
        // Update population
        population = newGeneration.map(evo => evo.evolvedVersion)
        currentGeneration++
        
        // Check for convergence
        const hasConverged = await this.checkEvolutionConvergence(fitnessScores)
        if (hasConverged) {
          console.log(`Evolution converged at generation ${currentGeneration}`)
          break
        }
      }
      
      // Select best evolved algorithm
      const bestEvolution = await this.selectBestEvolution(evolutions)
      await this.applyBestEvolution(algorithmId, bestEvolution)
      
      console.log(`Algorithm evolution completed with ${evolutions.length} total evolutions`)
      
      return evolutions
    } catch (error) {
      console.error('Algorithm evolution failed:', error)
      throw new Error(`Algorithm evolution failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get optimization insights
  async getOptimizationInsights(algorithmId: string): Promise<any> {
    const hyperparameterHistory = this.optimizationHistory.get(algorithmId) || []
    const architectureHistory = this.architectureHistory.get(algorithmId) || []
    
    return {
      algorithmId,
      totalOptimizations: hyperparameterHistory.length + architectureHistory.length,
      averageImprovement: this.calculateAverageImprovement(hyperparameterHistory, architectureHistory),
      bestHyperparameters: this.getBestHyperparameters(hyperparameterHistory),
      bestArchitecture: this.getBestArchitecture(architectureHistory),
      optimizationTrends: this.analyzeOptimizationTrends(hyperparameterHistory, architectureHistory),
      metaLearningInsights: await this.getMetaLearningInsights(algorithmId)
    }
  }

  // Private helper methods
  private getDefaultSearchSpace(): SearchSpace {
    return {
      parameters: [
        {
          name: 'learning_rate',
          type: 'continuous',
          range: [0.0001, 0.1],
          scale: 'log',
          importance: 0.9
        },
        {
          name: 'batch_size',
          type: 'discrete',
          range: [16, 32, 64, 128, 256],
          scale: 'linear',
          importance: 0.7
        },
        {
          name: 'hidden_layers',
          type: 'discrete',
          range: [1, 2, 3, 4, 5],
          scale: 'linear',
          importance: 0.8
        },
        {
          name: 'dropout_rate',
          type: 'continuous',
          range: [0.0, 0.5],
          scale: 'uniform',
          importance: 0.6
        }
      ],
      constraints: [],
      objectives: [
        {
          metric: 'accuracy',
          direction: 'maximize',
          weight: 0.7,
          tolerance: 0.01
        },
        {
          metric: 'efficiency',
          direction: 'maximize',
          weight: 0.3,
          tolerance: 0.05
        }
      ]
    }
  }

  private async defineSearchSpace(algorithmId: string, performance: AlgorithmPerformance): Promise<SearchSpace> {
    // Use meta-learning to define algorithm-specific search space
    const metaInsights = await this.metaLearningEngine.getMetaLearningInsights()
    
    // Customize search space based on algorithm type and meta-knowledge
    const customSearchSpace = { ...this.config.hyperparameterSearchSpace }
    
    // Add algorithm-specific parameters
    if (performance.algorithmType === 'neural') {
      customSearchSpace.parameters.push({
        name: 'optimizer',
        type: 'categorical',
        range: ['adam', 'sgd', 'rmsprop'],
        scale: 'linear',
        importance: 0.8
      })
    }
    
    return customSearchSpace
  }

  private async selectOptimizationMethod(
    algorithmId: string, 
    searchSpace: SearchSpace, 
    targetMetric: string
  ): Promise<'bayesian' | 'grid' | 'random' | 'evolutionary' | 'meta_learned'> {
    // Use meta-learning to select the best optimization method
    const metaInsights = await this.metaLearningEngine.getMetaLearningInsights()
    
    // Simple heuristic for now - in practice, this would use meta-learning
    if (searchSpace.parameters.length > 10) return 'bayesian'
    if (this.config.optimizationBudget < 100) return 'random'
    return 'evolutionary'
  }

  private async executeHyperparameterOptimization(
    algorithmId: string,
    currentPerformance: AlgorithmPerformance,
    searchSpace: SearchSpace,
    method: string,
    targetMetric: string
  ): Promise<HyperparameterOptimization> {
    const startTime = Date.now()
    let bestParameters = this.getCurrentParameters(currentPerformance)
    let bestScore = currentPerformance.performanceMetrics[targetMetric as keyof typeof currentPerformance.performanceMetrics] || 0
    let iterations = 0
    
    // Execute optimization based on selected method
    switch (method) {
      case 'bayesian':
        ({ bestParameters, bestScore, iterations } = await this.executeBayesianOptimization(
          algorithmId, searchSpace, targetMetric, bestParameters, bestScore
        ))
        break
      case 'evolutionary':
        ({ bestParameters, bestScore, iterations } = await this.executeEvolutionaryOptimization(
          algorithmId, searchSpace, targetMetric, bestParameters, bestScore
        ))
        break
      case 'random':
        ({ bestParameters, bestScore, iterations } = await this.executeRandomSearch(
          algorithmId, searchSpace, targetMetric, bestParameters, bestScore
        ))
        break
      default:
        ({ bestParameters, bestScore, iterations } = await this.executeMetaLearnedOptimization(
          algorithmId, searchSpace, targetMetric, bestParameters, bestScore
        ))
    }
    
    const convergenceTime = Date.now() - startTime
    const improvement = (bestScore - (currentPerformance.performanceMetrics[targetMetric as keyof typeof currentPerformance.performanceMetrics] || 0)) / (currentPerformance.performanceMetrics[targetMetric as keyof typeof currentPerformance.performanceMetrics] || 1)
    
    return {
      algorithmId,
      currentParameters: this.getCurrentParameters(currentPerformance),
      optimizedParameters: bestParameters,
      improvement,
      confidence: this.calculateOptimizationConfidence(improvement, iterations),
      validationScore: bestScore,
      optimizationMethod: method as any,
      iterations,
      convergenceTime
    }
  }

  private getCurrentParameters(performance: AlgorithmPerformance): Record<string, any> {
    // Extract current parameters from algorithm performance
    return {
      learning_rate: performance.performanceMetrics.learningRate,
      accuracy: performance.performanceMetrics.accuracy,
      efficiency: performance.performanceMetrics.efficiency
    }
  }

  private calculateOptimizationConfidence(improvement: number, iterations: number): number {
    // Calculate confidence based on improvement magnitude and iterations
    const improvementConfidence = Math.min(1, improvement * 2)
    const iterationConfidence = Math.min(1, iterations / 100)
    return (improvementConfidence + iterationConfidence) / 2
  }

  // Optimization method implementations
  private async executeBayesianOptimization(
    algorithmId: string,
    searchSpace: SearchSpace,
    targetMetric: string,
    initialParameters: Record<string, any>,
    initialScore: number
  ): Promise<{ bestParameters: Record<string, any>, bestScore: number, iterations: number }> {
    // Simplified Bayesian optimization implementation
    let bestParameters = { ...initialParameters }
    let bestScore = initialScore
    let iterations = 0
    
    for (let i = 0; i < Math.min(this.config.optimizationBudget, 50); i++) {
      // Sample parameters using acquisition function (simplified)
      const candidateParameters = await this.sampleParametersFromSearchSpace(searchSpace)
      
      // Evaluate candidate
      const candidateScore = await this.evaluateParameters(algorithmId, candidateParameters, targetMetric)
      
      if (candidateScore > bestScore) {
        bestParameters = candidateParameters
        bestScore = candidateScore
      }
      
      iterations++
      
      // Early stopping if improvement is minimal
      if (i > 10 && (bestScore - initialScore) / initialScore < 0.01) {
        break
      }
    }
    
    return { bestParameters, bestScore, iterations }
  }

  private async executeEvolutionaryOptimization(
    algorithmId: string,
    searchSpace: SearchSpace,
    targetMetric: string,
    initialParameters: Record<string, any>,
    initialScore: number
  ): Promise<{ bestParameters: Record<string, any>, bestScore: number, iterations: number }> {
    // Simplified evolutionary optimization
    const populationSize = 20
    const generations = 10
    
    // Initialize population
    let population = [initialParameters]
    for (let i = 1; i < populationSize; i++) {
      population.push(await this.sampleParametersFromSearchSpace(searchSpace))
    }
    
    let bestParameters = { ...initialParameters }
    let bestScore = initialScore
    let iterations = 0
    
    for (let gen = 0; gen < generations; gen++) {
      // Evaluate population
      const scores = []
      for (const individual of population) {
        const score = await this.evaluateParameters(algorithmId, individual, targetMetric)
        scores.push(score)
        iterations++
        
        if (score > bestScore) {
          bestParameters = { ...individual }
          bestScore = score
        }
      }
      
      // Selection and reproduction (simplified)
      const newPopulation = []
      for (let i = 0; i < populationSize; i++) {
        const parent1 = this.selectParent(population, scores)
        const parent2 = this.selectParent(population, scores)
        const offspring = await this.crossoverParameters(parent1, parent2, searchSpace)
        const mutatedOffspring = await this.mutateParameters(offspring, searchSpace)
        newPopulation.push(mutatedOffspring)
      }
      
      population = newPopulation
    }
    
    return { bestParameters, bestScore, iterations }
  }

  private async executeRandomSearch(
    algorithmId: string,
    searchSpace: SearchSpace,
    targetMetric: string,
    initialParameters: Record<string, any>,
    initialScore: number
  ): Promise<{ bestParameters: Record<string, any>, bestScore: number, iterations: number }> {
    let bestParameters = { ...initialParameters }
    let bestScore = initialScore
    let iterations = 0
    
    for (let i = 0; i < Math.min(this.config.optimizationBudget, 100); i++) {
      const candidateParameters = await this.sampleParametersFromSearchSpace(searchSpace)
      const candidateScore = await this.evaluateParameters(algorithmId, candidateParameters, targetMetric)
      
      if (candidateScore > bestScore) {
        bestParameters = candidateParameters
        bestScore = candidateScore
      }
      
      iterations++
    }
    
    return { bestParameters, bestScore, iterations }
  }

  private async executeMetaLearnedOptimization(
    algorithmId: string,
    searchSpace: SearchSpace,
    targetMetric: string,
    initialParameters: Record<string, any>,
    initialScore: number
  ): Promise<{ bestParameters: Record<string, any>, bestScore: number, iterations: number }> {
    // Use meta-learning to guide optimization
    const metaInsights = await this.metaLearningEngine.getMetaLearningInsights()
    
    // For now, fall back to evolutionary optimization with meta-learned guidance
    return this.executeEvolutionaryOptimization(algorithmId, searchSpace, targetMetric, initialParameters, initialScore)
  }

  // Additional helper methods would be implemented here...
  private async sampleParametersFromSearchSpace(searchSpace: SearchSpace): Promise<Record<string, any>> {
    const parameters: Record<string, any> = {}
    
    for (const param of searchSpace.parameters) {
      switch (param.type) {
        case 'continuous':
          const [min, max] = param.range as [number, number]
          if (param.scale === 'log') {
            parameters[param.name] = Math.exp(Math.random() * (Math.log(max) - Math.log(min)) + Math.log(min))
          } else {
            parameters[param.name] = Math.random() * (max - min) + min
          }
          break
        case 'discrete':
          const discreteOptions = param.range as number[]
          parameters[param.name] = discreteOptions[Math.floor(Math.random() * discreteOptions.length)]
          break
        case 'categorical':
          const categoricalOptions = param.range as string[]
          parameters[param.name] = categoricalOptions[Math.floor(Math.random() * categoricalOptions.length)]
          break
      }
    }
    
    return parameters
  }

  private async evaluateParameters(algorithmId: string, parameters: Record<string, any>, targetMetric: string): Promise<number> {
    // Simulate parameter evaluation - in practice, this would train/test the algorithm
    const baseScore = 0.8
    const randomVariation = (Math.random() - 0.5) * 0.2
    const parameterEffect = Object.values(parameters).reduce((sum, val) => sum + (typeof val === 'number' ? val * 0.01 : 0), 0)
    
    return Math.max(0, Math.min(1, baseScore + randomVariation + parameterEffect))
  }

  // More helper methods for genetic operations, architecture optimization, etc.
  // ... (many more methods would be implemented for a complete system)
}

// Export singleton instance
export const algorithmOptimizer = new AlgorithmOptimizer() 