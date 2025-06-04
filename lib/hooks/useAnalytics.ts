// lib/hooks/useAnalytics.ts
import { useState, useEffect, useCallback } from 'react';
import {
  AnalyticsOverview,
  ProductivityTrend,
  SessionAnalytics,
  AIToolPerformance,
  ProjectProgress,
  RecentActivity,
  AnalyticsTimeRange
} from '@/lib/types/analytics';

export interface UseAnalyticsOptions {
  period?: '7d' | '30d' | '90d' | '1y';
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export interface UseAnalyticsReturn {
  overview: AnalyticsOverview | null;
  productivity: ProductivityTrend[] | null;
  sessions: SessionAnalytics | null;
  aiTools: AIToolPerformance[] | null;
  projects: ProjectProgress[] | null;
  activity: RecentActivity[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setPeriod: (period: '7d' | '30d' | '90d' | '1y') => void;
}

export function useAnalytics(options: UseAnalyticsOptions = {}): UseAnalyticsReturn {
  const {
    period: initialPeriod = '30d',
    autoRefresh = false,
    refreshInterval = 60000 // 1 minute
  } = options;

  // State management
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>(initialPeriod);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [productivity, setProductivity] = useState<ProductivityTrend[] | null>(null);
  const [sessions, setSessions] = useState<SessionAnalytics | null>(null);
  const [aiTools, setAITools] = useState<AIToolPerformance[] | null>(null);
  const [projects, setProjects] = useState<ProjectProgress[] | null>(null);
  const [activity, setActivity] = useState<RecentActivity[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to make API calls with error handling
  const fetchData = useCallback(async <T>(endpoint: string): Promise<T | null> => {
    try {
      const response = await fetch(`/api/analytics/${endpoint}?period=${period}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}: ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      throw err;
    }
  }, [period]);

  // Main refresh function
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all analytics data in parallel
      const [
        overviewData,
        productivityData,
        sessionsData,
        aiToolsData,
        projectsData,
        activityData
      ] = await Promise.all([
        fetchData<AnalyticsOverview>('overview'),
        fetchData<ProductivityTrend[]>('productivity'),
        fetchData<SessionAnalytics>('sessions'),
        fetchData<AIToolPerformance[]>('ai-tools'),
        fetchData<ProjectProgress[]>('projects'),
        fetchData<RecentActivity[]>('activity')
      ]);

      // Update state with fetched data
      setOverview(overviewData);
      setProductivity(productivityData);
      setSessions(sessionsData);
      setAITools(aiToolsData);
      setProjects(projectsData);
      setActivity(activityData);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics data';
      setError(errorMessage);
      console.error('Analytics refresh error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  // Effect to refresh data when period changes
  useEffect(() => {
    refresh();
  }, [period, refresh]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  return {
    overview,
    productivity,
    sessions,
    aiTools,
    projects,
    activity,
    loading,
    error,
    refresh,
    setPeriod
  };
}

// Helper hook for specific analytics data
export function useAnalyticsOverview(period: '7d' | '30d' | '90d' | '1y' = '30d') {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/analytics/overview?period=${period}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch overview: ${response.status}`);
      }
      
      const overview = await response.json();
      setData(overview);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch overview';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return { data, loading, error, refresh: fetchOverview };
}

// Helper hook for productivity trends
export function useProductivityTrends(period: '7d' | '30d' | '90d' | '1y' = '30d') {
  const [data, setData] = useState<ProductivityTrend[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/analytics/productivity?period=${period}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch productivity trends: ${response.status}`);
      }
      
      const trends = await response.json();
      setData(trends);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch productivity trends';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  return { data, loading, error, refresh: fetchTrends };
}