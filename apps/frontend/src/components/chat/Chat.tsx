import React, { useState } from 'react';
import { ChatBubble } from './ChatBubble';
import { ChatWindow } from './ChatWindow';

export const Chat: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleChat = () => {
    setIsExpanded(!isExpanded);
  };

  const handleCloseChat = () => {
    setIsExpanded(false);
  };

  return (
    <>
      <ChatBubble onClick={handleToggleChat} isExpanded={isExpanded} />
      <ChatWindow isOpen={isExpanded} onClose={handleCloseChat} />
    </>
  );
};