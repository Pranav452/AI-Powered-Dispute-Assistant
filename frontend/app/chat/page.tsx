// src/app/chat/page.tsx
import ChatInterface from "../components/ChatInterface";
import QuickSuggestions from "../components/QuickSuggestions";
import Link from "next/link";

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Conversational Agent</h1>
              <p className="text-lg text-gray-600">Ask questions about dispute data and get intelligent insights</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>AI Agent Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Suggestions */}
        <QuickSuggestions suggestions={[
          "How many fraud cases are there?",
          "What's the trend for duplicate charges?",
          "Show me cases with low confidence scores",
          "Which customer has the most disputes?",
          "What's the average resolution time?"
        ]} />

        {/* Chat Interface */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">ML Oasis Assistant</h3>
                  <p className="text-sm text-gray-600">Powered by advanced AI</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Natural Language Processing
                </span>
              </div>
            </div>
          </div>
          <ChatInterface />
        </div>

        {/* Help Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <div className="flex items-center mb-3">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="text-sm font-semibold text-gray-900">How to use</h4>
            </div>
            <p className="text-sm text-gray-600">
              Ask questions in natural language about disputes, trends, customers, or any data-related queries. The AI will analyze your request and provide detailed insights.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <div className="flex items-center mb-3">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="text-sm font-semibold text-gray-900">Example queries</h4>
            </div>
            <p className="text-sm text-gray-600">
              &quot;Show me all fraud cases&quot;, &quot;What&apos;s the resolution rate?&quot;, &quot;Find disputes from last week&quot;, &quot;Compare categories by volume&quot;
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
            <div className="flex items-center mb-3">
              <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              <h4 className="text-sm font-semibold text-gray-900">Advanced features</h4>
            </div>
            <p className="text-sm text-gray-600">
              Get statistical summaries, trend analysis, pattern recognition, and actionable recommendations based on your data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
