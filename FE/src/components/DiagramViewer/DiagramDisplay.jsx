import React, { useState, useEffect } from 'react';
import { getDiagramByLevel, isDiagramGenerationInProgress } from '../../api/diagramApi';
import Loader from '../common/Loader';
import MermaidViewer from './MermaidViewer';
import PlantUMLViewer from './PlantUMLViewer';

const DiagramDisplay = ({ sessionId, level = 'high_level', onGenerateClick }) => {
  const [diagram, setDiagram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);

  // Initial fetch
  useEffect(() => {
    const fetchDiagram = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check if generation is in progress
        const generationInProgress = await isDiagramGenerationInProgress(sessionId);
        setIsGenerating(await isDiagramGenerationInProgress(sessionId));
        
        if (!generationInProgress) {
          // Fetch the diagram
          const diagramData = await getDiagramByLevel(sessionId, level);
          setDiagram(diagramData);
        }
        
        setLoading(false);
      } catch (err) {
        setError('No diagram available. Click "Generate Diagrams" to create one.');
        setLoading(false);
        console.error('Error loading diagram:', err);
      }
    };

    fetchDiagram();

    // Cleanup
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [sessionId, level]);

  // Set up polling if diagram generation is in progress
  useEffect(() => {
    if (isGenerating && !pollingInterval) {
      const interval = setInterval(async () => {
        try {
          const generationInProgress = await isDiagramGenerationInProgress(sessionId);
          
          if (!generationInProgress) {
            // Generation is complete, fetch the diagram
            setIsGenerating(false);
            clearInterval(interval);
            setPollingInterval(null);
            
            const diagramData = await getDiagramByLevel(sessionId, level);
            setDiagram(diagramData);
            setLoading(false);
          }
        } catch (err) {
          console.error('Error checking diagram status:', err);
        }
      }, 5000); // Poll every 5 seconds
      
      setPollingInterval(interval);
    }
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [isGenerating, sessionId, level, pollingInterval]);

  // Handle generate button click
  const handleGenerateClick = () => {
    if (onGenerateClick) {
      onGenerateClick();
      setIsGenerating(true);
    }
  };

  if (loading) {
    return <Loader text="Loading diagram..." />;
  }

  if (isGenerating) {
    return (
      <div className="text-center p-8">
        <Loader text="Generating diagram..." size="large" />
        <p className="mt-4 text-gray-600">
          This may take a few minutes depending on the size of your codebase.
        </p>
      </div>
    );
  }

  if (error || !diagram) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-600 mb-4">{error || 'No diagram available'}</p>
        <button
          onClick={handleGenerateClick}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
        >
          Generate Diagrams
        </button>
      </div>
    );
  }

  // Determine diagram type based on available data
  const isDiagramMermaid = diagram.code && diagram.code.includes('graph ') || diagram.code.includes('flowchart ');
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium">
          {level === 'high_level' ? 'High-Level Architecture Diagram' : 'Low-Level Architecture Diagram'}
        </h3>
      </div>
      
      {diagram.diagram_base64 ? (
        <div className="p-4 flex justify-center">
          <img 
            src={`data:image/png;base64,${diagram.diagram_base64}`} 
            alt={`${level} diagram`}
            className="max-w-full"
          />
        </div>
      ) : isDiagramMermaid ? (
        <MermaidViewer code={diagram.code} />
      ) : (
        <PlantUMLViewer code={diagram.code} />
      )}
      
      {diagram.code && (
        <div className="border-t p-4">
          <details className="text-sm">
            <summary className="cursor-pointer text-blue-500 hover:text-blue-700">
              View Diagram Code
            </summary>
            <pre className="mt-2 p-3 bg-gray-50 overflow-x-auto rounded text-xs">
              {diagram.code}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default DiagramDisplay;