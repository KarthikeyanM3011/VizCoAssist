import React, { useState, useEffect } from 'react';
import { getFilesAccessed } from '../../api/analysisApi';
import Loader from '../common/Loader';

const FileList = ({ sessionId, onFileSelect, selectedFile }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({});

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        const response = await getFilesAccessed(sessionId);
        setFiles(response.processed_files || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to load files');
        setLoading(false);
        console.error('Error loading files:', err);
      }
    };

    fetchFiles();
  }, [sessionId]);

  // Organize files into folder structure
  const organizeFileTree = () => {
    const tree = {};
    
    files.forEach(file => {
      const filePath = typeof file === 'string' ? file : file.path;
      if (!filePath) return;
      
      const parts = filePath.split('/');
      let current = tree;
      
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
      
      const fileName = parts[parts.length - 1];
      current[fileName] = filePath;
    });
    
    return tree;
  };

  const toggleFolder = (path) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const renderFileTree = (node, path = "", depth = 0) => {
    if (typeof node === 'string') {
      // This is a file
      if (searchTerm && !node.toLowerCase().includes(searchTerm.toLowerCase())) {
        return null;
      }
      
      const fileName = node.split('/').pop();
      
      return (
        <div 
          key={node}
          className={`pl-${depth * 4} py-1 cursor-pointer hover:bg-gray-100 ${selectedFile === node ? 'bg-blue-100' : ''}`}
          onClick={() => onFileSelect(node)}
        >
          <span className="text-gray-800">📄 {fileName}</span>
        </div>
      );
    }
    
    // This is a folder
    const entries = Object.entries(node);
    
    if (searchTerm) {
      // If searching, only show folders that have matching files
      const hasMatchingFiles = entries.some(([name, value]) => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return renderFileTree(value, `${path}/${name}`, depth + 1) !== null;
      });
      
      if (!hasMatchingFiles) {
        return null;
      }
    }
    
    return (
      <div key={path}>
        {path && (
          <div 
            className={`pl-${depth * 4} py-1 cursor-pointer hover:bg-gray-100 font-medium flex items-center`}
            onClick={() => toggleFolder(path)}
          >
            <span className="mr-1">{expandedFolders[path] ? '📂' : '📁'}</span>
            <span>{path.split('/').pop()}</span>
          </div>
        )}
        
        {(!path || expandedFolders[path]) && (
          <div className="ml-4">
            {entries.map(([name, value]) => {
              const newPath = path ? `${path}/${name}` : name;
              return renderFileTree(value, newPath, depth + 1);
            })}
          </div>
        )}
      </div>
    );
  };

  const fileTree = organizeFileTree();

  if (loading) {
    return <Loader text="Loading files..." />;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-3 border-b bg-gray-50">
        <input
          type="text"
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      
      <div className="overflow-y-auto max-h-[500px] p-2">
        {files.length === 0 ? (
          <div className="text-gray-500 text-center py-4">No files found</div>
        ) : (
          renderFileTree(fileTree)
        )}
      </div>
    </div>
  );
};

export default FileList;