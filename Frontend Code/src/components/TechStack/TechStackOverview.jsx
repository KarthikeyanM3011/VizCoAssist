// import React, { useState, useEffect } from 'react';
// import { getTechStackResults, isTechStackAnalysisComplete } from '../../api/techStackApi';
// import Loader from '../common/Loader';
// import LanguageDistribution from './LanguageDistribution';
// import TechStackCategory from './TechStackCategory';

// const TechStackOverview = ({ sessionId, onAnalyzeClick }) => {
//   const [techStack, setTechStack] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [pollingInterval, setPollingInterval] = useState(null);

//   // Initial fetch
//   useEffect(() => {
//     const fetchTechStack = async () => {
//       try {
//         setLoading(true);
//         setError(null);
        
//         // Check if analysis is complete
//         const isComplete = await isTechStackAnalysisComplete(sessionId);
        
//         if (isComplete) {
//           // Fetch the tech stack data
//           const techStackData = await getTechStackResults(sessionId);
//           setTechStack(techStackData);
//           setIsAnalyzing(false);
//         } else {
//           setIsAnalyzing(true);
//         }
        
//         setLoading(false);
//       } catch (err) {
//         setError('No tech stack analysis available. Click "Analyze Tech Stack" to create one.');
//         setLoading(false);
//         setIsAnalyzing(false);
//         console.error('Error loading tech stack:', err);
//       }
//     };

//     fetchTechStack();

//     // Cleanup
//     return () => {
//       if (pollingInterval) {
//         clearInterval(pollingInterval);
//       }
//     };
//   }, [sessionId]);

//   // Set up polling if tech stack analysis is in progress
//   useEffect(() => {
//     if (isAnalyzing && !pollingInterval) {
//       const interval = setInterval(async () => {
//         try {
//           const isComplete = await isTechStackAnalysisComplete(sessionId);
          
//           if (isComplete) {
//             // Analysis is complete, fetch the data
//             clearInterval(interval);
//             setPollingInterval(null);
            
//             const techStackData = await getTechStackResults(sessionId);
//             setTechStack(techStackData);
//             setIsAnalyzing(false);
//           }
//         } catch (err) {
//           console.error('Error checking tech stack analysis status:', err);
//         }
//       }, 5000); // Poll every 5 seconds
      
//       setPollingInterval(interval);
//     }
    
//     return () => {
//       if (pollingInterval) {
//         clearInterval(pollingInterval);
//       }
//     };
//   }, [isAnalyzing, sessionId, pollingInterval]);

//   // Handle analyze button click
//   const handleAnalyzeClick = () => {
//     if (onAnalyzeClick) {
//       onAnalyzeClick();
//       setIsAnalyzing(true);
//     }
//   };

//   if (loading) {
//     return <Loader text="Loading tech stack analysis..." />;
//   }

//   if (isAnalyzing) {
//     return (
//       <div className="text-center p-8">
//         <Loader text="Analyzing tech stack..." size="large" />
//         <p className="mt-4 text-gray-600">
//           This may take a few minutes depending on the size of your codebase.
//         </p>
//       </div>
//     );
//   }

//   if (error || !techStack) {
//     return (
//       <div className="bg-white rounded-lg shadow p-6 text-center">
//         <p className="text-gray-600 mb-4">{error || 'No tech stack analysis available'}</p>
//         <button
//           onClick={handleAnalyzeClick}
//           className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
//         >
//           Analyze Tech Stack
//         </button>
//       </div>
//     );
//   }

//   // Categories to display
//   const categories = [
//     { key: 'languages', title: 'Programming Languages' },
//     { key: 'frontend', title: 'Frontend Technologies' },
//     { key: 'backend', title: 'Backend Technologies' },
//     { key: 'database', title: 'Database Technologies' },
//     { key: 'api', title: 'APIs and Services' },
//     { key: 'devops', title: 'DevOps and Infrastructure' },
//     { key: 'other', title: 'Other Technologies' }
//   ];

//   return (
//     <div className="space-y-6">
//       {/* Language Distribution */}
//       <div className="bg-white rounded-lg shadow p-6">
//         <h2 className="text-xl font-bold mb-4">Language Distribution</h2>
//         <LanguageDistribution languages={techStack.languages || {}} />
//       </div>
      
//       {/* Tech Stack Categories */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {categories.map(category => (
//           <TechStackCategory 
//             key={category.key}
//             title={category.title}
//             technologies={techStack[category.key] || {}}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default TechStackOverview;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTechStackResults, isTechStackAnalysisComplete } from '../../api/techStackApi';
import LanguageDistribution from './LanguageDistribution';
import TechStackCategory from './TechStackCategory';
import './TechComponents.css';

