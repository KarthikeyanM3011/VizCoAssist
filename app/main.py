# from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks, Depends
# from fastapi.responses import JSONResponse
# import shutil
# import os
# from pathlib import Path
# import zipfile
# import uuid
# import logging
# from typing import Optional, List
# import asyncio

# from app.utils.session import SessionManager
# from app.utils.file_handler import extract_zip, create_session_directories
# from app.services.analyzer import CodebaseAnalyzer
# from app.services.summarizer import CodeSummarizer
# from app.config import DataPaths

# # Configure logging
# logging.basicConfig(
#     level=logging.INFO,
#     format="%(asctime)s - %(levelname)s - %(message)s"
# )

# app = FastAPI(
#     title="VizCoAssist API",
#     description="API for analyzing code repositories and generating architecture diagrams",
#     version="1.0.0",
# )

# # Initialize the session manager
# session_manager = SessionManager()

# @app.on_event("startup")
# async def startup_event():
#     """Initialize necessary directories on startup."""
#     for path in [DataPaths.UPLOADS_DIR, DataPaths.SESSIONS_DIR, 
#                 DataPaths.OUTPUT_DIR, DataPaths.CACHE_DIR]:
#         path.mkdir(parents=True, exist_ok=True)
#     logging.info("Application started and directories initialized")

# @app.post("/upload", response_model=dict)
# async def upload_codebase(
#     background_tasks: BackgroundTasks,
#     file: UploadFile = File(...),
# ):
#     logging.info(f"Received file upload: {file.filename}")
#     print(file.filename)
#     if not file.filename.endswith('.zip'):
#         raise HTTPException(status_code=400, detail="Only ZIP files are supported")
    
#     # Generate a unique session ID
#     session_id = str(uuid.uuid4())
    
#     # Create session directories
#     session_dirs = create_session_directories(session_id)
    
#     # Save the uploaded file temporarily
#     temp_file = session_dirs['upload_dir'] / file.filename
#     with open(temp_file, "wb") as buffer:
#         shutil.copyfileobj(file.file, buffer)
    
#     try:
#         # Extract the zip file
#         extract_zip(temp_file, session_dirs['codebase_dir'])
        
#         # Register the session
#         session_manager.register_session(session_id, {
#             "status": "uploaded",
#             "directories": session_dirs,
#             "original_filename": file.filename,
#         })
        
#         # Schedule background analysis task
#         background_tasks.add_task(
#             initialize_codebase_analysis,
#             session_id,
#             session_dirs
#         )
        
#         return {"session_id": session_id, "status": "uploaded"}
    
#     except Exception as e:
#         # Clean up in case of error
#         if os.path.exists(session_dirs['session_dir']):
#             shutil.rmtree(session_dirs['session_dir'])
#         raise HTTPException(status_code=500, detail=f"Error processing upload: {str(e)}")

# async def initialize_codebase_analysis(session_id: str, session_dirs: dict):
#     """Background task to start initial code analysis after upload."""
#     try:
#         # Update session status
#         session_manager.update_session(session_id, {"status": "analyzing"})
        
#         # Initialize the analyzer
#         analyzer = CodebaseAnalyzer(session_dirs['codebase_dir'], session_dirs['output_dir'])
        
#         # Run a basic analysis to identify files
#         processed_files = analyzer.scan_and_identify_files()
        
#         # Update session with processed files info
#         session_manager.update_session(session_id, {
#             "status": "ready",
#             "processed_files": processed_files,
#         })
        
#         logging.info(f"Completed initial analysis for session {session_id}")
    
#     except Exception as e:
#         session_manager.update_session(session_id, {"status": "error", "error": str(e)})
#         logging.error(f"Error in background analysis for session {session_id}: {e}")

# @app.get("/sessions/{session_id}/status")
# async def get_session_status(session_id: str):
#     """Get the current status of a session."""
#     if not session_manager.session_exists(session_id):
#         raise HTTPException(status_code=404, detail="Session not found")
    
#     session_data = session_manager.get_session(session_id)
#     return {
#         "session_id": session_id,
#         "status": session_data.get("status", "unknown")
#     }

# @app.get("/sessions/{session_id}/data")
# async def get_session_data(session_id: str):
#     """Get all stored data of a session as is, including base64 diagrams."""
#     if not session_manager.session_exists(session_id):
#         raise HTTPException(status_code=404, detail="Session not found")
    
#     # Retrieve session data and return it directly
#     session_data = session_manager.get_session(session_id)
    
#     return {
#         "session_id": session_id,
#         **session_data  # Includes status, diagrams (with existing base64), and summary
#     }


# # @app.post("/sessions/{session_id}/generatearchitecture")
# # async def generate_architecture(
# #     session_id: str,
# #     background_tasks: BackgroundTasks,
# #     diagram_type: str = "mermaid"
# # ):
# #     """
# #     Generate architecture diagrams for the uploaded codebase.
# #     """
# #     if not session_manager.session_exists(session_id):
# #         raise HTTPException(status_code=404, detail="Session not found")
    
# #     session_data = session_manager.get_session(session_id)
    
# #     if session_data.get("status") not in ["ready", "completed"]:
# #         raise HTTPException(status_code=400, 
# #             detail="Codebase analysis not complete. Current status: " + session_data.get("status"))
    
# #     # Update session status
# #     session_manager.update_session(session_id, {"status": "generating_diagrams"})
    
# #     # Start background task for diagram generation
# #     background_tasks.add_task(
# #         process_architecture_diagrams,
# #         session_id,
# #         session_data["directories"],
# #         diagram_type
# #     )
    
# #     return {"session_id": session_id, "status": "diagram_generation_started"}

