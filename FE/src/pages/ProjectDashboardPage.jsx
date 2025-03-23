import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loader from '../components/common/Loader';
import FileList from '../components/AnalysisViewer/FileList';
import SummaryViewer from '../components/AnalysisViewer/SummaryViewer';
import { getSessionStatus, getSessionData } from '../api/sessionApi';
import { useSession } from '../hooks/useSession';

const ProjectDashboardPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { setSession } = useSession();
  
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  
  // Fetch session data on mount
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        setLoading(true);
        
        // Check session status
        const statusResponse = await getSessionStatus(sessionId);
        
        // If uploaded or analyzing, set up polling
        if (statusResponse.status === 'uploaded' || statusResponse.status === 'analyzing') {
          // Start polling for status updates
          const interval = setInterval(async () => {
            try {
              const statusUpdate = await getSessionStatus(sessionId);
              
              if (statusUpdate.status === 'ready' || statusUpdate.status === 'completed' || statusUpdate.status === 'error') {
                // Analysis complete, clear interval and fetch full data
                clearInterval(interval);
                setPollingInterval(null);
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
    };
  }, [sessionId, setSession]);
  
  // Handle file selection
  const handleFileSelect = (filePath) => {
    setSelectedFile(filePath);
  };
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-gray-50 flex items-center justify-center">
          <Loader text="Loading project data..." size="large" />
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-gray-50 p-6">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Project</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link to="/" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors">
              Return to Home
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
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-gray-50 p-6">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-50 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Analyzing Your Codebase</h2>
            <p className="text-gray-600 mb-6">
              This may take a few minutes depending on the size of your codebase.
              The page will automatically update when analysis is complete.
            </p>
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-left">
              <h3 className="font-medium text-blue-800 mb-2">What's happening?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Scanning files and identifying file types</li>
                <li>• Analyzing code structure and relationships</li>
                <li>• Preparing for diagram generation and tech stack analysis</li>
              </ul>
            </div>
          </div>
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
          {/* Project Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Project Overview
            </h1>
            <p className="text-gray-600">
              Session ID: {sessionId}
            </p>
          </div>
          
          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Architecture Diagrams */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                Architecture Diagrams
              </h2>
              <p className="text-gray-600 mb-4">
                Visualize the structure of your codebase with high-level and low-level architecture diagrams.
              </p>
              <Link 
                to={`/project/${sessionId}/diagrams`}
                className="block text-center bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
              >
                View Diagrams
              </Link>
            </div>
            
            {/* Tech Stack Analysis */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Tech Stack Analysis
              </h2>
              <p className="text-gray-600 mb-4">
                Analyze the technologies, frameworks, and languages used in your codebase.
              </p>
              <Link 
                to={`/project/${sessionId}/techstack`}
                className="block text-center bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
              >
                View Tech Stack
              </Link>
            </div>
            
            {/* Chatbot */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                AI Chatbot
              </h2>
              <p className="text-gray-600 mb-4">
                Ask questions about your codebase and get instant answers from our AI assistant.
              </p>
              <Link 
                to={`/project/${sessionId}/chatbot`}
                className="block text-center bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
              >
                Chat with AI
              </Link>
            </div>
          </div>
          
          {/* File Browser and Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* File Browser */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-xl font-bold mb-4">Files</h2>
                <FileList 
                  sessionId={sessionId}
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedFile}
                />
              </div>
            </div>
            
            {/* File Summary / Codebase Summary */}
            <div className="lg:col-span-2">
              <SummaryViewer 
                sessionId={sessionId}
                filePath={selectedFile}
                type={selectedFile ? 'file' : 'codebase'}
              />
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProjectDashboardPage;