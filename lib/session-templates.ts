import { enhancedRedis } from './redis'

// Session template types and configurations
export const SessionTypes = {
  BUG_FIX: 'bug_fix',
  FEATURE_DEVELOPMENT: 'feature_development',
  INTEGRATION: 'integration',
  OPTIMIZATION: 'optimization',
  RESEARCH: 'research',
  MAINTENANCE: 'maintenance',
  TESTING: 'testing',
  DOCUMENTATION: 'documentation',
  REFACTORING: 'refactoring',
  CUSTOM: 'custom'
} as const

export type SessionType = typeof SessionTypes[keyof typeof SessionTypes]

export interface SessionTemplate {
  id: string
  type: SessionType
  name: string
  description: string
  estimatedDuration: number // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  tags: string[]
  defaultGoals: SessionGoal[]
  requiredSkills: string[]
  suggestedResources: Resource[]
  progressMilestones: ProgressMilestone[]
  customFields: CustomField[]
  integrations: TemplateIntegration[]
}

export interface SessionGoal {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  estimatedTime: number // minutes
  successCriteria: string[]
  dependencies: string[]
  category: 'technical' | 'learning' | 'documentation' | 'testing' | 'research'
}

export interface Resource {
  id: string
  type: 'file' | 'url' | 'documentation' | 'code' | 'reference'
  title: string
  description: string
  url?: string
  content?: string
  required: boolean
  category: string
}

export interface ProgressMilestone {
  id: string
  name: string
  description: string
  percentage: number
  estimatedTime: number
  dependencies: string[]
  validation: ValidationRule[]
}

export interface ValidationRule {
  type: 'file_exists' | 'test_passes' | 'code_compiles' | 'documentation_complete' | 'custom'
  description: string
  criteria: Record<string, any>
}

export interface CustomField {
  id: string
  name: string
  type: 'text' | 'number' | 'select' | 'multiselect' | 'date' | 'boolean' | 'file'
  label: string
  description: string
  required: boolean
  defaultValue?: any
  options?: string[]
  validation?: string
}

export interface TemplateIntegration {
  system: 'learning' | 'analytics' | 'cache' | 'files' | 'external'
  enabled: boolean
  configuration: Record<string, any>
  webhooks?: string[]
}

// Pre-configured session templates
export class SessionTemplateManager {
  private redis = enhancedRedis
  private templates: Map<string, SessionTemplate> = new Map()

  constructor() {
    this.initializeDefaultTemplates()
  }

  // Get all available templates
  async getTemplates(): Promise<SessionTemplate[]> {
    const cacheKey = 'session_templates:all'
    
    const cached = await this.redis.get<SessionTemplate[]>(cacheKey)
    if (cached) return cached

    const templates = Array.from(this.templates.values())
    await this.redis.set(cacheKey, templates, { ex: 3600 }) // Cache for 1 hour

    return templates
  }

  // Get templates by type
  async getTemplatesByType(type: SessionType): Promise<SessionTemplate[]> {
    const templates = await this.getTemplates()
    return templates.filter(template => template.type === type)
  }

  // Get template by ID
  async getTemplateById(id: string): Promise<SessionTemplate | null> {
    const cacheKey = `session_template:${id}`
    
    const cached = await this.redis.get<SessionTemplate>(cacheKey)
    if (cached) return cached

    const template = this.templates.get(id) || null
    if (template) {
      await this.redis.set(cacheKey, template, { ex: 3600 })
    }

    return template
  }

