'use client';

interface QuickSuggestionsProps {
  suggestions: string[];
}

export default function QuickSuggestions({ suggestions }: QuickSuggestionsProps) {
  const handleSuggestionClick = (question: string) => {
    const event = new CustomEvent('fillChatInput', { detail: question });
    window.dispatchEvent(event);
  };

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Quick questions to try:</h3>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((question, index) => (
          <button
            key={index}
            className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 hover:border-indigo-300 transition-colors"
            onClick={() => handleSuggestionClick(question)}
          >
            <svg className="w-3 h-3 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
