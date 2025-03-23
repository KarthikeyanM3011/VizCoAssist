import api from './index';

/**
 * Get the current status of a session
 * @param {string} sessionId - The session ID
 * @returns {Promise} - The session status data
 */
export const getSessionStatus = async (sessionId) => {
  try {
    const response = await api.get(`/sessions/${sessionId}/status`);
    return response.data;
  } catch (error) {
    console.error('Error getting session status:', error);
    throw error;
  }
};

/**
 * Get all data for a session
 * @param {string} sessionId - The session ID
 * @returns {Promise} - All session data including diagrams and summaries
 */
export const getSessionData = async (sessionId) => {
  try {
    const response = await api.get(`/sessions/${sessionId}/data`);
    return response.data;
  } catch (error) {
    console.error('Error getting session data:', error);
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
 * Get chatbot initialization progress
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