import { User, Prisma } from '@prisma/client'
import { prisma, safeQuery, NotFoundError, ValidationError } from '../db'

// Types for user operations
export interface CreateUserData {
  clerkId: string
  email: string
  firstName?: string
  lastName?: string
  username?: string
  imageUrl?: string
}

export interface UpdateUserData {
  email?: string
  firstName?: string
  lastName?: string
  username?: string
  imageUrl?: string
  timezone?: string
  preferences?: any
}

export interface OnboardingData {
  role?: string
  experience?: string
  primaryLanguage?: string
  aiToolsUsed?: string[]
  isOnboardingComplete?: boolean
}

export interface UserWithStats extends User {
  _count: {
    projects: number
    sessions: number
    aiTests: number
    learnings: number
  }
}

// Create a new user from Clerk webhook
export async function createUser(data: CreateUserData): Promise<User> {
  return safeQuery(async () => {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: data.clerkId }
    })
    
    if (existingUser) {
      throw new ValidationError('User already exists', 'clerkId')
    }
    
    return await prisma.user.create({
      data: {
        clerkId: data.clerkId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        imageUrl: data.imageUrl,
        lastActiveAt: new Date(),
      }
    })
  })
}

// Update user from Clerk webhook
export async function updateUser(clerkId: string, data: UpdateUserData): Promise<User> {
  return safeQuery(async () => {
    const user = await prisma.user.findUnique({
      where: { clerkId }
    })
    
    if (!user) {
      throw new NotFoundError('User', clerkId)
    }
    
    return await prisma.user.update({
      where: { clerkId },
      data: {
        ...data,
        updatedAt: new Date(),
        lastActiveAt: new Date(),
      }
    })
  })
}

// Delete user (for Clerk webhook)
export async function deleteUser(clerkId: string): Promise<void> {
  return safeQuery(async () => {
    const user = await prisma.user.findUnique({
      where: { clerkId }
    })
    
    if (!user) {
      throw new NotFoundError('User', clerkId)
    }
    
    // Soft delete by setting isActive to false
    await prisma.user.update({
      where: { clerkId },
      data: {
        isActive: false,
        updatedAt: new Date(),
      }
    })
  })
}

// Get user by Clerk ID
export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  return safeQuery(async () => {
    return await prisma.user.findUnique({
      where: { clerkId }
    })
  })
}

// Get user with statistics
export async function getUserWithStats(clerkId: string): Promise<UserWithStats | null> {
  return safeQuery(async () => {
    return await prisma.user.findUnique({
      where: { clerkId },
      include: {
        _count: {
          select: {
            projects: true,
            sessions: true,
            aiTests: true,
            learnings: true,
          }
        }
      }
    })
  })
}

// Update user onboarding data
export async function updateUserOnboarding(clerkId: string, data: OnboardingData): Promise<User> {
  return safeQuery(async () => {
    const user = await prisma.user.findUnique({
      where: { clerkId }
    })
    
    if (!user) {
      throw new NotFoundError('User', clerkId)
    }
    
    return await prisma.user.update({
      where: { clerkId },
      data: {
        ...data,
        updatedAt: new Date(),
      }
    })
  })
}

// Update user activity (call when user performs actions)
export async function updateUserActivity(clerkId: string): Promise<void> {
  return safeQuery(async () => {
    await prisma.user.update({
      where: { clerkId },
      data: {
        lastActiveAt: new Date(),
      }
    })
  })
}

// Get or create user (useful for ensuring user exists)
export async function getOrCreateUser(data: CreateUserData): Promise<User> {
  return safeQuery(async () => {
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: data.clerkId }
    })
    
    if (existingUser) {
      // Update last active time
      return await prisma.user.update({
        where: { clerkId: data.clerkId },
        data: {
          lastActiveAt: new Date(),
        }
      })
    }
    
    return await createUser(data)
  })
}

// Increment user statistics
export async function incrementUserStats(
  clerkId: string,
  stats: {
    sessions?: number
    developmentTime?: number
    aiInteractions?: number
  }
): Promise<void> {
  return safeQuery(async () => {
    const updateData: any = {}
    
    if (stats.sessions) {
      updateData.totalSessions = { increment: stats.sessions }
    }
    
    if (stats.developmentTime) {
      updateData.totalDevelopmentTime = { increment: stats.developmentTime }
    }
    
    if (stats.aiInteractions) {
      updateData.totalAIInteractions = { increment: stats.aiInteractions }
    }
    
    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { clerkId },
        data: {
          ...updateData,
          updatedAt: new Date(),
          lastActiveAt: new Date(),
        }
      })
    }
  })
}

// Get users with pagination
export async function getUsers(
  page: number = 1,
  limit: number = 50,
  filters?: {
    isActive?: boolean
    isOnboardingComplete?: boolean
  }
): Promise<{ users: User[], total: number, pages: number }> {
  return safeQuery(async () => {
    const where: Prisma.UserWhereInput = {}
    
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive
    }
    
    if (filters?.isOnboardingComplete !== undefined) {
      where.isOnboardingComplete = filters.isOnboardingComplete
    }
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ])
    
    return {
      users,
      total,
      pages: Math.ceil(total / limit)
    }
  })
}

// Cleanup inactive users (soft deleted users older than 30 days)
export async function cleanupInactiveUsers(): Promise<number> {
  return safeQuery(async () => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const result = await prisma.user.deleteMany({
      where: {
        isActive: false,
        updatedAt: {
          lt: thirtyDaysAgo
        }
      }
    })
    
    return result.count
  })
} 