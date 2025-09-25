// src/app/components/ChatInterface.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

// Define the structure of a chat message
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm your AI assistant for dispute data analysis. I can help you understand patterns, generate insights, and answer questions about your dispute cases. What would you like to know?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to the bottom when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for fillChatInput events from quick suggestion buttons
  useEffect(() => {
    const handleFillInput = (event: CustomEvent<string>) => {
      setInput(event.detail);
    };
    window.addEventListener('fillChatInput', handleFillInput as EventListener);
    return () => window.removeEventListener('fillChatInput', handleFillInput as EventListener);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const aiMessage: Message = { id: Date.now() + 1, text: data.answer, sender: 'ai' };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error("Chat Error:", error);
      const errorMessage: Message = { id: Date.now() + 1, text: "Sorry, I ran into an error. Please try again.", sender: 'ai' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[75vh] flex flex-col">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`} style={{animationDelay: `${index * 100}ms`}}>
            <div className={`flex items-start space-x-3 max-w-3xl ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.sender === 'user' 
                  ? 'bg-indigo-500' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600'
              }`}>
                {msg.sender === 'user' ? (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )}
              </div>
              
              {/* Message Bubble */}
              <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                <div className={`text-xs mt-1 ${
                  msg.sender === 'user' ? 'text-indigo-100' : 'text-gray-500'
                }`}>
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex items-start space-x-3 max-w-3xl">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="bg-gray-100 rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm text-gray-600">AI is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Type your question here... (Press Enter to send, Shift+Enter for new line)"
                rows={1}
                className="block w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-500 text-black"
                style={{ minHeight: '48px', maxHeight: '120px' }}
                disabled={isLoading}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:from-indigo-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
            <span className="ml-2">Send</span>
          </button>
        </form>
        <p className="mt-2 text-xs text-gray-500 text-center">
          AI responses are generated based on your dispute data. For best results, be specific in your queries.
        </p>
      </div>
    </div>
  );
}
