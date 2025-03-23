import logging
from pathlib import Path
from plantuml import PlantUML, PlantUMLHTTPError

from app.utils.helpers import create_unique_filename
from app.renderers.base import BaseRenderer

class PlantUMLRenderer(BaseRenderer):
    """Renderer for PlantUML diagrams."""
    
    def generate_png(self, diagram_code: str, output_dir: Path) -> Path:
        """
        Generate a PNG image from PlantUML code using the public PlantUML server.
        
        Args:
            diagram_code: The PlantUML code to render
            output_dir: Directory where the PNG should be saved
            
        Returns:
            Path to the generated PNG file
            
        Raises:
            Exception: If rendering fails
        """
        # Create a unique filename for the output image
        png_filename = create_unique_filename("plantuml_diagram", "png")
        png_filepath = output_dir / png_filename
        
        try:
            # Create a PlantUML client pointing to the public server
            plantuml_server = PlantUML(url='http://www.plantuml.com/plantuml/img/')
            
            # Get the PNG image bytes
            png_data = plantuml_server.processes(diagram_code)
            
            # Write the PNG data to a file
            with open(png_filepath, 'wb') as f:
                f.write(png_data)
            
            logging.info(f"PlantUML diagram image saved to {png_filepath}")
            
            return png_filepath
            
        except PlantUMLHTTPError as e:
            logging.error(f"Error generating PNG from PlantUML code: {e}")
            raise Exception(f"PlantUML rendering error: {e}")
        
        except Exception as e:
            logging.error(f"Unexpected error in PlantUML renderer: {e}")
            raise Exception(f"PlantUML rendering error: {e}")