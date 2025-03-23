import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import FileList from '../components/AnalysisViewer/FileList';
import SummaryViewer from '../components/AnalysisViewer/SummaryViewer';
import { getSessionStatus, getSessionData } from '../api/sessionApi';
import { useSession } from '../hooks/useSession';
import './ProjectDashboardPage.css';

const ProjectDashboardPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { setSession } = useSession();
  
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const progressInterval = useRef(null);
  
  // Fetch session data on mount
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        setLoading(true);
        
        // Check session status
        const statusResponse = await getSessionStatus(sessionId);
        
        // If uploaded or analyzing, set up polling and progress animation
        if (statusResponse.status === 'uploaded' || statusResponse.status === 'analyzing') {
          // Animate progress for better UX
          progressInterval.current = setInterval(() => {
            setAnalysisProgress(prev => {
              if (prev >= 95) return prev;
              return prev + (Math.random() * 2);
            });
          }, 1000);
          
          // Start polling for status updates
          const interval = setInterval(async () => {
            try {
              const statusUpdate = await getSessionStatus(sessionId);
              
              if (statusUpdate.status === 'ready' || statusUpdate.status === 'completed' || statusUpdate.status === 'error') {
                // Analysis complete, clear intervals and fetch full data
                clearInterval(interval);
                clearInterval(progressInterval.current);
                setPollingInterval(null);
                setAnalysisProgress(100);
                
                const fullData = await getSessionData(sessionId);
                setSessionData(fullData);
                setLoading(false);
                
                // Update session context
                setSession({
                  id: sessionId,
                  status: statusUpdate.status
                });
              }
            } catch (err) {
              console.error('Error polling status:', err);
            }
          }, 3000); // Poll every 3 seconds
          
          setPollingInterval(interval);
          
          // Set initial session data
          setSessionData({
            session_id: sessionId,
            status: statusResponse.status
          });
        } else {
          // Session already processed, fetch full data
          const fullData = await getSessionData(sessionId);
          setSessionData(fullData);
          
          // Update session context
          setSession({
            id: sessionId,
            status: fullData.status
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching session data:', err);
        setError('Failed to load project data. The session may have expired.');
        setLoading(false);
      }
    };
    
    fetchSessionData();
    
    // Clean up polling interval
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [sessionId, setSession]);
  
  // Handle file selection
  const handleFileSelect = (filePath) => {
    setSelectedFile(filePath);
    setActiveTab('files');
  };
  
  // Loader component
  const Loader = () => (
    <div className="dashboard-loader">
      <div className="pulse-loader">
        <div className="pulse-dot"></div>
        <div className="pulse-dot"></div>
        <div className="pulse-dot"></div>
      </div>
      <p>Loading project data...</p>
    </div>
  );
  
  if (loading && (!sessionData || (sessionData.status !== 'uploaded' && sessionData.status !== 'analyzing'))) {
    return (
      <div className="dashboard-page">
        <Header />
        <main className="dashboard-main loading-state">
          <Loader />
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="dashboard-page">
        <Header />
        <main className="dashboard-main error-state">
          <div className="dashboard-error">
            <div className="error-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2>Error Loading Project</h2>
            <p>{error}</p>
            <Link to="/" className="btn btn-primary">
              <span className="btn-text">Return to Home</span>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Handle in-progress analysis
  if (sessionData.status === 'uploaded' || sessionData.status === 'analyzing') {
    return (
      <div className="dashboard-page">
        <Header />
        <main className="dashboard-main analyzing-state">
          <div className="analyzing-container">
            <motion.div 
              className="analyzing-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="analyzing-header">
                <div className="progress-ring">
                  <svg viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="8" fill="none" />
                    <circle 
                      cx="60" 
                      cy="60" 
                      r="54" 
                      stroke="var(--primary-light)" 
                      strokeWidth="8" 
                      fill="none" 
                      strokeDasharray="339.292" 
                      strokeDashoffset={339.292 * (1 - analysisProgress / 100)} 
                      transform="rotate(-90, 60, 60)" 
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="progress-percentage">{Math.round(analysisProgress)}%</div>
                </div>
                <h2>Analyzing Your Codebase</h2>
                <p>
                  This may take a few minutes depending on the size of your codebase.
                  The page will automatically update when analysis is complete.
                </p>
              </div>
              
              <div className="analyzing-steps">
                <div className={`analyzing-step ${analysisProgress > 25 ? 'completed' : 'active'}`}>
                  <div className="step-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="step-content">
                    <h3>Scanning Files</h3>
                    <p>Identifying file types and structure</p>
                  </div>
                </div>
                
                <div className={`analyzing-step ${analysisProgress > 50 ? 'completed' : analysisProgress > 25 ? 'active' : ''}`}>
                  <div className="step-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M12 6.25278V4M19 10.1903V6M5 10.1903V6M15 20C15 18.3431 13.6569 17 12 17C10.3431 17 9 18.3431 9 20M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="step-content">
                    <h3>Analyzing Code</h3>
                    <p>Parsing and understanding relationships</p>
                  </div>
                </div>
                
                <div className={`analyzing-step ${analysisProgress > 75 ? 'completed' : analysisProgress > 50 ? 'active' : ''}`}>
                  <div className="step-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M8 9L11 12L8 15M13 15H16M5 20H19C20.1046 20 21 19.1046 21 18V6C21 4.89543 20.1046 4 19 4H5C3.89543 4 3 4.89543 3 6V18C3 19.1046 3.89543 20 5 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="step-content">
                    <h3>Generating Summaries</h3>
                    <p>Creating file and codebase summaries</p>
                  </div>
                </div>
                
                <div className={`analyzing-step ${analysisProgress > 90 ? 'completed' : analysisProgress > 75 ? 'active' : ''}`}>
                  <div className="step-icon">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M7 21L3 17L7 13M17 13L21 17L17 21M13 7L17 3L21 7M3 7L7 3L11 7M12 12C12 12.5523 11.5523 13 11 13C10.4477 13 10 12.5523 10 12C10 11.4477 10.4477 11 11 11C11.5523 11 12 11.4477 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="step-content">
                    <h3>Preparing Visualizations</h3>
                    <p>Setting up diagrams and tech stack analysis</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="dashboard-page">
      <Header />
      
      <motion.main 
        className="dashboard-main"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="dashboard-container">
          {/* Project Header */}
          <section className="dashboard-header">
            <div className="dashboard-header-content">
              <div>
                <h1>Project Dashboard</h1>
                <p className="session-info">
                  <span className="session-label">Session ID:</span> 
                  <span className="session-value">{sessionId}</span>
                </p>
              </div>
              <div className="dashboard-status">
                <div className={`status-indicator ${sessionData.status}`}></div>
                <span className="status-text">
                  {sessionData.status === 'error' ? 'Error' :
                   sessionData.status === 'ready' ? 'Ready' :
                   sessionData.status === 'completed' ? 'Completed' : 'Analyzing'}
                </span>
              </div>
            </div>
          </section>
          
          {/* Dashboard Navigation */}
          <nav className="dashboard-nav">
            <ul className="dashboard-tabs">
              <li 
                className={`dashboard-tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 13C4 12.4477 4.44772 12 5 12H11C11.5523 12 12 12.4477 12 13V19C12 19.5523 11.5523 20 11 20H5C4.44772 20 4 19.5523 4 19V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 13C16 12.4477 16.4477 12 17 12H19C19.5523 12 20 12.4477 20 13V19C20 19.5523 19.5523 20 19 20H17C16.4477 20 16 19.5523 16 19V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Overview
              </li>
              <li 
                className={`dashboard-tab ${activeTab === 'files' ? 'active' : ''}`}
                onClick={() => setActiveTab('files')}
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M4 5C4 4.44772 4.44772 4 5 4H10C10.5523 4 11 4.44772 11 5V19C11 19.5523 10.5523 20 10 20H5C4.44772 20 4 19.5523 4 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13 5C13 4.44772 13.4477 4 14 4H19C19.5523 4 20 4.44772 20 5V9C20 9.55228 19.5523 10 19 10H14C13.4477 10 13 9.55228 13 9V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13 14C13 13.4477 13.4477 13 14 13H19C19.5523 13 20 13.4477 20 14V19C20 19.5523 19.5523 20 19 20H14C13.4477 20 13 19.5523 13 19V14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Files
              </li>
              <li 
                className={`dashboard-tab ${activeTab === 'summary' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('summary');
                  setSelectedFile(null);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Summary
              </li>
            </ul>
          </nav>
          
          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && (
                <div className="dashboard-overview">
                  <div className="feature-cards">
                    {/* Architecture Diagrams */}
                    <div className="feature-card">
                      <div className="feature-card-icon">
                        <svg viewBox="0 0 24 24" fill="none">
                          <path d="M9 9H9.01M15 9H15.01M9 15H9.01M15 15H15.01M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M9 9H9.01M15 9H15.01M9 15H9.01M15 15H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="feature-card-content">
                        <h3>Architecture Diagrams</h3>
                        <p>
                          Visualize the structure of your codebase with high-level and low-level architecture diagrams.
                        </p>
                        <Link 
                          to={`/project/${sessionId}/diagrams`}
                          className="feature-card-action"
                        >
                          View Diagrams
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </Link>
                      </div>
                    </div>
                    
                    {/* Tech Stack Analysis */}
                    <div className="feature-card">
                      <div className="feature-card-icon">
                        <svg viewBox="0 0 24 24" fill="none">
                          <path d="M14 11H8M10.5 15H8M16 7H8M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="feature-card-content">
                        <h3>Tech Stack Analysis</h3>
                        <p>
                          Analyze the technologies, frameworks, and languages used in your codebase.
                        </p>
                        <Link 
                          to={`/project/${sessionId}/techstack`}
                          className="feature-card-action"
                        >
                          View Tech Stack
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </Link>
                      </div>
                    </div>
                    
                    {/* Chatbot */}
                    <div className="feature-card">
                      <div className="feature-card-icon">
                        <svg viewBox="0 0 24 24" fill="none">
                          <path d="M8 10H8.01M12 10H12.01M16 10H16.01M9 16H5C3.89543 16 3 15.1046 3 14V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V14C21 15.1046 20.1046 16 19 16H15L12 19L9 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="feature-card-content">
                        <h3>AI Chatbot</h3>
                        <p>
                          Ask questions about your codebase and get instant answers from our AI assistant.
                        </p>
                        <Link 
                          to={`/project/${sessionId}/chatbot`}
                          className="feature-card-action"
                        >
                          Chat with AI
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  <div className="project-stats">
                    <h3>Project Statistics</h3>
                    <div className="stats-grid">
                      <div className="stat-card">
                        <div className="stat-icon">
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M9 17H7C5.89543 17 5 16.1046 5 15V7C5 5.89543 5.89543 5 7 5H17C18.1046 5 19 5.89543 19 7V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14 15L16.5 12.5M16.5 12.5L19 10M16.5 12.5L14 10M16.5 12.5L19 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M7 9H12M7 13H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="stat-value">
                          {sessionData.processed_files ? sessionData.processed_files.length : 0}
                        </div>
                        <div className="stat-label">Files Processed</div>
                      </div>
                      
                      <div className="stat-card">
                        <div className="stat-icon">
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M8 9L11 12L8 15M13 15H16M5 20H19C20.1046 20 21 19.1046 21 18V6C21 4.89543 20.1046 4 19 4H5C3.89543 4 3 4.89543 3 6V18C3 19.1046 3.89543 20 5 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="stat-value">
                          {sessionData.summary && sessionData.summary.file_summaries ? sessionData.summary.file_summaries.length : 0}
                        </div>
                        <div className="stat-label">Files Summarized</div>
                      </div>
                      
                      <div className="stat-card">
                        <div className="stat-icon">
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M10 20L14 4M18 8L22 12L18 16M6 16L2 12L6 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="stat-value">
                          {sessionData.tech_stack && sessionData.tech_stack.languages ? Object.keys(sessionData.tech_stack.languages).length : 0}
                        </div>
                        <div className="stat-label">Languages Detected</div>
                      </div>
                      
                      <div className="stat-card">
                        <div className="stat-icon">
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M20.24 12.24C21.3658 11.1142 21.9983 9.58722 21.9983 7.99504C21.9983 6.40285 21.3658 4.87588 20.24 3.75004C19.1142 2.62419 17.5872 1.9917 15.995 1.9917C14.4028 1.9917 12.8758 2.62419 11.75 3.75004L5 10.5V19H13.5L20.24 12.24Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16 8L2 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M17.5 15H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <div className="stat-value">
                          {sessionData.diagrams && (sessionData.diagrams.low_level || sessionData.diagrams.high_level) ? 'Ready' : 'Not Generated'}
                        </div>
                        <div className="stat-label">Diagrams</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overview-actions">
                    <button 
                      className="overview-action" 
                      onClick={() => setActiveTab('files')}
                    >
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M9 17H7C5.89543 17 5 16.1046 5 15V7C5 5.89543 5.89543 5 7 5H17C18.1046 5 19 5.89543 19 7V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M13 11H17M15 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 9H9M7 13H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Browse Files
                    </button>
                    <button 
                      className="overview-action" 
                      onClick={() => {
                        setActiveTab('summary');
                        setSelectedFile(null);
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      View Summary
                    </button>
                  </div>
                </div>
              )}
              
              {(activeTab === 'files' || activeTab === 'summary') && (
                <div className="dashboard-explorer">
                  <div className="file-explorer-grid">
                    {/* File Browser */}
                    <div className="file-browser">
                      <div className="section-header">
                        <h3>
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9M13 2L20 9M13 2V9H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Files
                        </h3>
                        <button className="refresh-button">
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M4 4V9H4.58152M19.9381 11C19.446 7.05369 16.0796 4 12 4C8.64262 4 5.76829 6.06817 4.58152 9M4.58152 9H9M20 20V15H19.4185M19.4185 15C18.2317 17.9318 15.3574 20 12 20C7.92038 20 4.55399 16.9463 4.06189 13M19.4185 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                      <FileList 
                        sessionId={sessionId}
                        onFileSelect={handleFileSelect}
                        selectedFile={selectedFile}
                      />
                    </div>
                    
                    {/* File Summary / Codebase Summary */}
                    <div className="file-summary">
                      <div className="section-header">
                        <h3>
                          <svg viewBox="0 0 24 24" fill="none">
                            <path d="M9 12H15M9 16H15M9 8H15M5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {selectedFile ? 'File Summary' : 'Codebase Summary'}
                        </h3>
                        <div className="summary-actions">
                          {selectedFile && (
                            <button 
                              className="clear-selection-button"
                              onClick={() => setSelectedFile(null)}
                            >
                              Show Codebase Summary
                            </button>
                          )}
                        </div>
                      </div>
                      <SummaryViewer 
                        sessionId={sessionId}
                        filePath={selectedFile}
                        type={selectedFile ? 'file' : 'codebase'}
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.main>
      
      <Footer />
    </div>
  );
};

export default ProjectDashboardPage;