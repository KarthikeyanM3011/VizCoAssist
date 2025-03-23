# """
# Tech stack analysis service for VizCoAssist.

# This module provides functionality to analyze a codebase and identify
# the technologies, frameworks, and languages used. It follows a similar
# approach to the summary generation process that is known to work.
# """

# import logging
# import json
# import os
# import re
# from pathlib import Path
# from collections import Counter, defaultdict
# from typing import Dict, List, Any

# from app.config import LLMConfig
# from app.utils.helpers import save_to_file


# class TechStackAnalyzer:
#     """
#     Service to analyze and identify the technology stack used in a codebase.
#     This follows a similar approach to the code summarization service.
#     """
    
#     # Tech stack analysis prompt
#     TECH_STACK_PROMPT = """
# Analyze the following code file to identify the technologies, frameworks, libraries, and programming languages used:

# File path: {file_path}
# File extension: {file_extension}

# CODE CONTENT:
# {file_content}

# Provide a comprehensive list of all technologies used in or referenced by this file. Include:
# 1. The programming language(s)
# 2. Any frameworks or libraries imported or used
# 3. Any database technologies referenced
# 4. Any APIs or services integrated with
# 5. Any development tools or environments referenced
# 6. Simply list the technologies without any additional explanations
# 7. Do not include technologies that are not directly used in this file
# 8. Do not include common programming languages or technologies that are assumed to be present
# 9. Do add any notable technologies that are evident in the code
# 10. DO NOT LEAVE ANY TECHNOLOGY UNIDENTIFIED from the code

# For each identified technology, provide a brief explanation of how it's being used in this file.

# Your analysis should be factual and based only on what's evident in the code, not assumptions.
# """

#     # System prompt for tech stack analysis
#     SYSTEM_PROMPT = """
# You are a technology stack identification expert. Your task is to analyze code files and identify the technologies, frameworks, libraries, and languages being used.

# - Be precise and specific in your identification
# - Only include technologies that are actually referenced or used in the code
# - Do not make assumptions about technologies that might be used but aren't evident in the file
# - List both the technologies and how they are being used
# - Keep the response concise and to the point

# Your response should only contain the technology identification, with no additional explanations or fluff.
# """

#     # Tech stack aggregation prompt
#     AGGREGATE_PROMPT = """
# Below are the technology analyses for multiple files from a codebase. Aggregate this information to provide a comprehensive overview of the entire codebase's technology stack.

# FILE ANALYSES:
# {file_analyses}

# Based on these individual file analyses, provide a detailed breakdown of the codebase's complete technology stack in the following categories:

# 1. Programming Languages (with approximate percentage of codebase when possible)
# 2. Frontend Technologies
# 3. Backend Technologies
# 4. Database Technologies
# 5. APIs and Services
# 6. DevOps and Infrastructure
# 7. Third-party Libraries and Frameworks
# 8. Development Tools and Environments
# 9. Other Notable Technologies
# 10. AI Technologies

# You can add more categories if needed but ensure that all technologies are accounted for. Do not leave any technology unidentified. Do not include common technologies that are assumed to be present in any codebase.
# For each technology, include evidence of its use and specify which parts of the system it's used in based on the file analyses.
# """

#     # System prompt for aggregation
#     AGGREGATE_SYSTEM_PROMPT = """
# You are a technology stack analysis expert tasked with aggregating individual file analyses into a comprehensive overview of a codebase's technology stack.

# Your response should be organized into clear categories (languages, frontend, backend, etc.) and should provide a high-level understanding of the entire system's architecture and technology choices.

# Focus on being accurate, comprehensive, and insightful. Identify patterns and provide context for how different technologies work together in the system.
# """

#     def __init__(self, codebase_dir: Path, output_dir: Path, session_id: str = None):
#         """
#         Initialize the tech stack analyzer.
        
#         Args:
#             codebase_dir: Directory containing the codebase files
#             output_dir: Directory where analysis results will be saved
#             session_id: Unique session identifier
#         """
#         self.codebase_dir = codebase_dir
#         self.output_dir = output_dir
#         self.session_id = session_id
        
#         # Ensure output directory exists
#         self.output_dir.mkdir(parents=True, exist_ok=True)
        
#         # Create directories for tech stack analyses
#         self.tech_analyses_dir = self.output_dir / "tech_analyses"
#         self.tech_analyses_dir.mkdir(parents=True, exist_ok=True)
        
#         logging.info(f"Initialized tech stack analyzer for {codebase_dir}")
    
#     def analyze_tech_stack(self, file_list=None, codebase_summary=None) -> Dict[str, Any]:
#         """
#         Analyze the tech stack of the codebase using an approach similar to summary generation.
        
#         Args:
#             file_list: List of file information dictionaries (optional)
#             codebase_summary: Summary of the entire codebase (optional)
            
#         Returns:
#             Dictionary containing tech stack analysis
#         """
#         try:
#             # Step 1: Count file extensions for language statistics
#             language_stats = self._analyze_languages(file_list)
#             logging.info(f"Analyzed language statistics: {len(language_stats)} languages found")
            
#             # Step 2: Analyze individual files
#             file_analyses = {}
#             files_to_analyze = self._get_files_to_analyze(file_list)
#             total_files = len(files_to_analyze)
            
#             logging.info(f"Starting tech analysis of {total_files} files")
            
#             for idx, file_info in enumerate(files_to_analyze, 1):
#                 file_path = file_info.get('path', '')
                
#                 if not self._should_analyze_file(file_info):
#                     logging.info(f"Skipping file {file_path} as it's not suitable for analysis")
#                     continue
                
#                 logging.info(f"Analyzing file {idx}/{total_files}: {file_path}")
                
