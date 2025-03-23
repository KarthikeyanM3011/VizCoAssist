"""
HTML file reader for the VizCoAssist application.

This module provides functionality for parsing and extracting text from HTML files.
"""

from bs4 import BeautifulSoup
import logging

# File extensions this reader handles
FILE_EXTENSIONS = ['.html', '.htm', '.xhtml']

def read_file(file_path):
    """
    Extract text from an HTML file.
    
    Args:
        file_path: Path to the file to read
        
    Returns:
        Content of the file as a string with HTML tags removed
    """
    try:
        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            html_content = f.read()
        
        # Parse HTML content
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Extract text content
        text = soup.get_text(separator='\n')
        
        return text
        
    except Exception as e:
        logging.error(f"Error reading HTML file {file_path}: {e}")
        return f"Error reading HTML file: {e}"