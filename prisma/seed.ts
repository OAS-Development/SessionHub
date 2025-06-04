import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data (in development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Clearing existing seed data...')
    await prisma.aiTool.deleteMany({
      where: { isPublic: true }
    })
    await prisma.prompt.deleteMany({
      where: { isTemplate: true }
    })
  }

  // Seed AI Tools
  console.log('🤖 Seeding AI tools...')
  
  const aiTools = [
    {
      name: 'Cursor AI',
      version: '0.42.0',
      category: 'CODE_COMPLETION' as const,
      description: 'AI-powered code editor with intelligent autocomplete and chat features',
      strengths: [
        'Fast code completion',
        'Contextual understanding',
        'Multi-file editing',
        'Natural language to code',
        'Real-time collaboration'
      ],
      weaknesses: [
        'Requires subscription for advanced features',
        'Limited offline functionality',
        'Learning curve for new users'
      ],
      costModel: 'Free tier available, Pro plans start at $20/month',
      websiteUrl: 'https://cursor.sh',
      documentationUrl: 'https://docs.cursor.sh',
      isActive: true,
      isPublic: true
    },
    {
      name: 'GitHub Copilot',
      version: '1.0',
      category: 'CODE_COMPLETION' as const,
      description: 'AI pair programmer that helps you write code faster',
      strengths: [
        'Excellent code suggestions',
        'Supports many languages',
        'IDE integration',
        'Context-aware completions',
        'Large training dataset'
      ],
      weaknesses: [
        'Subscription required',
        'Privacy concerns',
        'Sometimes suggests outdated patterns',
        'Limited customization'
      ],
      costModel: '$10/month per user',
      websiteUrl: 'https://github.com/features/copilot',
      documentationUrl: 'https://docs.github.com/en/copilot',
      isActive: true,
      isPublic: true
    },
    {
      name: 'ChatGPT',
      version: '4.0',
      category: 'CHAT_ASSISTANT' as const,
      description: 'Advanced conversational AI for coding assistance and problem solving',
      strengths: [
        'Excellent explanation abilities',
        'Debugging assistance',
        'Code review capabilities',
        'Learning and teaching',
        'Multi-language support'
      ],
      weaknesses: [
        'No real-time code context',
        'Cannot execute code',
        'Token limits',
        'May hallucinate solutions'
      ],
      costModel: 'Free tier available, Plus at $20/month',
      websiteUrl: 'https://chat.openai.com',
      documentationUrl: 'https://platform.openai.com/docs',
      isActive: true,
      isPublic: true
    },
    {
      name: 'Claude',
      version: '3.5',
      category: 'CHAT_ASSISTANT' as const,
      description: 'Anthropic\'s AI assistant with strong reasoning and coding capabilities',
      strengths: [
        'Strong reasoning abilities',
        'Code analysis and review',
        'Detailed explanations',
        'Safety-focused responses',
        'Long context understanding'
      ],
      weaknesses: [
        'Limited availability',
        'No real-time coding',
        'Subscription required for heavy use'
      ],
      costModel: 'Free tier available, Pro at $20/month',
      websiteUrl: 'https://claude.ai',
      documentationUrl: 'https://docs.anthropic.com',
      isActive: true,
      isPublic: true
    },
    {
      name: 'Amazon CodeWhisperer',
      version: '1.0',
      category: 'CODE_COMPLETION' as const,
      description: 'Amazon\'s AI code generator with AWS integration',
      strengths: [
        'AWS service integration',
        'Security scanning',
        'Multiple IDE support',
        'Reference tracking',
        'Free for individual use'
      ],
      weaknesses: [
        'Limited to AWS ecosystem',
        'Less community support',
        'Fewer training languages'
      ],
      costModel: 'Free for individual use, Pro tiers available',
      websiteUrl: 'https://aws.amazon.com/codewhisperer',
      documentationUrl: 'https://docs.aws.amazon.com/codewhisperer',
      isActive: true,
      isPublic: true
    },
    {
      name: 'Tabnine',
      version: '4.0',
      category: 'CODE_COMPLETION' as const,
      description: 'AI code completion tool with privacy-focused approach',
      strengths: [
        'Privacy-focused',
        'Local model options',
        'Custom model training',
        'Multi-language support',
        'Team collaboration'
      ],
      weaknesses: [
        'Subscription required for best features',
        'Setup complexity',
        'Resource intensive'
      ],
      costModel: 'Free tier available, Pro plans start at $12/month',
      websiteUrl: 'https://www.tabnine.com',
      documentationUrl: 'https://docs.tabnine.com',
      isActive: true,
      isPublic: true
    },
    {
      name: 'Codeium',
      version: '1.0',
      category: 'CODE_COMPLETION' as const,
      description: 'Free AI-powered code acceleration toolkit',
      strengths: [
        'Free for individual use',
        'Fast completions',
        'Chat interface',
        'Multiple IDE support',
        'Good language coverage'
      ],
      weaknesses: [
        'Newer platform',
        'Less community',
        'Limited enterprise features'
      ],
      costModel: 'Free for individuals, Teams plans available',
      websiteUrl: 'https://codeium.com',
      documentationUrl: 'https://docs.codeium.com',
      isActive: true,
      isPublic: true
    }
  ]

  for (const tool of aiTools) {
    await prisma.aiTool.create({ data: tool })
    console.log(`✅ Created AI tool: ${tool.name}`)
  }

  // Seed Template Prompts
  console.log('📝 Seeding template prompts...')
  
  // We'll create a demo user ID for template prompts
  const demoUserId = 'system'
  
  const prompts = [
    {
      title: 'Bug Fix Assistant',
      description: 'Help identify and fix bugs in code',
      content: `I'm encountering a bug in my {language} code. Here's the problematic code:

\`\`\`{language}
{code}
\`\`\`

The issue is: {issue_description}

Expected behavior: {expected_behavior}
Actual behavior: {actual_behavior}

Please help me identify the root cause and provide a fix.`,
      category: 'DEBUGGING' as const,
      tags: ['debugging', 'bug-fix', 'troubleshooting'],
      difficulty: 'INTERMEDIATE' as const,
      language: null,
      framework: null,
      useCase: 'When you encounter bugs and need systematic debugging help',
      variables: {
        language: 'Programming language (e.g., JavaScript, Python)',
        code: 'The buggy code snippet',
        issue_description: 'Description of the problem',
        expected_behavior: 'What should happen',
        actual_behavior: 'What actually happens'
      },
      expectedOutput: 'Root cause analysis and corrected code',
      isPublic: true,
      isTemplate: true,
      isActive: true,
      userId: demoUserId
    },
    {
      title: 'Code Review Assistant',
      description: 'Get comprehensive code review feedback',
      content: `Please review this {language} code for best practices, potential issues, and improvements:

\`\`\`{language}
{code}
\`\`\`

Focus areas:
- Code quality and readability
- Performance optimizations
- Security considerations
- Best practices adherence
- Potential bugs or edge cases

Please provide specific feedback with examples of improvements.`,
      category: 'ARCHITECTURE' as const,
      tags: ['code-review', 'best-practices', 'quality'],
      difficulty: 'INTERMEDIATE' as const,
      language: null,
      framework: null,
      useCase: 'When you want thorough code review feedback',
      variables: {
        language: 'Programming language',
        code: 'Code to be reviewed'
      },
      expectedOutput: 'Detailed code review with specific improvement suggestions',
      isPublic: true,
      isTemplate: true,
      isActive: true,
      userId: demoUserId
    },
    {
      title: 'API Documentation Generator',
      description: 'Generate comprehensive API documentation',
      content: `Generate comprehensive API documentation for this {language} {type} endpoint:

\`\`\`{language}
{code}
\`\`\`

Please include:
- Endpoint description and purpose
- Request/response schemas
- Parameters and their types
- Example requests and responses
- Error codes and messages
- Authentication requirements (if applicable)

Format the documentation in a clear, professional manner.`,
      category: 'DOCUMENTATION' as const,
      tags: ['documentation', 'api', 'endpoints'],
      difficulty: 'BEGINNER' as const,
      language: null,
      framework: null,
      useCase: 'When you need to document API endpoints',
      variables: {
        language: 'Programming language',
        type: 'Type of endpoint (REST, GraphQL, etc.)',
        code: 'API endpoint code'
      },
      expectedOutput: 'Complete API documentation with examples',
      isPublic: true,
      isTemplate: true,
      isActive: true,
      userId: demoUserId
    },
    {
      title: 'Test Case Generator',
      description: 'Generate comprehensive test cases for functions',
      content: `Generate comprehensive test cases for this {language} function:

\`\`\`{language}
{code}
\`\`\`

Please include:
- Unit tests for normal cases
- Edge cases and boundary conditions
- Error handling tests
- Mock data where needed
- Test descriptions explaining what each test validates

Use {testing_framework} testing framework and follow best practices.`,
      category: 'TESTING' as const,
      tags: ['testing', 'unit-tests', 'test-cases'],
      difficulty: 'INTERMEDIATE' as const,
      language: null,
      framework: null,
      useCase: 'When you need comprehensive test coverage for functions',
      variables: {
        language: 'Programming language',
        code: 'Function to test',
        testing_framework: 'Testing framework (Jest, PyTest, etc.)'
      },
      expectedOutput: 'Complete test suite with multiple test cases',
      isPublic: true,
      isTemplate: true,
      isActive: true,
      userId: demoUserId
    },
    {
      title: 'Code Refactoring Assistant',
      description: 'Refactor code for better structure and maintainability',
      content: `Please refactor this {language} code to improve:
- Code structure and organization
- Readability and maintainability
- Performance where possible
- Following {language} best practices and conventions

Original code:
\`\`\`{language}
{code}
\`\`\`

Requirements:
{requirements}

Please provide the refactored code with explanations of the changes made.`,
      category: 'REFACTORING' as const,
      tags: ['refactoring', 'optimization', 'maintainability'],
      difficulty: 'ADVANCED' as const,
      language: null,
      framework: null,
      useCase: 'When you need to improve existing code structure',
      variables: {
        language: 'Programming language',
        code: 'Code to refactor',
        requirements: 'Specific refactoring requirements'
      },
      expectedOutput: 'Refactored code with explanations of improvements',
      isPublic: true,
      isTemplate: true,
      isActive: true,
      userId: demoUserId
    }
  ]

  for (const prompt of prompts) {
    await prisma.prompt.create({ data: prompt })
    console.log(`✅ Created template prompt: ${prompt.title}`)
  }

  console.log('🎉 Database seed completed successfully!')
  console.log(`📊 Created ${aiTools.length} AI tools and ${prompts.length} template prompts`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 