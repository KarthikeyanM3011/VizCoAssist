import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTechStackData, getFileTechStack } from '../../api/techStackApi';
import './TechStackOverview.css';

const TechStackOverview = ({ 
  sessionId, 
  onAnalyzeClick,
  activeCategory = 'languages',
  onCategoryChange,
  isTechStackReady = false
}) => {
  const [techStackData, setTechStackData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredTech, setHoveredTech] = useState(null);

  // Categories that we display in the UI
  const categories = [
    { id: 'languages', label: 'Languages', icon: 'code' },
    { id: 'frontend', label: 'Frontend', icon: 'layout' },
    { id: 'backend', label: 'Backend', icon: 'server' },
    { id: 'database', label: 'Database', icon: 'database' },
    { id: 'devops', label: 'DevOps', icon: 'settings' },
    { id: 'api', label: 'APIs', icon: 'globe' },
    { id: 'other', label: 'Other', icon: 'more' }
  ];

  useEffect(() => {
    // Load tech stack data
    const loadTechStackData = async () => {
      if (!isTechStackReady) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const data = await getTechStackData(sessionId);
        setTechStackData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading tech stack data:', err);
        setError('Failed to load tech stack data');
        setLoading(false);
      }
    };

    loadTechStackData();
  }, [sessionId, isTechStackReady]);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'code':
        return (
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M16 18L22 12L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 6L2 12L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'layout':
        return (
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 9H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'server':
        return (
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="20" height="8" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="2" y="14" width="20" height="8" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 6H6.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 18H6.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'database':
        return (
          <svg viewBox="0 0 24 24" fill="none">
            <ellipse cx="12" cy="5" rx="9" ry="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12C21 13.66 16.97 15 12 15C7.03 15 3 13.66 3 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 5V19C3 20.66 7.03 22 12 22C16.97 22 21 20.66 21 19V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'settings':
        return (
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19.4 15C19.1277 15.8031 19.2583 16.6923 19.7414 17.4004C20.2245 18.1085 21.0123 18.5413 21.8541 18.5805C21.9496 18.8671 22.0168 19.1612 22.0555 19.4603C22.0942 19.7593 22.1044 20.0615 22.0859 20.3623C21.8504 21.9696 20.775 23.3351 19.2475 23.9892C17.7201 24.6434 15.9956 24.4987 14.6 23.6C13.9003 23.1565 13.3102 22.5604 12.875 21.8585C12.4399 21.1567 12.1709 20.3691 12.0889 19.5535C12.0068 18.7378 12.1142 17.9154 12.4033 17.1477C12.6923 16.3799 13.1557 15.6852 13.7612 15.1198C14.3667 14.5544 15.0976 14.1325 15.8948 13.8847C16.692 13.6369 17.5364 13.5698 18.3658 13.689C19.1951 13.8083 19.9888 14.111 20.684 14.5753" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4.6 8.99999C5.29519 9.46431 6.08895 9.76708 6.91829 9.88636C7.74763 10.0056 8.59198 9.93856 9.38919 9.69068C10.1864 9.4428 10.9173 9.02093 11.5228 8.45552C12.1283 7.89011 12.5917 7.19539 12.8807 6.42768C13.1698 5.65997 13.2772 4.83756 13.1951 4.02189C13.1131 3.20622 12.8441 2.41866 12.409 1.71682C11.9738 1.01498 11.3837 0.418875 10.684 -0.0246582" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4.59999 9C4.32768 8.19693 3.74988 7.54419 2.99999 7.16389C2.2501 6.78359 1.3878 6.70419 0.583984 6.94213C0.488458 6.65554 0.421294 6.36145 0.38258 6.06238C0.343866 5.76331 0.333716 5.46112 0.352174 5.16029C0.587673 3.55297 1.66304 2.18747 3.19049 1.53332C4.71794 0.879166 6.44242 1.02396 7.83799 1.92269C8.53769 2.36619 9.12788 2.96229 9.56305 3.66414C9.99821 4.36599 10.2672 5.15355 10.3493 5.96922C10.4313 6.78488 10.3239 7.6073 10.0349 8.37501C9.74584 9.14272 9.28242 9.83744 8.67691 10.4028C8.0714 10.9683 7.34048 11.3901 6.54327 11.638C5.74605 11.8859 4.90171 11.9529 4.07237 11.8336C3.24303 11.7144 2.44927 11.4116 1.75407 10.9473" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'globe':
        return (
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 2C9.49872 4.73835 8.07725 8.29203 8 12C8.07725 15.708 9.49872 19.2616 12 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'more':
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M5 10C6.10457 10 7 10.8954 7 12C7 13.1046 6.10457 14 5 14C3.89543 14 3 13.1046 3 12C3 10.8954 3.89543 10 5 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 10C13.1046 10 14 10.8954 14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 10C20.1046 10 21 10.8954 21 12C21 13.1046 20.1046 14 19 14C17.8954 14 17 13.1046 17 12C17 10.8954 17.8954 10 19 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence?.toLowerCase()) {
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
        return 'low';
      default:
        return 'medium';
    }
  };

  return (
    <div className="tech-stack-overview">
      {!isTechStackReady && !loading ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 4V20M12 4L8 8M12 4L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3>No Tech Stack Analysis Available</h3>
          <p>Click the "Refresh Analysis" button to analyze the technologies used in your codebase</p>
          <button 
            onClick={onAnalyzeClick} 
            className="empty-action-button"
          >
            Start Analysis
          </button>
        </div>
      ) : (
        <>
          {/* Category Selector */}
          <div className="category-selector">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-button ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => onCategoryChange(category.id)}
              >
                <span className="category-icon">
                  {getCategoryIcon(category.icon)}
                </span>
                <span className="category-label">{category.label}</span>
                {activeCategory === category.id && (
                  <motion.div
                    className="active-indicator"
                    layoutId="activeCategory"
                    transition={{ type: 'spring', duration: 0.5 }}
                  />
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner">
                <div className="spinner-ring"></div>
                <span>Loading tech stack data...</span>
              </div>
            </div>
          ) : error ? (
            <div className="error-message">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33974 16C2.56994 17.3333 3.53217 19 5.07183 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{error}</span>
            </div>
          ) : techStackData ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="tech-list-container"
              >
                {activeCategory === 'languages' ? (
                  <div className="languages-grid">
                    {Object.entries(techStackData?.languages || {}).map(([lang, details]) => (
                      <div 
                        key={lang} 
                        className="language-card"
                        onMouseEnter={() => setHoveredTech(lang)}
                        onMouseLeave={() => setHoveredTech(null)}
                      >
                        <div className="language-header">
                          <h3>{lang}</h3>
                          <div className="language-percentage">
                            {details.percentage}%
                          </div>
                        </div>
                        <div className="percentage-bar">
                          <div 
                            className="percentage-fill" 
                            style={{ width: `${details.percentage}%` }}
                          ></div>
                        </div>
                        <div className="language-details">
                          <div className={`confidence-badge ${getConfidenceColor(details.confidence)}`}>
                            {details.confidence}
                          </div>
                          <div className="language-evidence">
                            {details.evidence}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="tech-grid">
                    {Object.entries(techStackData?.[activeCategory] || {}).map(([tech, details]) => (
                      <div 
                        key={tech} 
                        className="tech-card"
                        onMouseEnter={() => setHoveredTech(tech)}
                        onMouseLeave={() => setHoveredTech(null)}
                      >
                        <div className="tech-header">
                          <h3>{tech}</h3>
                          <div className={`confidence-badge ${getConfidenceColor(details.confidence)}`}>
                            {details.confidence}
                          </div>
                        </div>
                        <div className="tech-evidence">
                          {details.evidence}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="empty-tech-data">
              <p>No tech stack data available for this category</p>
              <button 
                onClick={onAnalyzeClick} 
                className="refresh-button"
              >
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M4 4V9H4.582M4.582 9C5.24585 7.35457 6.43568 5.9952 7.96503 5.08395C9.49438 4.1727 11.2768 3.75043 13.0632 3.88335C14.8496 4.01627 16.5432 4.69503 17.8787 5.82299C19.2142 6.95095 20.1217 8.46649 20.4625 10.1379M4.582 9H9M20 20V15H19.419M19.419 15C18.7542 16.6455 17.5644 18.0048 16.0351 18.9161C14.5057 19.8273 12.7232 20.2496 10.9368 20.1166C9.15038 19.9837 7.45682 19.305 6.1213 18.177C4.78579 17.0491 3.87826 15.5335 3.53753 13.8621M19.419 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Refresh Analysis
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TechStackOverview;