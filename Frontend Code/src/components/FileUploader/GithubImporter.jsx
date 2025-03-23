import React, { useState } from 'react';
import { uploadGithubRepo } from '../../api/uploadApi';

const GithubImporter = ({ onSuccess, setIsLoading, setError }) => {
  const [githubUrl, setGithubUrl] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!githubUrl) {
      setError('Please enter a GitHub repository URL');
      return;
    }
    
    // Simple URL validation
    if (!githubUrl.match(/^https?:\/\/github\.com\/[^\/]+\/[^\/]+\/?.*$/i)) {
      setError('Please enter a valid GitHub repository URL');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await uploadGithubRepo(githubUrl);
      
      setIsLoading(false);
      onSuccess(response);
    } catch (error) {
      setIsLoading(false);
      setError(error.response?.data?.detail || 'Error importing GitHub repository');
      console.error('GitHub import error:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="github-importer">
      <div className="input-group">
        <label htmlFor="github-url" className="input-label">
          GitHub Repository URL
        </label>
        <div className="input-container">
          <div className="input-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <input
            id="github-url"
            type="text"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/username/repository"
            className="text-input"
          />
        </div>
        <p className="input-hint">
          Enter the full URL to a GitHub repository
        </p>
      </div>
      
      <div className="example-box">
        <div className="example-header">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M13 16H12V12H11M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>Example URLs</span>
        </div>
        <ul className="example-list">
          <li>https://github.com/username/repository</li>
          <li>https://github.com/facebook/react</li>
          <li>https://github.com/tensorflow/tensorflow</li>
        </ul>
      </div>
      
      <button 
        type="submit"
        disabled={!githubUrl}
        className={`submit-button ${!githubUrl ? 'disabled' : ''}`}
      >
        <span className="button-text">Import and Analyze</span>
        <span className="button-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>
    </form>
  );
};

export default GithubImporter;