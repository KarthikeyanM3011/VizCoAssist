import os
import logging
from pathlib import Path
from typing import List, Dict, Any

from app.config import FileProcessingConfig
from app.utils.helpers import should_skip_file
from app.readers import get_file_reader

class CodebaseAnalyzer:
    """
    Analyzes a codebase to identify relevant files and their types.
    """
    
    def __init__(self, codebase_dir: Path, output_dir: Path):
        """
        Initialize the analyzer.
        
        Args:
            codebase_dir: Directory containing the codebase
            output_dir: Directory where analysis results will be saved
        """
        self.codebase_dir = codebase_dir
        self.output_dir = output_dir
        self.processed_files = []
        
        # Ensure output directory exists
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        logging.info(f"Initialized analyzer for codebase at {codebase_dir}")
    
    def scan_and_identify_files(self) -> List[Dict[str, Any]]:
        """
        Scan the codebase directory and identify relevant files for analysis.
        
        Returns:
            List of dictionaries containing file information
        """
        all_files = []
        total_files = 0
        skipped_files = 0
        
        logging.info(f"Scanning codebase in {self.codebase_dir}")
        
        for root, dirs, files in os.walk(self.codebase_dir):
            # Skip irrelevant directories
            dirs[:] = [d for d in dirs if d not in FileProcessingConfig.IRRELEVANT_DIRECTORIES]
            
            # Process each file
            for file_name in files:
                total_files += 1
                file_path = Path(root) / file_name
                
                # Skip irrelevant files
                if should_skip_file(file_path, FileProcessingConfig):
                    skipped_files += 1
                    continue
                
                relative_path = file_path.relative_to(self.codebase_dir)
                file_ext = file_path.suffix.lower()
                
                # Find appropriate reader
                reader_name = self._get_reader_name_for_extension(file_ext)
                
                # Add file info to the list
                file_info = {
                    "path": str(relative_path),
                    "extension": file_ext,
                    "reader": reader_name,
                    "size": file_path.stat().st_size,
                }
                
                all_files.append(file_info)
        
        logging.info(f"Found {len(all_files)} relevant files out of {total_files} total files")
        logging.info(f"Skipped {skipped_files} irrelevant files")
        
        # Save the file list to a JSON file
        self._save_file_list(all_files)
        
        return all_files
    
    def _get_reader_name_for_extension(self, extension: str) -> str:
        """
        Get the name of the reader for a specific file extension.
        
        Args:
            extension: File extension (including dot)
            
        Returns:
            Name of the reader to use
        """
        reader = get_file_reader(extension)
        return reader.__module__.split('.')[-1] if reader else "default"
    
    def _save_file_list(self, file_list: List[Dict[str, Any]]) -> None:
        """
        Save the list of files to a JSON file in the output directory.
        
        Args:
            file_list: List of file information dictionaries
        """
        import json
        
        # Create file list file
        file_list_path = self.output_dir / "file_list.json"
        
        with open(file_list_path, 'w', encoding='utf-8') as f:
            json.dump(file_list, f, indent=2)
        
        logging.info(f"Saved file list to {file_list_path}")
    
    def get_file_content(self, file_path: str) -> str:
        """
        Get the content of a file using the appropriate reader.
        
        Args:
            file_path: Path to the file relative to the codebase directory
            
        Returns:
            Content of the file as a string
        """
        full_path = self.codebase_dir / file_path
        file_ext = full_path.suffix.lower()
        
        reader = get_file_reader(file_ext)
        
        try:
            content = reader(full_path)
            return content
        except Exception as e:
            logging.error(f"Error reading file {file_path}: {e}")
            return f"Error reading file: {e}"