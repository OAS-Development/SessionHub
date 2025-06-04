import { Redis } from '@upstash/redis'

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Connection health check
export async function testRedisConnection(): Promise<boolean> {
  try {
    const result = await redis.ping()
    return result === 'PONG'
  } catch (error) {
    console.error('Redis connection failed:', error)
    return false
  }
}

// Enhanced Redis client with logging and error handling
export class EnhancedRedis {
  private client: Redis
  private metricsPrefix = 'cache_metrics:'
  
  constructor() {
    this.client = redis
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const start = Date.now()
      const result = await this.client.get<T>(key)
      const duration = Date.now() - start
      
      // Track cache hit/miss metrics
      await this.trackMetric('get', key, result !== null, duration)
      
      return result
    } catch (error) {
      console.error(`Redis GET error for key ${key}:`, error)
      await this.trackMetric('get', key, false, 0, true)
      return null
    }
  }

  async set(
    key: string, 
    value: any, 
    options?: { ex?: number; px?: number; nx?: boolean; xx?: boolean }
  ): Promise<boolean> {
    try {
      const start = Date.now()
      
      // Convert options to compatible format
      const setOptions: any = {}
      if (options?.ex) setOptions.ex = options.ex
      if (options?.px) setOptions.px = options.px
      if (options?.nx) setOptions.nx = options.nx
      if (options?.xx) setOptions.xx = options.xx
      
      await this.client.set(key, value, setOptions)
      const duration = Date.now() - start
      
      await this.trackMetric('set', key, true, duration)
      return true
    } catch (error) {
      console.error(`Redis SET error for key ${key}:`, error)
      await this.trackMetric('set', key, false, 0, true)
      return false
    }
  }

  async del(key: string | string[]): Promise<number> {
    try {
      const start = Date.now()
      
      // Handle both single key and array of keys
      const result = Array.isArray(key) 
        ? await this.client.del(...key)
        : await this.client.del(key)
      
      const duration = Date.now() - start
      
      const keyString = Array.isArray(key) ? key.join(',') : key
      await this.trackMetric('del', keyString, true, duration)
      
      return result
    } catch (error) {
      console.error(`Redis DEL error for key ${key}:`, error)
      return 0
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key)
      return result === 1
    } catch (error) {
      console.error(`Redis EXISTS error for key ${key}:`, error)
      return false
    }
  }

  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key)
    } catch (error) {
      console.error(`Redis INCR error for key ${key}:`, error)
      return 0
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, seconds)
      return result === 1
    } catch (error) {
      console.error(`Redis EXPIRE error for key ${key}:`, error)
      return false
    }
  }

  // Cache metrics tracking
  private async trackMetric(
    operation: string, 
    key: string, 
    success: boolean, 
    duration: number, 
    error: boolean = false
  ): Promise<void> {
    try {
      const timestamp = Date.now()
      const hour = Math.floor(timestamp / (1000 * 60 * 60))
      
      // Track operation counts
      await this.client.incr(`${this.metricsPrefix}ops:${operation}:${hour}`)
      
      // Track success/failure
      if (success) {
        await this.client.incr(`${this.metricsPrefix}hits:${hour}`)
      } else {
        await this.client.incr(`${this.metricsPrefix}misses:${hour}`)
      }
      
      // Track errors
      if (error) {
        await this.client.incr(`${this.metricsPrefix}errors:${hour}`)
      }
      
      // Track response times
      await this.client.lpush(`${this.metricsPrefix}durations:${hour}`, duration)
      await this.client.ltrim(`${this.metricsPrefix}durations:${hour}`, 0, 999) // Keep last 1000 measurements
      
      // Set TTL for metric keys (24 hours)
      await this.client.expire(`${this.metricsPrefix}ops:${operation}:${hour}`, 86400)
      await this.client.expire(`${this.metricsPrefix}hits:${hour}`, 86400)
      await this.client.expire(`${this.metricsPrefix}misses:${hour}`, 86400)
      await this.client.expire(`${this.metricsPrefix}errors:${hour}`, 86400)
      await this.client.expire(`${this.metricsPrefix}durations:${hour}`, 86400)
    } catch (error) {
      // Silently fail metrics tracking to avoid recursive errors
      console.error('Failed to track cache metrics:', error)
    }
  }

  // Get cache performance metrics
  async getMetrics(): Promise<{
    hitRate: number
    avgResponseTime: number
    totalOps: number
    errors: number
    hourlyStats: Array<{
      hour: number
      hits: number
      misses: number
      ops: number
      avgDuration: number
    }>
  }> {
    try {
      const currentHour = Math.floor(Date.now() / (1000 * 60 * 60))
      const last24Hours = Array.from({ length: 24 }, (_, i) => currentHour - i)
      
      const stats = await Promise.all(
        last24Hours.map(async (hour) => {
          const [hits, misses, durations] = await Promise.all([
            this.client.get(`${this.metricsPrefix}hits:${hour}`) as Promise<number | null>,
            this.client.get(`${this.metricsPrefix}misses:${hour}`) as Promise<number | null>,
            this.client.lrange(`${this.metricsPrefix}durations:${hour}`, 0, -1) as Promise<string[]>
          ])
          
          const hitsCount = hits || 0
          const missesCount = misses || 0
          const ops = hitsCount + missesCount
          const avgDuration = durations.length > 0 
            ? durations.reduce((sum, d) => sum + parseInt(d), 0) / durations.length
            : 0
          
          return {
            hour,
            hits: hitsCount,
            misses: missesCount,
            ops,
            avgDuration
          }
        })
      )
      
      const totalHits = stats.reduce((sum, s) => sum + s.hits, 0)
      const totalMisses = stats.reduce((sum, s) => sum + s.misses, 0)
      const totalOps = totalHits + totalMisses
      const hitRate = totalOps > 0 ? totalHits / totalOps : 0
      
      const avgResponseTime = stats.length > 0
        ? stats.reduce((sum, s) => sum + s.avgDuration, 0) / stats.filter(s => s.avgDuration > 0).length
        : 0
      
      const errors = await Promise.all(
        last24Hours.map(hour => this.client.get(`${this.metricsPrefix}errors:${hour}`) as Promise<number | null>)
      ).then(results => results.reduce((sum, e) => sum + (e || 0), 0))
      
      return {
        hitRate,
        avgResponseTime: avgResponseTime || 0,
        totalOps,
        errors,
        hourlyStats: stats.reverse() // Most recent first
      }
    } catch (error) {
      console.error('Failed to get cache metrics:', error)
      return {
        hitRate: 0,
        avgResponseTime: 0,
        totalOps: 0,
        errors: 0,
        hourlyStats: []
      }
    }
  }
}