#                 # Get file content
#                 try:
#                     full_path = self.codebase_dir / file_path
#                     with open(full_path, 'r', encoding='utf-8', errors='replace') as f:
#                         file_content = f.read()
                    
#                     # Skip empty files
#                     if not file_content.strip():
#                         logging.info(f"Skipping empty file: {file_path}")
#                         continue
                    
#                     # Generate tech analysis for this file
#                     file_analysis = self._generate_file_tech_analysis(
#                         file_path=file_path,
#                         file_extension=file_info.get('extension', ''),
#                         file_content=file_content
#                     )
                    
#                     if file_analysis:
#                         # Create a safe filename - replace both forward and backslashes with underscores
#                         safe_file_path = file_path.replace('/', '_').replace('\\', '_')
#                         analysis_filename = f"{safe_file_path}_tech.txt"
#                         analysis_path = self.tech_analyses_dir / analysis_filename
#                         save_to_file(file_analysis, analysis_path)
                        
#                         # Add to collection
#                         file_analyses[file_path] = file_analysis
                    
#                 except Exception as e:
#                     logging.error(f"Error analyzing file {file_path}: {e}")
#                     continue
                
#                 # Log progress
#                 if idx % 10 == 0 or idx == total_files:
#                     progress = (idx / total_files) * 100
#                     logging.info(f"Tech analysis progress: {progress:.2f}% ({idx}/{total_files})")
            
#             # Step 3: Save all file analyses to a single file for reference
#             combined_analyses_path = self.output_dir / "file_tech_analyses.json"
#             with open(combined_analyses_path, 'w', encoding='utf-8') as f:
#                 json.dump(file_analyses, f, indent=2)
            
#             logging.info(f"Saved {len(file_analyses)} file technology analyses to {combined_analyses_path}")
            
#             # Step 4: Aggregate the file analyses into a complete tech stack
#             tech_stack = self._aggregate_tech_analyses(file_analyses, language_stats)
            
#             # Step 5: Save the final tech stack analysis
#             tech_stack_path = self.output_dir / "tech_stack_analysis.json"
#             with open(tech_stack_path, 'w', encoding='utf-8') as f:
#                 json.dump(tech_stack, f, indent=2)
            
#             logging.info(f"Tech stack analysis completed and saved to {tech_stack_path}")
            
#             return tech_stack
            
#         except Exception as e:
#             logging.error(f"Error in analyze_tech_stack: {e}")
#             return {
#                 "error": str(e),
#                 "languages": language_stats if 'language_stats' in locals() else {}
#             }
    
#     def _get_files_to_analyze(self, file_list=None) -> List[Dict[str, Any]]:
#         """
#         Get the list of files to analyze.
        
#         Args:
#             file_list: List of file information dictionaries (optional)
            
#         Returns:
#             List of file information dictionaries
#         """
#         if file_list:
#             return file_list
        
#         # If no file list is provided, scan the codebase directory
#         result = []
#         for root, _, files in os.walk(self.codebase_dir):
#             for file in files:
#                 file_path = Path(root) / file
#                 try:
#                     relative_path = file_path.relative_to(self.codebase_dir)
                    
#                     # Skip very large files and binary files
#                     if file_path.stat().st_size > 1024 * 1024:  # 1MB limit
#                         continue
                        
#                     # Skip files that are likely to be binary or irrelevant
#                     _, ext = os.path.splitext(file)
#                     if ext.lower() in ['.zip', '.exe', '.dll', '.so', '.jpg', '.png', '.gif', '.pdf']:
#                         continue
                    
#                     result.append({
#                         'path': str(relative_path),
#                         'extension': ext.lower(),
#                         'size': file_path.stat().st_size
#                     })
#                 except Exception as e:
#                     logging.error(f"Error processing file {file_path}: {e}")
        
#         return result
    
#     def _should_analyze_file(self, file_info: Dict[str, Any]) -> bool:
#         """
#         Determine if a file should be analyzed.
        
#         Args:
#             file_info: File information dictionary
            
#         Returns:
#             True if the file should be analyzed, False otherwise
#         """
#         # Skip very large files
#         if file_info.get('size', 0) > 500 * 1024:  # 500KB
#             return False
            
#         # Skip binary and media files
#         ext = file_info.get('extension', '').lower()
#         if ext in ['.exe', '.dll', '.so', '.pyc', '.jpg', '.png', '.gif', 
#                    '.mp3', '.mp4', '.zip', '.tar', '.gz', '.class']:
#             return False
            
#         return True
    
#     def _generate_file_tech_analysis(self, file_path: str, file_extension: str, file_content: str) -> str:
#         """
#         Generate a technology analysis for a single file using the LLM.
        
#         Args:
#             file_path: Path to the file
#             file_extension: File extension
#             file_content: Content of the file
            
#         Returns:
#             Technology analysis text
#         """
#         try:
#             # Prepare the prompt
#             user_prompt = self.TECH_STACK_PROMPT.format(
#                 file_path=file_path,
#                 file_extension=file_extension,
#                 file_content=file_content[:8000]  # Limit to first 8000 characters
#             )
            
#             # Call the LLM API
#             logging.info(f"Calling LLM API for file {file_path}")
#             analysis = self._call_llm_api(user_prompt, self.SYSTEM_PROMPT, LLMConfig.DIAGRAM_MODEL)
            
#             if not analysis.strip():
#                 logging.warning(f"Empty analysis for file {file_path}")
#                 return f"No technology analysis available for {file_path}"
                
#             return analysis
            
#         except Exception as e:
#             logging.error(f"Error generating tech analysis for {file_path}: {e}")
#             return f"Error analyzing file: {e}"
    
