import React from 'react';
import { motion } from 'framer-motion';
import './ChatMessage.css';

const ChatMessage = ({ message }) => {
  const { id, type, content, timestamp } = message;
  
  // Format the timestamp
  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Format message text with code blocks and links
  const formatMessageText = (text) => {
    if (!text) return '';
    
    // Replace URLs with clickable links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const withLinks = text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="chat-link">${url}</a>`;
    });
    
    // Replace code blocks
    const codeBlockRegex = /```([\s\S]*?)```/g;
    const withCodeBlocks = withLinks.replace(codeBlockRegex, (match, code) => {
      return `<div class="code-block"><pre>${code.trim()}</pre></div>`;
    });
    
    // Replace inline code
    const inlineCodeRegex = /`([^`]+)`/g;
    const withInlineCode = withCodeBlocks.replace(inlineCodeRegex, (match, code) => {
      return `<code class="inline-code">${code}</code>`;
    });
    
    // Replace newlines with <br>
    return withInlineCode.replace(/\n/g, '<br>');
  };

  return (
    <motion.div
      className={`message ${type}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="message-avatar">
        {type === 'assistant' ? (
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 16V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15.5 4.5C14.79 4.1 14.14 4 12 4C9.86 4 9.21 4.1 8.5 4.5L7.5 6.5C6.55 8.17 6.53 8.28 5.5 8.5C4.5 8.71 4 9.34 4 12C4 14.66 4.5 15.29 5.5 15.5C6.5 15.71 6.55 15.83 7.5 17.5L8.5 19.5C9.21 19.9 9.86 20 12 20C14.14 20 14.79 19.9 15.5 19.5L16.5 17.5C17.46 15.83 17.48 15.72 18.5 15.5C19.5 15.29 20 14.66 20 12C20 9.34 19.5 8.71 18.5 8.5C17.5 8.29 17.46 8.17 16.5 6.5L15.5 4.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      
      <div className="message-content">
        <div 
          className="message-text"
          dangerouslySetInnerHTML={{ __html: formatMessageText(content) }}
        />
        <div className="message-time">
          {formattedTime}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;