const TechStackOverview = ({ sessionId, onAnalyzeClick, isAnalyzing: parentIsAnalyzing, techStackData: propsTechStackData }) => {
  const [techStack, setTechStack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);

  // Initial fetch
  useEffect(() => {
    // If data is provided through props, use it
    if (propsTechStackData) {
      setTechStack(propsTechStackData);
      setLoading(false);
      setIsAnalyzing(false);
      return;
    }

    // If parent component is handling the analyzing state
    if (parentIsAnalyzing !== undefined) {
      setIsAnalyzing(parentIsAnalyzing);
    }

    const fetchTechStack = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if analysis is complete
        const isComplete = await isTechStackAnalysisComplete(sessionId);
        
        if (isComplete) {
          // Fetch the tech stack data
          const techStackData = await getTechStackResults(sessionId);
          setTechStack(techStackData);
          setIsAnalyzing(false);
        } else {
          // Only set to analyzing if parent isn't handling this state
          if (parentIsAnalyzing === undefined) {
            setIsAnalyzing(true);
          }
        }
        
        setLoading(false);
      } catch (err) {
        setError('No tech stack analysis available. Click "Analyze Tech Stack" to create one.');
        setLoading(false);
        setIsAnalyzing(false);
        console.error('Error loading tech stack:', err);
      }
    };

    fetchTechStack();

    // Cleanup
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [sessionId, parentIsAnalyzing, propsTechStackData]);

  // Set up polling if tech stack analysis is in progress
  useEffect(() => {
    // Only set up polling if this component is responsible for tracking state
    if (isAnalyzing && !pollingInterval && parentIsAnalyzing === undefined) {
      const interval = setInterval(async () => {
        try {
          const isComplete = await isTechStackAnalysisComplete(sessionId);
          
          if (isComplete) {
            // Analysis is complete, fetch the data
            clearInterval(interval);
            setPollingInterval(null);
            
            const techStackData = await getTechStackResults(sessionId);
            setTechStack(techStackData);
            setIsAnalyzing(false);
          }
        } catch (err) {
          console.error('Error checking tech stack analysis status:', err);
        }
      }, 5000); // Poll every 5 seconds
      
      setPollingInterval(interval);
    }
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [isAnalyzing, sessionId, pollingInterval, parentIsAnalyzing]);

  // Handle analyze button click
  const handleAnalyzeClick = () => {
    if (onAnalyzeClick) {
      onAnalyzeClick();
      setIsAnalyzing(true);
    }
  };

  if (loading) {
    return (
      <div className="tech-stack-loading">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <span>Loading tech stack data...</span>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="tech-stack-loading">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <span>Analyzing tech stack...</span>
        </div>
        <p className="analysis-message">
          This may take a few minutes depending on the size of your codebase.
        </p>
      </div>
    );
  }

  if (error || !techStack) {
    return (
      <div className="tech-stack-empty">
        <div className="empty-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3>No Tech Stack Analysis Available</h3>
        <p>{error || 'Analyze your codebase to identify the technologies, frameworks, and languages used.'}</p>
        <button onClick={handleAnalyzeClick} className="action-button primary">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 4V9H4.582M19.418 9H20V4M20 20V15H19.418M4.582 15H4V20M4.582 9C5.24585 6.2 7.761 4 10.5 4C12.3487 4 14.0205 4.89235 15.1286 6.28746L15.2929 6.29289C16.4804 5.10536 18.1374 4.5 20 4.58579M4.582 15C5.24585 17.8 7.761 20 10.5 20C12.3487 20 14.0205 19.1077 15.1286 17.7125L15.2929 17.7071C16.4804 18.8946 18.1374 19.5 20 19.4142" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Analyze Tech Stack
        </button>
      </div>
    );
  }

  // Categories to display
  const categories = [
    { key: 'languages', title: 'Programming Languages' },
    { key: 'frontend', title: 'Frontend Technologies' },
    { key: 'backend', title: 'Backend Technologies' },
    { key: 'database', title: 'Database Technologies' },
    { key: 'api', title: 'APIs and Services' },
    { key: 'devops', title: 'DevOps and Infrastructure' },
    { key: 'ml_ai', title: 'Machine Learning / AI' },
    { key: 'other', title: 'Other Technologies' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="tech-overview-content"
    >
      {/* Language Distribution */}
      <div className="tech-overview-section">
        <h2 className="section-title">Language Distribution</h2>
        <div className="card-container">
          <LanguageDistribution languages={techStack.languages || {}} />
        </div>
      </div>
      
      {/* Tech Stack Categories */}
      <div className="tech-overview-section">
        <h2 className="section-title">Technology Stack</h2>
        <div className="categories-grid">
          {categories.map(category => {
            // Skip empty categories
            if (!techStack[category.key] || 
                Object.keys(techStack[category.key]).length === 0 ||
                (Object.keys(techStack[category.key]).length === 1 && 
                 Object.keys(techStack[category.key])[0] === "None identified")) {
              return null;
            }
            
            return (
              <TechStackCategory 
                key={category.key}
                title={category.title}
                technologies={techStack[category.key] || {}}
              />
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default TechStackOverview;