import axios from 'axios';

// Create a base axios instance with the backend URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add authentication headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle global error responses
    if (error.response) {
      // Server responded with an error status
      console.error('API Error Response:', error.response.data);
      
      // Handle specific status codes
      if (error.response.status === 404) {
        // Session not found, etc.
        console.error('Resource not found');
      } else if (error.response.status === 500) {
        console.error('Server error');
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
    } else {
      // Something else happened while setting up the request
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;