# def blocking_diagram_task(session_id, session_dirs, diagram_type):
#     process_architecture_diagrams(session_id, session_dirs, diagram_type)  # Ensure this function is synchronous

# @app.post("/sessions/{session_id}/generatearchitecture")
# async def generate_architecture(
#     session_id: str,
#     background_tasks: BackgroundTasks,
#     diagram_type: str = "mermaid"
# ):
#     if not session_manager.session_exists(session_id):
#         raise HTTPException(status_code=404, detail="Session not found")

#     session_data = session_manager.get_session(session_id)

#     if session_data.get("status") not in ["ready", "completed"]:
#         raise HTTPException(status_code=400, detail="Codebase analysis not complete. Current status: " + session_data.get("status"))

#     session_manager.update_session(session_id, {"status": "generating_diagrams"})

#     # Run in a separate thread to prevent blocking
#     loop = asyncio.get_running_loop()
#     loop.run_in_executor(None, blocking_diagram_task, session_id, session_data["directories"], diagram_type)

#     return {"session_id": session_id, "status": "diagram_generation_started"}

# async def process_architecture_diagrams(
#     session_id: str, 
#     session_dirs: dict,
#     diagram_type: str
# ):
#     """Background task to generate architecture diagrams."""
#     try:
#         # Update session status
#         session_manager.update_session(session_id, {"status": "generating_diagrams"})
        
#         # Initialize the summarizer
#         summarizer = CodeSummarizer(
#             codebase_dir=session_dirs['codebase_dir'],
#             output_dir=session_dirs['output_dir']
#         )
        
#         # Generate summaries for the codebase
#         summary_result = summarizer.summarize_codebase()
        
#         # Generate architecture diagrams
#         from app.services.diagram import DiagramGenerator
        
#         diagram_generator = DiagramGenerator(
#             output_dir=session_dirs['output_dir'],
#             diagram_type=diagram_type
#         )
        
#         # Generate high-level and low-level diagrams
#         diagrams = diagram_generator.generate_diagrams(summary_result["combined_summary"])
        
#         # Update session with diagram information
#         session_manager.update_session(session_id, {
#             "status": "completed",
#             "diagrams": diagrams,
#             "summary": summary_result
#         })
        
#         logging.info(f"Completed diagram generation for session {session_id}")
    
#     except Exception as e:
#         session_manager.update_session(session_id, {
#             "status": "error", 
#             "error": f"Diagram generation error: {str(e)}"
#         })
#         logging.error(f"Error generating diagrams for session {session_id}: {e}")

# @app.get("/sessions/{session_id}/summary")
# async def get_codebase_summary(session_id: str):
#     """Get the summary of the entire codebase."""
#     if not session_manager.session_exists(session_id):
#         raise HTTPException(status_code=404, detail="Session not found")
    
#     session_data = session_manager.get_session(session_id)
    
#     if "summary" not in session_data:
#         # Try to load summary from file if it exists
#         summary_file = session_data["directories"]["output_dir"] / "combined_summary.txt"
#         if summary_file.exists():
#             with open(summary_file, "r") as f:
#                 summary_content = f.read()
#             return {"session_id": session_id, "summary": summary_content}
#         else:
#             raise HTTPException(
#                 status_code=404, 
#                 detail="Summary not generated. Run /generatearchitecture first."
#             )
    
#     return {
#         "session_id": session_id,
#         "summary": session_data["summary"]["combined_summary"]
#     }

# @app.get("/sessions/{session_id}/filesummary")
# async def get_file_summary(session_id: str, file_path: str):
#     """Get the summary of a specific file."""
#     if not session_manager.session_exists(session_id):
#         raise HTTPException(status_code=404, detail="Session not found")
    
#     session_data = session_manager.get_session(session_id)
    
#     if "summary" not in session_data or "file_summaries" not in session_data["summary"]:
#         raise HTTPException(
#             status_code=404, 
#             detail="File summaries not available. Run /generatearchitecture first."
#         )
    
#     # Find the file summary
#     for file_summary in session_data["summary"]["file_summaries"]:
#         if file_summary["file_path"] == file_path:
#             return {
#                 "session_id": session_id,
#                 "file_path": file_path,
#                 "summary": file_summary["summary"]
#             }
    
#     raise HTTPException(status_code=404, detail=f"Summary for file {file_path} not found")

# @app.get("/sessions/{session_id}/getfilesaccessed")
# async def get_files_accessed(session_id: str):
#     """Get a list of all files that have been processed."""
#     if not session_manager.session_exists(session_id):
#         raise HTTPException(status_code=404, detail="Session not found")
    
#     session_data = session_manager.get_session(session_id)
    
#     if "processed_files" not in session_data:
#         raise HTTPException(
#             status_code=404, 
#             detail="No processed files information available."
#         )
    
#     return {
#         "session_id": session_id,
#         "processed_files": session_data["processed_files"]
#     }

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks, Depends, Form
from fastapi.responses import JSONResponse
import shutil
import os
import aiohttp
import asyncio
import tempfile
import re
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor
from pathlib import Path
import zipfile
import uuid
import logging
from typing import Optional, List
from urllib.parse import urlparse
import time

from app.services.techstack import TechStackAnalyzer
from app.utils.session import SessionManager
from app.utils.file_handler import extract_zip, create_session_directories
from app.services.analyzer import CodebaseAnalyzer
from app.services.summarizer import CodeSummarizer
from app.services.quality import CodeQualityAnalyzer
from app.config import DataPaths
from fastapi.middleware.cors import CORSMiddleware

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

app = FastAPI(
    title="VizCoAssist API",
    description="API for analyzing code repositories and generating architecture diagrams",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins, change to specific URL in production
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)
# Initialize the session manager
session_manager = SessionManager()

