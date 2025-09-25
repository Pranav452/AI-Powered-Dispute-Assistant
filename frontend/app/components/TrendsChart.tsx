// src/app/components/TrendsChart.tsx

'use client'; // This component uses browser features for rendering, so it's a Client Component.

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import RetryButton from './RetryButton';

// Define the shape of the data we expect from our /api/trends endpoint
interface TrendData {
  day: string;
  [key: string]: string | number; // Allows for dynamic category keys like 'FRAUD', 'DUPLICATE_CHARGE', etc.
}

export default function TrendsChart({ data }: { data: TrendData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No trend data available</h3>
        <p className="text-gray-500 text-center max-w-sm">
          Chart data is currently unavailable. Please ensure the backend service is running and try refreshing the page.
        </p>
        <RetryButton className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retry
        </RetryButton>
      </div>
    );
  }

  // Get all the category names from the first data point (excluding 'day')
  const categories = Object.keys(data[0]).filter(key => key !== 'day');
  
  // Define colors with better contrast and accessibility
  const colors = {
    'FRAUD': '#ef4444',
    'DUPLICATE_CHARGE': '#f97316', 
    'FAILED_TRANSACTION': '#8b5cf6',
    'REFUND_PENDING': '#3b82f6',
    'OTHERS': '#6b7280'
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{`Date: ${label}`}</p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey.replace('_', ' ')}: ${entry.value}`}
            </p>
          ))}
          <p className="text-xs text-gray-500 mt-2 pt-2 border-t">
            Total: {payload.reduce((sum: number, entry) => sum + entry.value, 0)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis 
            dataKey="day" 
            stroke="#64748b"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '12px'
            }}
          />
          {categories.map((category) => (
            <Bar 
              key={category} 
              dataKey={category} 
              stackId="a" 
              fill={colors[category as keyof typeof colors] || '#6b7280'}
              radius={[2, 2, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
