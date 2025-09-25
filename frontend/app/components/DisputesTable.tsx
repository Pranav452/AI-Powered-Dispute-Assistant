// src/app/components/DisputesTable.tsx

import { Dispute } from "../types"; // Import our new type
import Link from "next/link";

// Helper function to get status badge class
function getStatusBadgeClass(status: string) {
  switch (status) {
    case 'OPEN':
      return 'status-open';
    case 'IN_REVIEW':
      return 'status-in-review';
    case 'RESOLVED':
      return 'status-resolved';
    case 'CLOSED':
      return 'status-closed';
    default:
      return 'bg-gray-100 text-gray-800 border border-gray-200';
  }
}

// Helper function to get category badge class
function getCategoryBadgeClass(category: string) {
  switch (category) {
    case 'FRAUD':
      return 'category-fraud';
    case 'DUPLICATE_CHARGE':
      return 'category-duplicate';
    case 'FAILED_TRANSACTION':
      return 'category-failed';
    case 'REFUND_PENDING':
      return 'category-refund';
    default:
      return 'category-others';
  }
}

// This component receives a list of disputes as a "prop"
export default function DisputesTable({ disputes }: { disputes: Dispute[] }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              <div className="flex items-center space-x-1">
                <span>Dispute ID</span>
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Confidence</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created At</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {disputes.map((dispute, index) => (
            <tr key={dispute.dispute_id} className="hover:bg-blue-50 transition-colors duration-150 animate-fade-in" style={{animationDelay: `${index * 50}ms`}}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">#{dispute.dispute_id.slice(-3)}</span>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{dispute.dispute_id}</div>
                    <div className="text-xs text-gray-500">Customer: {dispute.customer_id}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeClass(dispute.predicted_category)}`}>
                  {dispute.predicted_category.replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(dispute.status)}`}>
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full mr-1.5" 
                         style={{backgroundColor: dispute.status === 'OPEN' ? '#f59e0b' : dispute.status === 'IN_REVIEW' ? '#3b82f6' : dispute.status === 'RESOLVED' ? '#10b981' : '#6b7280'}}></div>
                    {dispute.status.replace('_', ' ')}
                  </div>
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className={`h-2 rounded-full ${dispute.confidence >= 0.8 ? 'bg-green-500' : dispute.confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{width: `${dispute.confidence * 100}%`}}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{(dispute.confidence * 100).toFixed(0)}%</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex flex-col">
                  <span>{new Date(dispute.created_at).toLocaleDateString()}</span>
                  <span className="text-xs text-gray-400">{new Date(dispute.created_at).toLocaleTimeString()}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Link 
                  href={`/dispute/${dispute.dispute_id}`} 
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 hover:text-indigo-700 transition-colors duration-150"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