# Initialize thread pool executor for background tasks
executor = ThreadPoolExecutor(max_workers=10)

@app.on_event("startup")
async def startup_event():
    """Initialize necessary directories on startup."""
    for path in [DataPaths.UPLOADS_DIR, DataPaths.SESSIONS_DIR, 
                DataPaths.OUTPUT_DIR, DataPaths.CACHE_DIR]:
        path.mkdir(parents=True, exist_ok=True)
    logging.info("Application started and directories initialized")

@app.post("/upload", response_model=dict)
async def upload_codebase(
    file: UploadFile = File(...),
):
    """
    Upload a codebase as a zip file.
    Returns a session_id for subsequent API calls.
    """
    logging.info(f"Received file upload: {file.filename}")
    
    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Only ZIP files are supported")
    
    # Generate a unique session ID
    session_id = str(uuid.uuid4())
    
    # Create session directories
    session_dirs = create_session_directories(session_id)
    
    # Save the uploaded file temporarily
    temp_file = session_dirs['upload_dir'] / file.filename
    with open(temp_file, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # Extract the zip file
        extract_zip(temp_file, session_dirs['codebase_dir'])
        
        # Register the session
        session_manager.register_session(session_id, {
            "status": "uploaded",
            "directories": session_dirs,
            "original_filename": file.filename,
        })
        
        # Start background analysis task using asyncio
        loop = asyncio.get_running_loop()
        loop.create_task(initialize_codebase_analysis(session_id, session_dirs))
        
        return {"session_id": session_id, "status": "uploaded"}
    
    except Exception as e:
        # Clean up in case of error
        if os.path.exists(session_dirs['session_dir']):
            shutil.rmtree(session_dirs['session_dir'])
        raise HTTPException(status_code=500, detail=f"Error processing upload: {str(e)}")

@app.post("/upload/github", response_model=dict)
async def upload_github_repo(
    github_url: str = Form(...),
):
    """
    Download and process a GitHub repository.
    Returns a session_id for subsequent API calls.
    """
    logging.info(f"Received GitHub repo URL: {github_url}")
    
    if not github_url.startswith(("https://github.com/", "http://github.com/")):
        raise HTTPException(status_code=400, detail="Invalid GitHub URL format")
    
    # Generate a unique session ID
    session_id = str(uuid.uuid4())
    
    # Create session directories
    session_dirs = create_session_directories(session_id)
    
    try:
        # Parse the GitHub URL to extract owner and repo
        parsed_url = urlparse(github_url)
        path_parts = parsed_url.path.strip('/').split('/')
        
        if len(path_parts) < 2:
            raise HTTPException(status_code=400, detail="Invalid GitHub URL format")
        
        owner = path_parts[0]
        repo = path_parts[1].replace('.git', '')
        
        # Register the session
        session_manager.register_session(session_id, {
            "status": "downloading",
            "directories": session_dirs,
            "github_url": github_url,
            "owner": owner,
            "repo": repo,
        })
        
        # Start background task to download and process the GitHub repo
        loop = asyncio.get_running_loop()
        loop.create_task(
            process_github_repo(session_id, session_dirs, owner, repo)
        )
        
        return {"session_id": session_id, "status": "downloading"}
    
    except Exception as e:
        # Clean up in case of error
        if os.path.exists(session_dirs['session_dir']):
            shutil.rmtree(session_dirs['session_dir'])
        raise HTTPException(status_code=500, detail=f"Error processing GitHub repository: {str(e)}")

async def process_github_repo(session_id: str, session_dirs: dict, owner: str, repo: str):
    """Background task to download and process a GitHub repository."""
    try:
        # Update session status
        session_manager.update_session(session_id, {"status": "downloading"})
        
        # Generate zip filename
        timestamp = int(time.time())
        zip_filename = f"{owner}-{repo}-{timestamp}.zip"
        zip_filepath = session_dirs['upload_dir'] / zip_filename
        
        # GitHub API URL for downloading the repo
        download_url = f"https://api.github.com/repos/{owner}/{repo}/zipball"
        
        # Download the repository
        async with aiohttp.ClientSession() as session:
            logging.info(f"Downloading repository {owner}/{repo}...")
            
            async with session.get(
                download_url,
                headers={"Accept": "application/vnd.github.v3+json"}
            ) as response:
                if response.status != 200:
                    error_msg = f"GitHub API returned status code {response.status}"
                    session_manager.update_session(session_id, {
                        "status": "error",
                        "error": error_msg
                    })
                    logging.error(error_msg)
                    return
                
                # Save the response content
                with open(zip_filepath, 'wb') as f:
                    while True:
                        chunk = await response.content.read(8192)
                        if not chunk:
                            break
                        f.write(chunk)
        
        logging.info(f"Downloaded repository to {zip_filepath}")
        
        # Extract the zip file
        logging.info(f"Extracting repository to {session_dirs['codebase_dir']}")
        extract_zip(zip_filepath, session_dirs['codebase_dir'])
        
        # Update session status
        session_manager.update_session(session_id, {
            "status": "uploaded",
            "original_filename": zip_filename,
        })
        
        # Continue with codebase analysis
        await initialize_codebase_analysis(session_id, session_dirs)
        
    except Exception as e:
        error_msg = f"Error processing GitHub repository: {str(e)}"
        session_manager.update_session(session_id, {
            "status": "error",
            "error": error_msg
        })
        logging.error(error_msg)

async def initialize_codebase_analysis(session_id: str, session_dirs: dict):
    """Background task to start initial code analysis after upload."""
    try:
        # Update session status
        session_manager.update_session(session_id, {"status": "analyzing"})
        
        # Run the analyzer in a thread pool to avoid blocking the event loop
        loop = asyncio.get_running_loop()
        processed_files = await loop.run_in_executor(
            executor,
            run_analyzer,
            session_dirs['codebase_dir'],
            session_dirs['output_dir']
        )
        
        # Update session with processed files info
        session_manager.update_session(session_id, {
            "status": "ready",
            "processed_files": processed_files,
        })
        
        logging.info(f"Completed initial analysis for session {session_id}")
    
    except Exception as e:
        session_manager.update_session(session_id, {"status": "error", "error": str(e)})
        logging.error(f"Error in background analysis for session {session_id}: {e}")

def run_analyzer(codebase_dir, output_dir):
    """Run the analyzer in a separate thread."""
    analyzer = CodebaseAnalyzer(codebase_dir, output_dir)
    return analyzer.scan_and_identify_files()

@app.get("/sessions/{session_id}/status")
async def get_session_status(session_id: str):
    """Get the current status of a session."""
    if not session_manager.session_exists(session_id):
        raise HTTPException(status_code=404, detail="Session not found")
    
    session_data = session_manager.get_session(session_id)
    return {
        "session_id": session_id,
        "status": session_data.get("status", "unknown")
    }

@app.get("/sessions/{session_id}/data")
async def get_session_data(session_id: str):
    """Get all stored data of a session as is, including base64 diagrams."""
    if not session_manager.session_exists(session_id):
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Retrieve session data and return it directly
    session_data = session_manager.get_session(session_id)
    
    return {
        "session_id": session_id,
        **session_data  # Includes status, diagrams (with existing base64), and summary
    }

@app.post("/sessions/{session_id}/generatearchitecture")
async def generate_architecture(
    session_id: str,
    diagram_type: str = "mermaid"
):
    """
    Generate architecture diagrams for the uploaded codebase.
    """
    if not session_manager.session_exists(session_id):
        raise HTTPException(status_code=404, detail="Session not found")
    
    session_data = session_manager.get_session(session_id)
    
    if session_data.get("status") not in ["ready", "completed"]:
        raise HTTPException(status_code=400, 
            detail=f"Codebase analysis not complete. Current status: {session_data.get('status')}")
    
    # Update session status
    session_manager.update_session(session_id, {"status": "generating_diagrams"})
    
    # Start background task for diagram generation using asyncio
    loop = asyncio.get_running_loop()
    loop.create_task(
        process_architecture_diagrams(session_id, session_data["directories"], diagram_type)
    )
    
    return {"session_id": session_id, "status": "diagram_generation_started"}

async def process_architecture_diagrams(
    session_id: str, 
    session_dirs: dict,
    diagram_type: str
):
    """Background task to generate architecture diagrams."""
    try:
        # Run summarization in a thread pool
        loop = asyncio.get_running_loop()
        summary_result = await loop.run_in_executor(
            executor,
            run_summarizer,
            session_dirs['codebase_dir'],
            session_dirs['output_dir']
        )
        
        # Run diagram generation in a thread pool
        diagrams = await loop.run_in_executor(
            executor,
            run_diagram_generator,
            session_dirs['output_dir'],
            diagram_type,
            summary_result["combined_summary"]
        )
        
        # Update session with diagram information
        session_manager.update_session(session_id, {
            "status": "completed",
            "diagrams": diagrams,
            "summary": summary_result
        })
        
        logging.info(f"Completed diagram generation for session {session_id}")
    
    except Exception as e:
        session_manager.update_session(session_id, {
            "status": "error", 
            "error": f"Diagram generation error: {str(e)}"
        })
        logging.error(f"Error generating diagrams for session {session_id}: {e}")

def run_summarizer(codebase_dir, output_dir):
    """Run the summarizer in a separate thread."""
    summarizer = CodeSummarizer(
        codebase_dir=codebase_dir,
        output_dir=output_dir
    )
    return summarizer.summarize_codebase()

def run_diagram_generator(output_dir, diagram_type, summary):
    """Run the diagram generator in a separate thread."""
    from app.services.diagram import DiagramGenerator
    
    diagram_generator = DiagramGenerator(
        output_dir=output_dir,
        diagram_type=diagram_type
    )
    
    return diagram_generator.generate_diagrams(summary)

@app.get("/sessions/{session_id}/summary")
async def get_codebase_summary(session_id: str):
    """Get the summary of the entire codebase."""
    if not session_manager.session_exists(session_id):
        raise HTTPException(status_code=404, detail="Session not found")
    
    session_data = session_manager.get_session(session_id)
    
    if "summary" not in session_data:
        # Try to load summary from file if it exists
        summary_file = session_data["directories"]["output_dir"] / "combined_summary.txt"
        if summary_file.exists():
            with open(summary_file, "r") as f:
                summary_content = f.read()
            return {"session_id": session_id, "summary": summary_content}
        else:
            raise HTTPException(
                status_code=404, 
                detail="Summary not generated. Run /generatearchitecture first."
            )
    
    return {
        "session_id": session_id,
        "summary": session_data["summary"]["combined_summary"]
    }

@app.get("/sessions/{session_id}/filesummary")
async def get_file_summary(session_id: str, file_path: str):
    """Get the summary of a specific file."""
    if not session_manager.session_exists(session_id):
        raise HTTPException(status_code=404, detail="Session not found")
    
    session_data = session_manager.get_session(session_id)
    
    if "summary" not in session_data or "file_summaries" not in session_data["summary"]:
        raise HTTPException(
            status_code=404, 
            detail="File summaries not available. Run /generatearchitecture first."
        )
    
    # Find the file summary
    for file_summary in session_data["summary"]["file_summaries"]:
        if file_summary["file_path"] == file_path:
            return {
                "session_id": session_id,
                "file_path": file_path,
                "summary": file_summary["summary"]
            }
    
    raise HTTPException(status_code=404, detail=f"Summary for file {file_path} not found")

@app.get("/sessions/{session_id}/getfilesaccessed")
async def get_files_accessed(session_id: str):
    """Get a list of all files that have been processed."""
    if not session_manager.session_exists(session_id):
        raise HTTPException(status_code=404, detail="Session not found")
    
    session_data = session_manager.get_session(session_id)
    
    if "processed_files" not in session_data:
        raise HTTPException(
            status_code=404, 
            detail="No processed files information available."
        )
    
    return {
        "session_id": session_id,
        "processed_files": session_data["processed_files"]
    }

async def _analyze_tech_stack(session_id, session_dirs, file_list, codebase_summary, previous_status):
    """
    Analyze tech stack in the background and update the session when complete.
    This uses the revised approach similar to code summarization.
    """
    try:
        logging.info(f"Starting background tech stack analysis for session {session_id}")
        
        # Run the tech stack analyzer (now using a similar approach to the summarizer)
        from app.services.techstack import TechStackAnalyzer
        
        analyzer = TechStackAnalyzer(
            codebase_dir=session_dirs['codebase_dir'],
            output_dir=session_dirs['output_dir'],
            session_id=session_id
        )
        
        # Run the analysis with detailed progress logging
        tech_stack = analyzer.analyze_tech_stack(file_list, codebase_summary)
        
        logging.info(f"Tech stack analysis completed for session {session_id}")
        
        # Update session with tech stack information
        session_manager.update_session(session_id, {
            "status": previous_status,  # Restore previous status
            "tech_stack": tech_stack,
            "tech_stack_analyzed_at": time.time(),
            "tech_stack_progress": {
                "progress": 100,
                "files_analyzed": len(file_list) if file_list else 0,
                "total_files": len(file_list) if file_list else 0,
                "complete": True
            }
        })
        
    except Exception as e:
        logging.error(f"Error during tech stack analysis for session {session_id}: {e}")
        
        # Update session with error
        session_manager.update_session(session_id, {
            "status": previous_status,
            "tech_stack_error": str(e)
        })

def run_tech_stack_analyzer(codebase_dir, output_dir, file_list, codebase_summary, session_id):
    """Run the tech stack analyzer in a separate thread."""
    from app.services.techstack import TechStackAnalyzer
    
    logging.info(f"Starting tech stack analysis for session {session_id}")
    
    # Create analyzer instance (using the revised version)
    analyzer = TechStackAnalyzer(
        codebase_dir=codebase_dir,
        output_dir=output_dir,
        session_id=session_id
    )
    
    # Run the analysis
    tech_stack = analyzer.analyze_tech_stack(file_list, codebase_summary)
    
    logging.info(f"Completed tech stack analysis for session {session_id}")
    
    return tech_stack

@app.get("/sessions/{session_id}/techstack")
async def analyze_tech_stack(session_id: str, force_refresh: bool = False):
    """
    Analyze the technology stack used in the codebase.
    Returns a JSON object with tech stack information including:
    - Languages used and their percentages
    - Frontend frameworks and libraries
    - Backend technologies
    - Database technologies
    - APIs and other notable technologies
    
    Parameters:
    - session_id: The session ID for the codebase analysis
    - force_refresh: If True, will reanalyze the tech stack even if it was already analyzed
    """
    if not session_manager.session_exists(session_id):
        raise HTTPException(status_code=404, detail="Session not found")
    
    session_data = session_manager.get_session(session_id)
    
    # Check if tech stack analysis already exists and force_refresh is False
    if "tech_stack" in session_data and not force_refresh:
        return {
            "session_id": session_id,
            "tech_stack": session_data["tech_stack"]
        }
    
    # Check if the codebase has been analyzed
    if session_data.get("status") not in ["ready", "completed", "error"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Codebase analysis not complete. Current status: {session_data.get('status')}"
        )
    
    # Check if analysis is already in progress
    if session_data.get("status") == "analyzing_tech_stack":
        return {
            "session_id": session_id,
            "status": "analyzing_tech_stack",
            "message": "Tech stack analysis is already in progress",
            "progress": session_data.get("tech_stack_progress", {"progress": 0})
        }
    
    # Update session status
    previous_status = session_data.get("status")
    session_manager.update_session(session_id, {
        "status": "analyzing_tech_stack",
        "tech_stack_progress": {
            "progress": 0,
            "files_analyzed": 0,
            "total_files": len(session_data.get("processed_files", []))
        }
    })
    
    try:
        # Get necessary session information
        session_dirs = session_data["directories"]
        
        # Get file list if available
        file_list = session_data.get("processed_files", [])
        
        # Get codebase summary if available
        codebase_summary = None
        if "summary" in session_data and "combined_summary" in session_data["summary"]:
            codebase_summary = session_data["summary"]["combined_summary"]
        
        # Run tech stack analysis in a separate task to avoid blocking
        loop = asyncio.get_running_loop()
        loop.create_task(_analyze_tech_stack(
            session_id, 
            session_dirs, 
            file_list, 
            codebase_summary, 
            previous_status
        ))
        
        return {
            "session_id": session_id,
            "status": "analyzing_tech_stack",
            "message": "Tech stack analysis started",
            "progress": {
                "progress": 0,
                "files_analyzed": 0,
                "total_files": len(file_list)
            }
        }
        
    except Exception as e:
# Restore previous status on error
        session_manager.update_session(session_id, {
            "status": previous_status,
            "tech_stack_error": str(e)
        })
        raise HTTPException(status_code=500, detail=f"Error analyzing tech stack: {str(e)}")

@app.get("/sessions/{session_id}/filetechstack")
async def get_file_tech_stack(session_id: str, file_path: str):
    """
    Get the technology stack analysis for a specific file.
    
    Parameters:
    - session_id: The session ID for the codebase analysis
    - file_path: The path to the file within the codebase
    """
    if not session_manager.session_exists(session_id):
        raise HTTPException(status_code=404, detail="Session not found")
    
    session_data = session_manager.get_session(session_id)
    session_dirs = session_data.get("directories", {})
    
    # Look for file analysis in tech_analyses directory
    tech_analyses_dir = session_dirs.get("output_dir") / "tech_analyses"
    if not tech_analyses_dir.exists():
        raise HTTPException(
            status_code=404,
            detail="File-level tech stack analysis directory not found. Run /techstack endpoint first."
        )
    
    # Find the file analysis (converted file path to filename)
    # Replace both forward and backslashes with underscores - avoid f-string escaping issues
    safe_file_path = file_path.replace("/", "_").replace("\\", "_")
    analysis_filename = f"{safe_file_path}_tech.txt"
    analysis_path = tech_analyses_dir / analysis_filename
    
    if not analysis_path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Tech stack analysis for file {file_path} not found"
        )
    
    try:
        with open(analysis_path, 'r', encoding='utf-8') as f:
            analysis_content = f.read()
        
        return {
            "session_id": session_id,
            "file_path": file_path,
            "tech_analysis": analysis_content
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error reading file tech analysis: {str(e)}"
        )

