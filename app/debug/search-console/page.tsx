// app/debug/search-console/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Title } from '@/app/components/Title';

interface AnalyticsRow {
  keys?: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export default function SearchConsoleDashboard() {
  const [data, setData] = useState<AnalyticsRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [period, setPeriod] = useState<'week' | 'month' | '3months' | 'year'>('month');
  const [dimension, setDimension] = useState<'query' | 'page' | 'country' | 'device'>('query');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/search-console/analytics?period=${period}&dimension=${dimension}`
      );
      const result = await response.json();

      if (!response.ok) {
        if (result.needsAuth) {
          setNeedsAuth(true);
        }
        throw new Error(result.error || 'Failed to fetch data');
      }

      setData(result.data || []);
      setNeedsAuth(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = () => {
    window.location.href = '/api/search-console/auth';
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period, dimension]);

  const totalClicks = data.reduce((sum, row) => sum + row.clicks, 0);
  const totalImpressions = data.reduce((sum, row) => sum + row.impressions, 0);
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgPosition = data.length > 0
    ? data.reduce((sum, row) => sum + row.position, 0) / data.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <Title title="Google Search Console Analytics" level="page" />

        {needsAuth && (
          <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-2">Authentication Required</h3>
            <p className="mb-4">
              Connect your Google Search Console account to view analytics data.
            </p>
            <button
              onClick={handleAuth}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Connect Google Search Console
            </button>
          </div>
        )}

        {error && !needsAuth && (
          <div className="bg-red-900/50 border border-red-600 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-2">Error</h3>
            <p>{error}</p>
          </div>
        )}

        {/* Controls */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Time Period</label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 28 Days</option>
                <option value="3months">Last 3 Months</option>
                <option value="year">Last Year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Group By</label>
              <select
                value={dimension}
                onChange={(e) => setDimension(e.target.value as any)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
              >
                <option value="query">Search Query</option>
                <option value="page">Page URL</option>
                <option value="country">Country</option>
                <option value="device">Device</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchAnalytics}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {loading ? 'Loading...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {!needsAuth && data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-sm text-gray-400 mb-1">Total Clicks</div>
              <div className="text-3xl font-bold">{totalClicks.toLocaleString()}</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-sm text-gray-400 mb-1">Total Impressions</div>
              <div className="text-3xl font-bold">{totalImpressions.toLocaleString()}</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-sm text-gray-400 mb-1">Average CTR</div>
              <div className="text-3xl font-bold">{avgCtr.toFixed(2)}%</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <div className="text-sm text-gray-400 mb-1">Average Position</div>
              <div className="text-3xl font-bold">{avgPosition.toFixed(1)}</div>
            </div>
          </div>
        )}

        {/* Data Table */}
        {!needsAuth && data.length > 0 && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider">
                      {dimension === 'query' ? 'Query' : 
                       dimension === 'page' ? 'Page' :
                       dimension === 'country' ? 'Country' : 'Device'}
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium uppercase tracking-wider">
                      Impressions
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium uppercase tracking-wider">
                      CTR
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium uppercase tracking-wider">
                      Position
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {data.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 text-sm">
                        {row.keys?.[0] || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        {row.clicks.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        {row.impressions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        {(row.ctr * 100).toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        {row.position.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!needsAuth && !loading && data.length === 0 && !error && (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <p className="text-gray-400">No data available for the selected period.</p>
          </div>
        )}
      </div>
    </div>
  );
}
