# """
# Chatbot service for VizCoAssist.

# This module provides a RAG (Retrieval-Augmented Generation) chatbot
# that can answer questions about a codebase using the available analysis data.
# """

# import logging
# import json
# import os
# import re
# from pathlib import Path
# from typing import Dict, List, Any, Optional, Tuple
# import asyncio

# from app.config import LLMConfig
# from app.utils.helpers import save_to_file


# class CodebaseChatbot:
#     """
#     Chatbot service that answers questions about a codebase using
#     analysis data and the LLM.
#     """
    
#     # System prompt for the chatbot
#     SYSTEM_PROMPT = """
# You are a codebase assistant specialized in answering questions about software projects. 
# You have access to information about the structure, purpose, and technologies used in the codebase.
# Your role is to help users understand the codebase by providing insightful and accurate information.

# When answering questions:
# - Focus on the specific codebase and its structure, not general programming concepts
# - Cite evidence from the codebase analysis, summaries, and tech stack information
# - Keep responses concise but detailed enough to be helpful
# - If you don't have enough information, say so clearly
# - Use code examples when relevant, but keep them brief
# - Maintain a helpful, professional tone
# """

#     # Query prompt template
#     QUERY_PROMPT_TEMPLATE = """
# I'm going to provide you with information about a codebase, and I'd like you to answer the following question:

# QUESTION: {query}

# Here's the information I have about this codebase:

# === CODEBASE STRUCTURE ===
# {files_info}

# === CODEBASE SUMMARY ===
# {codebase_summary}

# === TECH STACK INFORMATION ===
# {tech_stack_info}

# === SPECIFIC FILE SUMMARIES ===
# {file_summaries}

# Based on this information, please answer the question thoroughly but concisely. If you need more specific information that isn't provided, please mention that in your response.
# """

#     def __init__(self, codebase_dir: Path, output_dir: Path, session_id: str):
#         """
#         Initialize the codebase chatbot.
        
#         Args:
#             codebase_dir: Directory containing the codebase files
#             output_dir: Directory where chatbot logs will be saved
#             session_id: Unique session identifier
#         """
#         self.codebase_dir = codebase_dir
#         self.output_dir = output_dir
#         self.session_id = session_id
        
#         # Ensure output directory exists
#         self.output_dir.mkdir(parents=True, exist_ok=True)
        
#         # Create a directory for chat logs
#         self.chat_logs_dir = self.output_dir / "chat_logs"
#         self.chat_logs_dir.mkdir(parents=True, exist_ok=True)
        
#         # Initialize chat history
#         self.chat_history = []
        
#         logging.info(f"Initialized codebase chatbot for session {session_id}")
    
#     async def generate_response(self, 
#                           query: str, 
#                           codebase_summary: Optional[str] = None,
#                           tech_stack: Optional[Dict] = None,
#                           files_processed: Optional[List] = None,
#                           file_summaries: Optional[Dict] = None) -> str:
#         """
#         Generate a response to a user query about the codebase.
        
#         Args:
#             query: User's question about the codebase
#             codebase_summary: Summary of the entire codebase (optional)
#             tech_stack: Tech stack analysis results (optional)
#             files_processed: List of processed files (optional)
#             file_summaries: Dictionary mapping file paths to summaries (optional)
            
#         Returns:
#             Generated response to the query
#         """
#         # Record the query in chat history
#         self.chat_history.append({"role": "user", "content": query})
        
#         try:
#             # Check and collect all available information
#             codebase_data = await self._collect_codebase_data(
#                 codebase_summary, tech_stack, files_processed, file_summaries
#             )
            
#             # Format the data for the prompt
#             files_info = self._format_files_info(codebase_data.get("files_processed", []))
#             tech_stack_info = self._format_tech_stack(codebase_data.get("tech_stack", {}))
            
#             # Select relevant file summaries based on the query
#             relevant_summaries = self._select_relevant_file_summaries(
#                 query, 
#                 codebase_data.get("file_summaries", {})
#             )
            
