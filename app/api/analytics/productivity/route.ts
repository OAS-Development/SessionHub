// app/api/analytics/productivity/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const userId = 'test-user-123'; // Mock user ID

    // Get sessions from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sessions = await prisma.session.findMany({
      where: {
        userId,
        startedAt: { gte: thirtyDaysAgo }
      },
      select: {
        startedAt: true,
        duration: true,
        linesAdded: true,
        testsAdded: true,
        status: true
      },
      orderBy: { startedAt: 'asc' }
    });

    // Group by date
    const dailyData = sessions.reduce((acc, session) => {
      if (!session.startedAt) return acc;
      
      const date = session.startedAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          sessions: 0,
          totalDuration: 0,
          linesAdded: 0,
          testsAdded: 0
        };
      }
      
      acc[date].sessions++;
      acc[date].totalDuration += session.duration || 0;
      acc[date].linesAdded += session.linesAdded || 0;
      acc[date].testsAdded += session.testsAdded || 0;
      
      return acc;
    }, {});

    return NextResponse.json(Object.values(dailyData));
  } catch (error) {
    console.error('Productivity analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch productivity analytics' },
      { status: 500 }
    );
  }
}
