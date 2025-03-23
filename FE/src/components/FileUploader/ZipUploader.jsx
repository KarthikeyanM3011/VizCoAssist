import React, { useRef, useState } from 'react';
import { uploadZipFile } from '../../api/uploadApi';

const ZipUploader = ({ onSuccess, setIsLoading, setError }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
        setSelectedFile(file);
      } else {
        setError('Please upload a ZIP file');
      }
    }
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please upload a ZIP file');
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a ZIP file to upload');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await uploadZipFile(selectedFile);
      
      setIsLoading(false);
      onSuccess(response);
    } catch (error) {
      setIsLoading(false);
      setError(error.response?.data?.detail || 'Error uploading file');
      console.error('Upload error:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <input 
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".zip"
          onChange={handleFileChange}
        />
        <svg className="w-12 h-12 mx-auto text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="mt-2 text-sm text-gray-600">
          Drag and drop your ZIP file here, or click to select
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Only ZIP files containing codebases are supported
        </p>
      </div>
      
      {selectedFile && (
        <div className="p-3 bg-gray-50 rounded flex items-center justify-between">
          <span className="text-sm text-gray-700">{selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
          <button 
            type="button"
            className="text-red-500 text-sm"
            onClick={() => setSelectedFile(null)}
          >
            Remove
          </button>
        </div>
      )}
      
      <button 
        type="submit"
        disabled={!selectedFile}
        className={`w-full py-2 px-4 rounded transition-colors ${
          !selectedFile 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        Upload and Analyze
      </button>
    </form>
  );
};

export default ZipUploader;