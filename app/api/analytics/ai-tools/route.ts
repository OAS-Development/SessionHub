// app/api/analytics/ai-tools/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const userId = 'test-user-123'; // Mock user ID

    // Get task statistics by AI tool
    const tasks = await prisma.task.findMany({
      where: {
        session: { userId }
      },
      select: {
        aiTool: true,
        status: true,
        executionTime: true
      }
    });

    // Group by AI tool
    const toolStats = tasks.reduce((acc, task) => {
      const tool = task.aiTool || 'unknown';
      if (!acc[tool]) {
        acc[tool] = {
          name: tool,
          totalTasks: 0,
          successfulTasks: 0,
          totalTime: 0,
          averageTime: 0
        };
      }
      
      acc[tool].totalTasks++;
      if (task.status === 'completed') {
        acc[tool].successfulTasks++;
      }
      acc[tool].totalTime += task.executionTime || 0;
      
      return acc;
    }, {});

    // Calculate averages
    Object.values(toolStats).forEach((stat: any) => {
      stat.successRate = stat.totalTasks > 0 ? (stat.successfulTasks / stat.totalTasks * 100) : 0;
      stat.averageTime = stat.totalTasks > 0 ? (stat.totalTime / stat.totalTasks) : 0;
    });

    return NextResponse.json(Object.values(toolStats));
  } catch (error) {
    console.error('AI tools analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI tools analytics' },
      { status: 500 }
    );
  }
}
