"""
VizCoAssist - A codebase analysis and architecture visualization tool.

This package provides a FastAPI-based application for uploading,
analyzing, and visualizing codebases through architecture diagrams.
"""

import logging
from pathlib import Path

__version__ = '1.0.0'
__author__ = 'VizCoAssist Team'
__description__ = 'Codebase analysis and architecture visualization service'

# Configure logging at the package level
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

# Create logger for this package
logger = logging.getLogger(__name__)

# Ensure data directories exist
from app.config import DataPaths

def _ensure_directories():
    """Ensure all required data directories exist."""
    for path in [
        DataPaths.UPLOADS_DIR,
        DataPaths.SESSIONS_DIR,
        DataPaths.OUTPUT_DIR,
        DataPaths.CACHE_DIR
    ]:
        path.mkdir(parents=True, exist_ok=True)
        logger.debug(f"Directory ensured: {path}")

# Create directories on import
_ensure_directories()