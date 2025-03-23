import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import DiagramDisplay from '../components/DiagramViewer/DiagramDisplay';
import Loader from '../components/common/Loader';
import { getSessionStatus } from '../api/sessionApi';
import { generateArchitectureDiagrams, isDiagramGenerationInProgress } from '../api/diagramApi';

const DiagramPage = () => {
  const { sessionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [diagramType, setDiagramType] = useState('mermaid');
  const [currentView, setCurrentView] = useState('high_level'); // 'high_level' or 'low_level'
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Check if session is ready
        const statusResponse = await getSessionStatus(sessionId);
        if (statusResponse.status !== 'ready' && statusResponse.status !== 'completed') {
          setError(`Cannot generate diagrams. Current status: ${statusResponse.status}`);
          setLoading(false);
          return;
        }
        
        // Check if diagram generation is in progress
        const generationInProgress = await isDiagramGenerationInProgress(sessionId);
        setIsGenerating(generationInProgress);
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load diagram data. Please try again later.');
        setLoading(false);
      }
    };
    
    loadData();
  }, [sessionId]);
  
  const handleGenerateDiagrams = async () => {
    try {
      setIsGenerating(true);
      await generateArchitectureDiagrams(sessionId, diagramType);
      // DiagramDisplay component will handle the polling for completion
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
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-gray-50 flex items-center justify-center">
          <Loader text="Loading diagram data..." />
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
            <h1 className="text-3xl font-bold mb-2">Architecture Diagrams</h1>
            <p className="text-gray-600">
              Visualize your codebase structure and relationships
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
              {error}
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold mb-4">Diagram Options</h2>
              
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Diagram Type
                  </label>
                  <div className="flex rounded-md overflow-hidden">
                    <button
                      className={`px-4 py-2 ${
                        diagramType === 'mermaid'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                      onClick={() => toggleDiagramType('mermaid')}
                      disabled={isGenerating}
                    >
                      Mermaid
                    </button>
                    <button
                      className={`px-4 py-2 ${
                        diagramType === 'plantuml'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                      onClick={() => toggleDiagramType('plantuml')}
                      disabled={isGenerating}
                    >
                      PlantUML
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    View
                  </label>
                  <div className="flex rounded-md overflow-hidden">
                    <button
                      className={`px-4 py-2 ${
                        currentView === 'high_level'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                      onClick={() => toggleView('high_level')}
                    >
                      High Level
                    </button>
                    <button
                      className={`px-4 py-2 ${
                        currentView === 'low_level'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                      onClick={() => toggleView('low_level')}
                    >
                      Low Level
                    </button>
                  </div>
                </div>
                
                <div className="ml-auto flex items-end">
                  <button
                    onClick={handleGenerateDiagrams}
                    disabled={isGenerating}
                    className={`px-4 py-2 rounded ${
                      isGenerating
                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {isGenerating ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </span>
                    ) : (
                      'Generate Diagrams'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <DiagramDisplay 
            sessionId={sessionId}
            level={currentView}
            onGenerateClick={handleGenerateDiagrams}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DiagramPage;