import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ZipUploader from './ZipUploader';
import GithubImporter from './GithubImporter';
import { useSession } from '../../hooks/useSession';
import './FileUploader.css';

const FileUploader = () => {
  const [uploadMethod, setUploadMethod] = useState('zip');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setSession } = useSession();
  const navigate = useNavigate();
  
  const handleUploadSuccess = (sessionData) => {
    setSession({
      id: sessionData.session_id,
      status: sessionData.status
    });
    navigate(`/project/${sessionData.session_id}`);
  };
  
  return (
    <div className="uploader-container">
      <div className="uploader-card">
        <div className="card-header">
          <h2>Upload Your Codebase</h2>
          <p className="subtitle">Transform your code into visual insights</p>
        </div>
        
        <div className="upload-tabs">
          <button 
            className={`tab-button ${uploadMethod === 'zip' ? 'active' : ''}`}
            onClick={() => setUploadMethod('zip')}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 2V9H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Upload ZIP
          </button>
          <button 
            className={`tab-button ${uploadMethod === 'github' ? 'active' : ''}`}
            onClick={() => setUploadMethod('github')}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            GitHub Repo
          </button>
        </div>
        
        {error && (
          <div className="error-message">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {error}
          </div>
        )}
        
        <div className="uploader-content">
          {uploadMethod === 'zip' ? (
            <ZipUploader 
              onSuccess={handleUploadSuccess}
              setIsLoading={setIsLoading} 
              setError={setError}
            />
          ) : (
            <GithubImporter 
              onSuccess={handleUploadSuccess}
              setIsLoading={setIsLoading} 
              setError={setError}
            />
          )}
        </div>
        
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="loading-spinner">
                <div className="spinner-inner"></div>
              </div>
              <p className="loading-text">
                {uploadMethod === 'zip' ? 'Uploading and extracting your codebase...' : 'Downloading GitHub repository...'}
              </p>
              <div className="progress-bar">
                <div className="progress-fill"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="background-grid"></div>
      <div className="background-circle circle1"></div>
      <div className="background-circle circle2"></div>
    </div>
  );
};

export default FileUploader;