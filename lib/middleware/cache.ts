import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { enhancedRedis, CacheKeys } from '../redis'
import { CacheTTL, shouldUseCache } from '../cache'
import crypto from 'crypto'

interface CacheOptions {
  ttl?: number
  keyGenerator?: (req: NextRequest, userId?: string) => string
  shouldCache?: (req: NextRequest, response: any, userId?: string) => boolean
  transformResponse?: (response: any) => any
  bypassCache?: boolean
}

// Higher-order function for API route caching
export function withCache(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: CacheOptions = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Skip caching if disabled or in test environment
    if (!shouldUseCache() || options.bypassCache) {
      return handler(req)
    }

    try {
      // Get user context
      const { userId } = auth()
      const method = req.method?.toUpperCase()

      // Only cache GET requests by default
      if (method !== 'GET') {
        return handler(req)
      }

      // Generate cache key
      const cacheKey = options.keyGenerator 
        ? options.keyGenerator(req, userId || undefined)
        : generateDefaultCacheKey(req, userId)

      // Try to get from cache
      const cached = await enhancedRedis.get(cacheKey)
      if (cached) {
        // Return cached response
        return new NextResponse(JSON.stringify(cached), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-Cache': 'HIT',
            'X-Cache-Key': cacheKey
          }
        })
      }

      // Execute handler
      const response = await handler(req)
      
      // Only cache successful responses
      if (response.status === 200) {
        const responseData = await response.clone().json()
        
        // Check if we should cache this response
        const shouldCacheResponse = options.shouldCache 
          ? options.shouldCache(req, responseData, userId || undefined)
          : defaultShouldCache(responseData)

        if (shouldCacheResponse) {
          const transformedData = options.transformResponse 
            ? options.transformResponse(responseData)
            : responseData

          // Add cache metadata
          const cachedData = {
            ...transformedData,
            _cache: {
              cached: true,
              timestamp: new Date().toISOString(),
              ttl: options.ttl || CacheTTL.SHORT_TERM
            }
          }

          // Store in cache
          await enhancedRedis.set(
            cacheKey, 
            cachedData, 
            { ex: options.ttl || CacheTTL.SHORT_TERM }
          )
        }
      }

      // Add cache headers
      const newResponse = new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          'X-Cache': 'MISS',
          'X-Cache-Key': cacheKey
        }
      })

      return newResponse
    } catch (error) {
      console.error('Cache middleware error:', error)
      // Fallback to handler if caching fails
      return handler(req)
    }
  }
}

// Default cache key generator
function generateDefaultCacheKey(req: NextRequest, userId?: string): string {
  const url = new URL(req.url)
  const pathname = url.pathname
  const searchParams = url.searchParams.toString()
  
  const parts = [pathname]
  if (userId) parts.push(`user:${userId}`)
  if (searchParams) parts.push(`params:${searchParams}`)
  
  return `api:${parts.join(':')}`
}

// Default cache condition
function defaultShouldCache(responseData: any): boolean {
  return responseData && 
         typeof responseData === 'object' && 
         responseData.success !== false &&
         !responseData.error
}

// Specific cache middleware for different API types
export function withDashboardCache(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return withCache(handler, {
    ttl: CacheTTL.DASHBOARD_STATS,
    keyGenerator: (req, userId) => CacheKeys.dashboardStats(userId || 'anonymous'),
    shouldCache: (req, response, userId) => {
      return userId && response.success && response.data
    },
    transformResponse: (response) => ({
      ...response,
      data: {
        ...response.data,
        _performance: {
          cached: true,
          cacheTime: new Date().toISOString()
        }
      }
    })
  })
}

export function withLearningCache(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return withCache(handler, {
    ttl: CacheTTL.LEARNING_METRICS,
    keyGenerator: (req, userId) => {
      const url = new URL(req.url)
      const pathname = url.pathname
      
      if (pathname.includes('/patterns')) {
        // For pattern requests, include query params in cache key
        const searchParams = url.searchParams.toString()
        return `learning:patterns:${searchParams ? crypto.createHash('md5').update(searchParams).digest('hex') : 'default'}`
      }
      
      return CacheKeys.learningMetrics(userId || 'anonymous')
    },
    shouldCache: (req, response) => {
      return response.success && (response.data?.patterns || response.data?.metrics)
    }
  })
}

