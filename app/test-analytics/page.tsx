// app/test-analytics/page.tsx
'use client';

import React, { useState } from 'react';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface TestResult {
  endpoint: string;
  success: boolean;
  data?: any;
  error?: string;
  responseTime?: number;
}

export default function AnalyticsTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const endpoints = [
    { path: '/api/analytics/overview', name: 'Analytics Overview' },
    { path: '/api/analytics/productivity', name: 'Productivity Trends' },
    { path: '/api/analytics/sessions', name: 'Session Analytics' },
    { path: '/api/analytics/ai-tools', name: 'AI Tools Performance' },
    { path: '/api/analytics/projects', name: 'Project Progress' },
    { path: '/api/analytics/activity', name: 'Recent Activity' },
  ];

  const testEndpoint = async (endpoint: { path: string; name: string }): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      const response = await fetch(endpoint.path + '?timeRange=30d');
      const responseTime = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        endpoint: endpoint.name,
        success: true,
        data,
        responseTime
      };
    } catch (error: any) {
      return {
        endpoint: endpoint.name,
        success: false,
        error: error.message,
        responseTime: Date.now() - startTime
      };
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setTestResults([]);
    
    const results: TestResult[] = [];
    
    for (const endpoint of endpoints) {
      const result = await testEndpoint(endpoint);
      results.push(result);
      setTestResults([...results]); // Update UI as we go
    }
    
    setTesting(false);
  };

  const testSingleEndpoint = async (endpoint: { path: string; name: string }) => {
    setTesting(true);
    
    const result = await testEndpoint(endpoint);
    
    setTestResults(prev => 
      prev.filter(r => r.endpoint !== endpoint.name).concat(result)
    );
    
    setTesting(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics API Test Suite</h1>
        <p className="text-gray-600">Test all analytics API endpoints to ensure they're working correctly</p>
      </div>

      {/* Test Controls */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Test Controls</h2>
          <button
            onClick={runAllTests}
            disabled={testing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {testing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {testing ? 'Testing...' : 'Test All Endpoints'}
          </button>
        </div>
      </div>

      {/* Individual Endpoint Tests */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {endpoints.map((endpoint) => {
          const result = testResults.find(r => r.endpoint === endpoint.name);
          
          return (
            <div key={endpoint.path} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{endpoint.name}</h3>
                {result && (
                  result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{endpoint.path}</p>
              
              {result && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Response Time</span>
                    <span>{result.responseTime}ms</span>
                  </div>
                  
                  {result.success ? (
                    <div className="text-xs">
                      <span className="text-green-600">✓ Success</span>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-blue-600">View Response</summary>
                        <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ) : (
                    <div className="text-xs text-red-600">
                      ✗ Error: {result.error}
                    </div>
                  )}
                </div>
              )}
              
              <button
                onClick={() => testSingleEndpoint(endpoint)}
                disabled={testing}
                className="w-full px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
              >
                Test Endpoint
              </button>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {testResults.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {testResults.filter(r => r.success).length}
              </div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {testResults.filter(r => !r.success).length}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {testResults.length > 0 ? Math.round(testResults.reduce((sum, r) => sum + (r.responseTime || 0), 0) / testResults.length) : 0}ms
              </div>
              <div className="text-sm text-gray-600">Avg Response Time</div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Recommendations:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              {testResults.some(r => !r.success) && (
                <li>• Fix failing endpoints before deploying to production</li>
              )}
              {testResults.some(r => (r.responseTime || 0) > 1000) && (
                <li>• Consider optimizing slow endpoints (>1000ms)</li>
              )}
              {testResults.every(r => r.success) && (
                <li>• ✓ All endpoints are working correctly!</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}