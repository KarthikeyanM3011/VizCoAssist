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
    <form onSubmit={handleSubmit} className="zip-uploader">
      <div 
        className={`dropzone ${dragActive ? 'active' : ''} ${selectedFile ? 'has-file' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <input 
          type="file"
          ref={fileInputRef}
          className="hidden-input"
          accept=".zip"
          onChange={handleFileChange}
        />
        
        <div className="dropzone-content">
          <div className="upload-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <div className="upload-text">
            <h3>Drag and drop your ZIP file here</h3>
            <p>or click to browse your files</p>
          </div>
          
          <div className="upload-note">
            <p>Only ZIP files containing codebases are supported</p>
          </div>
        </div>
        
        {selectedFile && (
          <div className="selected-file">
            <div className="file-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="file-info">
              <p className="file-name">{selectedFile.name}</p>
              <p className="file-size">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            <button 
              type="button"
              className="remove-file"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
              }}
            >
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </div>
      
      <button 
        type="submit"
        disabled={!selectedFile}
        className={`submit-button ${!selectedFile ? 'disabled' : ''}`}
      >
        <span className="button-text">Upload and Analyze</span>
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

export default ZipUploader;