@app.get("/sessions/{session_id}/techstack/progress")
async def get_tech_stack_progress(session_id: str):
    """
    Get the progress of tech stack analysis.
    
    Parameters:
    - session_id: The session ID for the codebase analysis
    """
    if not session_manager.session_exists(session_id):
        raise HTTPException(status_code=404, detail="Session not found")
    
    session_data = session_manager.get_session(session_id)
    
    # Check if analysis is in progress
    if session_data.get("status") != "analyzing_tech_stack":
        return {
            "session_id": session_id,
            "status": session_data.get("status"),
            "in_progress": False,
            "progress": 100 if "tech_stack" in session_data else 0
        }
    
    # Get progress information
    progress_info = session_data.get("tech_stack_progress", {})
    
    # If no explicit progress info, check the tech_analyses directory
    if not progress_info and "directories" in session_data:
        tech_analyses_dir = session_data["directories"]["output_dir"] / "tech_analyses"
        if tech_analyses_dir.exists():
            # Count the number of analysis files
            analysis_files = list(tech_analyses_dir.glob('*_tech.txt'))
            num_analysis_files = len(analysis_files)
            
            # Get total files
            total_files = len(session_data.get("processed_files", []))
            if total_files > 0:
                progress = min(int((num_analysis_files / total_files) * 100), 99)
            else:
                progress = 0
                
            progress_info = {
                "progress": progress,
                "files_analyzed": num_analysis_files,
                "total_files": total_files
            }
    
    return {
        "session_id": session_id,
        "status": "analyzing_tech_stack",
        "in_progress": True,
        "progress": progress_info.get("progress", 0),
        "files_analyzed": progress_info.get("files_analyzed", 0),
        "total_files": progress_info.get("total_files", 0)
    }

