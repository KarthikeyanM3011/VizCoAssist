import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import FileList from '../components/AnalysisViewer/FileList';
import SummaryViewer from '../components/AnalysisViewer/SummaryViewer';
import Loader from '../components/common/Loader';
import { getSessionStatus } from '../api/sessionApi';
import { getCodebaseSummary } from '../api/analysisApi';

const CodeSummaryPage = () => {
  const { sessionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [summaryType, setSummaryType] = useState('codebase'); // 'codebase' or 'file'
  const [codebaseSummary, setCodebaseSummary] = useState('');
  
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Check if session is ready
        const statusResponse = await getSessionStatus(sessionId);
        if (statusResponse.status !== 'ready' && statusResponse.status !== 'completed') {
          setError(`Cannot load summaries. Current status: ${statusResponse.status}`);
          setLoading(false);
          return;
        }
        
        // Load codebase summary
        try {
          const summaryResponse = await getCodebaseSummary(sessionId);
          setCodebaseSummary(summaryResponse.summary || '');
        } catch (err) {
          console.error('Error loading codebase summary:', err);
          // Don't set error here, as we still want to show file browser
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load summary data. Please try again later.');
        setLoading(false);
      }
    };
    
    loadData();
  }, [sessionId]);
  
  const handleFileSelect = (filePath) => {
    setSelectedFile(filePath);
    setSummaryType('file');
  };
  
  const handleViewCodebaseSummary = () => {
    setSelectedFile(null);
    setSummaryType('codebase');
  };
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-gray-50 flex items-center justify-center">
          <Loader text="Loading summary data..." />
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Code Summaries</h1>
            <p className="text-gray-600">
              Explore summaries of your codebase and individual files
            </p>
          </div>
          
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={handleViewCodebaseSummary}
              className={`py-2 px-4 rounded ${
                summaryType === 'codebase'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              Codebase Summary
            </button>
            
            {selectedFile && (
              <button
                onClick={() => setSummaryType('file')}
                className={`py-2 px-4 rounded ${
                  summaryType === 'file'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                File Summary
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* File Browser */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow">
                <div className="border-b p-4">
                  <h2 className="text-xl font-bold">Files</h2>
                  <p className="text-sm text-gray-600">Select a file to view its summary</p>
                </div>
                <div className="p-4">
                  <FileList 
                    sessionId={sessionId}
                    onFileSelect={handleFileSelect}
                    selectedFile={selectedFile}
                  />
                </div>
              </div>
            </div>
            
            {/* Summary Content */}
            <div className="lg:col-span-2">
              {summaryType === 'codebase' ? (
                <div className="bg-white rounded-lg shadow">
                  <div className="border-b p-4">
                    <h2 className="text-xl font-bold">Codebase Summary</h2>
                    <p className="text-sm text-gray-600">An overview of the entire codebase</p>
                  </div>
                  <div className="p-6">
                    {codebaseSummary ? (
                      <div className="prose max-w-none">
                        <p>{codebaseSummary}</p>
                      </div>
                    ) : (
                      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md">
                        <p>No codebase summary available yet. Try generating architecture diagrams first.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <SummaryViewer 
                  sessionId={sessionId}
                  filePath={selectedFile}
                  type="file"
                />
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CodeSummaryPage;