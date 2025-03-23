import chardet
import logging

# List of file extensions to handle
FILE_EXTENSIONS = [
    '.txt', '.md', '.py', '.java', '.js', '.ts',
    '.css', '.c', '.cpp', '.h', '.json', '.xml', '.yml', '.yaml', 
    '.conf', '.ini', '.log', '.properties', '.config'
]

def read_file(file_path):
    """
    Read plain text files with automatic encoding detection.
    
    Args:
        file_path: Path to the file to read
        
    Returns:
        Content of the file as a string
    """
    try:
        # First detect the file encoding
        with open(file_path, 'rb') as file:
            raw_data = file.read(10000)  # Read the first 10KB to detect encoding
            result = chardet.detect(raw_data)
            encoding = result['encoding'] if result['encoding'] else 'utf-8'
        
        # Then read the file with the detected encoding
        with open(file_path, 'r', encoding=encoding, errors='replace') as file:
            return file.read()
            
    except Exception as e:
        logging.error(f"Error reading text file {file_path}: {e}")
        return f"Error reading file: {e}"