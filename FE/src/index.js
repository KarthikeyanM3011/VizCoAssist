import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Add this file for any global CSS

/**
 * Application entry point
 * Renders the App component into the DOM
 */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);