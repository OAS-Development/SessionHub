// components/AnalyticsDashboard.tsx
'use client';

import React from 'react';
import { 
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  Code,
  Users,
  Calendar,
  Target
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { AnalyticsErrorBoundary } from './analytics/AnalyticsErrorBoundary';
import {
  KPICardSkeleton,
  ChartSkeleton,
  SessionListSkeleton,
  ActivityFeedSkeleton,
  ProjectProgressSkeleton,
  AIToolsSkeleton
} from './analytics/AnalyticsLoading';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, trend, loading }) => {
  if (loading) return <KPICardSkeleton />;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <span className={`text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-sm text-gray-500 ml-2">vs last period</span>
        </div>
      )}
    </div>
  );
};

interface ProductivityChartProps {
  data: any[];
  loading: boolean;
}

const ProductivityChart: React.FC<ProductivityChartProps> = ({ data, loading }) => {
  if (loading) return <ChartSkeleton />;

  const safeData = data || [];
  
  const chartData = {
    labels: safeData.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Sessions Completed',
        data: safeData.map(d => d.sessions || 0),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      },
      {
        label: 'Lines of Code',
        data: safeData.map(d => d.linesAdded || 0),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      }
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Productivity Trends',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <Line data={chartData} options={options} />
    </div>
  );
};

interface RecentSessionsProps {
  sessions: any[];
  loading: boolean;
}

const RecentSessions: React.FC<RecentSessionsProps> = ({ sessions, loading }) => {
  if (loading) return <SessionListSkeleton />;

  const safeSessions = sessions || [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h3>
      {safeSessions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No sessions yet. Start your first development session!</p>
      ) : (
        <div className="space-y-4">
          {safeSessions.slice(0, 5).map((session) => (
            <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">{session.title || 'Untitled Session'}</h4>
                <p className="text-sm text-gray-600">
                  {session.project?.name || 'Unknown Project'} • Session #{session.sessionNumber || 'N/A'}
                </p>
              </div>
              <div className="text-right">
                <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  session.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : session.status === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {session.status || 'unknown'}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {session.duration ? `${Math.round(session.duration / 60)}min` : 'No duration'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface ActivityFeedProps {
  activities: any[];
  loading: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, loading }) => {
  if (loading) return <ActivityFeedSkeleton />;

  const safeActivities = activities || [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      {safeActivities.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No recent activity to display.</p>
      ) : (
        <div className="space-y-4">
          {safeActivities.slice(0, 10).map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                activity.status === 'success' 
                  ? 'bg-green-400'
                  : activity.status === 'failed'
                  ? 'bg-red-400'
                  : 'bg-yellow-400'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.title || 'Untitled Activity'}</p>
                <p className="text-sm text-gray-600">{activity.description || 'No description'}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.timestamp).toLocaleDateString()} at {new Date(activity.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface ProjectProgressProps {
  projects: any[];
  loading: boolean;
}

const ProjectProgress: React.FC<ProjectProgressProps> = ({ projects, loading }) => {
  if (loading) return <ProjectProgressSkeleton />;

  const safeProjects = projects || [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Progress</h3>
      {safeProjects.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No projects yet. Create your first project!</p>
      ) : (
        <div className="space-y-4">
          {safeProjects.map((project) => (
            <div key={project.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{project.name || 'Untitled Project'}</h4>
                <span className="text-sm text-gray-600">{project.type || 'Unknown Type'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(project.progressPercentage || 0, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{project.completedSessions || 0}/{project.totalSessions || 0} sessions</span>
                <span>{Math.round(project.progressPercentage || 0)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface AIToolsProps {
  tools: any[];
  loading: boolean;
}

const AITools: React.FC<AIToolsProps> = ({ tools, loading }) => {
  if (loading) return <AIToolsSkeleton />;

  const safeTools = tools || [];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Tools Performance</h3>
      {safeTools.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No AI tool usage data yet.</p>
      ) : (
        <div className="space-y-4">
          {safeTools.map((tool, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">{tool.name || 'Unknown Tool'}</h4>
                <p className="text-sm text-gray-600">
                  {tool.totalTasks || 0} tasks • {Math.round(tool.averageTime || 0)}ms avg
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  {Math.round(tool.successRate || 0)}%
                </div>
                <p className="text-xs text-gray-500">Success Rate</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function AnalyticsDashboard() {
  const {
    overview,
    productivity,
    sessions,
    aiTools,
    projects,
    activity,
    loading,
    error
  } = useAnalytics();

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading analytics</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <AnalyticsErrorBoundary>
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Projects"
            value={overview?.totalProjects || 0}
            icon={<Target className="h-6 w-6 text-blue-600" />}
            loading={loading}
          />
          <KPICard
            title="Total Sessions"
            value={overview?.totalSessions || 0}
            icon={<Calendar className="h-6 w-6 text-green-600" />}
            loading={loading}
          />
          <KPICard
            title="Success Rate"
            value={`${Math.round(overview?.successRate || 0)}%`}
            icon={<CheckCircle className="h-6 w-6 text-purple-600" />}
            loading={loading}
          />
          <KPICard
            title="Avg Duration"
            value={`${Math.round((overview?.avgSessionDuration || 0) / 60)}min`}
            icon={<Clock className="h-6 w-6 text-orange-600" />}
            loading={loading}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductivityChart data={productivity || []} loading={loading} />
          <RecentSessions sessions={sessions || []} loading={loading} />
        </div>

        {/* Activity and Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityFeed activities={activity || []} loading={loading} />
          <ProjectProgress projects={projects || []} loading={loading} />
        </div>

        {/* AI Tools */}
        <AITools tools={aiTools || []} loading={loading} />
      </div>
    </AnalyticsErrorBoundary>
  );
}
