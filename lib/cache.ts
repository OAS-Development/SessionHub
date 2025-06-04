import { enhancedRedis, CacheKeys } from './redis'
import crypto from 'crypto'

// Cache TTL configurations (in seconds)
export const CacheTTL = {
  USER_DATA: 300,        // 5 minutes
  LEARNING_METRICS: 600, // 10 minutes
  STATIC_PATTERNS: 3600, // 1 hour
  SESSION_DATA: 1800,    // 30 minutes
  DASHBOARD_STATS: 300,  // 5 minutes
  PATTERN_ANALYSIS: 1800, // 30 minutes
  SHORT_TERM: 60,        // 1 minute
  LONG_TERM: 86400,      // 24 hours
} as const

// Cache strategy configuration
export interface CacheStrategy {
  key: string
  ttl: number
  fallback: () => Promise<any>
  shouldCache?: (data: any) => boolean
  transform?: (data: any) => any
}

// Enhanced caching utility class
export class CacheManager {
  private redis = enhancedRedis

  // Generic cache get with fallback
  async get<T>(
    key: string,
    fallback: () => Promise<T>,
    ttl: number = CacheTTL.SHORT_TERM,
    options: {
      transform?: (data: T) => T
      shouldCache?: (data: T) => boolean
      forceRefresh?: boolean
    } = {}
  ): Promise<T> {
    const { transform, shouldCache = () => true, forceRefresh = false } = options

    // Force refresh bypasses cache
    if (forceRefresh) {
      const data = await fallback()
      const finalData = transform ? transform(data) : data
      
      if (shouldCache(finalData)) {
        await this.redis.set(key, finalData, { ex: ttl })
      }
      
      return finalData
    }

    // Try cache first
    const cached = await this.redis.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Fallback to source
    const data = await fallback()
    const finalData = transform ? transform(data) : data

    // Cache the result if conditions are met
    if (shouldCache(finalData)) {
      await this.redis.set(key, finalData, { ex: ttl })
    }

    return finalData
  }

  // Set with TTL
  async set(key: string, value: any, ttl: number = CacheTTL.SHORT_TERM): Promise<boolean> {
    return await this.redis.set(key, value, { ex: ttl })
  }

  // Delete cache entry
  async del(key: string | string[]): Promise<number> {
    return await this.redis.del(key)
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    return await this.redis.exists(key)
  }

  // Invalidate cache pattern
  async invalidatePattern(pattern: string): Promise<void> {
    // Note: This is a simplified implementation
    // In production, you'd want to use Redis SCAN for pattern matching
    console.log(`Cache invalidation pattern: ${pattern}`)
  }

  // Get or compute with locking to prevent cache stampede
  async getOrCompute<T>(
    key: string,
    computer: () => Promise<T>,
    ttl: number = CacheTTL.SHORT_TERM,
    lockTtl: number = 30
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.redis.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Try to acquire lock
    const lockKey = `lock:${key}`
    const lockValue = crypto.randomUUID()
    const lockAcquired = await this.redis.set(lockKey, lockValue, { ex: lockTtl, nx: true })

    if (lockAcquired) {
      try {
        // Double-check cache after acquiring lock
        const cached = await this.redis.get<T>(key)
        if (cached !== null) {
          return cached
        }

        // Compute the value
        const value = await computer()
        
        // Cache the result
        await this.redis.set(key, value, { ex: ttl })
        
        return value
      } finally {
        // Release lock
        await this.redis.del(lockKey)
      }
    } else {
      // Lock not acquired, wait and retry
      await new Promise(resolve => setTimeout(resolve, 100))
      return this.getOrCompute(key, computer, ttl, lockTtl)
    }
  }

  // Batch operations
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    return Promise.all(keys.map(key => this.redis.get<T>(key)))
  }

  async mset(entries: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    await Promise.all(
      entries.map(entry => 
        this.redis.set(entry.key, entry.value, { ex: entry.ttl || CacheTTL.SHORT_TERM })
      )
    )
  }
}

// Specific cache utilities
export class UserDataCache extends CacheManager {
  async getUserStats(userId: string, fallback: () => Promise<any>) {
    return this.get(
      CacheKeys.userStats(userId),
      fallback,
      CacheTTL.USER_DATA,
      {
        shouldCache: (data) => data !== null && data !== undefined,
        transform: (data) => ({
          ...data,
          _cached: true,
          _cacheTime: new Date().toISOString()
        })
      }
    )
  }

