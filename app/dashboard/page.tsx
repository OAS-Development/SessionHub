"use client";

import React from 'react'
import { useUser } from '@clerk/nextjs'
import { 
  PlusIcon, 
  PlayIcon,
  ChartBarIcon,
  ClockIcon,
  FolderIcon,
  BeakerIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { useDashboard } from '@/lib/hooks/useDashboard'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/Navigation'
import LearningDashboard from '@/components/LearningDashboard'
import LearningCaptureDemo from '@/components/LearningCaptureDemo'
import CacheMetrics from '@/components/CacheMetrics'

export default function DashboardPage() {
  const { user } = useUser()
  const { stats, loading, error, refetch } = useDashboard()

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <FolderIcon className="h-5 w-5 text-blue-500" />
      case 'session':
        return <ClockIcon className="h-5 w-5 text-green-500" />
      case 'test':
        return <BeakerIcon className="h-5 w-5 text-purple-500" />
      case 'learning':
        return <AcademicCapIcon className="h-5 w-5 text-yellow-500" />
      default:
        return <ChartBarIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const formatRelativeTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (hours > 0) {
      return `${hours} hour${hours === 1 ? '' : 's'} ago`
    } else if (minutes > 0) {
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
    } else {
      return 'Just now'
    }
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navigation />
        <div className="pt-20 container-wide section-padding">
          <Card variant="outlined" className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Error Loading Dashboard</h3>
              <p className="text-neutral-600 mb-6">{error}</p>
              <Button onClick={refetch} variant="primary">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="pt-20 container-wide section-padding-sm space-y-8">
        {/* Welcome Header */}
        <div className="relative overflow-hidden">
          <Card variant="gradient" className="border-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221.5%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
            <CardContent className="relative p-8 md:p-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold">
                    Welcome back, {stats?.user?.firstName || user?.firstName || 'Developer'}! 👋
                  </h1>
                  <p className="text-blue-100 text-lg mt-2">
                    Track your AI-powered development journey and boost your productivity
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hover="scale" className="group cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <PlusIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-1">Create Project</h3>
                  <p className="text-sm text-neutral-600">Start a new development project</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover="scale" className="group cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <PlayIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-1">Start Session</h3>
                  <p className="text-sm text-neutral-600">Begin a focused coding session</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover="scale" className="group cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <BeakerIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 mb-1">Test AI Tools</h3>
                  <p className="text-sm text-neutral-600">Compare AI tool performance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card hover="lift" className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <FolderIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center text-green-600 text-sm">
                  <ArrowUpIcon className="w-4 h-4 mr-1" />
                  +12%
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Projects</p>
                <p className="text-3xl font-bold text-neutral-900">
                  {loading ? (
                    <div className="skeleton h-8 w-12 rounded"></div>
                  ) : (
                    stats?.projects || 0
                  )}
                </p>
                <p className="text-xs text-neutral-500 mt-1">Active projects</p>
              </div>
            </CardContent>
          </Card>

          <Card hover="lift" className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <ClockIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center text-green-600 text-sm">
                  <ArrowUpIcon className="w-4 h-4 mr-1" />
                  +8%
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Sessions</p>
                <p className="text-3xl font-bold text-neutral-900">
                  {loading ? (
                    <div className="skeleton h-8 w-12 rounded"></div>
                  ) : (
                    stats?.sessions || 0
                  )}
                </p>
                <p className="text-xs text-neutral-500 mt-1">Coding sessions</p>
              </div>
            </CardContent>
          </Card>

          <Card hover="lift" className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                  <BeakerIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center text-green-600 text-sm">
                  <ArrowUpIcon className="w-4 h-4 mr-1" />
                  +24%
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">AI Tests</p>
                <p className="text-3xl font-bold text-neutral-900">
                  {loading ? (
                    <div className="skeleton h-8 w-12 rounded"></div>
                  ) : (
                    stats?.aiTests || 0
                  )}
                </p>
                <p className="text-xs text-neutral-500 mt-1">Tool comparisons</p>
              </div>
            </CardContent>
          </Card>

          <Card hover="lift" className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <AcademicCapIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center text-green-600 text-sm">
                  <ArrowUpIcon className="w-4 h-4 mr-1" />
                  +18%
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">Learnings</p>
                <p className="text-3xl font-bold text-neutral-900">
                  {loading ? (
                    <div className="skeleton h-8 w-12 rounded"></div>
                  ) : (
                    stats?.learnings || 0
                  )}
                </p>
                <p className="text-xs text-neutral-500 mt-1">Insights captured</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card hover="lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-indigo-600" />
                Development Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-indigo-600">
                      {loading ? (
                        <div className="skeleton h-8 w-20 rounded"></div>
                      ) : (
                        formatTime(stats?.totalDevelopmentTime || 0)
                      )}
                    </p>
                    <p className="text-sm text-neutral-600">Total coding time</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl flex items-center justify-center">
                    <ChartBarIcon className="w-8 h-8 text-indigo-600" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-neutral-50 rounded-xl">
                    <p className="text-2xl font-bold text-neutral-900">
                      {loading ? '...' : Math.round((stats?.totalDevelopmentTime || 0) / (stats?.sessions || 1))}m
                    </p>
                    <p className="text-xs text-neutral-600">Avg session</p>
                  </div>
                  <div className="text-center p-4 bg-neutral-50 rounded-xl">
                    <p className="text-2xl font-bold text-neutral-900">
                      {loading ? '...' : 85}%
                    </p>
                    <p className="text-xs text-neutral-600">Productivity</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card hover="lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-purple-600" />
                AI Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-purple-600">
                      {loading ? (
                        <div className="skeleton h-8 w-16 rounded"></div>
                      ) : (
                        '92%'
                      )}
                    </p>
                    <p className="text-sm text-neutral-600">AI efficiency score</p>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center">
                    <BeakerIcon className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-neutral-50 rounded-xl">
                    <p className="text-2xl font-bold text-neutral-900">
                      {loading ? '...' : '1.2'}s
                    </p>
                    <p className="text-xs text-neutral-600">Avg response</p>
                  </div>
                  <div className="text-center p-4 bg-neutral-50 rounded-xl">
                    <p className="text-2xl font-bold text-neutral-900">
                      {loading ? '...' : '94'}%
                    </p>
                    <p className="text-xs text-neutral-600">Success rate</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card hover="lift">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <div className="skeleton w-8 h-8 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="skeleton h-4 w-48 rounded mb-2"></div>
                      <div className="skeleton h-3 w-24 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : stats?.recentActivity?.length ? (
              <div className="space-y-4">
                {stats.recentActivity.map((activity: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 hover:bg-neutral-50 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">{activity.title}</p>
                      <p className="text-sm text-neutral-600">{activity.description}</p>
                    </div>
                    <span className="text-xs text-neutral-500">
                      {formatRelativeTime(new Date(activity.timestamp))}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChartBarIcon className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="font-medium text-neutral-900 mb-2">No recent activity</h3>
                <p className="text-neutral-600 text-sm">Start a project or session to see your activity here</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card hover="lift">
            <CardHeader>
              <CardTitle>Learning Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <LearningDashboard />
            </CardContent>
          </Card>

          <Card hover="lift">
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <CacheMetrics />
            </CardContent>
          </Card>
        </div>

        {/* Learning Capture Demo */}
        <Card hover="lift">
          <CardHeader>
            <CardTitle>Learning Capture</CardTitle>
          </CardHeader>
          <CardContent>
            <LearningCaptureDemo />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 