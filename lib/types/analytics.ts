// lib/types/analytics.ts
export interface AnalyticsOverview {
  totalProjects: number;
  totalSessions: number;
  totalTasks: number;
  completedSessions: number;
  successRate: number;
  avgSessionDuration: number;
}

export interface ProductivityTrend {
  date: string;
  sessions: number;
  totalDuration: number;
  linesAdded: number;
  testsAdded: number;
}

export interface SessionAnalytics {
  id: string;
  sessionNumber: number;
  title: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  duration: number | null;
  linesAdded: number;
  testsAdded: number;
  project: {
    name: string;
  };
}

export interface AIToolPerformance {
  name: string;
  totalTasks: number;
  successfulTasks: number;
  totalTime: number;
  averageTime: number;
  successRate: number;
}

export interface ProjectProgress {
  id: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
  totalSessions: number;
  completedSessions: number;
  totalLinesAdded: number;
  progressPercentage: number;
  _count: {
    sessions: number;
  };
}

export interface RecentActivity {
  id: string;
  type: 'session' | 'task';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'failed' | 'in_progress';
  metadata: {
    [key: string]: any;
  };
}

export type AnalyticsTimeRange = '7d' | '30d' | '90d' | '1y';
