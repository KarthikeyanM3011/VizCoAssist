import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendChatbotQuery, getChatHistory, isChatbotInitialized, initializeChatbot, getChatbotInitProgress } from '../../api/chatbotApi';
import ChatMessage from './ChatMessage';
import QueryInput from './QueryInput';
import './ChatInterface.css';

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
        //   const historyResponse = await getChatHistory(sessionId);
        //   if (historyResponse.chat_history && historyResponse.chat_history.length > 0) {
        //     const formattedHistory = historyResponse.chat_history.map(item => ({
        //       id: Math.random().toString(36).substr(2, 9),
        //       type: 'user',
        //       content: item.query,
        //       timestamp: new Date(item.timestamp * 1000).toISOString()
        //     })).flatMap((userMsg, index, array) => {
        //       const item = array[index];
        //       return [
        //         userMsg,
        //         {
        //           id: Math.random().toString(36).substr(2, 9),
        //           type: 'assistant',
        //           content: item.response,
        //           timestamp: new Date(item.timestamp * 1000).toISOString()
        //         }
        //       ];
        //     });
            
        //     setMessages(formattedHistory);
        const historyResponse = await getChatHistory(sessionId);
if (historyResponse.chat_history && historyResponse.chat_history.length > 0) {
  const formattedHistory = historyResponse.chat_history.flatMap(item => {
    // Check if timestamp is valid before creating Date objects
    const timestamp = item.timestamp ? new Date(item.timestamp * 1000) : new Date();
    const isValidDate = timestamp instanceof Date && !isNaN(timestamp);
    const isoTimestamp = isValidDate ? timestamp.toISOString() : new Date().toISOString();
    
    return [
      {
        id: Math.random().toString(36).substr(2, 9),
        type: 'user',
        content: item.query,
        timestamp: isoTimestamp
      },
      {
        id: Math.random().toString(36).substr(2, 9),
        type: 'assistant',
        content: item.response,
        timestamp: isoTimestamp
      }
    ];
  });
  
  setMessages(formattedHistory);
          } else {
            // Add welcome message if no history
            setMessages([{
              id: 'welcome',
              type: 'assistant',
              content: "Hello! I'm your AI code assistant. I've analyzed your codebase and I'm ready to answer your questions about its structure, components, and implementation details.",
              timestamp: new Date().toISOString()
            }]);
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
      setInitProgress(0);
      
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
            
            // Add welcome message after initialization
            setMessages([{
              id: 'welcome',
              type: 'assistant',
              content: "Hello! I'm your AI code assistant. I've analyzed your codebase and I'm ready to answer your questions about its structure, components, and implementation details.",
              timestamp: new Date().toISOString()
            }]);
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
    return (
      <div className="chat-interface loading">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <span>Loading chatbot...</span>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="chat-interface not-initialized">
        <div className="initialization-container">
          <h2>Codebase AI Assistant</h2>
          
          {isInitializing ? (
            <div className="initialization-progress">
              <div className="progress-indicator">
                <div className="spinner"></div>
                <div className="progress-percentage">{Math.round(initProgress)}%</div>
              </div>
              
              <div className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${initProgress}%` }}
                >
                  <div className="progress-glow"></div>
                </div>
              </div>
              
              <div className="initialization-message">
                <p>Analyzing your codebase to prepare the AI assistant...</p>
                <p className="details">This may take several minutes depending on the size of your project.</p>
              </div>
              
              <div className="initialization-phases">
                <div className={`phase ${initProgress >= 25 ? 'complete' : initProgress > 0 ? 'active' : ''}`}>
                  <div className="phase-dot"></div>
                  <span>Processing code</span>
                </div>
                <div className={`phase ${initProgress >= 50 ? 'complete' : initProgress >= 25 ? 'active' : ''}`}>
                  <div className="phase-dot"></div>
                  <span>Analyzing structure</span>
                </div>
                <div className={`phase ${initProgress >= 75 ? 'complete' : initProgress >= 50 ? 'active' : ''}`}>
                  <div className="phase-dot"></div>
                  <span>Preparing knowledge</span>
                </div>
                <div className={`phase ${initProgress >= 100 ? 'complete' : initProgress >= 75 ? 'active' : ''}`}>
                  <div className="phase-dot"></div>
                  <span>Finalizing</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="initialization-prompt">
              <div className="prompt-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M8 10H8.01M12 10H12.01M16 10H16.01M9 16H5C3.89543 16 3 15.1046 3 14V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V14C21 15.1046 20.1046 16 19 16H15L12 19L9 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="prompt-text">
                The chatbot needs to be initialized before you can use it. This involves analyzing your codebase
                and may take several minutes depending on the size of your project.
              </p>
              {error && (
                <div className="error-message">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33974 16C2.56994 17.3333 3.53217 19 5.07183 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}
              <button
                onClick={handleInitialize}
                className="initialize-button"
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 4V20M12 4L8 8M12 4L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Initialize AI Assistant
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h2>Codebase AI Assistant</h2>
        <p>Ask questions about your codebase to learn more about it</p>
      </div>
      
      <div className="messages-container">
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div 
              className="empty-chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M8 10H8.01M12 10H12.01M16 10H16.01M9 16H5C3.89543 16 3 15.1046 3 14V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V14C21 15.1046 20.1046 16 19 16H15L12 19L9 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p>No messages yet. Start by asking a question about your codebase.</p>
              <p className="example-hint">
                Example: "What are the main components in this codebase?" or "Explain how the file system works."
              </p>
            </motion.div>
          ) : (
            messages.map(message => (
              <ChatMessage 
                key={message.id}
                message={message}
              />
            ))
          )}
        </AnimatePresence>

        {isSending && (
          <div className="message-typing">
            <div className="message-avatar">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15.5 4.5C14.79 4.1 14.14 4 12 4C9.86 4 9.21 4.1 8.5 4.5L7.5 6.5C6.55 8.17 6.53 8.28 5.5 8.5C4.5 8.71 4 9.34 4 12C4 14.66 4.5 15.29 5.5 15.5C6.5 15.71 6.55 15.83 7.5 17.5L8.5 19.5C9.21 19.9 9.86 20 12 20C14.14 20 14.79 19.9 15.5 19.5L16.5 17.5C17.46 15.83 17.48 15.72 18.5 15.5C19.5 15.29 20 14.66 20 12C20 9.34 19.5 8.71 18.5 8.5C17.5 8.29 17.46 8.17 16.5 6.5L15.5 4.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input-container">
        {error && (
          <div className="chat-error">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33974 16C2.56994 17.3333 3.53217 19 5.07183 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{error}</span>
            <button onClick={() => setError(null)} className="close-button">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
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