@app.post("/sessions/{session_id}/chatbot/initialize")
async def initialize_chatbot(session_id: str):
    """
    Initialize the chatbot by ensuring all necessary data is generated.
    This endpoint immediately returns and starts generating missing analysis data 
    (summaries, tech stack) in the background.
    
    Parameters:
    - session_id: The session ID for the codebase analysis
    
    Returns:
        Status of initialization and expected time to complete
    """
    if not session_manager.session_exists(session_id):
        raise HTTPException(status_code=404, detail="Session not found")
    
    session_data = session_manager.get_session(session_id)
    
    # Check for existing initialization info
    if "chatbot_initialization" in session_data:
        # If already completed, just return status
        if session_data["chatbot_initialization"].get("status") == "completed":
            return {
                "session_id": session_id,
                "initialized": True,
                "status": "completed"
            }
        
        # If in progress, return current status
        if session_data["chatbot_initialization"].get("status") == "in_progress":
            return {
                "session_id": session_id,
                "initialized": False,
                "status": "in_progress",
                "progress": session_data["chatbot_initialization"].get("progress", 0),
                "steps_completed": session_data["chatbot_initialization"].get("steps_completed", []),
                "steps_remaining": session_data["chatbot_initialization"].get("steps_remaining", [])
            }
    
    # Determine what needs to be initialized
    steps_needed = []
    
    # Check if initial analysis is complete
    if session_data.get("status") not in ["ready", "completed"]:
        steps_needed.append("initial_analysis")
    
    # Check if summaries are generated
    has_summaries = "summary" in session_data and "combined_summary" in session_data["summary"]
    if not has_summaries:
        steps_needed.append("summaries")
    
    # Check if tech stack is analyzed
    has_tech_stack = "tech_stack" in session_data
    if not has_tech_stack:
        steps_needed.append("tech_stack")
    
    # If everything is already available, return success
    if not steps_needed:
        session_manager.update_session(session_id, {
            "chatbot_initialization": {
                "status": "completed",
                "completed_at": time.time()
            }
        })
        
        return {
            "session_id": session_id,
            "initialized": True,
            "status": "completed"
        }
    
    # Set initialization status to in_progress
    session_manager.update_session(session_id, {
        "chatbot_initialization": {
            "status": "in_progress",
            "started_at": time.time(),
            "progress": 0,
            "steps_completed": [],
            "steps_remaining": steps_needed
        }
    })
    
    # Start the initialization process in the background without awaiting it
    # This ensures the endpoint returns immediately
    asyncio.create_task(
        run_chatbot_initialization(session_id, steps_needed)
    )
    
    # Estimate time to complete based on steps needed
    estimated_times = {
        "initial_analysis": 60,  # 1 minute
        "summaries": 300,        # 5 minutes
        "tech_stack": 180        # 3 minutes
    }
    
    total_estimated_seconds = sum(estimated_times.get(step, 60) for step in steps_needed)
    
    # Return immediately with status information
    return {
        "session_id": session_id,
        "initialized": False,
        "status": "in_progress",
        "steps_needed": steps_needed,
        "estimated_completion_seconds": total_estimated_seconds
    }

