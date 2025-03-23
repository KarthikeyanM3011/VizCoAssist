import React, { useState, useEffect } from 'react';
import { getFileSummary, getCodebaseSummary } from '../../api/analysisApi';
import Loader from '../common/Loader';
import ReactMarkdown from 'react-markdown';

const SummaryViewer = ({ sessionId, filePath, type = 'file' }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let response;
        if (type === 'file' && filePath) {
          response = await getFileSummary(sessionId, filePath);
          setSummary(response.summary || 'No summary available for this file.');
        } else {
          response = await getCodebaseSummary(sessionId);
          setSummary(response.summary || 'No codebase summary available.');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching summary:', err);
        setError('Failed to load summary. It may not have been generated yet.');
        setLoading(false);
      }
    };

    fetchSummary();
  }, [sessionId, filePath, type]);

  if (loading) {
    return <Loader text={`Loading ${type} summary...`} />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium mb-3">
        {type === 'file' ? `File Summary: ${filePath?.split('/').pop()}` : 'Codebase Summary'}
      </h3>
      
      <div className="prose max-w-none border-t pt-3">
        <ReactMarkdown>{summary}</ReactMarkdown>
      </div>
    </div>
  );
};

export default SummaryViewer;