export function withPatternAnalysisCache(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return withCache(handler, {
    ttl: CacheTTL.PATTERN_ANALYSIS,
    keyGenerator: (req) => {
      // For POST requests, we need to handle caching differently
      return `pattern:analysis:temp:${Date.now()}`
    },
    shouldCache: (req, response) => {
      return response.success && response.data?.matchedPatterns
    }
  })
}

// Cache invalidation middleware
export class CacheInvalidator {
  static async invalidateUser(userId: string): Promise<void> {
    await enhancedRedis.del([
      CacheKeys.userStats(userId),
      CacheKeys.dashboardStats(userId),
      CacheKeys.learningMetrics(userId)
    ])
  }

  static async invalidateLearning(): Promise<void> {
    await enhancedRedis.del(CacheKeys.learningPatterns())
  }

  static async invalidateSession(sessionId: string): Promise<void> {
    await enhancedRedis.del(CacheKeys.sessionData(sessionId))
  }

  static async invalidatePattern(): Promise<void> {
    // Invalidate all pattern analysis cache
    // In production, you'd use Redis SCAN to find and delete pattern keys
    console.log('Invalidating pattern analysis cache')
  }
}

// Cache warming utilities
export class CacheWarmer {
  static async warmDashboardCache(userId: string, dataFetcher: () => Promise<any>): Promise<void> {
    try {
      const data = await dataFetcher()
      await enhancedRedis.set(
        CacheKeys.dashboardStats(userId), 
        data, 
        { ex: CacheTTL.DASHBOARD_STATS }
      )
    } catch (error) {
      console.error('Failed to warm dashboard cache:', error)
    }
  }

  static async warmLearningCache(userId: string, dataFetcher: () => Promise<any>): Promise<void> {
    try {
      const data = await dataFetcher()
      await enhancedRedis.set(
        CacheKeys.learningMetrics(userId), 
        data, 
        { ex: CacheTTL.LEARNING_METRICS }
      )
    } catch (error) {
      console.error('Failed to warm learning cache:', error)
    }
  }

  static async warmPatternsCache(dataFetcher: () => Promise<any>): Promise<void> {
    try {
      const data = await dataFetcher()
      await enhancedRedis.set(
        CacheKeys.learningPatterns(), 
        data, 
        { ex: CacheTTL.STATIC_PATTERNS }
      )
    } catch (error) {
      console.error('Failed to warm patterns cache:', error)
    }
  }
}

// Performance tracking middleware
export function withCacheTracking(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now()
    
    try {
      const response = await handler(req)
      const duration = Date.now() - startTime
      
      // Track API performance
      const cacheHit = response.headers.get('X-Cache') === 'HIT'
      const cacheKey = response.headers.get('X-Cache-Key')
      
      // Log performance data
      console.log(`API ${req.method} ${req.url}:`, {
        duration,
        cacheHit,
        cacheKey,
        status: response.status
      })
      
      return response
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`API ${req.method} ${req.url} failed after ${duration}ms:`, error)
      throw error
    }
  }
}

// Utility function to create cache-aware API responses
export function createCachedResponse(
  data: any, 
  options: { 
    cached?: boolean
    cacheKey?: string
    ttl?: number
    status?: number 
  } = {}
): NextResponse {
  const responseData = {
    success: true,
    data,
    _cache: options.cached ? {
      cached: true,
      timestamp: new Date().toISOString(),
      ttl: options.ttl
    } : undefined
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (options.cached) {
    headers['X-Cache'] = 'HIT'
  }

  if (options.cacheKey) {
    headers['X-Cache-Key'] = options.cacheKey
  }

  return new NextResponse(JSON.stringify(responseData), {
    status: options.status || 200,
    headers
  })
} 