// app/api/analytics/sessions/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const userId = 'test-user-123'; // Mock user ID

    const sessions = await prisma.session.findMany({
      where: { userId },
      select: {
        id: true,
        sessionNumber: true,
        title: true,
        status: true,
        startedAt: true,
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
      orderBy: { sessionNumber: 'desc' },
      take: 20
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Sessions analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions analytics' },
      { status: 500 }
    );
  }
}
