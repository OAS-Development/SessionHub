// app/api/analytics/activity/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Mock user ID for testing (remove Clerk dependency)
    const userId = 'test-user-123';

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Fetch recent sessions using correct field names
    const recentSessions = await prisma.session.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,                // Correct field name
        goalDescription: true,
        status: true,               // This field exists
        startedAt: true,           // Using startedAt instead of createdAt
        completedAt: true,
        duration: true,
        linesAdded: true,
        testsAdded: true,
        project: {
          select: {
            name: true
          }
        }
      },
      orderBy: { startedAt: 'desc' },
      take: Math.floor(limit / 2)
    });

    // Fetch recent tasks (instead of aiTests which doesn't exist)
    const recentTasks = await prisma.task.findMany({
      where: { 
        session: {
          userId: userId
        }
      },
      select: {
        id: true,
        title: true,
        aiTool: true,
        status: true,
        createdAt: true,
        executionTime: true
      },
      orderBy: { createdAt: 'desc' },
      take: Math.floor(limit / 2)
    });

    // Combine and format activities
    const activities = [
      ...recentSessions.map(session => ({
        id: session.id,
        type: 'session' as const,
        title: session.title || 'Development Session',
        description: `${session.project?.name || 'Unknown Project'} - ${session.linesAdded || 0} lines added`,
        timestamp: (session.startedAt || new Date()).toISOString(),
        status: session.status === 'completed' ? 'success' as const : 
                session.status === 'failed' ? 'failed' as const : 'in_progress' as const,
        metadata: {
          duration: session.duration,
          linesAdded: session.linesAdded,
          testsAdded: session.testsAdded
        }
      })),
      ...recentTasks.map(task => ({
        id: task.id,
        type: 'task' as const,
        title: task.title || 'Development Task',
        description: `AI Tool: ${task.aiTool || 'Unknown'} - ${task.executionTime || 0}ms`,
        timestamp: task.createdAt.toISOString(),
        status: task.status === 'completed' ? 'success' as const : 
                task.status === 'failed' ? 'failed' as const : 'in_progress' as const,
        metadata: {
          aiTool: task.aiTool,
          executionTime: task.executionTime
        }
      }))
    ];

    // Sort by timestamp and limit
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return NextResponse.json(sortedActivities);
  } catch (error) {
    console.error('Activity analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent activity' },
      { status: 500 }
    );
  }
}
