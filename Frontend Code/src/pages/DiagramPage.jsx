import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import DiagramDisplay from '../components/DiagramViewer/DiagramDisplay';
import { getSessionStatus, getSessionData } from '../api/sessionApi';
import { generateArchitectureDiagrams, isDiagramGenerationInProgress } from '../api/diagramApi';
import './DiagramPage.css';

const DiagramPage = () => {
  const { sessionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [diagramType, setDiagramType] = useState('mermaid');
  const [currentView, setCurrentView] = useState('high_level'); // 'high_level' or 'low_level'
  const [isGenerating, setIsGenerating] = useState(false);
  const [diagramData, setDiagramData] = useState(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [expandedCode, setExpandedCode] = useState(false);
  const diagramRef = useRef(null);
  
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Check if session is ready
        const statusResponse = await getSessionStatus(sessionId);
        
        if (statusResponse.status !== 'ready' && statusResponse.status !== 'completed') {
          setError(`Session is not ready for diagram generation. Current status: ${statusResponse.status}`);
          setLoading(false);
          return;
        }
        
        // Check if diagram generation is in progress
        const generationInProgress = await isDiagramGenerationInProgress(sessionId);
        setIsGenerating(generationInProgress);
        
        // If session is completed, try to get diagram data
        if (statusResponse.status === 'completed') {
          const sessionData = await getSessionData(sessionId);
          if (sessionData.diagrams) {
            setDiagramData(sessionData.diagrams);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading diagram data:', err);
        setError('Failed to load diagram data. Please try again.');
        setLoading(false);
      }
    };
    
    loadData();
    
    // Set up polling for generation progress if in progress
    let progressInterval;
    if (isGenerating) {
      progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          // Cap at 95% until we confirm it's complete
          if (prev >= 95) return 95;
          return prev + (Math.random() * 5);
        });
      }, 1000);
    }
    
    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [sessionId, isGenerating]);
  
  const handleGenerateDiagrams = async () => {
    try {
      setIsGenerating(true);
      setGenerationProgress(0);
      
      // Start generation process
      await generateArchitectureDiagrams(sessionId, diagramType);
      
      // Poll for completion
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await getSessionStatus(sessionId);
          
          // Update progress based on status
          if (statusResponse.status === 'generating_diagrams') {
            setGenerationProgress(prev => Math.min(95, prev + 5));
          } else if (statusResponse.status === 'completed') {
            setGenerationProgress(100);
            clearInterval(pollInterval);
            
            // Get the updated data
            const sessionData = await getSessionData(sessionId);
            if (sessionData.diagrams) {
              setDiagramData(sessionData.diagrams);
            }
            
            setIsGenerating(false);
          } else if (statusResponse.status === 'error') {
            clearInterval(pollInterval);
            setIsGenerating(false);
            setError('Error during diagram generation: ' + statusResponse.error);
          }
        } catch (err) {
          console.error('Error polling diagram status:', err);
          // Don't stop polling on a single error
        }
      }, 3000);
      
      // Clean up interval on unmount
      return () => clearInterval(pollInterval);
    } catch (err) {
      console.error('Error generating diagrams:', err);
      setError('Failed to generate diagrams. Please try again.');
      setIsGenerating(false);
    }
  };
  
  const toggleDiagramType = (type) => {
    if (isGenerating) return; // Prevent changing while generating
    setDiagramType(type);
  };
  
  const toggleView = (view) => {
    setCurrentView(view);
  };
  
  const handleDownloadDiagram = () => {
    if (!diagramRef.current) return;
    
    try {
      // Create a temporary link
      const link = document.createElement('a');
      link.download = `${diagramType}_${currentView}_diagram.png`;
      
      // Use diagram element from DiagramDisplay via ref
      const diagramImg = diagramRef.current.querySelector('img');
      if (diagramImg && diagramImg.src) {
        link.href = diagramImg.src;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Try to get SVG element for Mermaid diagrams
        const svgElement = diagramRef.current.querySelector('svg');
        if (svgElement) {
          // Convert SVG to data URL
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
          const url = URL.createObjectURL(svgBlob);
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } else {
          throw new Error('No diagram image found');
        }
      }
    } catch (err) {
      console.error('Error downloading diagram:', err);
      setError('Failed to download diagram. Please try again.');
    }
  };
  
  const toggleCodeView = () => {
    setExpandedCode(!expandedCode);
  };
  
  const getCurrentDiagramCode = () => {
    if (!diagramData) return '';
    
    const levelKey = currentView === 'high_level' ? 'high_level' : 'low_level';
    if (diagramData[levelKey] && diagramData[levelKey].code) {
      return diagramData[levelKey].code;
    }
    
    return '';
  };

  return (
    <div className="diagram-page">
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
              <h1>Architecture Diagrams</h1>
              <p>Visualize your codebase architecture and dependencies</p>
            </div>
            
            <div className="header-actions">
              {diagramData && (
                <button 
                  onClick={handleDownloadDiagram} 
                  className="action-button secondary"
                  disabled={isGenerating || !diagramData}
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Download
                </button>
              )}
              
              <button 
                onClick={handleGenerateDiagrams} 
                disabled={isGenerating}
                className={`action-button primary ${isGenerating ? 'generating' : ''}`}
              >
                {isGenerating ? (
                  <>
                    <span className="spinner"></span>
                    <span>Generating... {Math.round(generationProgress)}%</span>
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M12 4V20M12 4L8 8M12 4L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Generate Diagrams
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
          
          <div className="diagram-controls">
            <div className="control-group">
              <h3>Diagram Type</h3>
              <div className="toggle-buttons">
                <button 
                  className={`toggle-button ${diagramType === 'mermaid' ? 'active' : ''}`}
                  onClick={() => toggleDiagramType('mermaid')}
                  disabled={isGenerating}
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M9 15L3 9M3 9L9 3M3 9H15C16.0609 9 17.0783 9.42143 17.8284 10.1716C18.5786 10.9217 19 11.9391 19 13C19 14.0609 18.5786 15.0783 17.8284 15.8284C17.0783 16.5786 16.0609 17 15 17H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Mermaid
                </button>
                {/* <button 
                  className={`toggle-button ${diagramType === 'plantuml' ? 'active' : ''}`}
                  onClick={() => toggleDiagramType('plantuml')}
                  disabled={isGenerating}
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M16 8V16M12 11V16M8 14V16M4 19.5V4.5C4 4.22386 4.22386 4 4.5 4H19.5C19.7761 4 20 4.22386 20 4.5V19.5C20 19.7761 19.7761 20 19.5 20H4.5C4.22386 20 4 19.7761 4 19.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  PlantUML
                </button> */}
              </div>
            </div>
            
            <div className="control-group">
              <h3>View Level</h3>
              <div className="toggle-buttons">
                <button 
                  className={`toggle-button ${currentView === 'high_level' ? 'active' : ''}`}
                  onClick={() => toggleView('high_level')}
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M3 9H21M9 21V9M5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  High Level
                </button>
                <button 
                  className={`toggle-button ${currentView === 'low_level' ? 'active' : ''}`}
                  onClick={() => toggleView('low_level')}
                >
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M3 9H21M9 21V9M15 21V9M5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Low Level
                </button>
              </div>
            </div>
          </div>
          
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
                  <span>Loading diagram data...</span>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="diagram-container"
                ref={diagramRef}
              >
                {isGenerating ? (
                  <div className="generation-progress">
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar" 
                        style={{width: `${generationProgress}%`}}
                      ></div>
                    </div>
                    <div className="generation-message">
                      <p>Generating your {diagramType} diagrams...</p>
                      <p className="progress-details">This may take a minute or two as we analyze your codebase structure</p>
                    </div>
                  </div>
                ) : (
                  diagramData ? (
                    <div className="diagram-content">
                      <div className="diagram-viewer">
                        <DiagramDisplay 
                          sessionId={sessionId}
                          level={currentView}
                          diagramData={diagramData}
                          showControls={false}
                        />
                      </div>
                      
                      {diagramData && getCurrentDiagramCode() && (
                        <div className={`diagram-code-section ${expandedCode ? 'expanded' : ''}`}>
                          <div className="code-header" onClick={toggleCodeView}>
                            <h3>Diagram Code</h3>
                            <button className="expand-button">
                              <svg viewBox="0 0 24 24" fill="none">
                                <path d={expandedCode ? 
                                  "M18 15L12 9L6 15" : 
                                  "M6 9L12 15L18 9"} 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </div>
                          
                          <AnimatePresence>
                            {expandedCode && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="code-content"
                              >
                                <pre>{getCurrentDiagramCode()}</pre>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <svg viewBox="0 0 24 24" fill="none">
                          <path d="M12 4V20M12 4L8 8M12 4L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <h3>No Diagrams Generated Yet</h3>
                      <p>Click the "Generate Diagrams" button to visualize your codebase architecture</p>
                    </div>
                  )
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DiagramPage;