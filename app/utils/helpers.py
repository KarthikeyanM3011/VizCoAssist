from pathlib import Path
import re
import uuid
from datetime import datetime
import logging

def generate_unique_id(prefix: str = "") -> str:
    """Generate a unique ID with timestamp and UUID."""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    unique_id = uuid.uuid4().hex[:6]
    return f"{prefix}_{timestamp}_{unique_id}" if prefix else f"{timestamp}_{unique_id}"

def sanitize_filename(filename: str) -> str:
    """Sanitize a filename by replacing invalid characters."""
    return re.sub(r'[^a-zA-Z0-9_\-]', '_', filename)

def create_unique_filename(base_name: str, extension: str) -> str:
    """Create a unique filename with a timestamp and UUID suffix."""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    unique_id = uuid.uuid4().hex[:6]
    safe_base_name = sanitize_filename(base_name)
    return f"{safe_base_name}_{timestamp}_{unique_id}.{extension}"

def save_to_file(content: str, file_path: Path) -> Path:
    """Save content to a file, creating parent directories if needed."""
    try:
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        logging.info(f"Content saved to {file_path}")
        return file_path
    
    except Exception as e:
        logging.error(f"Error saving content to {file_path}: {e}")
        raise

def should_skip_file(file_path: Path, config) -> bool:
    """
    Determine if a file should be skipped during analysis based on 
    extension, size, or location.
    """
    # Check file extension
    if file_path.suffix.lower() in config.IRRELEVANT_EXTENSIONS:
        return True
    
    # Check if in irrelevant directory
    for part in file_path.parts:
        if part.lower() in config.IRRELEVANT_DIRECTORIES:
            return True
    
    # Check file size if file exists
    if file_path.is_file() and file_path.stat().st_size > config.MAX_FILE_SIZE:
        return True
    
    return False