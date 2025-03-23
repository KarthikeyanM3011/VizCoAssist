"""
Code summarization service for VizCoAssist.

This module provides functionality to generate summaries of code files
and overall architecture using parallel processing for efficiency.
"""

import logging
import json
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
import shelve
from hashlib import md5
import concurrent.futures
from concurrent.futures import ThreadPoolExecutor

from app.config import LLMConfig
from app.utils.helpers import create_unique_filename, save_to_file
from app.readers import get_file_reader


class CodeSummarizer:
    """
    Service to generate summaries of codebase files and overall architecture.
    Uses parallel processing for efficient analysis.
    """
    
    # Updated File Summary Prompt Template (preserved from original)
    FILE_SUMMARY_PROMPT_TEMPLATE = """
Summarize the content of the following file by describing its purpose, functionality, and the key components it contains. The summary should cover:

1. **Purpose**: The main goal or function of the file within the project.
2. **Key Components**: Describe important classes, functions, or modules and their roles.
3. **Data Flow**: Explain how data is processed or manipulated by this file (inputs/outputs).
4. **Dependencies**: List any external or internal libraries, APIs, or other files it interacts with.
5. **Interactions**: Describe how this file communicates with other parts of the system.

Do not include any code generation, feedback, suggestions, or any additional text unrelated to the actual file content. Focus only on factual information from the file content.

**File being summarized**: {file_path}

**File content**:
{file_content}
"""

    # System Prompt for LLM behavior (preserved from original)
    SYSTEM_PROMPT = """
You are a code summarization assistant. Your task is to provide concise, high-level summaries of code files, focusing on their purpose, functionality, and role within the broader project.

- Do not include code snippets or technical details like variable names or function names.
- Do not include any preambles, confirmations, or apologies.
- Do not include any feedback, suggestions, or potential improvements.

Your response should be the summary only.
"""
    
    def __init__(self, codebase_dir: Path, output_dir: Path, cache_dir: Optional[Path] = None, max_workers: int = 10):
        """
        Initialize the code summarizer.
        
        Args:
            codebase_dir: Directory containing the codebase files
            output_dir: Directory where summaries will be saved
            cache_dir: Directory for caching LLM responses (optional)
            max_workers: Maximum number of parallel workers (default: 10)
        """
        self.codebase_dir = codebase_dir
        self.output_dir = output_dir
        self.cache_dir = cache_dir or (output_dir / "cache")
        self.max_workers = max_workers
        
        # Ensure directories exist
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        # Set up summaries directories
        self.summaries_dir = self.output_dir / "summaries"
        self.summaries_dir.mkdir(parents=True, exist_ok=True)
        
        logging.info(f"Initialized code summarizer for {codebase_dir} with {max_workers} parallel workers")
    
    def summarize_codebase(self) -> Dict[str, Any]:
        """
        Summarize all relevant files in the codebase using parallel processing.
        
        Returns:
            Dictionary containing summary information
        """
        file_list_path = self.output_dir / "file_list.json"
        
        if not file_list_path.exists():
            logging.error("File list not found. Run analyzer first.")
            return {"error": "File list not found"}
        
        try:
            # Load file list
            with open(file_list_path, 'r') as f:
                file_list = json.load(f)
            
            total_files = len(file_list)
            logging.info(f"Starting parallel summarization for {total_files} files using {self.max_workers} workers")
            
            combined_summaries = []
            file_summaries = []
            processed_count = 0
            
            # Process multiple files concurrently
            with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                # Create a dictionary to track futures and their corresponding file info
                future_to_file = {
                    executor.submit(self._process_single_file, file_info): file_info
                    for file_info in file_list
                }
                
                # Process results as they complete
                for i, future in enumerate(concurrent.futures.as_completed(future_to_file), 1):
                    file_info = future_to_file[future]
                    file_path = file_info["path"]
                    
                    try:
                        # Get the result from the future
                        result = future.result()
                        
                        if result:
                            summary, summary_path = result
                            
                            # Add to combined summary
                            file_entry = f"Filename: {file_path}\n{summary}\n"
                            combined_summaries.append((file_path, file_entry))  # Store with path for sorting later
                            
                            # Add to file summaries list
                            file_summaries.append({
                                "file_path": file_path,
                                "summary": summary,
                                "summary_file": str(summary_path.relative_to(self.output_dir))
                            })
                            
                            # Update processed status
                            file_info["processed"] = True
                            processed_count += 1
                            
                    except Exception as e:
                        logging.error(f"Error processing file {file_path}: {e}")
                    
                    # Log progress
                    if i % 10 == 0 or i == total_files:
                        progress = (i / total_files) * 100
                        logging.info(f"Progress: {progress:.2f}% ({i}/{total_files})")
            
            # Sort combined summaries to maintain consistent order
            combined_summaries.sort(key=lambda x: x[0])  # Sort by file path
            combined_summary_text = "\n".join([entry for _, entry in combined_summaries])
            
            # Save combined summary
            combined_summary_path = self.output_dir / "combined_summary.txt"
            save_to_file(combined_summary_text, combined_summary_path)
            
            # Update file list with processed status
            with open(file_list_path, 'w') as f:
                json.dump(file_list, f, indent=2)
            
            logging.info(f"Parallel summarization complete. Processed {processed_count}/{total_files} files.")
            
            result = {
                "combined_summary": combined_summary_text,
                "combined_summary_path": str(combined_summary_path),
                "file_summaries": file_summaries,
                "total_files": total_files,
                "processed_files": processed_count
            }
            
            return result
            
        except Exception as e:
            logging.error(f"Error in summarize_codebase: {e}")
            return {"error": str(e)}
    
    def _process_single_file(self, file_info: Dict[str, Any]) -> Optional[Tuple[str, Path]]:
        """
        Process a single file to generate its summary.
        
        Args:
            file_info: Information about the file to process
            
        Returns:
            Tuple containing (summary, summary_path) if successful, None otherwise
        """
        file_path = file_info["path"]
        
        try:
            # Read file content
            full_path = self.codebase_dir / file_path
            reader = get_file_reader(file_info["extension"])
            file_content = reader(full_path)
            
            # Generate summary for this file
            summary = self._generate_file_summary(file_path, file_content)
            
            if summary:
                # Save individual summary
                summary_filename = create_unique_filename(
                    Path(file_path).stem, "txt")
                summary_path = self.summaries_dir / summary_filename
                save_to_file(summary, summary_path)
                
                return summary, summary_path
                
        except Exception as e:
            logging.error(f"Error processing file {file_path}: {e}")
            raise  # Re-raise to be caught by the executor
            
        return None
    
    def _generate_file_summary(self, file_path: str, file_content: str) -> str:
        """
        Generate a summary for a single file using the LLM.
        
        Args:
            file_path: Path to the file (relative to codebase dir)
            file_content: Content of the file
            
        Returns:
            Generated summary text
        """
        # Prepare the prompt
        user_prompt = self.FILE_SUMMARY_PROMPT_TEMPLATE.format(
            file_path=file_path,
            file_content=file_content
        )
        
        # Generate cache key
        cache_key = self._generate_cache_key(
            user_prompt=user_prompt,
            system_prompt=self.SYSTEM_PROMPT,
            model=LLMConfig.SUMMARIZATION_MODEL
        )
        
        # Check cache first
        summary = self._check_cache(cache_key)
        if summary:
            logging.info(f"Cache hit for {file_path}")
            return summary
        
        # Call LLM API
        summary = self._call_llm_api(
            user_prompt=user_prompt,
            system_prompt=self.SYSTEM_PROMPT,
            model=LLMConfig.SUMMARIZATION_MODEL
        )
        
        # Cache the result
        if summary:
            self._update_cache(cache_key, summary)
        
        return summary
    
    def _generate_cache_key(self, user_prompt: str, system_prompt: str, model: str) -> str:
        """Generate a unique hash key for caching purposes."""
        key_string = f"{model}_{system_prompt}_{user_prompt}"
        return md5(key_string.encode()).hexdigest()
    
    def _check_cache(self, cache_key: str) -> Optional[str]:
        """Check if a response is cached and return it if found."""
        try:
            with shelve.open(str(self.cache_dir / 'llm_cache')) as cache:
                if cache_key in cache:
                    return cache[cache_key]
        except Exception as e:
            logging.error(f"Error checking cache: {e}")
        return None
    
    def _update_cache(self, cache_key: str, content: str) -> None:
        """Update the cache with a new response."""
        try:
            with shelve.open(str(self.cache_dir / 'llm_cache')) as cache:
                cache[cache_key] = content
        except Exception as e:
            logging.error(f"Error updating cache: {e}")
    
    def _call_llm_api(self, user_prompt: str, system_prompt: str, model: str) -> str:
        """
        Call the LLM API to generate a response.
        
        Args:
            user_prompt: User prompt text
            system_prompt: System prompt for LLM behavior
            model: Name of the model to use
            
        Returns:
            Generated text from the LLM
        """
        import requests
        import json
        
        try:
            logging.info(f"Calling LLM API with model {model}")
            
            payload = {
                "model": model,
                "prompt": user_prompt,
                "system": system_prompt
            }
            
            headers = {'Content-Type': 'application/json'}
            response = requests.post(
                LLMConfig.LLM_API_URL,
                data=json.dumps(payload),
                headers=headers,
                stream=True
            )
            
            if response.status_code != 200:
                logging.error(f"LLM API error: {response.status_code}")
                logging.debug(f"Response content: {response.text}")
                return ""
            
            # Read streaming response
            response_content = ""
            for line in response.iter_lines():
                if line:
                    try:
                        data = json.loads(line.decode('utf-8'))
                        if 'response' in data:
                            response_content += data['response']
                        if data.get('done', False):
                            break
                    except json.JSONDecodeError as e:
                        logging.error(f"JSON decode error: {e}")
                        continue
            
            return response_content
            
        except Exception as e:
            logging.error(f"Error calling LLM API: {e}")
            return ""