#             # Create the query prompt
#             prompt = self.QUERY_PROMPT_TEMPLATE.format(
#                 query=query,
#                 files_info=files_info,
#                 codebase_summary=codebase_data.get("codebase_summary", "No codebase summary available."),
#                 tech_stack_info=tech_stack_info,
#                 file_summaries=relevant_summaries
#             )
            
#             logging.info(f"Generating chatbot response for query: {query[:50]}...")
            
#             # Call the LLM to generate a response
#             response = await self._call_llm_api_async(prompt, self.SYSTEM_PROMPT, LLMConfig.DIAGRAM_MODEL)
            
#             # Record the response in chat history
#             self.chat_history.append({"role": "assistant", "content": response})
            
#             # Save chat history to a file
#             self._save_chat_history()
            
#             return response
            
#         except Exception as e:
#             error_msg = f"Error generating chatbot response: {e}"
#             logging.error(error_msg)
#             return f"I'm sorry, I encountered an error while processing your question: {str(e)}"
    
#     async def _collect_codebase_data(
#         self,
#         codebase_summary: Optional[str] = None,
#         tech_stack: Optional[Dict] = None,
#         files_processed: Optional[List] = None,
#         file_summaries: Optional[Dict] = None
#     ) -> Dict[str, Any]:
#         """
#         Collect all available data about the codebase for the chatbot.
#         If any data is missing, try to generate it or load it from files.
        
#         Returns:
#             Dictionary containing all available codebase data
#         """
#         data = {}
        
#         # Try to get or generate codebase summary
#         if codebase_summary:
#             data["codebase_summary"] = codebase_summary
#         else:
#             # Try to load from file
#             summary_file = self.output_dir / "combined_summary.txt"
#             if summary_file.exists():
#                 with open(summary_file, 'r', encoding='utf-8') as f:
#                     data["codebase_summary"] = f.read()
#             else:
#                 data["codebase_summary"] = "Codebase summary not available."
#                 logging.warning("Codebase summary not available.")
        
#         # Try to get or load tech stack information
#         if tech_stack:
#             data["tech_stack"] = tech_stack
#         else:
#             # Try to load from file
#             tech_stack_file = self.output_dir / "tech_stack_analysis.json"
#             if tech_stack_file.exists():
#                 try:
#                     with open(tech_stack_file, 'r', encoding='utf-8') as f:
#                         data["tech_stack"] = json.load(f)
#                 except Exception as e:
#                     logging.error(f"Error loading tech stack file: {e}")
#                     data["tech_stack"] = {}
#             else:
#                 data["tech_stack"] = {}
#                 logging.warning("Tech stack information not available.")
        
#         # Try to get or load processed files
#         if files_processed:
#             data["files_processed"] = files_processed
#         else:
#             # Try to load from file
#             file_list_file = self.output_dir / "file_list.json"
#             if file_list_file.exists():
#                 try:
#                     with open(file_list_file, 'r', encoding='utf-8') as f:
#                         data["files_processed"] = json.load(f)
#                 except Exception as e:
#                     logging.error(f"Error loading file list: {e}")
#                     data["files_processed"] = []
#             else:
#                 data["files_processed"] = []
#                 logging.warning("Processed files list not available.")
        
#         # Try to get or load file summaries
#         if file_summaries:
#             data["file_summaries"] = file_summaries
#         else:
#             # Try to load from summaries directory
#             summaries_dir = self.output_dir / "summaries"
#             data["file_summaries"] = {}
            
#             if summaries_dir.exists():
#                 # Load up to 30 file summaries (to keep the prompt size reasonable)
#                 summary_files = list(summaries_dir.glob("*.txt"))[:30]
#                 for summary_file in summary_files:
#                     try:
#                         with open(summary_file, 'r', encoding='utf-8') as f:
#                             summary_content = f.read()
#                             # Use filename as key (simplified)
#                             data["file_summaries"][summary_file.stem] = summary_content
#                     except Exception as e:
#                         logging.error(f"Error loading summary file {summary_file}: {e}")
#             else:
#                 logging.warning("File summaries directory not found.")
        
