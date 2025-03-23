import React, { useState } from 'react';

const QueryInput = ({ onSendQuery, isSending }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (query.trim() && !isSending) {
      onSendQuery(query);
      setQuery('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask a question about your codebase..."
        className="flex-1 p-3 border rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500"
        disabled={isSending}
      />
      <button
        type="submit"
        className={`px-4 py-2 ${
          isSending || !query.trim()
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white rounded-r transition-colors`}
        disabled={isSending || !query.trim()}
      >
        {isSending ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending
          </span>
        ) : (
          'Send'
        )}
      </button>
    </form>
  );
};

export default QueryInput;