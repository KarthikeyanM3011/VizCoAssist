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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="github-url" className="block text-sm font-medium text-gray-700 mb-1">
          GitHub Repository URL
        </label>
        <input
          id="github-url"
          type="text"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          placeholder="https://github.com/username/repository"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Enter the full URL to a GitHub repository
        </p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-gray-700">Example URLs:</h3>
        <ul className="mt-1 text-xs text-gray-600 space-y-1">
          <li>https://github.com/username/repository</li>
          <li>https://github.com/facebook/react</li>
        </ul>
      </div>
      
      <button 
        type="submit"
        disabled={!githubUrl}
        className={`w-full py-2 px-4 rounded transition-colors ${
          !githubUrl 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        Import and Analyze
      </button>
    </form>
  );
};

export default GithubImporter;