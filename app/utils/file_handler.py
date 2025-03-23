import os
import zipfile
import logging
import shutil
from pathlib import Path
from typing import Dict, List

from app.config import DataPaths

def extract_zip(zip_file_path: Path, destination_path: Path) -> None:
    """
    Extract a zip file to the destination directory.
    
    Args:
        zip_file_path: Path to the zip file
        destination_path: Directory where the zip file should be extracted
    
    Raises:
        Exception: If extraction fails
    """
    try:
        destination_path.mkdir(parents=True, exist_ok=True)
        
        with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
            # Get total files for logging
            total_files = len(zip_ref.namelist())
            logging.info(f"Extracting {total_files} files from {zip_file_path} to {destination_path}")
            
            # Extract all files
            zip_ref.extractall(destination_path)
        
        logging.info(f"Successfully extracted {zip_file_path} to {destination_path}")
    except Exception as e:
        logging.error(f"Error extracting zip file {zip_file_path}: {e}")
        raise Exception(f"Failed to extract zip file: {e}")

def create_session_directories(session_id: str) -> Dict[str, Path]:
    """
    Create all necessary directories for a new session.
    
    Args:
        session_id: Unique identifier for the session
    
    Returns:
        Dictionary containing paths to all created directories
    """
    session_dirs = DataPaths.get_session_dirs(session_id)
    
    # Create all directories
    for dir_name, dir_path in session_dirs.items():
        dir_path.mkdir(parents=True, exist_ok=True)
        logging.info(f"Created directory: {dir_path}")
    
    return session_dirs

def list_files_in_directory(directory: Path, exclude_dirs: List[str] = None) -> List[str]:
    """
    List all files in a directory recursively, excluding specified directories.
    
    Args:
        directory: Root directory to list files from
        exclude_dirs: List of directory names to exclude
    
    Returns:
        List of relative file paths
    """
    exclude_dirs = exclude_dirs or ['.git', '__pycache__', 'node_modules', 'venv']
    all_files = []
    
    for root, dirs, files in os.walk(directory):
        # Skip excluded directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            file_path = Path(root) / file
            relative_path = file_path.relative_to(directory)
            all_files.append(str(relative_path))
    
    return all_files

def save_processed_file_list(session_id: str, file_list: List[str]) -> Path:
    """
    Save the list of processed files to a file in the session output directory.
    
    Args:
        session_id: Session identifier
        file_list: List of processed file paths
    
    Returns:
        Path to the saved file
    """
    session_dirs = DataPaths.get_session_dirs(session_id)
    output_file = session_dirs["output_dir"] / "processed_files.txt"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        for file_path in file_list:
            f.write(f"{file_path}\n")
    
    return output_file

def get_file_content(file_path: Path) -> str:
    """
    Read and return the content of a file.
    
    Args:
        file_path: Path to the file to read
    
    Returns:
        Content of the file as a string
    
    Raises:
        Exception: If the file cannot be read
    """
    try:
        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            return f.read()
    except Exception as e:
        logging.error(f"Error reading file {file_path}: {e}")
        raise Exception(f"Failed to read file {file_path}: {e}")

def copy_file(source: Path, destination: Path) -> Path:
    """
    Copy a file from source to destination.
    
    Args:
        source: Source file path
        destination: Destination file path
    
    Returns:
        Path to the copied file
    
    Raises:
        Exception: If the file cannot be copied
    """
    try:
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
        return destination
    except Exception as e:
        logging.error(f"Error copying file from {source} to {destination}: {e}")
        raise Exception(f"Failed to copy file: {e}")