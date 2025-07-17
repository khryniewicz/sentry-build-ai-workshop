import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface ChatBubbleProps {
  onClick: () => void;
  isExpanded: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ onClick, isExpanded }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated || isExpanded) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-50 flex items-center justify-center"
      aria-label="Open AI Chat"
    >
      <MessageCircle size={24} />
    </button>
  );
};