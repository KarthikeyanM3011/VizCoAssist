import json
import shelve
import logging
from pathlib import Path
from typing import Dict, Any, Optional, Set
import threading
from datetime import datetime, timedelta

from app.config import DataPaths

class SessionManager:
    """
    Manages active sessions for the application, including creation,
    updates, and cleanup.
    """
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        """Implement singleton pattern to ensure only one session manager exists."""
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(SessionManager, cls).__new__(cls)
                cls._instance._initialize()
            return cls._instance
    
    def _initialize(self):
        """Initialize the session manager."""
        self.sessions = {}
        self.db_path = DataPaths.SESSIONS_DIR / "sessions_db"
        self.load_sessions()
        logging.info("Session manager initialized")
    
    def load_sessions(self):
        """Load sessions from persistent storage."""
        try:
            self.db_path.parent.mkdir(parents=True, exist_ok=True)
            with shelve.open(str(self.db_path)) as db:
                for session_id in db.keys():
                    self.sessions[session_id] = db[session_id]
            logging.info(f"Loaded {len(self.sessions)} sessions from database")
        except Exception as e:
            logging.error(f"Error loading sessions: {e}")
            self.sessions = {}
    
    def save_sessions(self):
        """Save all sessions to persistent storage."""
        try:
            with shelve.open(str(self.db_path)) as db:
                for session_id, session_data in self.sessions.items():
                    db[session_id] = session_data
            logging.info(f"Saved {len(self.sessions)} sessions to database")
        except Exception as e:
            logging.error(f"Error saving sessions: {e}")
    
    def register_session(self, session_id: str, initial_data: Dict[str, Any]) -> None:
        """Register a new session with initial data."""
        with self._lock:
            self.sessions[session_id] = {
                **initial_data,
                "created_at": datetime.now().isoformat(),
                "last_accessed": datetime.now().isoformat(),
            }
            self.save_sessions()
            logging.info(f"Registered new session {session_id}")
    
    def update_session(self, session_id: str, update_data: Dict[str, Any]) -> None:
        """Update an existing session with new data."""
        with self._lock:
            if session_id not in self.sessions:
                logging.warning(f"Attempted to update non-existent session {session_id}")
                return
            
            # Update the session data
            self.sessions[session_id].update(update_data)
            self.sessions[session_id]["last_accessed"] = datetime.now().isoformat()
            self.save_sessions()
            logging.info(f"Updated session {session_id}")
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get data for a specific session."""
        with self._lock:
            if session_id not in self.sessions:
                return None
            
            # Update last accessed time
            self.sessions[session_id]["last_accessed"] = datetime.now().isoformat()
            return dict(self.sessions[session_id])  # Return a copy
    
    def session_exists(self, session_id: str) -> bool:
        """Check if a session exists."""
        return session_id in self.sessions
    
    def clean_old_sessions(self, max_age_days: int = 7) -> int:
        """
        Remove sessions older than the specified number of days.
        Returns the count of removed sessions.
        """
        with self._lock:
            now = datetime.now()
            sessions_to_remove = []
            
            for session_id, session_data in self.sessions.items():
                last_accessed = datetime.fromisoformat(session_data["last_accessed"])
                if now - last_accessed > timedelta(days=max_age_days):
                    sessions_to_remove.append(session_id)
            
            # Remove the old sessions
            for session_id in sessions_to_remove:
                del self.sessions[session_id]
                
                # Also delete the session files if they exist
                session_dir = DataPaths.SESSIONS_DIR / session_id
                if session_dir.exists():
                    import shutil
                    shutil.rmtree(session_dir)
            
            # Save the updated sessions
            if sessions_to_remove:
                self.save_sessions()
                logging.info(f"Cleaned {len(sessions_to_remove)} old sessions")
            
            return len(sessions_to_remove)
    
    def get_all_session_ids(self) -> Set[str]:
        """Get a set of all active session IDs."""
        return set(self.sessions.keys())
    
    def close(self):
        """Close the session manager and save any pending changes."""
        with self._lock:
            self.save_sessions()
            logging.info("Session manager closed")