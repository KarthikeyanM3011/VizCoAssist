import api from './index';

/**
 * Initialize the chatbot for a session
 * @param {string} sessionId - The session ID
 * @returns {Promise} - The initialization status
 */
export const initializeChatbot = async (sessionId) => {
  try {
    const response = await api.post(`/sessions/${sessionId}/chatbot/initialize`);
    return response.data;
  } catch (error) {
    console.error('Error initializing chatbot:', error);
    throw error;
  }
};

/**
 * Get the chatbot initialization progress
 * @param {string} sessionId - The session ID
 * @returns {Promise} - The initialization progress data
 */
export const getChatbotInitProgress = async (sessionId) => {
  try {
    const response = await api.get(`/sessions/${sessionId}/chatbot/initialize/progress`);
    return response.data;
  } catch (error) {
    console.error('Error getting chatbot initialization progress:', error);
    throw error;
  }
};

/**
 * Send a query to the chatbot
 * @param {string} sessionId - The session ID
 * @param {string} query - The question to ask the chatbot
 * @returns {Promise} - The chatbot response
 */
export const sendChatbotQuery = async (sessionId, query) => {
  try {
    // Create form data for the query
    const formData = new FormData();
    formData.append('query', query);
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    
    const response = await api.post(`/sessions/${sessionId}/chatbot/query`, formData, config);
    return response.data;
  } catch (error) {
    console.error('Error sending chatbot query:', error);
    throw error;
  }
};

/**
 * Get the chat history for a session
 * @param {string} sessionId - The session ID
 * @returns {Promise} - The chat history data
 */
export const getChatHistory = async (sessionId) => {
  try {
    const response = await api.get(`/sessions/${sessionId}/chatbot/history`);
    return response.data;
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw error;
  }
};

/**
 * Check if the chatbot is initialized
 * @param {string} sessionId - The session ID
 * @returns {Promise<boolean>} - Whether the chatbot is initialized
 */
export const isChatbotInitialized = async (sessionId) => {
  try {
    const progress = await getChatbotInitProgress(sessionId);
    return progress.initialized && progress.status === 'completed';
  } catch (error) {
    console.error('Error checking chatbot initialization:', error);
    return false;
  }
};