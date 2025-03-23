import React, { useState, useEffect } from 'react';
import { getTechStackResults, isTechStackAnalysisComplete } from '../../api/techStackApi';
import Loader from '../common/Loader';
import LanguageDistribution from './LanguageDistribution';
import TechStackCategory from './TechStackCategory';

const TechStackOverview = ({ sessionId, onAnalyzeClick }) => {
  const [techStack, setTechStack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);

  // Initial fetch
  useEffect(() => {
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
          setIsAnalyzing(true);
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
  }, [sessionId]);

  // Set up polling if tech stack analysis is in progress
  useEffect(() => {
    if (isAnalyzing && !pollingInterval) {
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
  }, [isAnalyzing, sessionId, pollingInterval]);

  // Handle analyze button click
  const handleAnalyzeClick = () => {
    if (onAnalyzeClick) {
      onAnalyzeClick();
      setIsAnalyzing(true);
    }
  };

  if (loading) {
    return <Loader text="Loading tech stack analysis..." />;
  }

  if (isAnalyzing) {
    return (
      <div className="text-center p-8">
        <Loader text="Analyzing tech stack..." size="large" />
        <p className="mt-4 text-gray-600">
          This may take a few minutes depending on the size of your codebase.
        </p>
      </div>
    );
  }

  if (error || !techStack) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-600 mb-4">{error || 'No tech stack analysis available'}</p>
        <button
          onClick={handleAnalyzeClick}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
        >
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
    { key: 'other', title: 'Other Technologies' }
  ];

  return (
    <div className="space-y-6">
      {/* Language Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Language Distribution</h2>
        <LanguageDistribution languages={techStack.languages || {}} />
      </div>
      
      {/* Tech Stack Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map(category => (
          <TechStackCategory 
            key={category.key}
            title={category.title}
            technologies={techStack[category.key] || {}}
          />
        ))}
      </div>
    </div>
  );
};

export default TechStackOverview;