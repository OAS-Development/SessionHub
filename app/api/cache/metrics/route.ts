import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { cacheMonitor, shouldUseCache } from '@/lib/cache'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    // Check if caching is enabled
    if (!shouldUseCache()) {
      return NextResponse.json({
        success: true,
        data: {
          hitRate: 0,
          avgResponseTime: 0,
          totalOps: 0,
          errors: 0,
          hourlyStats: [],
          performance: {
            hitRateStatus: 'poor',
            responseTimeStatus: 'poor',
            recommendations: ['Redis caching is disabled - no performance data available']
          }
        }
      })
    }

    // Get detailed cache metrics
    const metrics = await cacheMonitor.getDetailedStats()

    return NextResponse.json({
      success: true,
      data: metrics
    })
  } catch (error) {
    console.error('Cache metrics error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch cache metrics' 
      }, 
      { status: 500 }
    )
  }
} 