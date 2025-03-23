import api from './index';

/**
 * Upload a ZIP file containing a codebase
 * @param {File} file - The ZIP file to upload
 * @returns {Promise} - The upload response with session ID
 */
export const uploadZipFile = async (file) => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    // Set content type to multipart/form-data for file uploads
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    
    const response = await api.post('/upload', formData, config);
    console.log('Upload response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error uploading ZIP file:', error);
    throw error;
  }
};

/**
 * Upload a GitHub repository URL
 * @param {string} githubUrl - The GitHub repository URL
 * @returns {Promise} - The upload response with session ID
 */
export const uploadGithubRepo = async (githubUrl) => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('github_url', githubUrl);
    
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    
    const response = await api.post('/upload/github', formData, config);
    return response.data;
  } catch (error) {
    console.error('Error uploading GitHub repository:', error);
    throw error;
  }
};