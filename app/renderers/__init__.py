"""
Renderer package for diagram generation.

This package provides renderers for different types of diagrams
(Mermaid, PlantUML, etc.) with a common interface.
"""

import logging
from app.renderers.base import BaseRenderer
from app.renderers.factory import create_renderer, register_renderer

# Import renderers to register them
from app.renderers.mermaid import MermaidRenderer
from app.renderers.plantuml import PlantUMLRenderer

# Register built-in renderers
register_renderer('mermaid', MermaidRenderer)
register_renderer('plantuml', PlantUMLRenderer)

def get_renderer(diagram_type: str) -> BaseRenderer:
    """
    Get a renderer instance for the specified diagram type.
    
    Args:
        diagram_type: Type of diagram ('mermaid', 'plantuml', etc.)
        
    Returns:
        Instance of the appropriate renderer class
        
    Raises:
        ValueError: If no renderer is found for the diagram type
    """
    try:
        return create_renderer(diagram_type)
    except ValueError as e:
        logging.error(f"Failed to get renderer for {diagram_type}: {e}")
        raise

__all__ = [
    'BaseRenderer',
    'get_renderer',
    'register_renderer',
    'MermaidRenderer',
    'PlantUMLRenderer'
]