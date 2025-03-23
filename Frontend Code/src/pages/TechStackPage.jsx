import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import TechStackOverview from '../components/TechStack/TechStackOverview';
import { getSessionStatus } from '../api/sessionApi';
import { analyzeTechStack, getTechStackProgress } from '../api/techStackApi';
import './TechStackPage.css';

const TechStackPage = () => {
  const { sessionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [techStackData, setTechStackData] = useState(null);
  
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Check if session is ready
        const statusResponse = await getSessionStatus(sessionId);
        if (statusResponse.status !== 'ready' && statusResponse.status !== 'completed') {
          setError(`Cannot analyze tech stack. Current status: ${statusResponse.status}`);
          setLoading(false);
          return;
        }
        
        // Check if tech stack analysis is in progress
        const progressResponse = await getTechStackProgress(sessionId);
        
        if (progressResponse.in_progress) {
          setIsAnalyzing(true);
          setProgress(progressResponse.progress || 0);
          
          // Set up polling
          const interval = setInterval(async () => {
            try {
              const progressUpdate = await getTechStackProgress(sessionId);
              setProgress(progressUpdate.progress || 0);
              
              if (!progressUpdate.in_progress) {
                // Analysis complete
                clearInterval(interval);
                setPollingInterval(null);
                setIsAnalyzing(false);
              }
            } catch (err) {
              console.error('Error polling progress:', err);
            }
          }, 3000);
          
          setPollingInterval(interval);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load tech stack data. Please try again later.');
        setLoading(false);
      }
    };
    
    loadData();
    
    // Clean up polling interval
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [sessionId]);
  
  const handleAnalyzeTechStack = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);
      setProgress(0);
      
      // Start tech stack analysis
      await analyzeTechStack(sessionId, true); // Force refresh
      
      // Set up polling for progress updates
      const interval = setInterval(async () => {
        try {
          const progressResponse = await getTechStackProgress(sessionId);
          setProgress(progressResponse.progress || 0);
          
          if (!progressResponse.in_progress) {
            // Analysis complete
            clearInterval(interval);
            setPollingInterval(null);
            setIsAnalyzing(false);
            // Try to get the updated tech stack data
            const analysisResponse = await analyzeTechStack(sessionId, false);
            if (analysisResponse && analysisResponse.tech_stack) {
              setTechStackData(analysisResponse.tech_stack);
            }
          }
        } catch (err) {
          console.error('Error polling progress:', err);
        }
      }, 3000);
      
      setPollingInterval(interval);
    } catch (err) {
      console.error('Error analyzing tech stack:', err);
      setError('Failed to analyze tech stack. Please try again.');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="techstack-page">
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
              <h1>Tech Stack Analysis</h1>
              <p>Discover the technologies, frameworks, and languages used in your codebase</p>
            </div>
            
            <div className="header-actions">
              <button 
                onClick={handleAnalyzeTechStack} 
                disabled={isAnalyzing}
                className={`action-button primary ${isAnalyzing ? 'analyzing' : ''}`}
              >
                {isAnalyzing ? (
                  <>
                    <span className="spinner"></span>
                    <span>Analyzing... {Math.round(progress)}%</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M4 4V9H4.582M19.418 9H20V4M20 20V15H19.418M4.582 15H4V20M4.582 9C5.24585 6.2 7.761 4 10.5 4C12.3487 4 14.0205 4.89235 15.1286 6.28746L15.2929 6.29289C16.4804 5.10536 18.1374 4.5 20 4.58579M4.582 15C5.24585 17.8 7.761 20 10.5 20C12.3487 20 14.0205 19.1077 15.1286 17.7125L15.2929 17.7071C16.4804 18.8946 18.1374 19.5 20 19.4142" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Refresh Analysis
                  </>
                )}
              </button>
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
          
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div 
                className="analysis-progress-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="card-header">
                  <h2>Analyzing Tech Stack</h2>
                  <div className="progress-percentage">{Math.round(progress)}%</div>
                </div>
                
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${progress}%` }}
                  >
                    <div className="progress-glow"></div>
                  </div>
                </div>
                
                <div className="progress-info">
                  <div className="info-item">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Analyzing your codebase to identify technologies, frameworks, and libraries</span>
                  </div>
                  
                  <div className="info-item">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M9 20L3 17M3 7V17M3 7L9 4M3 7L9 10M9 4V10M9 4L15 7M9 10V15M9 15L3 17M9 15L15 18M15 7V18M15 7L21 4V14L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>This process may take several minutes depending on the size of your codebase</span>
                  </div>
                </div>
                
                <div className="analysis-phases">
                  <div className={`phase ${progress >= 25 ? 'complete' : progress > 0 ? 'active' : ''}`}>
                    <div className="phase-dot"></div>
                    <span>Scanning files</span>
                  </div>
                  <div className={`phase ${progress >= 50 ? 'complete' : progress >= 25 ? 'active' : ''}`}>
                    <div className="phase-dot"></div>
                    <span>Identifying technologies</span>
                  </div>
                  <div className={`phase ${progress >= 75 ? 'complete' : progress >= 50 ? 'active' : ''}`}>
                    <div className="phase-dot"></div>
                    <span>Analyzing dependencies</span>
                  </div>
                  <div className={`phase ${progress >= 95 ? 'complete' : progress >= 75 ? 'active' : ''}`}>
                    <div className="phase-dot"></div>
                    <span>Generating insights</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
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
                  <span>Loading tech stack data...</span>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <TechStackOverview 
                  sessionId={sessionId}
                  onAnalyzeClick={handleAnalyzeTechStack}
                  isAnalyzing={isAnalyzing}
                  techStackData={techStackData}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TechStackPage;