#     def _aggregate_tech_analyses(self, file_analyses: Dict[str, str], language_stats: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
#         """
#         Aggregate the file-level tech analyses into a codebase-level tech stack.
        
#         Args:
#             file_analyses: Dictionary mapping file paths to their tech analyses
#             language_stats: Dictionary mapping languages to statistics
            
#         Returns:
#             Dictionary containing the aggregated tech stack
#         """
#         try:
#             # If no file analyses, return basic language stats
#             if not file_analyses:
#                 logging.warning("No file analyses to aggregate")
#                 return {
#                     "languages": {
#                         lang: {
#                             "percentage": stats["percentage"],
#                             "confidence": "High",
#                             "evidence": f"{stats['count']} files with extension(s) {', '.join(stats['extensions'])}"
#                         }
#                         for lang, stats in language_stats.items()
#                     }
#                 }
            
#             # Prepare the file analyses for the aggregation prompt
#             file_analyses_text = "\n\n".join([
#                 f"FILE: {file_path}\nANALYSIS: {analysis}"
#                 for file_path, analysis in list(file_analyses.items())[:50]  # Limit to 50 files
#             ])
            
#             # Prepare the aggregation prompt
#             aggregation_prompt = self.AGGREGATE_PROMPT.format(
#                 file_analyses=file_analyses_text
#             )
            
#             # Call the LLM API for aggregation
#             logging.info("Calling LLM API for tech stack aggregation")
#             aggregated_analysis = self._call_llm_api(
#                 aggregation_prompt, 
#                 self.AGGREGATE_SYSTEM_PROMPT,
#                 LLMConfig.DIAGRAM_MODEL
#             )
            
#             # Parse the aggregated analysis into a structured format
#             # This is a simple approach - the output is meant to be read by humans
#             tech_stack = self._parse_aggregated_analysis(aggregated_analysis, language_stats)
            
#             return tech_stack
            
#         except Exception as e:
#             logging.error(f"Error aggregating tech analyses: {e}")
#             return {
#                 "error": str(e),
#                 "languages": {
#                     lang: {
#                         "percentage": stats["percentage"],
#                         "confidence": "High",
#                         "evidence": f"{stats['count']} files with extension(s) {', '.join(stats['extensions'])}"
#                     }
#                     for lang, stats in language_stats.items()
#                 }
#             }
    
#     def _parse_aggregated_analysis(self, analysis_text: str, language_stats: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
#         """
#         Parse the aggregated analysis text into a structured format.
        
#         Args:
#             analysis_text: Aggregated analysis text from LLM
#             language_stats: Dictionary mapping languages to statistics
            
#         Returns:
#             Dictionary containing structured tech stack
#         """
#         # Initialize categories
#         tech_stack = {
#             "languages": {},
#             "frontend": {},
#             "backend": {},
#             "database": {},
#             "api": {},
#             "devops": {},
#             "ml_ai": {},
#             "testing": {},
#             "mobile": {},
#             "other": {}
#         }
        
#         # Add language statistics
#         for lang, stats in language_stats.items():
#             if stats["percentage"] > 0:
#                 tech_stack["languages"][lang] = {
#                     "percentage": stats["percentage"],
#                     "confidence": "High",
#                     "evidence": f"{stats['count']} files with extension(s) {', '.join(stats['extensions'])}"
#                 }
        
#         # Extract sections from the analysis
#         sections = {
#             "frontend": "frontend|ui|client|web",
#             "backend": "backend|server|service",
#             "database": "database|db|data",
#             "api": "api|rest|graphql",
#             "devops": "devops|infrastructure|deployment|ci/cd",
#             "ml_ai": "ml|ai|machine learning|artificial intelligence",
#             "testing": "testing|test|qa",
#             "mobile": "mobile|android|ios"
#         }
        
#         current_section = "other"
        
#         # Process the analysis line by line
#         for line in analysis_text.split("\n"):
#             line = line.strip()
#             if not line:
#                 continue
                
#             # Check if this line starts a new section
#             for section, patterns in sections.items():
#                 pattern_regex = f"^.*({patterns}).*$"
#                 if re.search(pattern_regex, line.lower()):
#                     current_section = section
#                     break
            
#             # Extract technology mentions (simplistic approach)
#             # Look for lines that mention technologies with some evidence
#             tech_match = re.search(r"^[*-]?\s*([A-Za-z0-9_\+\.\-]+)(?:\s*[:–-]\s*|\s+–\s+|\s+-)?\s*(.*)?$", line)
#             if tech_match:
#                 tech_name = tech_match.group(1).strip()
#                 evidence = tech_match.group(2).strip() if tech_match.group(2) else f"Mentioned in {current_section} section"
                
#                 # Skip if it's just a heading or common word
#                 common_words = ["languages", "technologies", "frameworks", "libraries", "tools"]
#                 if tech_name.lower() in common_words:
#                     continue
                    
#                 # Add to the appropriate section
#                 if current_section in tech_stack:
#                     tech_stack[current_section][tech_name] = {
#                         "confidence": "Medium",
#                         "evidence": evidence
#                     }
        
#         # Add "None identified" for empty categories
#         for category in tech_stack:
#             if category != "languages" and not tech_stack[category]:
#                 tech_stack[category]["None identified"] = {
#                     "confidence": "High",
#                     "evidence": "No technologies of this type identified in the codebase"
#                 }
        
#         return tech_stack
    
#     def _analyze_languages(self, file_list=None) -> Dict[str, Dict[str, Any]]:
#         """
#         Analyze the programming languages used in the codebase based on file extensions.
        
#         Args:
#             file_list: List of file information dictionaries (optional)
            
#         Returns:
#             Dictionary mapping languages to statistics
#         """
#         logging.info("Analyzing language statistics based on file extensions")
        