#         return data
    
    # def _format_files_info(self, files_processed: List[Dict[str, Any]]) -> str:
    #     """
    #     Format the list of processed files for the prompt.
        
    #     Args:
    #         files_processed: List of processed file information
            
    #     Returns:
    #         Formatted string of file information
    #     """
    #     if not files_processed:
    #         return "No file information available."
        
    #     # Limit to maximum 50 files to keep prompt size reasonable
    #     files_to_include = files_processed[:50]
        
    #     file_info_lines = []
    #     for file_info in files_to_include:
    #         if isinstance(file_info, dict):
    #             path = file_info.get("path", "unknown")
    #             extension = file_info.get("extension", "")
    #             file_info_lines.append(f"- {path} ({extension})")
    #         else:
    #             file_info_lines.append(f"- {file_info}")
        
    #     if len(files_processed) > 50:
    #         file_info_lines.append(f"... and {len(files_processed) - 50} more files")
        
    #     return "\n".join(file_info_lines)
    
    # def _format_tech_stack(self, tech_stack: Dict[str, Any]) -> str:
    #     """
    #     Format the tech stack information for the prompt.
        
    #     Args:
    #         tech_stack: Tech stack analysis results
            
    #     Returns:
    #         Formatted string of tech stack information
    #     """
    #     if not tech_stack:
    #         return "No tech stack information available."
        
    #     tech_info_sections = []
        
    #     # Format languages section
    #     if "languages" in tech_stack and tech_stack["languages"]:
    #         languages_section = ["Languages:"]
    #         for lang, details in tech_stack["languages"].items():
    #             percentage = details.get("percentage", "")
    #             percentage_str = f" ({percentage}%)" if percentage else ""
    #             languages_section.append(f"- {lang}{percentage_str}")
    #         tech_info_sections.append("\n".join(languages_section))
        
    #     # Format other technology categories
    #     categories = [
    #         ("frontend", "Frontend Technologies"),
    #         ("backend", "Backend Technologies"),
    #         ("database", "Database Technologies"),
    #         ("api", "APIs"),
    #         ("devops", "DevOps"),
    #         ("ml_ai", "Machine Learning/AI"),
    #         ("testing", "Testing"),
    #         ("mobile", "Mobile"),
    #         ("other", "Other Technologies")
    #     ]
        
    #     for key, title in categories:
    #         if key in tech_stack and tech_stack[key]:
    #             section = [f"{title}:"]
    #             for tech, details in tech_stack[key].items():
    #                 if tech == "None identified":
    #                     continue
    #                 evidence = details.get("evidence", "")
    #                 evidence_str = f" - {evidence}" if evidence else ""
    #                 section.append(f"- {tech}{evidence_str}")
    #             if len(section) > 1:  # Only add sections with technologies
    #                 tech_info_sections.append("\n".join(section))
        
    #     return "\n\n".join(tech_info_sections)
    
#     def _select_relevant_file_summaries(self, query: str, file_summaries: Dict[str, str]) -> str:
#         """
#         Select file summaries that are most relevant to the query.
        
#         Args:
#             query: User's question
#             file_summaries: Dictionary mapping file paths to summaries
            
#         Returns:
#             Formatted string of relevant file summaries
#         """
#         if not file_summaries:
#             return "No file summaries available."
        
#         # Extract keywords from the query
#         query_words = set(re.findall(r'\b\w+\b', query.lower()))
        
#         # Score file summaries based on keyword matches
#         scored_summaries = []
#         for file_path, summary in file_summaries.items():
#             score = 0
            
#             # Check for filename match
#             filename = file_path.lower()
#             for word in query_words:
#                 if word in filename:
#                     score += 5  # Higher score for filename matches
            
