'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Sparkles, 
  Brain, 
  Zap, 
  BookOpen, 
  Target, 
  BarChart3,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Get intelligent insights and recommendations for your tasks and goals'
    },
    {
      icon: BookOpen,
      title: 'Personal Library',
      description: 'Upload and analyze documents, books, and notes with AI-powered insights'
    },
    {
      icon: Target,
      title: 'Smart Goal Tracking',
      description: 'Set, track, and achieve your goals with AI-driven progress monitoring'
    },
    {
      icon: Zap,
      title: 'Automation Hub',
      description: 'Connect with Zapier and automate your productivity workflows'
    },
    {
      icon: BarChart3,
      title: 'Intelligence Analytics',
      description: 'Understand your patterns and optimize your productivity with detailed insights'
    },
    {
      icon: CheckCircle,
      title: 'Task Management',
      description: 'Organize and prioritize tasks with AI-powered analysis and recommendations'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Bara</h1>
              <p className="text-xs text-gray-500">AI Intelligence Platform</p>
            </div>
          </div>
          <Button 
            onClick={() => router.push('/auth')}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            Get Started
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full text-sm font-medium text-blue-700 mb-8">
            <Sparkles className="h-4 w-4" />
            Powered by Claude AI
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Personal
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
              AI Intelligence Platform
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Boost your productivity with AI-powered task analysis, intelligent document insights, 
            and automated workflows. Everything you need to achieve more.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => router.push('/auth')}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-lg px-8 py-6"
            >
              Start Free Today
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-gray-300"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need for Intelligent Productivity
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Bara combines the power of AI with intuitive design to help you achieve more than ever before.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg w-fit mb-4">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Productivity?
            </h2>
            <p className="text-blue-100 mb-8 text-lg">
              Join thousands of users who are already achieving more with AI-powered insights.
            </p>
            <Button 
              size="lg"
              onClick={() => router.push('/auth')}
              className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6"
            >
              Get Started Now
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-gray-200 bg-white/80">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900">Bara</span>
          </div>
          <p className="text-gray-600 text-sm">
            © 2024 Bara. Your personal AI intelligence platform.
          </p>
        </div>
      </footer>
    </div>
  )
}
