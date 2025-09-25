// src/app/dispute/[disputeId]/page.tsx

import { Dispute, DisputeHistory } from "../../types";
import Link from "next/link";
// 1. IMPORT THE NEW COMPONENT
import StatusUpdater from "../../components/StatusUpdater";

// Define the shape of the data we expect from our API
interface DisputeDetailsData {
  details: Dispute;
  history: DisputeHistory[];
}

// This function fetches data for a SINGLE dispute from our FastAPI backend
async function getDisputeDetails(id: string): Promise<DisputeDetailsData | null> {
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/disputes/${id}`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Failed to fetch dispute details');
    }
    return res.json();
  } catch (error) {
    console.error("API Fetch Error:", error);
    return null;
  }
}

// This is the main component for the detail page
export default async function DisputeDetailPage({ params }: { params: { disputeId: string } }) {
  const data = await getDisputeDetails(params.disputeId);

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Dispute Not Found</h1>
            <p className="text-lg text-gray-600 mb-8">The dispute with ID &quot;{params.disputeId}&quot; could not be loaded or does not exist.</p>
            <Link 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { details, history } = data;

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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Dispute Case Details</h1>
              <p className="text-lg text-gray-600">Case ID: {details.dispute_id}</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusBadgeClass(details.status)}`}>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full mr-2" 
                       style={{backgroundColor: details.status === 'OPEN' ? '#f59e0b' : details.status === 'IN_REVIEW' ? '#3b82f6' : details.status === 'RESOLVED' ? '#10b981' : '#6b7280'}}></div>
                  {details.status.replace('_', ' ')}
                </div>
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Core Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">Case Information</h2>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <dt className="text-sm font-medium text-gray-500 mb-1">Customer ID</dt>
                    <dd className="text-lg font-semibold text-gray-900">{details.customer_id}</dd>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <dt className="text-sm font-medium text-gray-500 mb-1">Transaction ID</dt>
                    <dd className="text-lg font-semibold text-gray-900 font-mono">{details.txn_id}</dd>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <dt className="text-sm font-medium text-gray-500 mb-1">Created At</dt>
                    <dd className="text-lg font-semibold text-gray-900">{new Date(details.created_at).toLocaleDateString()}</dd>
                    <dd className="text-sm text-gray-500">{new Date(details.created_at).toLocaleTimeString()}</dd>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <dt className="text-sm font-medium text-gray-500 mb-1">Category</dt>
                    <dd>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getCategoryBadgeClass(details.predicted_category)}`}>
                        {details.predicted_category.replace('_', ' ')}
                      </span>
                    </dd>
                  </div>
                  <div className="sm:col-span-2 bg-gray-50 rounded-lg p-4">
                    <dt className="text-sm font-medium text-gray-500 mb-2">Description</dt>
                    <dd className="text-gray-900 leading-relaxed">{details.description}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Additional Details */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">AI Recommendations</h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-blue-900">Suggested Action</h3>
                        <p className="text-sm text-blue-800 mt-1">{details.suggested_action}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-green-900">AI Explanation</h3>
                        <p className="text-sm text-green-800 mt-1">{details.explanation}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-purple-900">Justification</h3>
                        <p className="text-sm text-purple-800 mt-1">{details.justification}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: AI Analysis & Status Updater */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <h2 className="text-xl font-semibold text-gray-900">AI Confidence Score</h2>
              </div>
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="relative inline-flex items-center justify-center w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8"/>
                      <circle 
                        cx="60" 
                        cy="60" 
                        r="54" 
                        fill="none" 
                        stroke={details.confidence >= 0.8 ? '#10b981' : details.confidence >= 0.6 ? '#f59e0b' : '#ef4444'}
                        strokeWidth="8"
                        strokeDasharray={`${details.confidence * 339.292} 339.292`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900">{(details.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {details.confidence >= 0.8 ? 'High Confidence' : details.confidence >= 0.6 ? 'Medium Confidence' : 'Low Confidence'}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Accuracy</span>
                    <span className="text-sm font-medium text-gray-900">{(details.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Risk Level</span>
                    <span className={`text-sm font-medium ${details.predicted_category === 'FRAUD' ? 'text-red-600' : details.predicted_category === 'DUPLICATE_CHARGE' ? 'text-orange-600' : 'text-green-600'}`}>
                      {details.predicted_category === 'FRAUD' ? 'High' : details.predicted_category === 'DUPLICATE_CHARGE' ? 'Medium' : 'Low'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Status Updater */}
            <StatusUpdater disputeId={details.dispute_id} currentStatus={details.status} />

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <Link 
                  href="/chat"
                  className="w-full flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                >
                  <svg className="w-4 h-4 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Ask AI About This Case
                </Link>
                <Link 
                  href="/analytics"
                  className="w-full flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-sm"
                >
                  <svg className="w-4 h-4 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  View Similar Cases
                </Link>
                <button className="w-full flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-sm">
                  <svg className="w-4 h-4 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export Case Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: History Log */}
        <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Case Activity History</h2>
            <p className="text-sm text-gray-600 mt-1">Chronological log of all case changes and updates</p>
          </div>
          <div className="p-6">
            {history.length > 0 ? (
              <div className="flow-root">
                <ul className="-mb-8">
                  {history.map((entry, index) => (
                    <li key={entry.id}>
                      <div className="relative pb-8">
                        {index !== history.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-900">
                                Field <span className="font-semibold text-indigo-600">{entry.field_changed}</span> changed from{' '}
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                  {entry.old_value}
                                </span>{' '}
                                to{' '}
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  {entry.new_value}
                                </span>
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              <time dateTime={entry.timestamp}>{new Date(entry.timestamp).toLocaleString()}</time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h3>
                <p className="text-gray-500">No status changes have been recorded for this case yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