#         # If file list is provided, use it
#         if file_list:
#             extensions = [item.get('extension', '').lower() for item in file_list]
#         # Otherwise, scan the codebase directory
#         else:
#             extensions = []
#             for root, _, files in os.walk(self.codebase_dir):
#                 for file in files:
#                     _, ext = os.path.splitext(file)
#                     if ext:
#                         extensions.append(ext.lower())
        
#         # Count extensions
#         extension_counter = Counter(extensions)
#         total_files = sum(extension_counter.values())
        
#         logging.info(f"Found {len(extension_counter)} different file extensions across {total_files} files")
        
#         # Map extensions to languages and calculate percentages
#         language_map = self._map_extensions_to_languages()
#         language_stats = defaultdict(lambda: {'count': 0, 'extensions': set(), 'percentage': 0})
        
#         for ext, count in extension_counter.items():
#             lang = language_map.get(ext, 'Other')
#             language_stats[lang]['count'] += count
#             language_stats[lang]['extensions'].add(ext)
        
#         # Calculate percentages
#         if total_files > 0:
#             for lang in language_stats:
#                 language_stats[lang]['percentage'] = round(
#                     (language_stats[lang]['count'] / total_files) * 100, 1
#                 )
#                 language_stats[lang]['extensions'] = list(language_stats[lang]['extensions'])
        
#         logging.info(f"Identified {len(language_stats)} programming languages")
        
#         return dict(language_stats)
    
#     def _map_extensions_to_languages(self) -> Dict[str, str]:
#         """
#         Map file extensions to programming languages.
        
#         Returns:
#             Dictionary mapping file extensions to language names
#         """
#         return {
#             '.py': 'Python',
#             '.js': 'JavaScript',
#             '.ts': 'TypeScript',
#             '.jsx': 'JavaScript',
#             '.tsx': 'TypeScript',
#             '.java': 'Java',
#             '.c': 'C',
#             '.cpp': 'C++',
#             '.cs': 'C#',
#             '.go': 'Go',
#             '.rb': 'Ruby',
#             '.php': 'PHP',
#             '.swift': 'Swift',
#             '.kt': 'Kotlin',
#             '.rs': 'Rust',
#             '.scala': 'Scala',
#             '.html': 'HTML',
#             '.css': 'CSS',
#             '.scss': 'SCSS',
#             '.sass': 'SASS',
#             '.less': 'LESS',
#             '.json': 'JSON',
#             '.xml': 'XML',
#             '.yaml': 'YAML',
#             '.yml': 'YAML',
#             '.md': 'Markdown',
#             '.sql': 'SQL',
#             '.sh': 'Shell',
#             '.bat': 'Batch',
#             '.ps1': 'PowerShell',
#             '.r': 'R',
#             '.dart': 'Dart',
#             '.lua': 'Lua',
#             '.pl': 'Perl',
#             '.groovy': 'Groovy',
#             '.elm': 'Elm',
#             '.ex': 'Elixir',
#             '.exs': 'Elixir',
#             '.erl': 'Erlang',
#             '.fs': 'F#',
#             '.fsx': 'F#',
#             '.hs': 'Haskell',
#             '.jl': 'Julia',
#             '.clj': 'Clojure',
#             '.vue': 'Vue',
#             '.svelte': 'Svelte',
#             '.asm': 'Assembly',
#             '.cmake': 'CMake',
#             '.dockerfile': 'Dockerfile',
#             '.tf': 'Terraform',
#             '.ipynb': 'Jupyter Notebook',
#         }
    
#     def _call_llm_api(self, user_prompt: str, system_prompt: str, model: str) -> str:
#         """
#         Call the LLM API to generate responses with detailed logging.
        
#         Args:
#             user_prompt: User prompt text
#             system_prompt: System prompt for LLM behavior
#             model: Name of the model to use
            
#         Returns:
#             Generated text from the LLM
#         """
#         import requests
#         import json
        
#         try:
#             logging.debug(f"Calling LLM API with model {model}")
#             logging.debug(f"System prompt: {system_prompt[:100]}...")
#             logging.debug(f"User prompt length: {len(user_prompt)} characters")
            
#             # Prepare the payload
#             payload = {
#                 "model": model,
#                 "prompt": user_prompt,
#                 "system": system_prompt
#             }
            
#             headers = {'Content-Type': 'application/json'}
            
#             # Make the API call with proper exception handling
#             try:
#                 response = requests.post(
#                     LLMConfig.LLM_API_URL,
#                     data=json.dumps(payload),
#                     headers=headers,
#                     stream=True,
#                     timeout=60  # Add timeout
#                 )
                
#                 response.raise_for_status()  # Raise an exception for HTTP errors
                
#             except requests.exceptions.RequestException as e:
#                 logging.error(f"HTTP Request error: {e}")
#                 return ""
            
#             # Read streaming response
#             response_content = ""
            
#             try:
#                 for line in response.iter_lines():
#                     if line:
#                         try:
#                             data = json.loads(line.decode('utf-8'))
#                             if 'response' in data:
#                                 response_content += data['response']
#                             if data.get('done', False):
#                                 break
#                         except json.JSONDecodeError as e:
#                             logging.error(f"JSON decode error: {e}")
#                             logging.debug(f"Line content: {line}")
#                             continue
#             except Exception as e:
#                 logging.error(f"Error reading response stream: {e}")
                
#             if not response_content:
#                 logging.warning("Received empty response from LLM API")
                
#             logging.debug(f"Response length: {len(response_content)} characters")
            
#             return response_content
            
#         except Exception as e:
#             logging.error(f"Unexpected error calling LLM API: {e}")
#             return ""
"""
Tech stack analysis service for VizCoAssist.

This module provides functionality to analyze a codebase and identify
the technologies, frameworks, and languages used. It follows a similar
approach to the summary generation process that is known to work.
"""

