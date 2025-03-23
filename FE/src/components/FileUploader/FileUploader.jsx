import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ZipUploader from './ZipUploader';
import GithubImporter from './GithubImporter';
import { useSession } from '../../hooks/useSession';

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
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Upload Your Codebase</h2>
      
      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button 
            className={`py-2 px-4 font-medium ${uploadMethod === 'zip' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
            onClick={() => setUploadMethod('zip')}
          >
            Upload ZIP
          </button>
          <button 
            className={`py-2 px-4 font-medium ${uploadMethod === 'github' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
            onClick={() => setUploadMethod('github')}
          >
            Import from GitHub
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
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
      
      {isLoading && (
        <div className="mt-4 flex justify-center">
          <div className="animate-pulse text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-opacity-50 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">
              {uploadMethod === 'zip' ? 'Uploading and extracting ZIP...' : 'Downloading repository...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;