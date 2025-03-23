import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import TechStackOverview from '../components/TechStack/TechStackOverview';
import Loader from '../components/common/Loader';
import { getSessionStatus } from '../api/sessionApi';
import { analyzeTechStack, getTechStackProgress } from '../api/techStackApi';

const TechStackPage = () => {
  const { sessionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pollingInterval, setPollingInterval] = useState(null);
  
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
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-gray-50 flex items-center justify-center">
          <Loader text="Loading tech stack data..." />
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Tech Stack Analysis</h1>
                <p className="text-gray-600">
                  Analyze the technologies, frameworks, and languages used in your codebase
                </p>
              </div>
              
              <button
                onClick={handleAnalyzeTechStack}
                disabled={isAnalyzing}
                className={`px-4 py-2 rounded mt-2 ${
                  isAnalyzing
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
              {error}
            </div>
          )}
          
          {isAnalyzing && (
            <div className="mb-6 p-6 bg-white rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Analyzing Tech Stack</h2>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-gray-600">
                Analyzing your codebase to identify technologies, frameworks, and languages.
                This may take several minutes depending on the size of your codebase.
              </p>
            </div>
          )}
          
          <TechStackOverview 
            sessionId={sessionId}
            onAnalyzeClick={handleAnalyzeTechStack}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TechStackPage;