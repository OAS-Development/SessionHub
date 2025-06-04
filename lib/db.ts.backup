import { PrismaClient } from '@prisma/client'

// Global declaration for TypeScript
declare global {
  var __prisma: PrismaClient | undefined
}

// Prevent multiple instances of Prisma Client in development
const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// In development, save the client to global to prevent hot reload issues
if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma
}

export { prisma }

// Database connection health check
export async function healthCheck(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}

// Graceful shutdown
export async function disconnect() {
  await prisma.$disconnect()
}

// Transaction wrapper with retry logic
export async function withTransaction<T>(
  callback: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>) => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await prisma.$transaction(callback, {
        timeout: 10000, // 10 seconds
        maxWait: 5000,  // 5 seconds
      })
    } catch (error) {
      lastError = error as Error
      console.warn(`Transaction attempt ${attempt} failed:`, error)
      
      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 100
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw new Error(`Transaction failed after ${maxRetries} attempts: ${lastError?.message}`)
}

// Database error types for better error handling
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public meta?: any
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, identifier: string) {
    super(`${resource} with identifier '${identifier}' not found`)
    this.name = 'NotFoundError'
  }
}

// Error handler for Prisma errors
export function handlePrismaError(error: any): never {
  console.error('Prisma error:', error)
  
  if (error.code === 'P2002') {
    throw new ValidationError(`Duplicate value for unique field: ${error.meta?.target?.join(', ')}`)
  }
  
  if (error.code === 'P2025') {
    throw new NotFoundError('Record', 'unknown')
  }
  
  if (error.code === 'P2003') {
    throw new ValidationError('Foreign key constraint failed')
  }
  
  if (error.code === 'P2016') {
    throw new ValidationError('Query interpretation error')
  }
  
  throw new DatabaseError(error.message, error.code, error.meta)
}

// Safe query wrapper
export async function safeQuery<T>(
  queryFn: () => Promise<T>
): Promise<T> {
  try {
    return await queryFn()
  } catch (error) {
    handlePrismaError(error)
  }
} 