#             # Check for content match
#             summary_text = summary.lower()
#             for word in query_words:
#                 if len(word) > 3:  # Only consider meaningful words
#                     score += summary_text.count(word)
            
#             scored_summaries.append((file_path, summary, score))
        
#         # Sort by score (descending) and select top 5
#         scored_summaries.sort(key=lambda x: x[2], reverse=True)
#         top_summaries = scored_summaries[:5]
        
#         # Format the selected summaries
#         summary_sections = []
#         for file_path, summary, _ in top_summaries:
#             if score > 0:  # Only include if there was some relevance
#                 summary_sections.append(f"File: {file_path}\n{summary}")
        
#         if not summary_sections:
#             # If no relevant summaries found, include a few random ones
#             for file_path, summary, _ in scored_summaries[:3]:
#                 summary_sections.append(f"File: {file_path}\n{summary}")
        
#         return "\n\n".join(summary_sections)
    
    # def _save_chat_history(self) -> None:
    #     """Save the chat history to a file."""
    #     try:
    #         chat_log_file = self.chat_logs_dir / f"chat_log_{self.session_id}.json"
    #         with open(chat_log_file, 'w', encoding='utf-8') as f:
    #             json.dump(self.chat_history, f, indent=2)
    #     except Exception as e:
    #         logging.error(f"Error saving chat history: {e}")
    
    # async def _call_llm_api_async(self, user_prompt: str, system_prompt: str, model: str) -> str:
    #     """
    #     Call the LLM API asynchronously to generate responses.
        
    #     Args:
    #         user_prompt: User prompt text
    #         system_prompt: System prompt for LLM behavior
    #         model: Name of the model to use
            
    #     Returns:
    #         Generated text from the LLM
    #     """
    #     import aiohttp
    #     import json
        
    #     try:
    #         logging.debug(f"Calling LLM API with model {model}")
            
    #         # Prepare the payload
    #         payload = {
    #             "model": model,
    #             "prompt": user_prompt,
    #             "system": system_prompt
    #         }
            
    #         headers = {'Content-Type': 'application/json'}
            
    #         # Make the API call with proper exception handling
    #         async with aiohttp.ClientSession() as session:
    #             try:
    #                 async with session.post(
    #                     LLMConfig.LLM_API_URL,
    #                     data=json.dumps(payload),
    #                     headers=headers,
    #                     timeout=60  # Add timeout
    #                 ) as response:
    #                     if response.status != 200:
    #                         error_text = await response.text()
    #                         logging.error(f"LLM API error: {response.status}, {error_text}")
    #                         return "Sorry, I'm having trouble processing your request right now."
                        
    #                     # Read streaming response
    #                     response_content = ""
    #                     async for line_bytes in response.content:
    #                         line = line_bytes.decode('utf-8')
    #                         try:
    #                             data = json.loads(line)
    #                             if 'response' in data:
    #                                 response_content += data['response']
    #                             if data.get('done', False):
    #                                 break
    #                         except json.JSONDecodeError as e:
    #                             logging.error(f"JSON decode error: {e}")
    #                             continue
                        
    #                     if not response_content:
    #                         logging.warning("Received empty response from LLM API")
    #                         return "I apologize, but I couldn't generate a meaningful response to your question."
                        
    #                     return response_content
                        
    #             except aiohttp.ClientError as e:
    #                 logging.error(f"HTTP Request error: {e}")
    #                 return "Sorry, I'm having trouble connecting to my knowledge base right now."
                
    #     except Exception as e:
    #         logging.error(f"Unexpected error calling LLM API: {e}")
    #         return "I encountered an unexpected error while processing your question."
"""
Chatbot service for VizCoAssist.

This module provides a RAG (Retrieval-Augmented Generation) chatbot
that can answer questions about a codebase using the available analysis data.
The chatbot can automatically trigger the generation of missing data.
"""

import logging
import json
import os
import re
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
import asyncio
import time

from app.config import LLMConfig
from app.utils.helpers import save_to_file


