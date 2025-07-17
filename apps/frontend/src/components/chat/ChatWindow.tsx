import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

type AIModel = '4o-mini';

export const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose }) => {
  const { isAuthenticated } = useAuth();
  const [selectedModel] = useState<AIModel>('4o-mini');
  const [forceRender, setForceRender] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use the AI SDK v4 useChat hook with explicit API URL
  const apiUrl = `${import.meta.env.VITE_API_URL}/chat`;
  
  const chatHook = useChat({
    api: apiUrl,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      model: selectedModel,
    },
    onError: (error) => {
      console.error('Chat error:', error);
    },
    onFinish: (message) => {
      // Force a re-render when message is complete
      setForceRender(prev => prev + 1);
    },
    fetch: async (url, options) => {
      return await fetch(url, options);
    },
  });
  
  // Use the standard AI SDK v4 pattern - it DOES provide input/handleSubmit!
  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    isLoading, 
    error,
    append 
  } = chatHook;

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Small delay to ensure content is rendered before scrolling
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, isLoading, forceRender]);


  if (!isAuthenticated || !isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col overflow-hidden" style={{ height: '50vh' }}>
      {/* Header */}
      <div className="bg-purple-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold">AI Assistant</h3>
          <span className="text-xs bg-purple-700 px-2 py-1 rounded-full">
            GPT-4o Mini
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onClose}
            className="hover:bg-purple-700 p-1 rounded transition-colors"
            aria-label="Close chat"
          >
            <X size={16} />
          </button>
        </div>
      </div>


      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 text-sm">
            <p>Welcome! I can help you with:</p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• Finding available lessons</li>
              <li>• Searching for courses</li>
              <li>• General questions about the platform</li>
            </ul>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
            Error: {error.message}
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-sm px-3 py-2 rounded-lg text-sm ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.role === 'user' ? (
                message.content
              ) : (
                <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-headings:text-xs prose-headings:font-semibold prose-headings:mb-1 prose-p:text-gray-800 prose-p:text-xs prose-p:mb-1 prose-li:text-gray-800 prose-li:text-xs prose-strong:text-gray-900 prose-strong:font-medium prose-code:bg-gray-200 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-pre:bg-gray-800 prose-pre:text-white prose-pre:text-xs prose-pre:p-2 prose-pre:rounded prose-ul:mb-1 prose-ol:mb-1 prose-table:text-xs">
                  {message.content ? (
                    <ReactMarkdown 
                      rehypePlugins={[rehypeHighlight]}
                      key={`${message.id}-${message.content.length}-${forceRender}`}
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <div className="text-gray-500 italic">Loading...</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm flex items-center space-x-2">
              <Loader2 size={14} className="animate-spin" />
              <span>Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input || ''}
            onChange={handleInputChange}
            placeholder="Ask me anything..."
            className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="sm"
            disabled={isLoading || !input.trim()}
            className="px-3"
          >
            <Send size={14} />
          </Button>
        </div>
      </form>
    </div>
  );
};