import logging
import json
import os
import re
from pathlib import Path
from collections import Counter, defaultdict
from typing import Dict, List, Any, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed
import multiprocessing

from app.config import LLMConfig
from app.utils.helpers import save_to_file


class TechStackAnalyzer:
    """
    Service to analyze and identify the technology stack used in a codebase.
    This follows a similar approach to the code summarization service.
    """
    
    # Tech stack analysis prompt
    TECH_STACK_PROMPT = """
Analyze the following code file to identify the technologies, frameworks, libraries, and programming languages used:

File path: {file_path}
File extension: {file_extension}

CODE CONTENT:
{file_content}

Provide a comprehensive list of all technologies used in or referenced by this file. Include:
1. The programming language(s)
2. Any frameworks or libraries imported or used
3. Any database technologies referenced
4. Simply list the technologies without any additional explanations
5. Do not include technologies that are not directly used in this file
6. Do not include common programming languages or technologies that are assumed to be present
7. Do add any notable technologies that are evident in the code
8. DO NOT LEAVE ANY TECHNOLOGY UNIDENTIFIED from the code

For each identified technology, provide a brief explanation of how it's being used in this file.

Your analysis should be factual and based only on what's evident in the code, not assumptions.
"""


    # System prompt for tech stack analysis
    SYSTEM_PROMPT = """
You are a technology stack identification expert. Your task is to analyze code files and identify the technologies, frameworks, libraries, and languages being used.

- Be precise and specific in your identification
- Only include technologies that are actually referenced or used in the code
- Do not make assumptions about technologies that might be used but aren't evident in the file
- List both the technologies and how they are being used
- Keep the response concise and to the point

Your response should only contain the technology identification, with no additional explanations or fluff.
"""

    # Tech stack aggregation prompt
    AGGREGATE_PROMPT = """
Below are the technology analyses for multiple files from a codebase. Aggregate this information to provide a comprehensive overview of the entire codebase's technology stack.

FILE ANALYSES:
{file_analyses}

Based on these individual file analyses, provide a detailed breakdown of the codebase's complete technology stack in the following categories:

1. Programming Languages (with approximate percentage of codebase when possible)
2. Frontend Technologies
3. Backend Technologies
4. Database Technologies
5. APIs and Services
6. DevOps and Infrastructure
7. Third-party Libraries and Frameworks
8. Development Tools and Environments
9. Other Notable Technologies
10. AI Technologies

You can add more categories if needed but ensure that all technologies are accounted for. Do not leave any technology unidentified. Do not include common technologies that are assumed to be present in any codebase.
For each technology, include evidence of its use and specify which parts of the system it's used in based on the file analyses.
"""

    # System prompt for aggregation
    AGGREGATE_SYSTEM_PROMPT = """
You are a technology stack analysis expert tasked with aggregating individual file analyses into a comprehensive overview of a codebase's technology stack.

Your response should be organized into clear categories (languages, frontend, backend, etc.) and should provide a high-level understanding of the entire system's architecture and technology choices.

Focus on being accurate, comprehensive, and insightful. Identify patterns and provide context for how different technologies work together in the system.
"""

    def __init__(self, codebase_dir: Path, output_dir: Path, session_id: str = None, max_workers: int = None):
        """
        Initialize the tech stack analyzer.
        
        Args:
            codebase_dir: Directory containing the codebase files
            output_dir: Directory where analysis results will be saved
            session_id: Unique session identifier
            max_workers: Maximum number of worker threads to use for parallel processing
                         (defaults to number of CPU cores * 2)
        """
        self.codebase_dir = codebase_dir
        self.output_dir = output_dir
        self.session_id = session_id
        
        # Set default max_workers if not provided
        self.max_workers = max_workers or (multiprocessing.cpu_count() * 2)
        
        # Ensure output directory exists
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Create directories for tech stack analyses
        self.tech_analyses_dir = self.output_dir / "tech_analyses"
        self.tech_analyses_dir.mkdir(parents=True, exist_ok=True)
        
        logging.info(f"Initialized tech stack analyzer for {codebase_dir} with {self.max_workers} workers")
    
    def analyze_tech_stack(self, file_list=None, codebase_summary=None) -> Dict[str, Any]:
        """
        Analyze the tech stack of the codebase using an approach similar to summary generation,
        but with parallel processing for file analysis.
        
        Args:
            file_list: List of file information dictionaries (optional)
            codebase_summary: Summary of the entire codebase (optional)
            
        Returns:
            Dictionary containing tech stack analysis
        """
        import time
        try:
            # Step 1: Count file extensions for language statistics
            language_stats = self._analyze_languages(file_list)
            logging.info(f"Analyzed language statistics: {len(language_stats)} languages found")
            
            # Step 2: Get files to analyze
            files_to_analyze = self._get_files_to_analyze(file_list)
            total_files = len(files_to_analyze)
            
            logging.info(f"Starting parallel tech analysis of {total_files} files with {self.max_workers} workers")
            
            # Step 3: Use ThreadPoolExecutor for parallel processing
            file_analyses = {}
            
            # Filter files that should be analyzed
            filtered_files = [file_info for file_info in files_to_analyze if self._should_analyze_file(file_info)]
            filtered_total = len(filtered_files)
            
            logging.info(f"After filtering, {filtered_total} files will be analyzed")
            
            # Create a progress counter for logging
            processed_files = 0
            
            # with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            #     # Submit all tasks
            #     future_to_file = {
            #         executor.submit(self._process_file, file_info): file_info
            #         for file_info in filtered_files
            #     }
                
            #     # Process results as they complete
            #     for future in as_completed(future_to_file):
            #         file_info = future_to_file[future]
            #         file_path = file_info.get('path', '')
                    
            #         try:
            #             result = future.result()
            #             if result:
            #                 file_path, analysis_path, analysis = result
            #                 file_analyses[file_path] = analysis
            #         except Exception as e:
            #             logging.error(f"Error processing file {file_path}: {e}")
                    
            #         # Update progress
            #         processed_files += 1
            #         if processed_files % 10 == 0 or processed_files == filtered_total:
            #             progress = (processed_files / filtered_total) * 100
            #             logging.info(f"Tech analysis progress: {progress:.2f}% ({processed_files}/{filtered_total})")
            
            with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
                future_to_file = {}

                for i, file_info in enumerate(filtered_files):
                    future = executor.submit(self._process_file, file_info)
                    future_to_file[future] = file_info

                    # Allow the thread pool to process other tasks while waiting
                    if i < len(filtered_files) - 1:  # Avoid unnecessary delay after the last file
                        time.sleep(5)  # Ensures a 5-second gap between submissions

                # Process results as they complete
                for future in as_completed(future_to_file):
                    file_info = future_to_file[future]
                    file_path = file_info.get('path', '')

                    try:
                        result = future.result()
                        if result:
                            file_path, analysis_path, analysis = result
                            file_analyses[file_path] = analysis
                    except Exception as e:
                        logging.error(f"Error processing file {file_path}: {e}")

                    # Update progress
                    processed_files += 1
                    if processed_files % 10 == 0 or processed_files == filtered_total:
                        progress = (processed_files / filtered_total) * 100
                        logging.info(f"Tech analysis progress: {progress:.2f}% ({processed_files}/{filtered_total})")
            # Step 4: Save all file analyses to a single file for reference
            combined_analyses_path = self.output_dir / "file_tech_analyses.json"
            with open(combined_analyses_path, 'w', encoding='utf-8') as f:
                json.dump(file_analyses, f, indent=2)
            
            logging.info(f"Saved {len(file_analyses)} file technology analyses to {combined_analyses_path}")
            
            # Step 5: Aggregate the file analyses into a complete tech stack
            tech_stack = self._aggregate_tech_analyses(file_analyses, language_stats)
            
            # Step 6: Save the final tech stack analysis
            tech_stack_path = self.output_dir / "tech_stack_analysis.json"
            with open(tech_stack_path, 'w', encoding='utf-8') as f:
                json.dump(tech_stack, f, indent=2)
            
            logging.info(f"Tech stack analysis completed and saved to {tech_stack_path}")
            
            return tech_stack
            
        except Exception as e:
            logging.error(f"Error in analyze_tech_stack: {e}")
            return {
                "error": str(e),
                "languages": language_stats if 'language_stats' in locals() else {}
            }
    
    def _process_file(self, file_info: Dict[str, Any]) -> Tuple[str, Path, str]:
        """
        Process a single file for tech stack analysis.
        This method is designed to be run in parallel by ThreadPoolExecutor.
        
        Args:
            file_info: Dictionary containing file information
            
        Returns:
            Tuple of (file_path, analysis_path, analysis_text)
        """
        file_path = file_info.get('path', '')
        
        try:
            # Get file content
            full_path = self.codebase_dir / file_path
            with open(full_path, 'r', encoding='utf-8', errors='replace') as f:
                file_content = f.read()
            
            # Skip empty files
            if not file_content.strip():
                logging.info(f"Skipping empty file: {file_path}")
                return None
            
            # Generate tech analysis for this file
            file_analysis = self._generate_file_tech_analysis(
                file_path=file_path,
                file_extension=file_info.get('extension', ''),
                file_content=file_content
            )
            
            if file_analysis:
                # Create a safe filename - replace both forward and backslashes with underscores
                safe_file_path = file_path.replace('/', '_').replace('\\', '_')
                analysis_filename = f"{safe_file_path}_tech.txt"
                analysis_path = self.tech_analyses_dir / analysis_filename
                save_to_file(file_analysis, analysis_path)
                
                return file_path, analysis_path, file_analysis
            
            return None
            
        except Exception as e:
            logging.error(f"Error processing file {file_path}: {e}")
            return None
    
    def _get_files_to_analyze(self, file_list=None) -> List[Dict[str, Any]]:
        """
        Get the list of files to analyze.
        
        Args:
            file_list: List of file information dictionaries (optional)
            
        Returns:
            List of file information dictionaries
        """
        if file_list:
            return file_list
        
        # If no file list is provided, scan the codebase directory
        result = []
        for root, _, files in os.walk(self.codebase_dir):
            for file in files:
                file_path = Path(root) / file
                try:
                    relative_path = file_path.relative_to(self.codebase_dir)
                    
                    # Skip very large files and binary files
                    if file_path.stat().st_size > 1024 * 1024:  # 1MB limit
                        continue
                        
                    # Skip files that are likely to be binary or irrelevant
                    _, ext = os.path.splitext(file)
                    if ext.lower() in ['.zip', '.exe', '.dll', '.so', '.jpg', '.png', '.gif', '.pdf']:
                        continue
                    
                    result.append({
                        'path': str(relative_path),
                        'extension': ext.lower(),
                        'size': file_path.stat().st_size
                    })
                except Exception as e:
                    logging.error(f"Error processing file {file_path}: {e}")
        
        return result
    
    def _should_analyze_file(self, file_info: Dict[str, Any]) -> bool:
        """
        Determine if a file should be analyzed.
        
        Args:
            file_info: File information dictionary
            
        Returns:
            True if the file should be analyzed, False otherwise
        """
        # Skip very large files
        if file_info.get('size', 0) > 500 * 1024:  # 500KB
            return False
            
        # Skip binary and media files
        ext = file_info.get('extension', '').lower()
        if ext in ['.exe', '.dll', '.so', '.pyc', '.jpg', '.png', '.gif', 
                   '.mp3', '.mp4', '.zip', '.tar', '.gz', '.class']:
            return False
            
        return True
    
    def _generate_file_tech_analysis(self, file_path: str, file_extension: str, file_content: str) -> str:
        """
        Generate a technology analysis for a single file using the LLM.
        
        Args:
            file_path: Path to the file
            file_extension: File extension
            file_content: Content of the file
            
        Returns:
            Technology analysis text
        """
        try:
            # Prepare the prompt
            user_prompt = self.TECH_STACK_PROMPT.format(
                file_path=file_path,
                file_extension=file_extension,
                file_content=file_content[:8000]  # Limit to first 8000 characters
            )
            
            # Call the LLM API
            logging.info(f"Calling LLM API for file {file_path}")
            analysis = self._call_llm_api(user_prompt, self.SYSTEM_PROMPT, LLMConfig.DIAGRAM_MODEL)
            
            if not analysis.strip():
                logging.warning(f"Empty analysis for file {file_path}")
                return f"No technology analysis available for {file_path}"
                
            return analysis
            
        except Exception as e:
            logging.error(f"Error generating tech analysis for {file_path}: {e}")
            return f"Error analyzing file: {e}"
    
    def _aggregate_tech_analyses(self, file_analyses: Dict[str, str], language_stats: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """
        Aggregate the file-level tech analyses into a codebase-level tech stack.
        
        Args:
            file_analyses: Dictionary mapping file paths to their tech analyses
            language_stats: Dictionary mapping languages to statistics
            
        Returns:
            Dictionary containing the aggregated tech stack
        """
        try:
            # If no file analyses, return basic language stats
            if not file_analyses:
                logging.warning("No file analyses to aggregate")
                return {
                    "languages": {
                        lang: {
                            "percentage": stats["percentage"],
                            "confidence": "High",
                            "evidence": f"{stats['count']} files with extension(s) {', '.join(stats['extensions'])}"
                        }
                        for lang, stats in language_stats.items()
                    }
                }
            
            # Prepare the file analyses for the aggregation prompt
            file_analyses_text = "\n\n".join([
                f"FILE: {file_path}\nANALYSIS: {analysis}"
                for file_path, analysis in list(file_analyses.items())[:50]  # Limit to 50 files
            ])
            
            # Prepare the aggregation prompt
            aggregation_prompt = self.AGGREGATE_PROMPT.format(
                file_analyses=file_analyses_text
            )
            
            # Call the LLM API for aggregation
            logging.info("Calling LLM API for tech stack aggregation")
            aggregated_analysis = self._call_llm_api(
                aggregation_prompt, 
                self.AGGREGATE_SYSTEM_PROMPT,
                LLMConfig.DIAGRAM_MODEL
            )
            
            # Parse the aggregated analysis into a structured format
            # This is a simple approach - the output is meant to be read by humans
            tech_stack = self._parse_aggregated_analysis(aggregated_analysis, language_stats)
            
            return tech_stack
            
        except Exception as e:
            logging.error(f"Error aggregating tech analyses: {e}")
            return {
                "error": str(e),
                "languages": {
                    lang: {
                        "percentage": stats["percentage"],
                        "confidence": "High",
                        "evidence": f"{stats['count']} files with extension(s) {', '.join(stats['extensions'])}"
                    }
                    for lang, stats in language_stats.items()
                }
            }
    
    def _parse_aggregated_analysis(self, analysis_text: str, language_stats: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """
        Parse the aggregated analysis text into a structured format.
        
        Args:
            analysis_text: Aggregated analysis text from LLM
            language_stats: Dictionary mapping languages to statistics
            
        Returns:
            Dictionary containing structured tech stack
        """
        # Initialize categories
        tech_stack = {
            "languages": {},
            "frontend": {},
            "backend": {},
            "database": {},
            "api": {},
            "devops": {},
            "ml_ai": {},
            "testing": {},
            "mobile": {},
            "other": {}
        }
        
        # Add language statistics
        for lang, stats in language_stats.items():
            if stats["percentage"] > 0:
                tech_stack["languages"][lang] = {
                    "percentage": stats["percentage"],
                    "confidence": "High",
                    "evidence": f"{stats['count']} files with extension(s) {', '.join(stats['extensions'])}"
                }
        
        # Extract sections from the analysis
        sections = {
            "frontend": "frontend|ui|client|web",
            "backend": "backend|server|service",
            "database": "database|db|data",
            "api": "api|rest|graphql",
            "devops": "devops|infrastructure|deployment|ci/cd",
            "ml_ai": "ml|ai|machine learning|artificial intelligence",
            "testing": "testing|test|qa",
            "mobile": "mobile|android|ios"
        }
        
        current_section = "other"
        
        # Process the analysis line by line
        for line in analysis_text.split("\n"):
            line = line.strip()
            if not line:
                continue
                
            # Check if this line starts a new section
            for section, patterns in sections.items():
                pattern_regex = f"^.*({patterns}).*$"
                if re.search(pattern_regex, line.lower()):
                    current_section = section
                    break
            
            # Extract technology mentions (simplistic approach)
            # Look for lines that mention technologies with some evidence
            tech_match = re.search(r"^[*-]?\s*([A-Za-z0-9_\+\.\-]+)(?:\s*[:–-]\s*|\s+–\s+|\s+-)?\s*(.*)?$", line)
            if tech_match:
                tech_name = tech_match.group(1).strip()
                evidence = tech_match.group(2).strip() if tech_match.group(2) else f"Mentioned in {current_section} section"
                
                # Skip if it's just a heading or common word
                common_words = ["languages", "technologies", "frameworks", "libraries", "tools"]
                if tech_name.lower() in common_words:
                    continue
                    
                # Add to the appropriate section
                if current_section in tech_stack:
                    tech_stack[current_section][tech_name] = {
                        "confidence": "Medium",
                        "evidence": evidence
                    }
        
        # Add "None identified" for empty categories
        for category in tech_stack:
            if category != "languages" and not tech_stack[category]:
                tech_stack[category]["None identified"] = {
                    "confidence": "High",
                    "evidence": "No technologies of this type identified in the codebase"
                }
        
        return tech_stack
    
    def _analyze_languages(self, file_list=None) -> Dict[str, Dict[str, Any]]:
        """
        Analyze the programming languages used in the codebase based on file extensions.
        
        Args:
            file_list: List of file information dictionaries (optional)
            
        Returns:
            Dictionary mapping languages to statistics
        """
        logging.info("Analyzing language statistics based on file extensions")
        
        # If file list is provided, use it
        if file_list:
            extensions = [item.get('extension', '').lower() for item in file_list]
        # Otherwise, scan the codebase directory
        else:
            extensions = []
            for root, _, files in os.walk(self.codebase_dir):
                for file in files:
                    _, ext = os.path.splitext(file)
                    if ext:
                        extensions.append(ext.lower())
        
        # Count extensions
        extension_counter = Counter(extensions)
        total_files = sum(extension_counter.values())
        
        logging.info(f"Found {len(extension_counter)} different file extensions across {total_files} files")
        
        # Map extensions to languages and calculate percentages
        language_map = self._map_extensions_to_languages()
        language_stats = defaultdict(lambda: {'count': 0, 'extensions': set(), 'percentage': 0})
        
        for ext, count in extension_counter.items():
            lang = language_map.get(ext, 'Other')
            language_stats[lang]['count'] += count
            language_stats[lang]['extensions'].add(ext)
        
        # Calculate percentages
        if total_files > 0:
            for lang in language_stats:
                language_stats[lang]['percentage'] = round(
                    (language_stats[lang]['count'] / total_files) * 100, 1
                )
                language_stats[lang]['extensions'] = list(language_stats[lang]['extensions'])
        
        logging.info(f"Identified {len(language_stats)} programming languages")
        
        return dict(language_stats)
    
    def _map_extensions_to_languages(self) -> Dict[str, str]:
        """
        Map file extensions to programming languages.
        
        Returns:
            Dictionary mapping file extensions to language names
        """
        return {
            '.py': 'Python',
            '.js': 'JavaScript',
            '.ts': 'TypeScript',
            '.jsx': 'JavaScript',
            '.tsx': 'TypeScript',
            '.java': 'Java',
            '.c': 'C',
            '.cpp': 'C++',
            '.cs': 'C#',
            '.go': 'Go',
            '.rb': 'Ruby',
            '.php': 'PHP',
            '.swift': 'Swift',
            '.kt': 'Kotlin',
            '.rs': 'Rust',
            '.scala': 'Scala',
            '.html': 'HTML',
            '.css': 'CSS',
            '.scss': 'SCSS',
            '.sass': 'SASS',
            '.less': 'LESS',
            '.json': 'JSON',
            '.xml': 'XML',
            '.yaml': 'YAML',
            '.yml': 'YAML',
            '.md': 'Markdown',
            '.sql': 'SQL',
            '.sh': 'Shell',
            '.bat': 'Batch',
            '.ps1': 'PowerShell',
            '.r': 'R',
            '.dart': 'Dart',
            '.lua': 'Lua',
            '.pl': 'Perl',
            '.groovy': 'Groovy',
            '.elm': 'Elm',
            '.ex': 'Elixir',
            '.exs': 'Elixir',
            '.erl': 'Erlang',
            '.fs': 'F#',
            '.fsx': 'F#',
            '.hs': 'Haskell',
            '.jl': 'Julia',
            '.clj': 'Clojure',
            '.vue': 'Vue',
            '.svelte': 'Svelte',
            '.asm': 'Assembly',
            '.cmake': 'CMake',
            '.dockerfile': 'Dockerfile',
            '.tf': 'Terraform',
            '.ipynb': 'Jupyter Notebook',
        }
    
    def _call_llm_api(self, user_prompt: str, system_prompt: str, model: str) -> str:
        """
        Call the LLM API to generate responses with detailed logging.
        
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
            logging.debug(f"Calling LLM API with model {model}")
            logging.debug(f"System prompt: {system_prompt[:100]}...")
            logging.debug(f"User prompt length: {len(user_prompt)} characters")
            
            # Prepare the payload
            payload = {
                "model": model,
                "prompt": user_prompt,
                "system": system_prompt
            }
            
            headers = {'Content-Type': 'application/json'}
            
            # Make the API call with proper exception handling
            try:
                response = requests.post(
                    LLMConfig.LLM_API_URL,
                    data=json.dumps(payload),
                    headers=headers,
                    stream=True,
                    timeout=60  # Add timeout
                )
                
                response.raise_for_status()  # Raise an exception for HTTP errors
                
            except requests.exceptions.RequestException as e:
                logging.error(f"HTTP Request error: {e}")
                return ""
            
            # Read streaming response
            response_content = ""
            
            try:
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
                            logging.debug(f"Line content: {line}")
                            continue
            except Exception as e:
                logging.error(f"Error reading response stream: {e}")
                
            if not response_content:
                logging.warning("Received empty response from LLM API")
                
            logging.debug(f"Response length: {len(response_content)} characters")
            
            return response_content
            
        except Exception as e:
            logging.error(f"Unexpected error calling LLM API: {e}")
            return ""