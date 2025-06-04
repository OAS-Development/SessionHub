import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { withDashboardCache, withCacheTracking } from '@/lib/middleware/cache'
import { userDataCache } from '@/lib/cache'

async function dashboardStatsHandler(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Check authentication
    let clerkUserId: string | null = null
    try {
      const authResult = auth()
      clerkUserId = authResult?.userId || null
    } catch (authError) {
      console.log('Auth error:', authError)
      // Continue with null userId to return 401 below
    }
    
    if (!clerkUserId) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    // Try to get from cache first, with fallback to generate data
    const stats = await userDataCache.getDashboardStats(clerkUserId, async () => {
      // This is the fallback function that generates the data
      return {
        totalProjects: 0,
        activeSessions: 0,
        aiTestsCompleted: 0,
        avgSessionTime: 0,
        projects: 0,
        activeProjects: 0,
        sessions: 0,
        aiTests: 0,
        learnings: 0,
        totalDevelopmentTime: 0,
        totalAIInteractions: 0,
        recentActivity: [],
        user: {
          firstName: 'Welcome',
          lastName: 'User',
          email: 'user@example.com',
          imageUrl: null,
          isOnboardingComplete: false,
          lastActiveAt: new Date().toISOString()
        }
      }
    })

    const responseTime = Date.now() - startTime
    console.log(`Dashboard stats for user ${clerkUserId} - Response time: ${responseTime}ms`)
    
    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        _performance: {
          responseTime,
          cached: stats._cached || false,
          timestamp: new Date().toISOString()
        }
      }
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`Dashboard stats error after ${responseTime}ms:`, error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch dashboard statistics',
        _performance: {
          responseTime,
          cached: false,
          error: true
        }
      }, 
      { status: 500 }
    )
  }
}

// Apply caching and tracking middleware
export const GET = withCacheTracking(withDashboardCache(dashboardStatsHandler)) 