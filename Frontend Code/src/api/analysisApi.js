import api from './index';

/**
 * Get the list of files accessed in a session
 * @param {string} sessionId - The session ID
 * @returns {Promise} - The list of processed files
 */
export const getFilesAccessed = async (sessionId) => {
  try {
    const response = await api.get(`/sessions/${sessionId}/getfilesaccessed`);
    return response.data;
  } catch (error) {
    console.error('Error getting files accessed:', error);
    throw error;
  }
};

/**
 * Get the codebase summary for a session
 * @param {string} sessionId - The session ID
 * @returns {Promise} - The codebase summary data
 */
export const getCodebaseSummary = async (sessionId) => {
  try {
    const response = await api.get(`/sessions/${sessionId}/summary`);
    return response.data;
  } catch (error) {
    console.error('Error getting codebase summary:', error);
    throw error;
  }
};

/**
 * Get a summary for a specific file
 * @param {string} sessionId - The session ID
 * @param {string} filePath - The path of the file to summarize
 * @returns {Promise} - The file summary data
 */
// export const getFileSummary = async (sessionId, filePath) => {
//   try {
//     const response = await api.get(`/sessions/${sessionId}/filesummary`, {
//       params: { file_path: filePath }
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error getting file summary:', error);
//     throw error;
//   }
// };

// Add or update this function in src/api/analysisApi.js
export const getFileSummary = async (sessionId, filePath) => {
    try {
      const response = await api.get(`/sessions/${sessionId}/filesummary`, {
        params: { file_path: filePath }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting file summary:', error);
      throw error;
    }
  };

/**
 * Generate architecture diagrams for a codebase
 * @param {string} sessionId - The session ID
 * @param {string} diagramType - The type of diagram to generate (mermaid or plantuml)
 * @returns {Promise} - The diagram generation status
 */
export const generateArchitecture = async (sessionId, diagramType = 'mermaid') => {
  try {
    const response = await api.post(`/sessions/${sessionId}/generatearchitecture`, null, {
      params: { diagram_type: diagramType }
    });
    return response.data;
  } catch (error) {
    console.error('Error generating architecture diagrams:', error);
    throw error;
  }
};

/**
 * Analyze the tech stack of a codebase
 * @param {string} sessionId - The session ID
 * @param {boolean} forceRefresh - Whether to force a refresh of the tech stack analysis
 * @returns {Promise} - The tech stack analysis status or results
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