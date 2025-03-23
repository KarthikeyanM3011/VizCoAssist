// Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSession } from '../../hooks/useSession';
import './CommonComponents.css';

const Header = () => {
  const location = useLocation();
  const { session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return (
    <header className={`cyber-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <Link to="/" className="logo">
          <div className="logo-icon">
            <svg viewBox="0 0 36 36" fill="none">
              <path d="M18 3L30 10.5V25.5L18 33L6 25.5V10.5L18 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 15L25 19.5V28.5L18 33L11 28.5V19.5L18 15Z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M30 10.5L18 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 10.5L18 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="logo-text">VizCoAssist</span>
        </Link>
        
        <nav className="desktop-nav">
          <ul className="nav-list">
            <li className={location.pathname === '/' ? 'active' : ''}>
              <Link to="/">
                <span className="nav-text">Home</span>
                <span className="nav-indicator"></span>
              </Link>
            </li>
            
            {session?.id && (
              <>
                <li className={location.pathname.includes('/project/') && !location.pathname.includes('/diagrams') && !location.pathname.includes('/techstack') && !location.pathname.includes('/chatbot') ? 'active' : ''}>
                  <Link to={`/project/${session.id}`}>
                    <span className="nav-text">Dashboard</span>
                    <span className="nav-indicator"></span>
                  </Link>
                </li>
                <li className={location.pathname.includes('/diagrams') ? 'active' : ''}>
                  <Link to={`/project/${session.id}/diagrams`}>
                    <span className="nav-text">Diagrams</span>
                    <span className="nav-indicator"></span>
                  </Link>
                </li>
                <li className={location.pathname.includes('/techstack') ? 'active' : ''}>
                  <Link to={`/project/${session.id}/techstack`}>
                    <span className="nav-text">Tech Stack</span>
                    <span className="nav-indicator"></span>
                  </Link>
                </li>
                <li className={location.pathname.includes('/chatbot') ? 'active' : ''}>
                  <Link to={`/project/${session.id}/chatbot`}>
                    <span className="nav-text">Chatbot</span>
                    <span className="nav-indicator"></span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
        
        <div className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <div className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="mobile-nav">
          <ul className="mobile-nav-list">
            <li className={location.pathname === '/' ? 'active' : ''}>
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            </li>
            
            {session?.id && (
              <>
                <li className={location.pathname.includes('/project/') && !location.pathname.includes('/diagrams') && !location.pathname.includes('/techstack') && !location.pathname.includes('/chatbot') ? 'active' : ''}>
                  <Link to={`/project/${session.id}`} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                </li>
                <li className={location.pathname.includes('/diagrams') ? 'active' : ''}>
                  <Link to={`/project/${session.id}/diagrams`} onClick={() => setMobileMenuOpen(false)}>Diagrams</Link>
                </li>
                <li className={location.pathname.includes('/techstack') ? 'active' : ''}>
                  <Link to={`/project/${session.id}/techstack`} onClick={() => setMobileMenuOpen(false)}>Tech Stack</Link>
                </li>
                <li className={location.pathname.includes('/chatbot') ? 'active' : ''}>
                  <Link to={`/project/${session.id}/chatbot`} onClick={() => setMobileMenuOpen(false)}>Chatbot</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Header;
