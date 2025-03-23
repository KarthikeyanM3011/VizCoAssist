from pathlib import Path
from abc import ABC, abstractmethod

class BaseRenderer(ABC):
    """
    Abstract base class for diagram renderers.
    All diagram renderers should inherit from this class and implement
    the required methods.
    """
    
    @abstractmethod
    def generate_png(self, diagram_code: str, output_dir: Path) -> Path:
        """
        Generate a PNG image from diagram code.
        
        Args:
            diagram_code: The diagram code to render
            output_dir: Directory where the PNG should be saved
            
        Returns:
            Path to the generated PNG file
            
        Raises:
            Exception: If rendering fails
        """
        pass