  // Create custom template
  async createCustomTemplate(templateData: Partial<SessionTemplate>): Promise<SessionTemplate> {
    const template: SessionTemplate = {
      id: `custom_${Date.now()}`,
      type: SessionTypes.CUSTOM,
      name: templateData.name || 'Custom Session',
      description: templateData.description || 'Custom session template',
      estimatedDuration: templateData.estimatedDuration || 60,
      difficulty: templateData.difficulty || 'intermediate',
      tags: templateData.tags || [],
      defaultGoals: templateData.defaultGoals || [],
      requiredSkills: templateData.requiredSkills || [],
      suggestedResources: templateData.suggestedResources || [],
      progressMilestones: templateData.progressMilestones || [],
      customFields: templateData.customFields || [],
      integrations: templateData.integrations || this.getDefaultIntegrations()
    }

    this.templates.set(template.id, template)
    
    // Clear cache
    await this.redis.del('session_templates:all')
    
    return template
  }

  // Update template
  async updateTemplate(id: string, updates: Partial<SessionTemplate>): Promise<SessionTemplate | null> {
    const existing = this.templates.get(id)
    if (!existing) return null

    const updated = { ...existing, ...updates, id }
    this.templates.set(id, updated)

    // Clear cache
    await this.redis.del(['session_templates:all', `session_template:${id}`])

    return updated
  }

  // Delete template
  async deleteTemplate(id: string): Promise<boolean> {
    const deleted = this.templates.delete(id)
    
    if (deleted) {
      // Clear cache
      await this.redis.del(['session_templates:all', `session_template:${id}`])
    }

    return deleted
  }

