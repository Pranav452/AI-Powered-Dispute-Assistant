// src/app/components/FuzzyMatcher.tsx

'use client'; // This must be a Client Component to handle user interaction and state.

import { useState } from "react";

// Define the TypeScript type for a potential duplicate object, matching our API response.
interface Duplicate {
  original_txn_id: string;
  duplicate_txn_id: string;
  customer_id: string;
  amount: number;
  merchant: string;
  time_diff_seconds: number;
}

export default function FuzzyMatcher() {
  // State to hold the results from the API call
  const [duplicates, setDuplicates] = useState<Duplicate[]>([]);
  // State to manage the loading status of the button
  const [isLoading, setIsLoading] = useState(false);
  // State to hold any potential error messages
  const [error, setError] = useState<string | null>(null);

  const findDuplicates = async () => {
    setIsLoading(true);
    setError(null);
    setDuplicates([]); // Clear previous results

    try {
      // Call the specific backend endpoint for fuzzy matching
      const res = await fetch('http://127.0.0.1:8000/api/find-fuzzy-duplicates');
      
      if (!res.ok) {
        throw new Error('The server failed to process the request for fuzzy matching.');
      }
      
      const data: Duplicate[] = await res.json();
      setDuplicates(data);

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while fetching duplicates.');
      }
    } finally {
      setIsLoading(false); // Ensure the button is re-enabled even if an error occurs
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Duplicate Transaction Scanner</h2>
            <p className="text-sm text-gray-600 mt-1">AI-powered detection of potential duplicate transactions</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600">Live Detection</span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-start space-x-3 mb-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700 leading-relaxed">
                This advanced tool analyzes transaction logs to identify potential duplicates using Fuzzy Matching. 
                It examines customer IDs, transaction amounts, merchant information, and timing patterns within configurable time windows.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">5min</div>
                <div className="text-xs text-gray-500">Time Window</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">4</div>
                <div className="text-xs text-gray-500">Match Criteria</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">94%</div>
                <div className="text-xs text-gray-500">Accuracy</div>
              </div>
            </div>
            <button
              onClick={findDuplicates}
              disabled={isLoading}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Scanning...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Start Scan
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Scan Failed</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Results Section */}
        {!isLoading && duplicates.length > 0 && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Scan Results: {duplicates.length} Potential Duplicate{duplicates.length !== 1 ? 's' : ''} Found
              </h3>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  High Priority
                </span>
                <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {duplicates.map((dup, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-indigo-300 transition-colors animate-slide-in" style={{animationDelay: `${index * 100}ms`}}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-indigo-600">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Customer: {dup.customer_id}</p>
                            <p className="text-xs text-gray-500">Merchant: {dup.merchant}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-lg font-bold text-green-600">${dup.amount.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">Amount</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-orange-600">{dup.time_diff_seconds.toFixed(0)}s</p>
                            <p className="text-xs text-gray-500">Time Gap</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div className="bg-white rounded-md p-3 border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Original Transaction</p>
                          <p className="text-sm font-mono text-gray-900">{dup.original_txn_id}</p>
                        </div>
                        <div className="bg-white rounded-md p-3 border border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Duplicate Transaction</p>
                          <p className="text-sm font-mono text-gray-900">{dup.duplicate_txn_id}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <button className="inline-flex items-center px-3 py-1.5 bg-red-100 text-red-700 rounded-md text-xs font-medium hover:bg-red-200 transition-colors">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Flag as Fraud
                      </button>
                      <button className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-200 transition-colors">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Investigate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && duplicates.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Duplicates Found</h3>
            <p className="text-gray-500 mb-4">Great news! The scan completed successfully with no potential duplicate transactions detected.</p>
            <button 
              onClick={findDuplicates}
              className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Scan Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