async def run_chatbot_initialization(session_id: str, steps_needed: List[str]):
    """
    Run the initialization process for chatbot data.
    This function runs in the background.
    
    Args:
        session_id: The session ID
        steps_needed: List of initialization steps needed
    """
    if not session_manager.session_exists(session_id):
        logging.error(f"Session {session_id} not found during initialization")
        return
    
    session_data = session_manager.get_session(session_id)
    session_dirs = session_data.get("directories", {})
    
    # Track progress
    total_steps = len(steps_needed)
    completed_steps = []
    
    try:
        # Step 1: Initial analysis if needed
        if "initial_analysis" in steps_needed:
            logging.info(f"Running initial analysis for session {session_id}")
            
            # Update initialization status
            session_manager.update_session(session_id, {
                "chatbot_initialization": {
                    "status": "in_progress",
                    "progress": (len(completed_steps) / total_steps) * 100,
                    "current_step": "initial_analysis",
                    "steps_completed": completed_steps,
                    "steps_remaining": [s for s in steps_needed if s not in completed_steps]
                }
            })
            
            # Run the analyzer in a thread pool to avoid blocking
            loop = asyncio.get_running_loop()
            processed_files = await loop.run_in_executor(
                executor,  # Use the global thread pool executor
                lambda: CodebaseAnalyzer(session_dirs['codebase_dir'], session_dirs['output_dir']).scan_and_identify_files()
            )
            
            # Update session
            session_manager.update_session(session_id, {
                "status": "ready",
                "processed_files": processed_files
            })
            
            # Mark step as completed
            completed_steps.append("initial_analysis")
            
            # Get updated session data
            session_data = session_manager.get_session(session_id)
        
        # Step 2: Generate summaries if needed
        if "summaries" in steps_needed:
            logging.info(f"Generating summaries for session {session_id}")
            
            # Update initialization status
            session_manager.update_session(session_id, {
                "chatbot_initialization": {
                    "status": "in_progress",
                    "progress": (len(completed_steps) / total_steps) * 100,
                    "current_step": "summaries",
                    "steps_completed": completed_steps,
                    "steps_remaining": [s for s in steps_needed if s not in completed_steps]
                }
            })
            
            # Run the summarizer in a thread pool to avoid blocking
            loop = asyncio.get_running_loop()
            summary_result = await loop.run_in_executor(
                executor,  # Use the global thread pool executor
                lambda: CodeSummarizer(
                    codebase_dir=session_dirs['codebase_dir'],
                    output_dir=session_dirs['output_dir']
                ).summarize_codebase()
            )
            
            # Update session
            session_manager.update_session(session_id, {
                "summary": summary_result
            })
            
            # Mark step as completed
            completed_steps.append("summaries")
        
        # Step 3: Generate tech stack if needed
        if "tech_stack" in steps_needed:
            logging.info(f"Generating tech stack analysis for session {session_id}")
            
            # Update initialization status
            session_manager.update_session(session_id, {
                "chatbot_initialization": {
                    "status": "in_progress",
                    "progress": (len(completed_steps) / total_steps) * 100,
                    "current_step": "tech_stack",
                    "steps_completed": completed_steps,
                    "steps_remaining": [s for s in steps_needed if s not in completed_steps]
                }
            })
            
            # Get updated session data
            session_data = session_manager.get_session(session_id)
            
            # Get file list and summary for tech stack analysis
            file_list = session_data.get("processed_files", [])
            codebase_summary = None
            if "summary" in session_data and "combined_summary" in session_data["summary"]:
                codebase_summary = session_data["summary"]["combined_summary"]
            
            # Run the tech stack analyzer in a thread pool to avoid blocking
            loop = asyncio.get_running_loop()
            tech_stack = await loop.run_in_executor(
                executor,  # Use the global thread pool executor
                lambda: TechStackAnalyzer(
                    codebase_dir=session_dirs['codebase_dir'],
                    output_dir=session_dirs['output_dir'],
                    session_id=session_id
                ).analyze_tech_stack(file_list, codebase_summary)
            )
            
            # Update session
            session_manager.update_session(session_id, {
                "tech_stack": tech_stack,
                "tech_stack_analyzed_at": time.time()
            })
            
            # Mark step as completed
            completed_steps.append("tech_stack")
        
        # Mark initialization as complete
        session_manager.update_session(session_id, {
            "status": "completed",
            "chatbot_initialization": {
                "status": "completed",
                "progress": 100,
                "steps_completed": completed_steps,
                "completed_at": time.time()
            }
        })
        
        logging.info(f"Chatbot initialization completed for session {session_id}")
        
    except Exception as e:
        logging.error(f"Error during chatbot initialization for session {session_id}: {e}")
        
        # Update initialization status to error
        session_manager.update_session(session_id, {
            "chatbot_initialization": {
                "status": "error",
                "error": str(e),
                "steps_completed": completed_steps,
                "steps_remaining": [s for s in steps_needed if s not in completed_steps]
            }
        })

