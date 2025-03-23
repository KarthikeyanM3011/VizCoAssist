
// Loader.jsx
import React from 'react';
import './CommonComponents.css';

const Loader = ({ text = 'Loading...', size = 'medium' }) => {
  const sizeClass = size === 'small' ? 'loader-sm' : size === 'large' ? 'loader-lg' : 'loader-md';
  
  return (
    <div className="cyber-loader">
      <div className={`loader-spinner ${sizeClass}`}>
        <div className="spinner-ring"></div>
        <div className="spinner-circle"></div>
      </div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};

export default Loader;

