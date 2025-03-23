import React, { useState, useRef, useEffect } from 'react';
import './QueryInput.css';

const QueryInput = ({ onSendQuery, isSending }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  
  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isSending) return;
    
    onSendQuery(inputValue);
    setInputValue('');
  };
  
  const handleChange = (e) => {
    setInputValue(e.target.value);
  };
  
  // Auto expand textarea height based on content
  const handleInput = (e) => {
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
  };
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    // Send message with Enter (but not with Shift+Enter)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="query-input-form" onSubmit={handleSubmit}>
      <textarea
        ref={inputRef}
        className="query-input"
        value={inputValue}
        onChange={handleChange}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Ask about your codebase..."
        disabled={isSending}
        rows={1}
      />
      <button 
        type="submit" 
        className={`send-button ${!inputValue.trim() || isSending ? 'disabled' : ''}`}
        disabled={!inputValue.trim() || isSending}
      >
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </form>
  );
};

export default QueryInput;