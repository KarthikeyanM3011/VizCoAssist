import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import SessionProvider from './context/SessionContext';

/**
 * Main Application component
 * Sets up the router and context providers
 */
const App = () => {
  return (
    <Router>
      <SessionProvider>
        <div className="min-h-screen flex flex-col">
          <AppRoutes />
        </div>
      </SessionProvider>
    </Router>
  );
};

export default App;