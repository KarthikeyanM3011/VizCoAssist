import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import FileUploader from '../components/FileUploader/FileUploader';
import { useSession } from '../hooks/useSession';
import './ProjectUploadPage.css';

const ProjectUploadPage = () => {
  const navigate = useNavigate();
  const { setSession } = useSession();
  const observerRef = useRef(null);
  
  useEffect(() => {
    // Setup intersection observer for reveal animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
          }
        });
      },
      { threshold: 0.2 }
    );
    
    // Observe all elements with reveal class
    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => {
      observerRef.current.observe(el);
    });
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);
  
  const handleUploadSuccess = (sessionData) => {
    // Update session context with new session data
    setSession({
      id: sessionData.session_id,
      status: sessionData.status
    });
    
    // Navigate to the project dashboard
    navigate(`/project/${sessionData.session_id}`);
  };
  
  return (
    <div className="upload-page-wrapper">
      <Header />
      
      <div className="animated-bg">
        <div className="cyber-grid"></div>
        <div className="glow-circle circle1"></div>
        <div className="glow-circle circle2"></div>
        <div className="glow-circle circle3"></div>
      </div>
      
      <main className="upload-page-content">
        <div className="content-container">
          <h1 className="cyber-title reveal">
            <span className="text-glitch" data-text="Upload Your Codebase">Upload Your Codebase</span>
          </h1>
          
          <div className="uploader-section reveal">
            <FileUploader onUploadSuccess={handleUploadSuccess} />
          </div>
          
          <div className="info-section reveal">
            <div className="info-header">
              <div className="info-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M17.5 12C17.5 15.0376 15.0376 17.5 12 17.5C8.96243 17.5 6.5 15.0376 6.5 12C6.5 8.96243 8.96243 6.5 12 6.5C15.0376 6.5 17.5 8.96243 17.5 12Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M16 8L18.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M8 16L5.5 18.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M16 16L18.5 18.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M8 8L5.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h2>What Happens After Upload?</h2>
            </div>
            
            <div className="process-steps">
              <div className="process-step reveal">
                <div className="step-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M14 3V7C14 7.26522 14.1054 7.51957 14.2929 7.70711C14.4804 7.89464 14.7348 8 15 8H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 8V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H14L19 8V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 12H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 15L12 12L9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="step-content">
                  <h3>Code Analysis</h3>
                  <p>Your code is scanned and analyzed to identify file types, dependencies, and structures</p>
                </div>
              </div>
              
              <div className="process-step reveal">
                <div className="step-icon diagram-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V7C20 7.55228 19.5523 8 19 8H5C4.44772 8 4 7.55228 4 7V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 13C4 12.4477 4.44772 12 5 12H11C11.5523 12 12 12.4477 12 13V19C12 19.5523 11.5523 20 11 20H5C4.44772 20 4 19.5523 4 19V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 13C16 12.4477 16.4477 12 17 12H19C19.5523 12 20 12.4477 20 13V19C20 19.5523 19.5523 20 19 20H17C16.4477 20 16 19.5523 16 19V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="step-content">
                  <h3>Architecture Visualization</h3>
                  <p>Generate interactive diagrams that visualize your codebase structure and data flow</p>
                </div>
              </div>
              
              <div className="process-step reveal">
                <div className="step-icon tech-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M10.75 13.25H6.75L13.25 3.75V10.75H17.25L10.75 20.25V13.25Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="step-content">
                  <h3>Tech Stack Analysis</h3>
                  <p>Identify and analyze the technologies, frameworks, and languages used in your project</p>
                </div>
              </div>
              
              <div className="process-step reveal">
                <div className="step-icon ai-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="step-content">
                  <h3>AI Assistant Chat</h3>
                  <p>Interact with our AI assistant to ask questions and gain insights about your codebase</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="privacy-section reveal">
            <div className="privacy-card">
              <div className="privacy-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 16.5V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 7V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="privacy-content">
                <h3>Privacy & Security</h3>
                <p>Your code is processed securely and not shared with third parties. All session data will be automatically deleted after 7 days.</p>
              </div>
              <div className="lock-icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProjectUploadPage;