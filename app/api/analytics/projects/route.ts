// app/api/analytics/projects/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const userId = 'test-user-123'; // Mock user ID

    const projects = await prisma.project.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            sessions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get session stats for each project
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const completedSessions = await prisma.session.count({
          where: { projectId: project.id, status: 'completed' }
        });

        const totalLines = await prisma.session.aggregate({
          where: { projectId: project.id },
          _sum: { linesAdded: true }
        });

        return {
          ...project,
          totalSessions: project._count.sessions,
          completedSessions,
          totalLinesAdded: totalLines._sum.linesAdded || 0,
          progressPercentage: project._count.sessions > 0 ? 
            (completedSessions / project._count.sessions * 100) : 0
        };
      })
    );

    return NextResponse.json(projectsWithStats);
  } catch (error) {
    console.error('Projects analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects analytics' },
      { status: 500 }
    );
  }
}