  // Get template suggestions based on user patterns
  async getSuggestedTemplates(userId: string, context?: Record<string, any>): Promise<SessionTemplate[]> {
    // Analyze user session history for recommendations
    const userHistory = await this.getUserSessionHistory(userId)
    const templates = await this.getTemplates()

    // Score templates based on user patterns
    const scoredTemplates = templates.map(template => ({
      template,
      score: this.calculateTemplateScore(template, userHistory, context)
    }))

    // Return top 5 suggestions
    return scoredTemplates
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.template)
  }

  // Initialize default templates
  private initializeDefaultTemplates(): void {
    const defaultTemplates: SessionTemplate[] = [
      {
        id: 'bug_fix_standard',
        type: SessionTypes.BUG_FIX,
        name: 'Standard Bug Fix',
        description: 'Systematic approach to identifying, reproducing, and fixing bugs',
        estimatedDuration: 90,
        difficulty: 'intermediate',
        tags: ['debugging', 'testing', 'problem-solving'],
        defaultGoals: [
          {
            id: 'reproduce_bug',
            title: 'Reproduce the Bug',
            description: 'Create reliable steps to reproduce the issue',
            priority: 'high',
            estimatedTime: 20,
            successCriteria: ['Bug can be consistently reproduced', 'Clear reproduction steps documented'],
            dependencies: [],
            category: 'technical'
          },
          {
            id: 'identify_root_cause',
            title: 'Identify Root Cause',
            description: 'Debug and analyze the underlying cause',
            priority: 'critical',
            estimatedTime: 40,
            successCriteria: ['Root cause identified', 'Impact analysis completed'],
            dependencies: ['reproduce_bug'],
            category: 'technical'
          },
          {
            id: 'implement_fix',
            title: 'Implement Fix',
            description: 'Develop and test the solution',
            priority: 'critical',
            estimatedTime: 30,
            successCriteria: ['Fix implemented', 'Tests pass', 'No regression introduced'],
            dependencies: ['identify_root_cause'],
            category: 'technical'
          }
        ],
        requiredSkills: ['debugging', 'testing', 'code-analysis'],
        suggestedResources: [
          {
            id: 'debugging_guide',
            type: 'documentation',
            title: 'Debugging Best Practices',
            description: 'Comprehensive guide to effective debugging techniques',
            required: false,
            category: 'reference'
          }
        ],
        progressMilestones: [
          {
            id: 'bug_reproduced',
            name: 'Bug Reproduced',
            description: 'Successfully reproduced the bug with clear steps',
            percentage: 25,
            estimatedTime: 20,
            dependencies: [],
            validation: [
              {
                type: 'custom',
                description: 'Bug reproduction confirmed',
                criteria: { hasReproductionSteps: true }
              }
            ]
          },
          {
            id: 'root_cause_found',
            name: 'Root Cause Identified',
            description: 'Underlying cause has been identified and analyzed',
            percentage: 60,
            estimatedTime: 40,
            dependencies: ['bug_reproduced'],
            validation: [
              {
                type: 'custom',
                description: 'Root cause documented',
                criteria: { hasRootCauseAnalysis: true }
              }
            ]
          },
          {
            id: 'fix_implemented',
            name: 'Fix Implemented',
            description: 'Solution has been implemented and tested',
            percentage: 100,
            estimatedTime: 30,
            dependencies: ['root_cause_found'],
            validation: [
              {
                type: 'test_passes',
                description: 'All tests pass',
                criteria: { testSuite: 'all' }
              }
            ]
          }
        ],
        customFields: [
          {
            id: 'bug_severity',
            name: 'severity',
            type: 'select',
            label: 'Bug Severity',
            description: 'How critical is this bug?',
            required: true,
            options: ['low', 'medium', 'high', 'critical'],
            defaultValue: 'medium'
          },
          {
            id: 'affected_users',
            name: 'affectedUsers',
            type: 'number',
            label: 'Affected Users',
            description: 'Estimated number of users affected',
            required: false
          }
        ],
        integrations: this.getDefaultIntegrations()
      },
      {
        id: 'feature_development_standard',
        type: SessionTypes.FEATURE_DEVELOPMENT,
        name: 'Feature Development',
        description: 'Complete feature development lifecycle from planning to deployment',
        estimatedDuration: 180,
        difficulty: 'advanced',
        tags: ['development', 'feature', 'planning', 'implementation'],
        defaultGoals: [
          {
            id: 'requirements_analysis',
            title: 'Requirements Analysis',
            description: 'Analyze and document feature requirements',
            priority: 'critical',
            estimatedTime: 30,
            successCriteria: ['Requirements documented', 'Acceptance criteria defined'],
            dependencies: [],
            category: 'research'
          },
          {
            id: 'design_architecture',
            title: 'Design Architecture',
            description: 'Design the technical architecture and implementation plan',
            priority: 'high',
            estimatedTime: 45,
            successCriteria: ['Architecture designed', 'Implementation plan created'],
            dependencies: ['requirements_analysis'],
            category: 'technical'
          },
          {
            id: 'implement_feature',
            title: 'Implement Feature',
            description: 'Code the feature according to specifications',
            priority: 'critical',
            estimatedTime: 90,
            successCriteria: ['Feature implemented', 'Code reviewed', 'Tests written'],
            dependencies: ['design_architecture'],
            category: 'technical'
          },
          {
            id: 'testing_validation',
            title: 'Testing & Validation',
            description: 'Comprehensive testing and validation',
            priority: 'high',
            estimatedTime: 15,
            successCriteria: ['All tests pass', 'Feature validated'],
            dependencies: ['implement_feature'],
            category: 'testing'
          }
        ],
        requiredSkills: ['software-design', 'programming', 'testing', 'documentation'],
        suggestedResources: [
          {
            id: 'feature_template',
            type: 'documentation',
            title: 'Feature Development Template',
            description: 'Standard template for feature development',
            required: true,
            category: 'template'
          }
        ],
        progressMilestones: [
          {
            id: 'requirements_complete',
            name: 'Requirements Complete',
            description: 'All requirements have been analyzed and documented',
            percentage: 20,
            estimatedTime: 30,
            dependencies: [],
            validation: [
              {
                type: 'documentation_complete',
                description: 'Requirements documentation exists',
                criteria: { documentType: 'requirements' }
              }
            ]
          },
          {
            id: 'design_complete',
            name: 'Design Complete',
            description: 'Technical design and architecture finalized',
            percentage: 45,
            estimatedTime: 45,
            dependencies: ['requirements_complete'],
            validation: [
              {
                type: 'documentation_complete',
                description: 'Design documentation exists',
                criteria: { documentType: 'design' }
              }
            ]
          },
          {
            id: 'implementation_complete',
            name: 'Implementation Complete',
            description: 'Feature has been fully implemented',
            percentage: 90,
            estimatedTime: 90,
            dependencies: ['design_complete'],
            validation: [
              {
                type: 'code_compiles',
                description: 'Code compiles without errors',
                criteria: { checkBuild: true }
              }
            ]
          },
          {
            id: 'testing_complete',
            name: 'Testing Complete',
            description: 'All testing and validation completed',
            percentage: 100,
            estimatedTime: 15,
            dependencies: ['implementation_complete'],
            validation: [
              {
                type: 'test_passes',
                description: 'All tests pass',
                criteria: { coverage: 0.8 }
              }
            ]
          }
        ],
        customFields: [
          {
            id: 'feature_complexity',
            name: 'complexity',
            type: 'select',
            label: 'Feature Complexity',
            description: 'How complex is this feature?',
            required: true,
            options: ['simple', 'moderate', 'complex', 'very-complex'],
            defaultValue: 'moderate'
          },
          {
            id: 'target_release',
            name: 'targetRelease',
            type: 'text',
            label: 'Target Release',
            description: 'Which release is this feature targeting?',
            required: false
          }
        ],
        integrations: this.getDefaultIntegrations()
      },
      {
        id: 'research_exploration',
        type: SessionTypes.RESEARCH,
        name: 'Research & Exploration',
        description: 'Structured research session for exploring new technologies or concepts',
        estimatedDuration: 120,
        difficulty: 'beginner',
        tags: ['research', 'learning', 'exploration', 'analysis'],
        defaultGoals: [
          {
            id: 'define_research_scope',
            title: 'Define Research Scope',
            description: 'Clearly define what needs to be researched',
            priority: 'critical',
            estimatedTime: 15,
            successCriteria: ['Research questions defined', 'Scope documented'],
            dependencies: [],
            category: 'research'
          },
          {
            id: 'gather_information',
            title: 'Gather Information',
            description: 'Collect relevant information and resources',
            priority: 'high',
            estimatedTime: 60,
            successCriteria: ['Key sources identified', 'Information collected'],
            dependencies: ['define_research_scope'],
            category: 'research'
          },
          {
            id: 'analyze_findings',
            title: 'Analyze Findings',
            description: 'Analyze and synthesize research findings',
            priority: 'high',
            estimatedTime: 30,
            successCriteria: ['Analysis completed', 'Key insights identified'],
            dependencies: ['gather_information'],
            category: 'learning'
          },
          {
            id: 'document_results',
            title: 'Document Results',
            description: 'Create comprehensive documentation of findings',
            priority: 'medium',
            estimatedTime: 15,
            successCriteria: ['Documentation created', 'Recommendations provided'],
            dependencies: ['analyze_findings'],
            category: 'documentation'
          }
        ],
        requiredSkills: ['research', 'analysis', 'documentation'],
        suggestedResources: [
          {
            id: 'research_methodology',
            type: 'documentation',
            title: 'Research Methodology Guide',
            description: 'Best practices for conducting technical research',
            required: false,
            category: 'methodology'
          }
        ],
        progressMilestones: [
          {
            id: 'scope_defined',
            name: 'Scope Defined',
            description: 'Research scope and objectives clearly defined',
            percentage: 15,
            estimatedTime: 15,
            dependencies: [],
            validation: [
              {
                type: 'custom',
                description: 'Research scope documented',
                criteria: { hasScopeDocument: true }
              }
            ]
          },
          {
            id: 'information_gathered',
            name: 'Information Gathered',
            description: 'Relevant information and resources collected',
            percentage: 65,
            estimatedTime: 60,
            dependencies: ['scope_defined'],
            validation: [
              {
                type: 'custom',
                description: 'Minimum number of sources collected',
                criteria: { minSources: 5 }
              }
            ]
          },
          {
            id: 'analysis_complete',
            name: 'Analysis Complete',
            description: 'Research findings analyzed and synthesized',
            percentage: 90,
            estimatedTime: 30,
            dependencies: ['information_gathered'],
            validation: [
              {
                type: 'custom',
                description: 'Analysis documented',
                criteria: { hasAnalysis: true }
              }
            ]
          },
          {
            id: 'documentation_complete',
            name: 'Documentation Complete',
            description: 'Research results fully documented',
            percentage: 100,
            estimatedTime: 15,
            dependencies: ['analysis_complete'],
            validation: [
              {
                type: 'documentation_complete',
                description: 'Final documentation exists',
                criteria: { documentType: 'research-results' }
              }
            ]
          }
        ],
        customFields: [
          {
            id: 'research_type',
            name: 'researchType',
            type: 'select',
            label: 'Research Type',
            description: 'What type of research is this?',
            required: true,
            options: ['technology', 'methodology', 'competitive', 'feasibility', 'other'],
            defaultValue: 'technology'
          },
          {
            id: 'urgency',
            name: 'urgency',
            type: 'select',
            label: 'Urgency',
            description: 'How urgent is this research?',
            required: false,
            options: ['low', 'medium', 'high', 'critical'],
            defaultValue: 'medium'
          }
        ],
        integrations: this.getDefaultIntegrations()
      }
    ]

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template)
    })
  }

  // Get default integrations configuration
  private getDefaultIntegrations(): TemplateIntegration[] {
    return [
      {
        system: 'learning',
        enabled: true,
        configuration: {
          captureInteractions: true,
          trackProgress: true,
          analyzePatterns: true
        }
      },
      {
        system: 'analytics',
        enabled: true,
        configuration: {
          trackPerformance: true,
          measureDuration: true,
          collectMetrics: true
        }
      },
      {
        system: 'cache',
        enabled: true,
        configuration: {
          cacheProgress: true,
          cacheResults: true,
          enableRealtime: true
        }
      },
      {
        system: 'files',
        enabled: true,
        configuration: {
          organizeBySession: true,
          trackAttachments: true,
          enableVersioning: true
        }
      }
    ]
  }

  // Calculate template score based on user history
  private calculateTemplateScore(
    template: SessionTemplate, 
    userHistory: any[], 
    context?: Record<string, any>
  ): number {
    let score = 0

    // Base score from template popularity
    score += template.type === SessionTypes.FEATURE_DEVELOPMENT ? 0.3 : 0.2

    // Score based on user's previous session types
    const userTypeFrequency = userHistory
      .filter(session => session.type === template.type)
      .length / Math.max(userHistory.length, 1)
    score += userTypeFrequency * 0.4

    // Score based on difficulty match
    if (context?.userSkillLevel) {
      const difficultyMatch = this.getDifficultyMatch(template.difficulty, context.userSkillLevel)
      score += difficultyMatch * 0.2
    }

    // Score based on estimated duration preference
    if (context?.preferredDuration) {
      const durationMatch = 1 - Math.abs(template.estimatedDuration - context.preferredDuration) / 180
      score += Math.max(0, durationMatch) * 0.1
    }

    return Math.min(1, score)
  }

  // Get difficulty match score
  private getDifficultyMatch(templateDifficulty: string, userLevel: string): number {
    const difficultyLevels = ['beginner', 'intermediate', 'advanced', 'expert']
    const templateIndex = difficultyLevels.indexOf(templateDifficulty)
    const userIndex = difficultyLevels.indexOf(userLevel)
    
    if (templateIndex === -1 || userIndex === -1) return 0.5
    
    const difference = Math.abs(templateIndex - userIndex)
    return Math.max(0, 1 - difference * 0.3)
  }

  // Get user session history (mock implementation)
  private async getUserSessionHistory(userId: string): Promise<any[]> {
    // In a real implementation, this would query the database
    // For now, return mock data
    return []
  }
}

// Export singleton instance
export const sessionTemplateManager = new SessionTemplateManager() 