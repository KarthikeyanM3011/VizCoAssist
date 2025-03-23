import React, { createContext, useState, useEffect } from 'react';

// Create context
export const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  // State for the active session
  const [session, setSession] = useState(() => {
    // Try to load from localStorage on initial render
    const savedSession = localStorage.getItem('vizcoassist_session');
    return savedSession ? JSON.parse(savedSession) : null;
  });

  // List of recent sessions
  const [recentSessions, setRecentSessions] = useState(() => {
    const savedRecentSessions = localStorage.getItem('vizcoassist_recent_sessions');
    return savedRecentSessions ? JSON.parse(savedRecentSessions) : [];
  });

  // Save session to localStorage when it changes
  useEffect(() => {
    if (session) {
      localStorage.setItem('vizcoassist_session', JSON.stringify(session));
      
      // Update recent sessions list
      const isExisting = recentSessions.some(s => s.id === session.id);
      
      if (!isExisting) {
        const updatedRecentSessions = [
          session,
          ...recentSessions.filter(s => s.id !== session.id)
        ].slice(0, 5); // Keep only 5 most recent sessions
        
        setRecentSessions(updatedRecentSessions);
        localStorage.setItem('vizcoassist_recent_sessions', JSON.stringify(updatedRecentSessions));
      }
    }
  }, [session, recentSessions]);

  // Function to update the current session
  const updateSession = (sessionData) => {
    setSession(prev => ({
      ...prev,
      ...sessionData,
      lastUpdated: new Date().toISOString()
    }));
  };

  // Function to clear the current session
  const clearSession = () => {
    setSession(null);
    localStorage.removeItem('vizcoassist_session');
  };

  // Function to switch to a different session
  const switchSession = (sessionId) => {
    const sessionToSwitch = recentSessions.find(s => s.id === sessionId);
    if (sessionToSwitch) {
      setSession(sessionToSwitch);
    }
  };

  // Function to remove a session from recent sessions
  const removeRecentSession = (sessionId) => {
    const updatedRecentSessions = recentSessions.filter(s => s.id !== sessionId);
    setRecentSessions(updatedRecentSessions);
    localStorage.setItem('vizcoassist_recent_sessions', JSON.stringify(updatedRecentSessions));
    
    // If the current session is being removed, clear it
    if (session && session.id === sessionId) {
      clearSession();
    }
  };

  // Create the context value object
  const contextValue = {
    session,
    setSession,
    updateSession,
    clearSession,
    recentSessions,
    switchSession,
    removeRecentSession
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};

export default SessionProvider;