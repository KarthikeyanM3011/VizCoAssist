from pathlib import Path
import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

class LLMConfig:
    """Configuration for LLM services."""
    LLM_API_URL = os.getenv("LLM_API_URL", "http://localhost:11434/api/generate")
    SUMMARIZATION_MODEL = os.getenv("SUMMARIZATION_MODEL", "llama3.2:latest")
    DIAGRAM_MODEL = os.getenv("DIAGRAM_MODEL", "llama3.2:latest")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY= os.getenv("GEMINI_API_KEY", "")
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
    CLEAN_CACHE_ON_STARTUP = os.getenv("CLEAN_CACHE_ON_STARTUP", "False").lower() == "true"
    MAX_FIX_ATTEMPTS = int(os.getenv("MAX_FIX_ATTEMPTS", "2"))

class DiagramConfig:
    """Configuration for diagram generation."""
    DEFAULT_DIAGRAM_TYPE = os.getenv("DEFAULT_DIAGRAM_TYPE", "mermaid")
    GENERATE_DIAGRAMS = os.getenv("GENERATE_DIAGRAMS", "True").lower() == "true"
    
class DataPaths:
    """Paths for data storage and processing."""
    # Main data directories
    UPLOADS_DIR = DATA_DIR / "uploads"
    SESSIONS_DIR = DATA_DIR / "sessions"
    OUTPUT_DIR = DATA_DIR / "output"
    CACHE_DIR = DATA_DIR / "cache"
    
    # Helper function to create session-specific directories
    @staticmethod
    def get_session_dirs(session_id: str) -> dict:
        """Get the directory paths for a specific session."""
        session_dir = DataPaths.SESSIONS_DIR / session_id
        return {
            "session_dir": session_dir,
            "upload_dir": session_dir / "upload",
            "codebase_dir": session_dir / "codebase",
            "output_dir": session_dir / "output",
            "cache_dir": session_dir / "cache",
        }

class FileProcessingConfig:
    """Configuration for file processing."""
    MAX_FILE_SIZE = 500 * 1024  # Max file size (500KB) for analysis
    
    # File types to skip
    IRRELEVANT_EXTENSIONS = [
        # Binaries
        '.bin', '.exe', '.o', '.obj', '.class', '.pyc', '.pyo', '.jar', '.dll',
        # Media
        '.jpg', '.jpeg', '.png', '.gif', '.mp3', '.mp4', '.avi', '.mov',
        # Archives
        '.zip', '.tar', '.gz', '.rar', '.7z',
        # Other
        '.swp', '.swo', '.tmp', '.bak'
    ]
    
    # Directories to skip
    IRRELEVANT_DIRECTORIES = [
        '.git', '.vscode', '__pycache__', 'node_modules', 'venv', 'env',
        'build', 'dist', 'target', 'tests', 'test'
    ]