import { useState, useEffect } from 'react'

interface DashboardStats {
  projects: number
  activeProjects: number
  sessions: number
  aiTests: number
  learnings: number
  totalDevelopmentTime: number
  totalAIInteractions: number
  recentActivity: RecentActivity[]
  user: {
    firstName?: string | null
    lastName?: string | null
    email: string
    imageUrl?: string | null
    isOnboardingComplete: boolean
    lastActiveAt: Date
  }
}

interface RecentActivity {
  id: string
  type: 'project' | 'session' | 'test' | 'learning'
  title: string
  description?: string
  timestamp: Date
}

interface UseDashboardReturn {
  stats: DashboardStats | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDashboard(): UseDashboardReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/dashboard/stats')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard stats: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      // Check if the response has the new format with success/data
      let data;
      if (result.success && result.data) {
        data = result.data
      } else if (result.success === false) {
        throw new Error(result.error || 'API returned error')
      } else {
        // Fallback to old format for compatibility
        data = result
      }
      
      // Transform timestamps back to Date objects
      const transformedData = {
        ...data,
        recentActivity: data.recentActivity?.map((activity: any) => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        })) || [],
        user: {
          ...data.user,
          lastActiveAt: new Date(data.user.lastActiveAt)
        }
      }
      
      setStats(transformedData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data'
      setError(errorMessage)
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  }
} 