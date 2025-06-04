'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  CheckSquare, 
  Target, 
  BookOpen, 
  Zap, 
  BarChart3, 
  Sparkles,
  Plus,
  TrendingUp,
  Clock,
  Brain
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [insights] = useState([
    "Your most productive hours are typically between 9-11 AM",
    "You're 40% more efficient when you break tasks into smaller chunks",
    "Consider scheduling important work during your peak energy times"
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const quickActions = [
    {
      title: 'Add Task',
      description: 'Create a new task with AI analysis',
      icon: CheckSquare,
      href: '/tasks',
      color: 'bg-blue-500'
    },
    {
      title: 'Set Goal',
      description: 'Define a new goal to track',
      icon: Target,
      href: '/goals',
      color: 'bg-green-500'
    },
    {
      title: 'Upload Document',
      description: 'Add to your knowledge library',
      icon: BookOpen,
      href: '/library',
      color: 'bg-purple-500'
    },
    {
      title: 'Create Automation',
      description: 'Set up a new Zapier workflow',
      icon: Zap,
      href: '/automation',
      color: 'bg-orange-500'
    }
  ]

  const stats = [
    {
      title: 'Active Tasks',
      value: '12',
      change: '+3 this week',
      icon: CheckSquare,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'Goals Progress',
      value: '78%',
      change: '+15% this month',
      icon: Target,
      color: 'text-green-600 bg-green-100'
    },
    {
      title: 'Documents',
      value: '24',
      change: '+5 this week',
      icon: BookOpen,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      title: 'Automations',
      value: '6',
      change: '+2 this month',
      icon: Zap,
      color: 'text-orange-600 bg-orange-100'
    }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {getGreeting()}, {user?.user_metadata?.full_name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-gray-600 mt-1">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Ready to boost your productivity with AI insights?
            </p>
          </div>
          <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* AI Insights & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-purple-900">AI Insights</CardTitle>
            </div>
            <CardDescription className="text-purple-700">
              Personalized recommendations based on your patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white/70 rounded-lg">
                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-gray-700">{insight}</p>
              </div>
            ))}
            <Button 
              variant="outline" 
              className="w-full border-purple-300 text-purple-700 hover:bg-purple-100"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Full Analytics
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Jump into your most common tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.title}
                  variant="outline"
                  className="w-full justify-start h-auto p-4 hover:bg-gray-50"
                  asChild
                >
                  <a href={action.href}>
                    <div className="flex items-center gap-4">
                      <div className={`p-2 ${action.color} rounded-lg`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">{action.title}</div>
                        <div className="text-sm text-gray-500">{action.description}</div>
                      </div>
                      <Plus className="h-4 w-4 text-gray-400 ml-auto" />
                    </div>
                  </a>
                </Button>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest actions and AI interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: 'Analyzed task',
                description: 'AI provided insights for "Complete project proposal"',
                time: '2 hours ago',
                type: 'analysis'
              },
              {
                action: 'Added document',
                description: 'Uploaded "Product Strategy 2024.pdf" to library',
                time: '1 day ago',
                type: 'upload'
              },
              {
                action: 'Goal progress',
                description: 'Reached 80% completion on Q4 objectives',
                time: '2 days ago',
                type: 'progress'
              }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'analysis' ? 'bg-purple-500' :
                  activity.type === 'upload' ? 'bg-blue-500' : 'bg-green-500'
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 