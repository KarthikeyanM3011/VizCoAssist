import api from './index';

/**
 * Start tech stack analysis for a codebase
 * @param {string} sessionId - The session ID
 * @param {boolean} forceRefresh - Whether to force a fresh analysis
 * @returns {Promise} - The tech stack analysis initialization status
 */
export const analyzeTechStack = async (sessionId, forceRefresh = false) => {
  try {
    const response = await api.get(`/sessions/${sessionId}/techstack`, {
      params: { force_refresh: forceRefresh }
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing tech stack:', error);
    throw error;
  }
};

/**
 * Get the tech stack analysis progress
 * @param {string} sessionId - The session ID
 * @returns {Promise} - The tech stack analysis progress data
 */
export const getTechStackProgress = async (sessionId) => {
  try {
    const response = await api.get(`/sessions/${sessionId}/techstack/progress`);
    return response.data;
  } catch (error) {
    console.error('Error getting tech stack progress:', error);
    throw error;
  }
};

/**
 * Get the tech stack analysis results
 * @param {string} sessionId - The session ID
 * @returns {Promise} - The complete tech stack analysis data
 */
export const getTechStackResults = async (sessionId) => {
  try {
    const sessionData = await api.get(`/sessions/${sessionId}/data`);
    if (sessionData.data.tech_stack) {
      return sessionData.data.tech_stack;
    }
    throw new Error('Tech stack analysis not available');
  } catch (error) {
    console.error('Error getting tech stack results:', error);
    throw error;
  }
};

/**
 * Get tech stack analysis for a specific file
 * @param {string} sessionId - The session ID
 * @param {string} filePath - The path of the file to analyze
 * @returns {Promise} - The file-specific tech stack analysis
 */
export const getFileTechStack = async (sessionId, filePath) => {
  try {
    const response = await api.get(`/sessions/${sessionId}/filetechstack`, {
      params: { file_path: filePath }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting file tech stack:', error);
    throw error;
  }
};

/**
 * Check if tech stack analysis is complete
 * @param {string} sessionId - The session ID
 * @returns {Promise<boolean>} - Whether the analysis is complete
 */
export const isTechStackAnalysisComplete = async (sessionId) => {
  try {
    const progress = await getTechStackProgress(sessionId);
    return !progress.in_progress && progress.progress === 100;
  } catch (error) {
    console.error('Error checking tech stack analysis completion:', error);
    return false;
  }
};