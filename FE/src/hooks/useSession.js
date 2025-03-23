import { useContext } from 'react';
import { SessionContext } from '../context/SessionContext';
import { useNavigate } from 'react-router-dom';
import { getSessionStatus } from '../api/sessionApi';

/**
 * Custom hook for session management
 * Provides session data and operations to manipulate it
 */
export const useSession = () => {
  const context = useContext(SessionContext);
  const navigate = useNavigate();

  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }

  const { 
    session, 
    setSession, 
    updateSession, 
    clearSession, 
    recentSessions, 
    switchSession, 
    removeRecentSession 
  } = context;

  /**
   * Check if the current session is valid and navigate to the appropriate page
   */
  const validateSession = async () => {
    if (!session || !session.id) {
      navigate('/');
      return false;
    }

    try {
      const response = await getSessionStatus(session.id);
      
      // Update session status
      updateSession({ status: response.status });
      
      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      
      // If session not found or other error, clear session and navigate to home
      if (error.response && error.response.status === 404) {
        clearSession();
        navigate('/');
      }
      
      return false;
    }
  };

  /**
   * Create a new session from upload response
   */
  const createSession = (sessionData) => {
    console.log('Creating new session:', sessionData);
    setSession({
      id: sessionData.session_id,
      status: sessionData.status,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });

    return sessionData.session_id;
  };

  /**
   * Navigate to a specific section of the current session
   */
  const navigateToSessionPage = (page) => {
    if (!session || !session.id) {
      return;
    }

    navigate(`/project/${session.id}/${page}`);
  };

  return {
    session,
    setSession,
    updateSession,
    clearSession,
    recentSessions,
    switchSession,
    removeRecentSession,
    validateSession,
    createSession,
    navigateToSessionPage
  };
};

export default useSession;