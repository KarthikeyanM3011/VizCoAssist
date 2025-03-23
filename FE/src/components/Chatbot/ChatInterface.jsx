import React, { useState, useEffect, useRef } from 'react';
import { sendChatbotQuery, getChatHistory, isChatbotInitialized, initializeChatbot, getChatbotInitProgress } from '../../api/chatbotApi';
import Loader from '../common/Loader';
import ChatMessage from './ChatMessage';
import QueryInput from './QueryInput';

const ChatInterface = ({ sessionId }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initProgress, setInitProgress] = useState(0);
  const [error, setError] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial load
  useEffect(() => {
    const loadChatbot = async () => {
      try {
        setLoading(true);
        
        // Check if chatbot is already initialized
        const initialized = await isChatbotInitialized(sessionId);
        setIsInitialized(initialized);
        
        if (initialized) {
          // Load chat history
          const historyResponse = await getChatHistory(sessionId);
          if (historyResponse.chat_history && historyResponse.chat_history.length > 0) {
            const formattedHistory = historyResponse.chat_history.map(item => ({
              id: Math.random().toString(36).substr(2, 9),
              type: 'user',
              content: item.query,
              timestamp: new Date(item.timestamp * 1000).toISOString()
            })).flatMap((userMsg, index, array) => {
              const item = array[index];
              return [
                userMsg,
                {
                  id: Math.random().toString(36).substr(2, 9),
                  type: 'assistant',
                  content: item.response,
                  timestamp: new Date(item.timestamp * 1000).toISOString()
                }
              ];
            });
            
            setMessages(formattedHistory);
          }
        } else {
          // Check if initialization is in progress
          const progressResponse = await getChatbotInitProgress(sessionId);
          if (progressResponse.status === 'in_progress') {
            setIsInitializing(true);
            setInitProgress(progressResponse.progress || 0);
            
            // Set up polling for progress
            const interval = setInterval(async () => {
              try {
                const progressUpdate = await getChatbotInitProgress(sessionId);
                setInitProgress(progressUpdate.progress || 0);
                
                if (progressUpdate.status === 'completed') {
                  setIsInitialized(true);
                  setIsInitializing(false);
                  clearInterval(interval);
                  setPollingInterval(null);
                }
              } catch (err) {
                console.error('Error checking initialization progress:', err);
              }
            }, 3000);
            
            setPollingInterval(interval);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading chatbot:', err);
        setError('Failed to load chatbot');
        setLoading(false);
      }
    };

    loadChatbot();
    
    // Cleanup
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [sessionId]);

  const handleInitialize = async () => {
    try {
      setIsInitializing(true);
      setError(null);
      
      // Start initialization
      const initResponse = await initializeChatbot(sessionId);
      
      // Set up polling for progress
      const interval = setInterval(async () => {
        try {
          const progressUpdate = await getChatbotInitProgress(sessionId);
          setInitProgress(progressUpdate.progress || 0);
          
          if (progressUpdate.status === 'completed') {
            setIsInitialized(true);
            setIsInitializing(false);
            clearInterval(interval);
            setPollingInterval(null);
          }
        } catch (err) {
          console.error('Error checking initialization progress:', err);
        }
      }, 3000);
      
      setPollingInterval(interval);
    } catch (err) {
      console.error('Error initializing chatbot:', err);
      setError('Failed to initialize chatbot');
      setIsInitializing(false);
    }
  };

  const handleSendQuery = async (query) => {
    if (!query.trim() || isSending) return;
    
    try {
      setIsSending(true);
      setError(null);
      
      // Add user message to UI immediately
      const userMessage = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'user',
        content: query,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      // Send query to backend
      const response = await sendChatbotQuery(sessionId, query);
      
      // Add assistant response
      const assistantMessage = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      setIsSending(false);
    } catch (err) {
      console.error('Error sending query:', err);
      setError('Failed to send query. Please try again.');
      setIsSending(false);
    }
  };

  if (loading) {
    return <Loader text="Loading chatbot..." />;
  }

  if (!isInitialized) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Codebase Chatbot</h2>
        
        {isInitializing ? (
          <div className="p-8 text-center">
            <Loader text="Initializing chatbot..." />
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${initProgress}%` }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                This may take several minutes. The chatbot needs to analyze your codebase first.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              The chatbot needs to be initialized before you can use it. This involves analyzing your codebase
              and may take several minutes depending on the size of your project.
            </p>
            {error && (
              <p className="text-red-500 mb-4">{error}</p>
            )}
            <button
              onClick={handleInitialize}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
            >
              Initialize Chatbot
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow flex flex-col h-[600px]">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Codebase Chatbot</h2>
        <p className="text-sm text-gray-600">
          Ask questions about your codebase to learn more about it
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            <p>No messages yet. Start by asking a question about your codebase.</p>
            <p className="text-sm mt-2">
              Example: "What are the main components in this codebase?" or "Explain how the file system works."
            </p>
          </div>
        ) : (
          messages.map(message => (
            <ChatMessage 
              key={message.id}
              message={message}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t">
        {error && (
          <div className="mb-2 p-2 bg-red-50 text-red-500 rounded text-sm">
            {error}
          </div>
        )}
        <QueryInput 
          onSendQuery={handleSendQuery} 
          isSending={isSending}
        />
      </div>
    </div>
  );
};

export default ChatInterface;