  async getDashboardStats(userId: string, fallback: () => Promise<any>) {
    return this.get(
      CacheKeys.dashboardStats(userId),
      fallback,
      CacheTTL.DASHBOARD_STATS,
      {
        shouldCache: (data) => data && data.success,
      }
    )
  }

  async invalidateUserCache(userId: string): Promise<void> {
    await this.del([
      CacheKeys.userStats(userId),
      CacheKeys.dashboardStats(userId),
      CacheKeys.learningMetrics(userId)
    ])
  }
}

export class LearningDataCache extends CacheManager {
  async getLearningMetrics(userId: string, fallback: () => Promise<any>) {
    return this.get(
      CacheKeys.learningMetrics(userId),
      fallback,
      CacheTTL.LEARNING_METRICS,
      {
        shouldCache: (data) => data && Object.keys(data).length > 0
      }
    )
  }

  async getLearningPatterns(fallback: () => Promise<any>) {
    return this.get(
      CacheKeys.learningPatterns(),
      fallback,
      CacheTTL.STATIC_PATTERNS,
      {
        shouldCache: (data) => data && data.length > 0
      }
    )
  }

  async getPatternAnalysis(instructionText: string, context: any, fallback: () => Promise<any>) {
    // Create hash from instruction and context for cache key
    const hash = crypto
      .createHash('md5')
      .update(JSON.stringify({ instructionText, context }))
      .digest('hex')

    return this.get(
      CacheKeys.patternAnalysis(hash),
      fallback,
      CacheTTL.PATTERN_ANALYSIS,
      {
        shouldCache: (data) => data && data.matchedPatterns
      }
    )
  }

  async invalidateLearningCache(): Promise<void> {
    await this.del([CacheKeys.learningPatterns()])
  }
}

export class SessionDataCache extends CacheManager {
  async getSessionData(sessionId: string, fallback: () => Promise<any>) {
    return this.get(
      CacheKeys.sessionData(sessionId),
      fallback,
      CacheTTL.SESSION_DATA
    )
  }

  async setSessionData(sessionId: string, data: any): Promise<boolean> {
    return this.set(CacheKeys.sessionData(sessionId), data, CacheTTL.SESSION_DATA)
  }

  async invalidateSession(sessionId: string): Promise<void> {
    await this.del(CacheKeys.sessionData(sessionId))
  }
}

// Performance monitoring
export class CachePerformanceMonitor {
  private redis = enhancedRedis

  async getPerformanceMetrics() {
    return await this.redis.getMetrics()
  }

  async getDetailedStats() {
    const metrics = await this.getPerformanceMetrics()
    
    return {
      ...metrics,
      performance: {
        hitRateStatus: this.getHitRateStatus(metrics.hitRate),
        responseTimeStatus: this.getResponseTimeStatus(metrics.avgResponseTime),
        recommendations: this.getRecommendations(metrics)
      }
    }
  }

  private getHitRateStatus(hitRate: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (hitRate >= 0.8) return 'excellent'
    if (hitRate >= 0.6) return 'good'
    if (hitRate >= 0.4) return 'fair'
    return 'poor'
  }

  private getResponseTimeStatus(avgTime: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (avgTime <= 10) return 'excellent'
    if (avgTime <= 25) return 'good'
    if (avgTime <= 50) return 'fair'
    return 'poor'
  }

  private getRecommendations(metrics: any): string[] {
    const recommendations: string[] = []

    if (metrics.hitRate < 0.5) {
      recommendations.push('Consider increasing cache TTL for frequently accessed data')
    }

    if (metrics.avgResponseTime > 50) {
      recommendations.push('Cache response times are high - check Redis connection')
    }

    if (metrics.errors > 0) {
      recommendations.push('Address Redis connection errors to improve reliability')
    }

    if (metrics.totalOps > 10000 && metrics.hitRate < 0.7) {
      recommendations.push('High usage with low hit rate - review caching strategy')
    }

    return recommendations
  }
}

// Export singleton instances
export const cacheManager = new CacheManager()
export const userDataCache = new UserDataCache()
export const learningDataCache = new LearningDataCache()
export const sessionDataCache = new SessionDataCache()
export const cacheMonitor = new CachePerformanceMonitor()

// Utility functions
export function generateCacheKey(prefix: string, ...parts: string[]): string {
  return [prefix, ...parts.map(part => part.replace(/[^a-zA-Z0-9]/g, '_'))].join(':')
}

export function shouldUseCache(): boolean {
  return process.env.NODE_ENV !== 'test' && 
         Boolean(process.env.UPSTASH_REDIS_REST_URL)
} 