// Export singleton instance
export const enhancedRedis = new EnhancedRedis()

// Export raw client for direct access if needed
export { redis }

// Cache key generators
export const CacheKeys = {
  userStats: (userId: string) => `user:stats:${userId}`,
  learningMetrics: (userId: string) => `learning:metrics:${userId}`,
  learningPatterns: () => 'learning:patterns:global',
  sessionData: (sessionId: string) => `session:${sessionId}`,
  dashboardStats: (userId: string) => `dashboard:stats:${userId}`,
  patternAnalysis: (hash: string) => `pattern:analysis:${hash}`,
  // File storage cache keys
  fileMetadata: (fileId: string) => `file_metadata:${fileId}`,
  userFiles: (userId: string) => `user_files:${userId}`,
  userFilesList: (userId: string, options: string) => `user_files_list:${userId}:${options}`,
  uploadProgress: (uploadId: string) => `upload_progress:${uploadId}`,
  fileOperation: (timestamp: number, userId: string) => `file_operation:${timestamp}:${userId}`,
  // Session management cache keys
  session: (sessionId: string) => `session:${sessionId}`,
  sessionTemplates: () => 'session_templates:all',
  sessionTemplate: (templateId: string) => `session_template:${templateId}`,
  sessionSearch: (userId: string, searchHash: string) => `session_search:${userId}:${searchHash}`,
  userSessions: (userId: string) => `user_sessions:${userId}`,
  sessionProgress: (sessionId: string) => `session_progress:${sessionId}`,
  sessionAnalytics: (sessionId: string) => `session_analytics:${sessionId}`,
  sessionEvents: (sessionId: string) => `session_events:${sessionId}`,
  activeSession: (userId: string) => `active_session:${userId}`,
} 