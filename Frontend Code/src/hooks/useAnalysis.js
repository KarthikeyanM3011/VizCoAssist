import { useState, useEffect, useCallback } from 'react';
import { getSessionData } from '../api/sessionApi';
import { getFilesAccessed, getCodebaseSummary, getFileSummary } from '../api/analysisApi';
import { getTechStackResults } from '../api/techStackApi';
import { getDiagrams } from '../api/diagramApi';

/**
 * Custom hook for managing analysis data from the backend
 */
export const useAnalysis = (sessionId) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filesData, setFilesData] = useState([]);
  const [codebaseSummary, setCodebaseSummary] = useState('');
  const [techStack, setTechStack] = useState(null);
  const [diagrams, setDiagrams] = useState(null);
  const [fileSummaries, setFileSummaries] = useState({});

  // Load analysis data
  const loadAnalysisData = useCallback(async (options = {}) => {
    if (!sessionId) return;

    const { 
      loadFiles = true, 
      loadSummary = true, 
      loadTechStack = true, 
      loadDiagrams = true 
    } = options;

    try {
      setLoading(true);
      setError(null);

      // Get all session data (this can be used instead of individual API calls if we want all data at once)
      const sessionData = await getSessionData(sessionId);

      // Load files if requested
      if (loadFiles) {
        try {
          const filesResponse = await getFilesAccessed(sessionId);
          setFilesData(filesResponse.processed_files || []);
        } catch (err) {
          console.error('Error loading files:', err);
        }
      }

      // Load summary if requested
      if (loadSummary) {
        try {
          const summaryResponse = await getCodebaseSummary(sessionId);
          setCodebaseSummary(summaryResponse.summary || '');
        } catch (err) {
          console.error('Error loading summary:', err);
        }
      }

      // Load tech stack if requested
      if (loadTechStack) {
        try {
          const techStackData = sessionData.tech_stack || await getTechStackResults(sessionId);
          setTechStack(techStackData);
        } catch (err) {
          console.error('Error loading tech stack:', err);
        }
      }

      // Load diagrams if requested
      if (loadDiagrams) {
        try {
          const diagramsData = sessionData.diagrams || await getDiagrams(sessionId);
          setDiagrams(diagramsData);
        } catch (err) {
          console.error('Error loading diagrams:', err);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading analysis data:', err);
      setError('Failed to load analysis data. Please try again later.');
      setLoading(false);
    }
  }, [sessionId]);

  // Load initial data on mount
  useEffect(() => {
    if (sessionId) {
      loadAnalysisData();
    }
  }, [sessionId, loadAnalysisData]);

  /**
   * Get summary for a specific file
   */
  const getFileSummaryData = async (filePath) => {
    if (!sessionId || !filePath) return null;

    // Check if we already have this file summary
    if (fileSummaries[filePath]) {
      return fileSummaries[filePath];
    }

    try {
      const summaryResponse = await getFileSummary(sessionId, filePath);
      const summary = summaryResponse.summary || '';
      
      // Cache the summary
      setFileSummaries(prev => ({
        ...prev,
        [filePath]: summary
      }));
      
      return summary;
    } catch (err) {
      console.error(`Error loading summary for file ${filePath}:`, err);
      return null;
    }
  };

  return {
    loading,
    error,
    filesData,
    codebaseSummary,
    techStack,
    diagrams,
    fileSummaries,
    loadAnalysisData,
    getFileSummaryData
  };
};

export default useAnalysis;