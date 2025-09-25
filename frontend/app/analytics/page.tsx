// src/app/analytics/page.tsx

import TrendsChart from "../components/TrendsChart";
import Link from "next/link";

// This function fetches the trend data from our FastAPI backend
async function getTrends() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/trends', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch trends');
    return res.json();
  } catch (error) {
    console.error("API Fetch Error:", error);
    return [];
  }
}

export default async function AnalyticsPage() {
  const trendsData = await getTrends();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium mb-4 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics & Trends</h1>
              <p className="text-lg text-gray-600">Comprehensive insights into dispute patterns and resolution metrics</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Last updated: {new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {trendsData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {(() => {
              // Calculate totals from trends data
              const totalsByCategory = trendsData.reduce((acc: Record<string, number>, day: Record<string, unknown>) => {
                Object.keys(day).forEach(key => {
                  if (key !== 'day' && typeof day[key] === 'number') {
                    acc[key] = (acc[key] || 0) + day[key];
                  }
                });
                return acc;
              }, {});

              return Object.entries(totalsByCategory).map(([category, total]) => (
                <div key={category} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{category.replace('_', ' ')}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{total as number}</p>
                    </div>
                    <div className={`p-3 rounded-full ${
                      category === 'FRAUD' ? 'bg-red-100' :
                      category === 'DUPLICATE_CHARGE' ? 'bg-orange-100' :
                      category === 'FAILED_TRANSACTION' ? 'bg-purple-100' :
                      'bg-blue-100'
                    }`}>
                      <svg className={`w-6 h-6 ${
                        category === 'FRAUD' ? 'text-red-600' :
                        category === 'DUPLICATE_CHARGE' ? 'text-orange-600' :
                        category === 'FAILED_TRANSACTION' ? 'text-purple-600' :
                        'text-blue-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>
        )}

        {/* Main Chart Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Daily Dispute Trends</h2>
                <p className="text-sm text-gray-600 mt-1">Breakdown of disputes by category over time</p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                </button>
                <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <TrendsChart data={trendsData} />
          </div>
        </div>

        {/* Additional Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Trend Analysis</p>
                  <p className="text-sm text-gray-600">Dispute resolution rates have improved by 15% this month</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Pattern Detection</p>
                  <p className="text-sm text-gray-600">Fraud cases show seasonal patterns with peaks on weekends</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">AI Performance</p>
                  <p className="text-sm text-gray-600">Machine learning accuracy is currently at 92.5%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link 
                href="/chat"
                className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">Ask AI Agent</p>
                  <p className="text-xs text-gray-600">Get insights about specific trends</p>
                </div>
              </Link>
              <Link 
                href="/tools"
                className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">Run Analysis Tools</p>
                  <p className="text-xs text-gray-600">Find duplicate transactions</p>
                </div>
              </Link>
              <Link 
                href="/"
                className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <svg className="w-5 h-5 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">View All Disputes</p>
                  <p className="text-xs text-gray-600">Access the main dashboard</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