@app.get("/sessions/{session_id}/chatbot/initialize/progress")
async def get_chatbot_initialization_progress(session_id: str):
    """
    Get the progress of chatbot initialization.
    
    Parameters:
    - session_id: The session ID for the codebase analysis
    
    Returns:
    - Status information including progress percentage, completed steps, and remaining steps
    """
    if not session_manager.session_exists(session_id):
        raise HTTPException(status_code=404, detail="Session not found")
    
    session_data = session_manager.get_session(session_id)
    
    # Check if initialization info exists
    if "chatbot_initialization" not in session_data:
        return {
            "session_id": session_id,
            "initialized": False,
            "status": "not_started"
        }
    
    initialization_data = session_data["chatbot_initialization"]
    status = initialization_data.get("status", "unknown")
    
    response = {
        "session_id": session_id,
        "initialized": status == "completed",
        "status": status
    }
    
    # Add details based on status
    if status == "completed":
        response["completed_at"] = initialization_data.get("completed_at")
        response["message"] = "Chatbot initialization complete and ready to use"
    elif status == "in_progress":
        response["progress"] = initialization_data.get("progress", 0)
        response["current_step"] = initialization_data.get("current_step")
        response["steps_completed"] = initialization_data.get("steps_completed", [])
        response["steps_remaining"] = initialization_data.get("steps_remaining", [])
        
        # Calculate time elapsed
        started_at = initialization_data.get("started_at")
        if started_at:
            elapsed_seconds = time.time() - started_at
            response["elapsed_seconds"] = int(elapsed_seconds)
        
        # Add descriptive message
        current_step = initialization_data.get("current_step", "")
        if current_step == "initial_analysis":
            response["message"] = "Scanning and analyzing codebase files"
        elif current_step == "summaries":
            response["message"] = "Generating summaries for codebase files"
        elif current_step == "tech_stack":
            response["message"] = "Analyzing technologies used in codebase"
        else:
            response["message"] = "Initializing chatbot"
    elif status == "error":
        response["error"] = initialization_data.get("error")
        response["steps_completed"] = initialization_data.get("steps_completed", [])
        response["steps_remaining"] = initialization_data.get("steps_remaining", [])
        response["message"] = "Error during chatbot initialization"
    else:
        response["message"] = "Unknown initialization status"
    
    return response

