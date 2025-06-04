import { NextRequest, NextResponse } from 'next/server'
import { testRedisConnection } from '@/lib/redis'
import { shouldUseCache } from '@/lib/cache'

export async function GET(request: NextRequest) {
  try {
    if (!shouldUseCache()) {
      return NextResponse.json({
        connected: false,
        status: 'disabled',
        message: 'Redis caching is disabled in this environment'
      })
    }

    const isConnected = await testRedisConnection()

    return NextResponse.json({
      connected: isConnected,
      status: isConnected ? 'healthy' : 'unhealthy',
      message: isConnected 
        ? 'Redis connection is working properly'
        : 'Redis connection failed',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Cache health check error:', error)
    return NextResponse.json({
      connected: false,
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 