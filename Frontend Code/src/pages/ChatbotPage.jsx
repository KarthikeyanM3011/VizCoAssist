import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import ChatInterface from '../components/Chatbot/ChatInterface';
import { getSessionStatus } from '../api/sessionApi';
import { initializeChatbot, isChatbotInitialized, getChatbotInitProgress } from '../api/chatbotApi';
import './ChatbotPage.css';

const ChatbotPage = () => {
  const { sessionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initProgress, setInitProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [exampleQuestions, setExampleQuestions] = useState([
    "What are the main components in this codebase?",
    "Explain how the file processing works in this system.",
    "What technologies are used in the frontend and backend?",
    "How does the rendering system work for diagrams?",
    "What is the architecture pattern used in this application?",
    "How does the session management work?"
  ]);
  const pollIntervalRef = useRef(null);
  
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Check if session is ready
        const statusResponse = await getSessionStatus(sessionId);
        if (statusResponse.status !== 'ready' && statusResponse.status !== 'completed') {
          setError(`Cannot use chatbot. Current status: ${statusResponse.status}`);
          setLoading(false);
          return;
        }
        
        // Check if chatbot is initialized
        const initResponse = await isChatbotInitialized(sessionId);
        setIsInitialized(initResponse.initialized);
        
        if (!initResponse.initialized) {
          // Check initialization progress
          const progressResponse = await getChatbotInitProgress(sessionId);
          
          if (progressResponse.status === 'in_progress') {
            setIsInitializing(true);
            setInitProgress(progressResponse.progress || 0);
            setCurrentStep(progressResponse.current_step || '');
            startPolling();
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load chatbot data. Please try again later.');
        setLoading(false);
      }
    };
    
    loadData();
    
    // Cleanup polling on unmount
    return () => stopPolling();
  }, [sessionId]);
  
  const startPolling = () => {
    // Clear any existing interval
    stopPolling();
    
    // Set up new polling interval
    pollIntervalRef.current = setInterval(async () => {
      try {
        const progressResponse = await getChatbotInitProgress(sessionId);
        
        setInitProgress(progressResponse.progress || 0);
        setCurrentStep(progressResponse.current_step || '');
        
        if (progressResponse.status === 'completed') {
          setIsInitialized(true);
          setIsInitializing(false);
          stopPolling();
        } else if (progressResponse.status === 'error') {
          setError(`Chatbot initialization failed: ${progressResponse.error}`);
          setIsInitializing(false);
          stopPolling();
        }
      } catch (err) {
        console.error('Error polling initialization progress:', err);
      }
    }, 2000);
  };
  
  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };
  
  const handleInitializeChatbot = async () => {
    try {
      setIsInitializing(true);
      setError(null);
      
      // Start initialization
      await initializeChatbot(sessionId);
      
      // Start polling for progress
      startPolling();
    } catch (err) {
      console.error('Error initializing chatbot:', err);
      setError('Failed to initialize chatbot. Please try again.');
      setIsInitializing(false);
    }
  };
  
  const getInitializationStepText = (step) => {
    switch (step) {
      case 'initial_analysis':
        return 'Analyzing codebase structure';
      case 'summaries':
        return 'Generating code summaries';
      case 'tech_stack':
        return 'Analyzing technologies used';
      default:
        return 'Preparing chatbot';
    }
  };
  
  const insertExampleQuestion = (question) => {
    // This function will be passed to the ChatInterface component
    // to allow inserting example questions into the chat
    // Implementation depends on how ChatInterface is set up
    if (window.insertQuestion && typeof window.insertQuestion === 'function') {
      window.insertQuestion(question);
    }
  };

  return (
    <div className="chatbot-page">
      <Header />
      
      <main className="page-content">
        <div className="container">
          <motion.div 
            className="page-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="header-content">
              <h1>AI Codebase Assistant</h1>
              <p>Chat with our AI to get detailed insights about your codebase</p>
            </div>
          </motion.div>
          
          {error && (
            <motion.div 
              className="error-message"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33974 16C2.56994 17.3333 3.53217 19 5.07183 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{error}</span>
              <button onClick={() => setError(null)} className="close-button">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </motion.div>
          )}
          
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="loading-container"
              >
                <div className="loading-spinner">
                  <div className="spinner-ring"></div>
                  <span>Loading chatbot...</span>
                </div>
              </motion.div>
            ) : isInitializing ? (
              <motion.div 
                key="initializing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="initialization-container"
              >
                <div className="initialization-card">
                  <h2>Preparing AI Assistant</h2>
                  <p>We're training the AI on your codebase to provide accurate answers.</p>
                  
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${initProgress}%` }}
                    >
                      <div className="progress-glow"></div>
                    </div>
                  </div>
                  
                  <div className="init-progress-text">
                    <span className="progress-percentage">{Math.round(initProgress)}%</span>
                    <span className="current-step">{getInitializationStepText(currentStep)}</span>
                  </div>
                  
                  <div className="initialization-steps">
                    <div className={`init-step ${currentStep === 'initial_analysis' || initProgress >= 33 ? 'active' : ''}`}>
                      <div className="step-number">1</div>
                      <div className="step-text">Analyzing code structure</div>
                    </div>
                    <div className={`init-step ${currentStep === 'summaries' || initProgress >= 66 ? 'active' : ''}`}>
                      <div className="step-number">2</div>
                      <div className="step-text">Building code summaries</div>
                    </div>
                    <div className={`init-step ${currentStep === 'tech_stack' || initProgress >= 90 ? 'active' : ''}`}>
                      <div className="step-number">3</div>
                      <div className="step-text">Analyzing technologies</div>
                    </div>
                  </div>
                  
                  <p className="initialization-note">
                    This process usually takes 2-5 minutes depending on the size of your codebase.
                  </p>
                </div>
              </motion.div>
            ) : !isInitialized ? (
              <motion.div 
                key="not-initialized"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="not-initialized-container"
              >
                <div className="not-initialized-card">
                  <div className="card-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M8 10H8.01M12 10H12.01M16 10H16.01M9 16H5C3.89543 16 3 15.1046 3 14V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V14C21 15.1046 20.1046 16 19 16H15L12 19L9 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h2>Chatbot Not Initialized</h2>
                  <p>
                    The AI assistant needs to learn about your codebase before it can answer your questions.
                    This process will analyze your code structure and create detailed summaries.
                  </p>
                  <button 
                    onClick={handleInitializeChatbot}
                    className="action-button primary"
                  >
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M12 4V20M12 4L19 11M12 4L5 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Initialize Chatbot
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="chat-interface"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="chat-container"
              >
                <div className="chat-interface-wrapper">
                  <ChatInterface 
                    sessionId={sessionId} 
                    darkMode={true}
                  />
                </div>
                
                <motion.div 
                  className="example-questions-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <h2>Example Questions</h2>
                  <div className="example-questions-grid">
                    {exampleQuestions.map((question, index) => (
                      <motion.div 
                        key={index}
                        className="example-question-card"
                        whileHover={{ 
                          scale: 1.03, 
                          backgroundColor: 'rgba(111, 74, 142, 0.2)',
                          borderColor: 'var(--primary-light)'
                        }}
                        transition={{ duration: 0.2 }}
                        onClick={() => insertExampleQuestion(question)}
                      >
                        <svg viewBox="0 0 24 24" fill="none">
                          <path d="M8 9L11 12L8 15M13 15H16M5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>{question}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="example-questions-hint">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p>
                      The AI assistant has been trained on your codebase structure, implementation details,
                      and the technologies used. Click on any example question to try it out.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ChatbotPage;