@app.post("/sessions/{session_id}/chatbot/query")
async def chatbot_query(
    session_id: str,
    query: str = Form(...),
):
    """
    Query the codebase chatbot with a question.
    The chatbot uses information about the codebase to provide relevant answers.
    
    The chatbot must be initialized first using the /chatbot/initialize endpoint.
    
    Parameters:
    - session_id: The session ID for the codebase analysis
    - query: The user's question about the codebase
    """
    if not session_manager.session_exists(session_id):
        raise HTTPException(status_code=404, detail="Session not found")
    
    session_data = session_manager.get_session(session_id)
    
    # Check if chatbot is initialized
    is_initialized = (
        "chatbot_initialization" in session_data and 
        session_data["chatbot_initialization"].get("status") == "completed"
    )
    
    if not is_initialized:
        raise HTTPException(
            status_code=400, 
            detail="Chatbot not initialized. Please call /chatbot/initialize first."
        )
    
    try:
        # Get session directories
        session_dirs = session_data["directories"]
        
        # Initialize the chatbot
        from app.services.chatbot import CodebaseChatbot
        
        chatbot = CodebaseChatbot(
            codebase_dir=session_dirs['codebase_dir'],
            output_dir=session_dirs['output_dir'],
            session_id=session_id,
            session_manager=session_manager
        )
        
        # Collect available information from session data
        codebase_summary = None
        if "summary" in session_data and "combined_summary" in session_data["summary"]:
            codebase_summary = session_data["summary"]["combined_summary"]
        
        tech_stack = None
        if "tech_stack" in session_data:
            tech_stack = session_data["tech_stack"]
        
        files_processed = session_data.get("processed_files", [])
        
        # Get file summaries from session data
        file_summaries = {}
        if "summary" in session_data and "file_summaries" in session_data["summary"]:
            for file_summary in session_data["summary"]["file_summaries"]:
                file_path = file_summary.get("file_path", "")
                summary = file_summary.get("summary", "")
                if file_path and summary:
                    file_summaries[file_path] = summary
        
        # Generate the response
        response = await chatbot.generate_response(
            query,
            codebase_summary=codebase_summary,
            tech_stack=tech_stack,
            files_processed=files_processed,
            file_summaries=file_summaries
        )
        
        # Store the query and response in session data for history
        if "chat_history" not in session_data:
            session_data["chat_history"] = []
            
        session_data["chat_history"].append({
            "query": query,
            "response": response,
            "timestamp": time.time()
        })
        
        # Update session with new chat history
        session_manager.update_session(session_id, {
            "chat_history": session_data["chat_history"]
        })
        
        return {
            "session_id": session_id,
            "query": query,
            "response": response
        }
        
    except Exception as e:
        logging.error(f"Error in chatbot query: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing chatbot query: {str(e)}")
    
@app.get("/sessions/{session_id}/chatbot/history")
async def get_chatbot_history(session_id: str):
    """
    Get the chat history for a session.
    
    Parameters:
    - session_id: The session ID for the codebase analysis
    """
    if not session_manager.session_exists(session_id):
        raise HTTPException(status_code=404, detail="Session not found")
    
    session_data = session_manager.get_session(session_id)
    
    chat_history = session_data.get("chat_history", [])
    
    return {
        "session_id": session_id,
        "chat_history": chat_history
    }

@app.get("/test")
async def test_endpoint():
    return {"message": "Hello! Welcome to VizCoAssist API."}
        
@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on application shutdown."""
    executor.shutdown(wait=False)
    logging.info("Application shutting down, resources cleaned up")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)