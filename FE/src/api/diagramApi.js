import api from './index';

/**
 * Generate architecture diagrams for a codebase
 * @param {string} sessionId - The session ID
 * @param {string} diagramType - The type of diagram to generate (mermaid or plantuml)
 * @returns {Promise} - The diagram generation status
 */
export const generateArchitectureDiagrams = async (sessionId, diagramType = 'mermaid') => {
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
 * Get the diagrams data from a session
 * @param {string} sessionId - The session ID
 * @returns {Promise} - The diagrams data including high and low level diagrams
 */
export const getDiagrams = async (sessionId) => {
  try {
    const sessionData = await api.get(`/sessions/${sessionId}/data`);
    return sessionData.data.diagrams || { error: "No diagrams available" };
  } catch (error) {
    console.error('Error getting diagrams:', error);
    throw error;
  }
};

/**
 * Get a specific diagram by type and level
 * @param {string} sessionId - The session ID
 * @param {string} level - The diagram level (high_level or low_level)
 * @returns {Promise} - The specific diagram data
 */
export const getDiagramByLevel = async (sessionId, level) => {
  try {
    const diagrams = await getDiagrams(sessionId);
    if (diagrams && diagrams[level]) {
      return diagrams[level];
    }
    throw new Error(`Diagram of level ${level} not found`);
  } catch (error) {
    console.error(`Error getting ${level} diagram:`, error);
    throw error;
  }
};

/**
 * Check if diagram generation is in progress
 * @param {string} sessionId - The session ID
 * @returns {Promise<boolean>} - True if generation is in progress
 */
export const isDiagramGenerationInProgress = async (sessionId) => {
  try {
    const response = await api.get(`/sessions/${sessionId}/status`);
    return response.data.status === 'generating_diagrams';
  } catch (error) {
    console.error('Error checking diagram generation status:', error);
    throw error;
  }
};