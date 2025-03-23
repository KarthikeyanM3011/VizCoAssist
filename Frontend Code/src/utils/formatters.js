/**
 * Utility functions for formatting data
 */

/**
 * Format a date to a human-readable string
 * @param {string|Date} date - Date to format
 * @param {object} options - Format options
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, options = {}) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    const formatOptions = { ...defaultOptions, ...options };
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    return dateObj.toLocaleDateString('en-US', formatOptions);
  };
  
  /**
   * Format a file size in bytes to a human-readable string
   * @param {number} bytes - File size in bytes
   * @param {number} decimals - Number of decimal places
   * @returns {string} - Formatted file size
   */
  export const formatFileSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };
  
  /**
   * Format a percentage value
   * @param {number} value - Percentage value (0-100)
   * @param {number} decimals - Number of decimal places
   * @returns {string} - Formatted percentage
   */
  export const formatPercentage = (value, decimals = 1) => {
    return `${parseFloat(value).toFixed(decimals)}%`;
  };
  
  /**
   * Truncate a string to a specified length
   * @param {string} str - String to truncate
   * @param {number} maxLength - Maximum length
   * @returns {string} - Truncated string
   */
  export const truncateString = (str, maxLength = 100) => {
    if (!str || str.length <= maxLength) return str;
    return `${str.substring(0, maxLength)}...`;
  };
  
  /**
   * Format a file path for display
   * @param {string} filePath - File path to format
   * @returns {string} - Formatted file path
   */
  export const formatFilePath = (filePath) => {
    if (!filePath) return '';
    
    // Handle both forward and backslashes
    const normalizedPath = filePath.replace(/\\/g, '/');
    
    // Split path into parts
    const parts = normalizedPath.split('/');
    
    // If the path is short enough, return it as is
    if (normalizedPath.length <= 50) return normalizedPath;
    
    // Otherwise, show the first and last parts
    const fileName = parts[parts.length - 1];
    
    if (parts.length <= 2) return normalizedPath;
    
    // Keep the first part (usually the root directory)
    const firstPart = parts[0];
    
    // If there are several directories, collapse the middle ones
    if (parts.length > 3) {
      return `${firstPart}/.../${fileName}`;
    }
    
    return normalizedPath;
  };
  
  /**
   * Generate a readable project name from a filename
   * @param {string} filename - Uploaded filename
   * @returns {string} - Readable project name
   */
  export const generateProjectName = (filename) => {
    if (!filename) return 'Unnamed Project';
    
    // Remove file extension
    const nameWithoutExt = filename.replace(/\.\w+$/, '');
    
    // Replace hyphens and underscores with spaces
    const nameWithSpaces = nameWithoutExt.replace(/[-_]/g, ' ');
    
    // Capitalize words
    const capitalizedName = nameWithSpaces
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return capitalizedName;
  };
  
  /**
   * Format session status for display
   * @param {string} status - Session status from API
   * @returns {object} - Formatted status with text and color
   */
  export const formatSessionStatus = (status) => {
    switch (status) {
      case 'uploaded':
        return { text: 'Uploaded', color: 'bg-yellow-100 text-yellow-800' };
      case 'analyzing':
        return { text: 'Analyzing', color: 'bg-blue-100 text-blue-800' };
      case 'ready':
        return { text: 'Ready', color: 'bg-green-100 text-green-800' };
      case 'completed':
        return { text: 'Completed', color: 'bg-green-100 text-green-800' };
      case 'generating_diagrams':
        return { text: 'Generating Diagrams', color: 'bg-purple-100 text-purple-800' };
      case 'analyzing_tech_stack':
        return { text: 'Analyzing Tech Stack', color: 'bg-indigo-100 text-indigo-800' };
      case 'error':
        return { text: 'Error', color: 'bg-red-100 text-red-800' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-800' };
    }
  };