class CodebaseChatbot:
    """
    Chatbot service that answers questions about a codebase using
    analysis data and the LLM. Can generate missing data on demand.
    """
    
    # System prompt for the chatbot
    SYSTEM_PROMPT = """
You are a codebase assistant specialized in answering questions about software projects. 
You have access to information about the structure, purpose, and technologies used in the codebase.
Your role is to help users understand the codebase by providing insightful and accurate information.

When answering questions:
- Focus on the specific codebase and its structure, not general programming concepts
- Cite evidence from the codebase analysis, summaries, and tech stack information
- Keep responses concise but detailed enough to be helpful
- If you don't have enough information, say so clearly
- Use code examples when relevant, but keep them brief
- Maintain a helpful, professional tone
"""

    # Query prompt template
    QUERY_PROMPT_TEMPLATE = """
I'm going to provide you with information about a codebase, 


Here's the information I have about this codebase:

=== CODEBASE STRUCTURE ===
{files_info}

=== CODEBASE SUMMARY ===
{codebase_summary}

=== TECH STACK INFORMATION ===
{tech_stack_info}

=== SPECIFIC FILE SUMMARIES ===
{file_summaries}

The below is the user query for which you need to provide the answer using the above information.
USER QUERY: {query}

Based on this information, please answer the question thoroughly but concisely. If you need more specific information that isn't provided, please mention that in your response.
"""

    def __init__(self, codebase_dir: Path, output_dir: Path, session_id: str, session_manager=None):
        """
        Initialize the codebase chatbot.
        
        Args:
            codebase_dir: Directory containing the codebase files
            output_dir: Directory where chatbot logs will be saved
            session_id: Unique session identifier
            session_manager: Reference to the session manager for accessing APIs
        """
        self.codebase_dir = codebase_dir
        self.output_dir = output_dir
        self.session_id = session_id
        self.session_manager = session_manager
        
        # Ensure output directory exists
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Create a directory for chat logs
        self.chat_logs_dir = self.output_dir / "chat_logs"
        self.chat_logs_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize chat history
        self.chat_history = []
        
        logging.info(f"Initialized codebase chatbot for session {session_id}")
    
    async def generate_response(self, 
                          query: str, 
                          codebase_summary: Optional[str] = None,
                          tech_stack: Optional[Dict] = None,
                          files_processed: Optional[List] = None,
                          file_summaries: Optional[Dict] = None,
                          session_data: Optional[Dict] = None) -> str:
        """
        Generate a response to a user query about the codebase.
        
        Args:
            query: User's question about the codebase
            codebase_summary: Summary of the entire codebase (optional)
            tech_stack: Tech stack analysis results (optional)
            files_processed: List of processed files (optional)
            file_summaries: Dictionary mapping file paths to summaries (optional)
            session_data: Full session data if available (optional)
            
        Returns:
            Generated response to the query
        """
        # Record the query in chat history
        self.chat_history.append({"role": "user", "content": query})
        
        try:
            # Check if there's any missing data that needs to be generated
            needs_summary = codebase_summary is None
            needs_tech_stack = tech_stack is None
            
            # Auto-generate missing data if needed
            if (needs_summary or needs_tech_stack) and session_data:
                status = session_data.get("status", "")
                
                if status not in ["ready", "completed"] and needs_summary:
                    # Need to run initial analysis first
                    logging.info(f"Session {self.session_id} needs initial analysis")
                    
                    await self._ensure_codebase_analyzed(session_data)
                    
                    # Reload session data after analysis
                    if self.session_manager:
                        session_data = self.session_manager.get_session(self.session_id)
                    
                if needs_summary and status in ["ready", "completed"]:
                    # Generate summaries if needed
                    logging.info(f"Generating codebase summaries for session {self.session_id}")
                    await self._ensure_summaries_generated(session_data)
                    
                    # Reload session data after summary generation
                    if self.session_manager:
                        session_data = self.session_manager.get_session(self.session_id)
                
                if needs_tech_stack and status in ["ready", "completed"]:
                    # Generate tech stack analysis if needed
                    logging.info(f"Generating tech stack analysis for session {self.session_id}")
                    await self._ensure_tech_stack_generated(session_data)
                    
                    # Reload session data after tech stack analysis
                    if self.session_manager:
                        session_data = self.session_manager.get_session(self.session_id)
            
            # Update local data with session data if available
            if session_data:
                if codebase_summary is None and "summary" in session_data and "combined_summary" in session_data["summary"]:
                    codebase_summary = session_data["summary"]["combined_summary"]
                
                if tech_stack is None and "tech_stack" in session_data:
                    tech_stack = session_data["tech_stack"]
                
                if files_processed is None:
                    files_processed = session_data.get("processed_files", [])
                
                if file_summaries is None and "summary" in session_data and "file_summaries" in session_data["summary"]:
                    file_summaries = {}
                    for file_summary in session_data["summary"]["file_summaries"]:
                        file_path = file_summary.get("file_path", "")
                        summary = file_summary.get("summary", "")
                        if file_path and summary:
                            file_summaries[file_path] = summary
            
            # Check and collect all available information
            codebase_data = await self._collect_codebase_data(
                codebase_summary, tech_stack, files_processed, file_summaries
            )
            
            # Format the data for the prompt
            # files_info = self._format_files_info(codebase_data.get("files_processed", []))
            # tech_stack_info = self._format_tech_stack(codebase_data.get("tech_stack", {}))
            files_info = codebase_data.get("files_processed", [])
            tech_stack_info = codebase_data.get("tech_stack", {})
            
            # Select relevant file summaries based on the query
            # relevant_summaries = self._select_relevant_file_summaries(
            #     query, 
            #     codebase_data.get("file_summaries", {})
            # )

            summary_data=''
            dataa=codebase_data.get("codebase_summary", [])
            # logging.info(dataa)
            # for file_summary in dataa.values():
            #     summary_data += str(file_summary)
            # Create the query prompt
            prompt = self.QUERY_PROMPT_TEMPLATE.format(
                query=query,
                files_info=files_info,
                codebase_summary=codebase_data.get("codebase_summary", "No codebase summary available."),
                tech_stack_info=tech_stack_info,
                file_summaries=dataa
            )
            
            logging.info(f"Generating chatbot response for query: {query[:50]}...")
            
            # Call the LLM to generate a response
            response = await self._call_llm_api_async(prompt, self.SYSTEM_PROMPT, LLMConfig.DIAGRAM_MODEL)
            
            # Record the response in chat history

            self.chat_history.append({"role": "assistant", "content": response})
            
            # Save chat history to a file
            self._save_chat_history()
            
            return response
            
        except Exception as e:
            error_msg = f"Error generating chatbot response: {e}"
            logging.error(error_msg)
            return f"I'm sorry, I encountered an error while processing your question: {str(e)}"
    
    
    async def _call_llm_api_async(self, user_prompt: str, system_prompt: str, model: str) -> str:
        """
        Call the LLM API asynchronously to generate responses.
        
        Args:
            user_prompt: User prompt text
            system_prompt: System prompt for LLM behavior
            model: Name of the model to use
            
        Returns:
            Generated text from the LLM
        """
        import aiohttp
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
            async with aiohttp.ClientSession() as session:
                try:
                    async with session.post(
                        LLMConfig.LLM_API_URL,
                        data=json.dumps(payload),
                        headers=headers,
                        timeout=60  # Add timeout
                    ) as response:
                        if response.status != 200:
                            error_text = await response.text()
                            logging.error(f"LLM API error: {response.status}, {error_text}")
                            return "Sorry, I'm having trouble processing your request right now."
                        
                        # Read streaming response
                        response_content = ""
                        async for line_bytes in response.content:
                            line = line_bytes.decode('utf-8')
                            try:
                                data = json.loads(line)
                                if 'response' in data:
                                    response_content += data['response']
                                if data.get('done', False):
                                    break
                            except json.JSONDecodeError as e:
                                logging.error(f"JSON decode error: {e}")
                                continue
                        
                        if not response_content:
                            logging.warning("Received empty response from LLM API")
                            return "I apologize, but I couldn't generate a meaningful response to your question."
                        return response_content
                        
                except aiohttp.ClientError as e:
                    logging.error(f"HTTP Request error: {e}")
                    return "Sorry, I'm having trouble connecting to my knowledge base right now."
                
        except Exception as e:
            logging.error(f"Unexpected error calling LLM API: {e}")
  
    async def _ensure_codebase_analyzed(self, session_data: Dict[str, Any]) -> None:
        """
        Ensure the codebase has been analyzed. If not, trigger analysis.
        
        Args:
            session_data: Current session data
        """
        if not self.session_manager:
            logging.warning("Session manager not available for triggering analysis")
            return
            
        # Directly run the analyzer if we're in the same process
        from app.services.analyzer import CodebaseAnalyzer
        
        session_dirs = session_data.get("directories", {})
        codebase_dir = session_dirs.get('codebase_dir')
        output_dir = session_dirs.get('output_dir')
        
        if not codebase_dir or not output_dir:
            logging.warning("Missing required directories for analysis")
            return
            
        logging.info("Running codebase analyzer directly")
        analyzer = CodebaseAnalyzer(codebase_dir, output_dir)
        
        # Run the analysis
        processed_files = analyzer.scan_and_identify_files()
        
        # Update session
        self.session_manager.update_session(self.session_id, {
            "status": "ready",
            "processed_files": processed_files,
        })
        
        logging.info(f"Completed initial analysis for session {self.session_id}")
    
    async def _ensure_summaries_generated(self, session_data: Dict[str, Any]) -> None:
        """
        Ensure codebase summaries are generated. If not, trigger summary generation.
        
        Args:
            session_data: Current session data
        """
        if "summary" in session_data and "combined_summary" in session_data["summary"]:
            logging.info("Summaries already generated")
            return
            
        if not self.session_manager:
            logging.warning("Session manager not available for triggering summary generation")
            return
            
        # Directly run the summarizer if we're in the same process
        from app.services.summarizer import CodeSummarizer
        
        session_dirs = session_data.get("directories", {})
        codebase_dir = session_dirs.get('codebase_dir')
        output_dir = session_dirs.get('output_dir')
        
        if not codebase_dir or not output_dir:
            logging.warning("Missing required directories for summary generation")
            return
            
        logging.info("Running code summarizer directly")
        summarizer = CodeSummarizer(
            codebase_dir=codebase_dir,
            output_dir=output_dir
        )
        
        # Run the summarizer
        summary_result = summarizer.summarize_codebase()
        
        # Update session
        self.session_manager.update_session(self.session_id, {
            "status": "completed",
            "summary": summary_result
        })
        
        logging.info(f"Completed summary generation for session {self.session_id}")
    
    async def _ensure_tech_stack_generated(self, session_data: Dict[str, Any]) -> None:
        """
        Ensure tech stack analysis is generated. If not, trigger tech stack analysis.
        
        Args:
            session_data: Current session data
        """
        if "tech_stack" in session_data:
            logging.info("Tech stack analysis already generated")
            return
            
        if not self.session_manager:
            logging.warning("Session manager not available for triggering tech stack analysis")
            return
            
        # Directly run the tech stack analyzer if we're in the same process
        from app.services.techstack import TechStackAnalyzer
        
        session_dirs = session_data.get("directories", {})
        codebase_dir = session_dirs.get('codebase_dir')
        output_dir = session_dirs.get('output_dir')
        
        if not codebase_dir or not output_dir:
            logging.warning("Missing required directories for tech stack analysis")
            return
            
        logging.info("Running tech stack analyzer directly")
        analyzer = TechStackAnalyzer(
            codebase_dir=codebase_dir,
            output_dir=output_dir,
            session_id=self.session_id
        )
        
        # Get file list if available
        file_list = session_data.get("processed_files", [])
        
        # Get codebase summary if available
        codebase_summary = None
        if "summary" in session_data and "combined_summary" in session_data["summary"]:
            codebase_summary = session_data["summary"]["combined_summary"]
        
        # Run the tech stack analyzer
        tech_stack = analyzer.analyze_tech_stack(file_list, codebase_summary)
        
        # Update session
        previous_status = session_data.get("status", "completed")
        self.session_manager.update_session(self.session_id, {
            "status": previous_status,
            "tech_stack": tech_stack,
            "tech_stack_analyzed_at": time.time()
        })
        
        logging.info(f"Completed tech stack analysis for session {self.session_id}")
    
    def _save_chat_history(self) -> None:
        """Save the chat history to a file."""
        try:
            chat_log_file = self.chat_logs_dir / f"chat_log_{self.session_id}.json"
            with open(chat_log_file, 'w', encoding='utf-8') as f:
                json.dump(self.chat_history, f, indent=2)
        except Exception as e:
            logging.error(f"Error saving chat history: {e}")
    
    async def _collect_codebase_data(
        self,
        codebase_summary: Optional[str] = None,
        tech_stack: Optional[Dict] = None,
        files_processed: Optional[List] = None,
        file_summaries: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Collect all available data about the codebase for the chatbot.
        If any data is missing, try to generate it or load it from files.
        
        Returns:
            Dictionary containing all available codebase data
        """
        data = {}
        
        # Try to get or generate codebase summary
        if codebase_summary:
            data["codebase_summary"] = codebase_summary
        else:
            # Try to load from file
            summary_file = self.output_dir / "combined_summary.txt"
            if summary_file.exists():
                with open(summary_file, 'r', encoding='utf-8') as f:
                    data["codebase_summary"] = f.read()
            else:
                data["codebase_summary"] = "Codebase summary not available."
                logging.warning("Codebase summary not available.")
        
        # Try to get or load tech stack information
        if tech_stack:
            data["tech_stack"] = tech_stack
        else:
            # Try to load from file
            tech_stack_file = self.output_dir / "tech_stack_analysis.json"
            if tech_stack_file.exists():
                try:
                    with open(tech_stack_file, 'r', encoding='utf-8') as f:
                        data["tech_stack"] = json.load(f)
                except Exception as e:
                    logging.error(f"Error loading tech stack file: {e}")
                    data["tech_stack"] = {}
            else:
                data["tech_stack"] = {}
                logging.warning("Tech stack information not available.")
        
        # Try to get or load processed files
        if files_processed:
            data["files_processed"] = files_processed
        else:
            # Try to load from file
            file_list_file = self.output_dir / "file_list.json"
            if file_list_file.exists():
                try:
                    with open(file_list_file, 'r', encoding='utf-8') as f:
                        data["files_processed"] = json.load(f)
                except Exception as e:
                    logging.error(f"Error loading file list: {e}")
                    data["files_processed"] = []
            else:
                data["files_processed"] = []
                logging.warning("Processed files list not available.")
        
        # Try to get or load file summaries
        if file_summaries:
            data["file_summaries"] = file_summaries
        else:
            # Try to load from summaries directory
            summaries_dir = self.output_dir / "summaries"
            data["file_summaries"] = {}
            
            if summaries_dir.exists():
                # Load up to 30 file summaries (to keep the prompt size reasonable)
                summary_files = list(summaries_dir.glob("*.txt"))[:30]
                for summary_file in summary_files:
                    try:
                        with open(summary_file, 'r', encoding='utf-8') as f:
                            summary_content = f.read()
                            # Use filename as key (simplified)
                            data["file_summaries"][summary_file.stem] = summary_content
                    except Exception as e:
                        logging.error(f"Error loading summary file {summary_file}: {e}")
            else:
                logging.warning("File summaries directory not found.")
        
        return data