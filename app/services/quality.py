"""
Code Quality Analysis Service for VizCoAssist.

This module analyzes code files to evaluate their quality based on various 
criteria such as structure, efficiency, professionalism, and error propensity.
Each file receives a quality score from 0-100, and an overall average score is calculated.
"""

import logging
import json
import os
import re
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
import asyncio
import time
import statistics

from app.config import LLMConfig
from app.utils.helpers import save_to_file


class CodeQualityAnalyzer:
    """
    Service to analyze code quality for individual files and the entire codebase.
    """
    
    # Prompt for analyzing code quality of a single file
    CODE_QUALITY_PROMPT = """
You are an expert code reviewer with deep understanding of software quality metrics. Analyze the following code file and provide a comprehensive code quality assessment.

File path: {file_path}
File extension: {file_extension}

CODE CONTENT:
{file_content}

Evaluate this code based on the following criteria (score each from 0-100):

1. **Structure and Organization** (0-100):
   - Is the code well-structured with clear separation of concerns?
   - Are functions/methods and classes well-organized and of appropriate size?
   - Is there proper modularization?

2. **Code Professionalism** (0-100):
   - Does the code follow consistent formatting and style?
   - Is the naming convention clear, consistent, and descriptive?
   - Are there appropriate comments and documentation?

3. **Error Handling** (0-100):
   - Are potential errors identified and properly handled?
   - Are exceptions used appropriately?
   - Is there proper validation of inputs and defensive programming?

4. **Efficiency** (0-100):
   - Is the code using efficient algorithms and data structures?
   - Are there any performance bottlenecks or inefficient patterns?
   - Is resource usage optimized?

5. **Maintainability** (0-100):
   - How easy would it be for another developer to understand and modify this code?
   - Is there excessive complexity or "code smell"?
   - Is the code DRY (Don't Repeat Yourself)?

6. **Security** (0-100):
   - Are there any obvious security vulnerabilities?
   - Is sensitive data properly handled?
   - Are secure coding practices followed?

For each criterion, provide:
1. A numerical score (0-100)
2. A brief explanation justifying the score
3. Specific examples from the code
4. Suggestions for improvement

Also calculate an overall score, which is a weighted average of all criteria.

FORMAT YOUR RESPONSE AS A JSON OBJECT with this exact structure:
{
  "structure_score": 85,
  "structure_feedback": "Clear organization with...",
  "professionalism_score": 90,
  "professionalism_feedback": "Consistent naming with...",
  "error_handling_score": 75,
  "error_handling_feedback": "Basic error handling but...",
  "efficiency_score": 80,
  "efficiency_feedback": "Generally efficient but...",
  "maintainability_score": 85,
  "maintainability_feedback": "Readable code with...",
  "security_score": 70,
  "security_feedback": "Some potential issues with...",
  "overall_score": 82,
  "summary": "This code demonstrates good structure and organization...",
  "top_suggestions": [
    "Consider adding more comprehensive error handling...",
    "Optimize the loop on line X by...",
    "Add input validation for..."
  ]
}

IMPORTANT: The "overall_score" is a weighted average, not a simple average.
"""

    # System prompt for code quality analysis
    SYSTEM_PROMPT = """
You are an expert code quality analyzer. Your task is to evaluate code files and provide detailed quality assessments as structured JSON.

- Be thorough and critical but fair in your evaluations
- Provide specific evidence from the code to justify your scores
- Ensure your analysis is language-appropriate (e.g., apply Python best practices to Python code)
- Be objective and focus on established quality metrics and patterns
- Provide constructive feedback that would genuinely improve the code quality
- Return ONLY valid JSON matching the specified format
"""

    # Prompt for aggregating individual file analyses into an overall assessment
    AGGREGATE_PROMPT = """
You have analyzed multiple files in a codebase for code quality. Based on these individual file analyses, provide an overall assessment of the entire codebase quality.

Here are the individual file assessments:

{file_assessments}

Provide a comprehensive analysis of the overall code quality with:

1. Average scores across all files for each criterion
2. Overall codebase quality score (weighted average)
3. Identification of consistent strengths across the codebase
4. Identification of consistent weaknesses or areas for improvement
5. General recommendations for improving the codebase quality

FORMAT YOUR RESPONSE AS A JSON OBJECT with this exact structure:
{
  "average_scores": {
    "structure_score": 82.5,
    "professionalism_score": 78.3,
    "error_handling_score": 65.7,
    "efficiency_score": 79.1,
    "maintainability_score": 81.2,
    "security_score": 68.9,
    "overall_score": 76.2
  },
  "codebase_strengths": [
    "Consistent code structure across most files",
    "Good naming conventions throughout the codebase",
    "..."
  ],
  "codebase_weaknesses": [
    "Inconsistent error handling patterns",
    "Several instances of inefficient algorithms in critical paths",
    "..."
  ],
  "key_recommendations": [
    "Implement a standardized error handling framework across the codebase",
    "Review and optimize the identified performance bottlenecks",
    "..."
  ],
  "quality_assessment": "This codebase demonstrates generally good practices with consistent structure..."
}
"""

    # System prompt for aggregate analysis
    AGGREGATE_SYSTEM_PROMPT = """
You are an expert code quality analyst tasked with providing an overall assessment of a codebase based on individual file analyses.

Focus on identifying patterns across the codebase and providing insightful recommendations that would meaningfully improve overall quality.

Your response must be formatted as valid JSON matching the specified structure.
"""

    def __init__(self, codebase_dir: Path, output_dir: Path, session_id: str = None):
        """
        Initialize the code quality analyzer.
        
        Args:
            codebase_dir: Directory containing the codebase files
            output_dir: Directory where quality analyses will be saved
            session_id: Unique session identifier
        """
        self.codebase_dir = codebase_dir
        self.output_dir = output_dir
        self.session_id = session_id
        
        # Ensure output directory exists
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Create directory for quality analyses
        self.quality_analyses_dir = self.output_dir / "quality_analyses"
        self.quality_analyses_dir.mkdir(parents=True, exist_ok=True)
        
        logging.info(f"Initialized code quality analyzer for {codebase_dir}")
    
    def analyze_code_quality(self, file_list=None) -> Dict[str, Any]:
        """
        Analyze the code quality of all relevant files in the codebase.
        
        Args:
            file_list: List of file information dictionaries (optional)
            
        Returns:
            Dictionary containing quality analysis results
        """
        try:
            # Step 1: Get list of files to analyze
            files_to_analyze = self._get_files_to_analyze(file_list)
            total_files = len(files_to_analyze)
            
            logging.info(f"Starting code quality analysis of {total_files} files")
            
            # Step 2: Analyze each file's quality
            file_quality_results = {}
            all_scores = []
            
            for idx, file_info in enumerate(files_to_analyze, 1):
                file_path = file_info.get('path', '')
                
                # Skip files that shouldn't be analyzed for quality
                if not self._should_analyze_file(file_info):
                    logging.info(f"Skipping quality analysis for {file_path}")
                    continue
                
                logging.info(f"Analyzing code quality for file {idx}/{total_files}: {file_path}")
                
                # Analyze file
                try:
                    full_path = self.codebase_dir / file_path
                    with open(full_path, 'r', encoding='utf-8', errors='replace') as f:
                        file_content = f.read()
                    
                    # Skip empty files
                    if not file_content.strip():
                        logging.info(f"Skipping empty file: {file_path}")
                        continue
                    
                    # Analyze file quality
                    quality_result = self._analyze_file_quality(
                        file_path=file_path,
                        file_extension=file_info.get('extension', ''),
                        file_content=file_content
                    )
                    
                    if quality_result:
                        # Save individual file analysis
                        safe_file_path = file_path.replace('/', '_').replace('\\', '_')
                        analysis_filename = f"{safe_file_path}_quality.json"
                        analysis_path = self.quality_analyses_dir / analysis_filename
                        
                        with open(analysis_path, 'w', encoding='utf-8') as f:
                            json.dump(quality_result, f, indent=2)
                        
                        # Add to results dictionary
                        file_quality_results[file_path] = quality_result
                        
                        # Track overall score for this file
                        if 'overall_score' in quality_result:
                            all_scores.append({
                                'file': file_path,
                                'score': quality_result['overall_score']
                            })
                    
                except Exception as e:
                    logging.error(f"Error analyzing quality for file {file_path}: {e}")
                    continue
                
                # Log progress
                if idx % 10 == 0 or idx == total_files:
                    progress = (idx / total_files) * 100
                    logging.info(f"Quality analysis progress: {progress:.2f}% ({idx}/{total_files})")
            
            # Step 3: Calculate overall stats
            overall_quality = self._calculate_overall_quality(file_quality_results)
            
            # Step 4: Save aggregated results
            quality_summary = {
                "file_scores": all_scores,
                "average_score": overall_quality.get("average_scores", {}).get("overall_score", 0),
                "total_files_analyzed": len(file_quality_results),
                "detailed_results": overall_quality
            }
            
            # Save results to file
            summary_path = self.output_dir / "quality_summary.json"
            with open(summary_path, 'w', encoding='utf-8') as f:
                json.dump(quality_summary, f, indent=2)
            
            logging.info(f"Completed code quality analysis of {len(file_quality_results)} files")
            logging.info(f"Average quality score: {quality_summary['average_score']:.2f}")
            
            return quality_summary
            
        except Exception as e:
            logging.error(f"Error in analyze_code_quality: {e}")
            return {
                "error": str(e),
                "file_scores": [],
                "average_score": 0,
                "total_files_analyzed": 0
            }
    
    def _get_files_to_analyze(self, file_list=None) -> List[Dict[str, Any]]:
        """
        Get the list of files to analyze for code quality.
        
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
                    
                    # Skip very large files 
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
        Determine if a file should be analyzed for code quality.
        
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
        
        # Skip non-code files
        code_extensions = [
            '.py', '.js', '.ts', '.java', '.c', '.cpp', '.cs', '.go', '.rb', 
            '.php', '.swift', '.kt', '.rs', '.scala', '.html', '.css', '.jsx',
            '.tsx', '.vue', '.sh', '.ps1', '.pl', '.r', '.dart'
        ]
        
        # Only analyze code files
        return ext in code_extensions
    
    def _analyze_file_quality(self, file_path: str, file_extension: str, file_content: str) -> Dict[str, Any]:
        """
        Analyze the code quality of a single file using the LLM.
        
        Args:
            file_path: Path to the file
            file_extension: File extension
            file_content: Content of the file
            
        Returns:
            Dictionary containing quality analysis for the file
        """
        try:
            # Prepare the prompt
            prompt = self.CODE_QUALITY_PROMPT.format(
                file_path=file_path,
                file_extension=file_extension,
                file_content=file_content[:8000]  # Limit to first 8000 characters
            )
            
            # Call the LLM API
            logging.info(f"Calling LLM API for quality analysis of file {file_path}")
            analysis_text = self._call_llm_api(prompt, self.SYSTEM_PROMPT, LLMConfig.DIAGRAM_MODEL)
            
            # Parse the JSON response
            try:
                analysis = json.loads(analysis_text)
                return analysis
            except json.JSONDecodeError:
                # Try to extract JSON from the response
                match = re.search(r'\{[\s\S]*\}', analysis_text)
                if match:
                    try:
                        return json.loads(match.group(0))
                    except json.JSONDecodeError:
                        pass
                
                logging.warning(f"Failed to parse quality analysis as JSON for {file_path}")
                
                # Create a basic quality result using any numbers we can find
                scores = re.findall(r'(\w+)_score["\s:]+(\d+)', analysis_text)
                result = {
                    "error": "Failed to parse LLM response as JSON",
                    "raw_response": analysis_text[:1000]  # Truncate to avoid huge error messages
                }
                
                # Add any scores we could extract
                for key, score in scores:
                    try:
                        result[f"{key}_score"] = int(score)
                    except ValueError:
                        pass
                
                # Try to extract overall score
                overall_match = re.search(r'overall[_\s]*score["\s:]+(\d+)', analysis_text)
                if overall_match:
                    try:
                        result["overall_score"] = int(overall_match.group(1))
                    except ValueError:
                        # Default fallback score
                        result["overall_score"] = 50
                else:
                    # Default fallback score
                    result["overall_score"] = 50
                
                return result
                
        except Exception as e:
            logging.error(f"Error analyzing quality for {file_path}: {e}")
            return {
                "error": str(e),
                "overall_score": 0
            }
    
    def _calculate_overall_quality(self, file_quality_results: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculate overall code quality metrics across all analyzed files.
        
        Args:
            file_quality_results: Dictionary mapping file paths to quality analyses
            
        Returns:
            Dictionary containing aggregated quality metrics
        """
        if not file_quality_results:
            return {
                "average_scores": {
                    "structure_score": 0,
                    "professionalism_score": 0,
                    "error_handling_score": 0,
                    "efficiency_score": 0,
                    "maintainability_score": 0,
                    "security_score": 0,
                    "overall_score": 0
                },
                "codebase_strengths": [],
                "codebase_weaknesses": [],
                "key_recommendations": [],
                "quality_assessment": "No files were successfully analyzed for code quality."
            }
        
        try:
            # Option 1: Use LLM to aggregate the analyses
            if len(file_quality_results) <= 20:  # Only for reasonable number of files
                # Prepare file analyses for the aggregation prompt
                file_assessments = "\n\n".join([
                    f"File: {file_path}\nAnalysis: {json.dumps(analysis, indent=2)}"
                    for file_path, analysis in list(file_quality_results.items())[:20]
                ])
                
                # Generate aggregate analysis using LLM
                prompt = self.AGGREGATE_PROMPT.format(
                    file_assessments=file_assessments
                )
                
                analysis_text = self._call_llm_api(
                    prompt, 
                    self.AGGREGATE_SYSTEM_PROMPT,
                    LLMConfig.DIAGRAM_MODEL
                )
                
                try:
                    return json.loads(analysis_text)
                except json.JSONDecodeError:
                    # Try to extract JSON
                    match = re.search(r'\{[\s\S]*\}', analysis_text)
                    if match:
                        try:
                            return json.loads(match.group(0))
                        except json.JSONDecodeError:
                            pass
            
            # Option 2: Fallback to basic statistical aggregation
            logging.info("Using statistical aggregation for overall quality metrics")
            
            # Initialize score lists
            scores = {
                "structure_score": [],
                "professionalism_score": [],
                "error_handling_score": [],
                "efficiency_score": [],
                "maintainability_score": [],
                "security_score": [],
                "overall_score": []
            }
            
            # Collect scores from all files
            for file_path, analysis in file_quality_results.items():
                for score_key in scores.keys():
                    if score_key in analysis:
                        try:
                            score_value = float(analysis[score_key])
                            scores[score_key].append(score_value)
                        except (ValueError, TypeError):
                            pass
            
            # Calculate averages
            average_scores = {}
            for score_key, score_list in scores.items():
                if score_list:
                    average_scores[score_key] = round(sum(score_list) / len(score_list), 1)
                else:
                    average_scores[score_key] = 0
            
            # Create basic aggregate analysis
            return {
                "average_scores": average_scores,
                "codebase_strengths": [],
                "codebase_weaknesses": [],
                "key_recommendations": [],
                "quality_assessment": f"Statistical aggregation of {len(file_quality_results)} file analyses."
            }
            
        except Exception as e:
            logging.error(f"Error calculating overall quality: {e}")
            return {
                "error": str(e),
                "average_scores": {
                    "overall_score": 0
                }
            }
    
    def _call_llm_api(self, user_prompt: str, system_prompt: str, model: str) -> str:
        """
        Call the LLM API to generate responses.
        
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
                
            return response_content
            
        except Exception as e:
            logging.error(f"Unexpected error calling LLM API: {e}")
            return ""