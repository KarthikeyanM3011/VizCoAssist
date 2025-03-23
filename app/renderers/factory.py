"""
Factory module for creating diagram renderers.

This module encapsulates the logic for selecting and instantiating
the appropriate renderer based on the diagram type.
"""

import logging
from importlib import import_module
from typing import Dict, Type

from app.renderers.base import BaseRenderer

# Cache of renderer classes
_renderer_classes: Dict[str, Type[BaseRenderer]] = {}

def register_renderer(diagram_type: str, renderer_class: Type[BaseRenderer]) -> None:
    """
    Register a renderer class for a specific diagram type.
    
    Args:
        diagram_type: Type of diagram (e.g., 'mermaid', 'plantuml')
        renderer_class: Class that implements the BaseRenderer interface
    """
    global _renderer_classes
    _renderer_classes[diagram_type.lower()] = renderer_class
    logging.debug(f"Registered renderer class for {diagram_type}: {renderer_class.__name__}")

def get_renderer_class(diagram_type: str) -> Type[BaseRenderer]:
    """
    Get the renderer class for a specific diagram type.
    
    Args:
        diagram_type: Type of diagram (e.g., 'mermaid', 'plantuml')
        
    Returns:
        Renderer class that implements BaseRenderer
        
    Raises:
        ValueError: If no renderer is found for the diagram type
    """
    global _renderer_classes
    
    diagram_type = diagram_type.lower()
    
    # Check if already in cache
    if diagram_type in _renderer_classes:
        return _renderer_classes[diagram_type]
    
    # Try to dynamically import
    try:
        module_name = f'app.renderers.{diagram_type}'
        class_name = f'{diagram_type.capitalize()}Renderer'
        
        module = import_module(module_name)
        renderer_class = getattr(module, class_name)
        
        # Cache the class
        _renderer_classes[diagram_type] = renderer_class
        
        return renderer_class
        
    except (ImportError, AttributeError) as e:
        logging.error(f"Failed to load renderer for {diagram_type}: {e}")
        raise ValueError(f"No renderer available for diagram type: {diagram_type}")

def create_renderer(diagram_type: str) -> BaseRenderer:
    """
    Create a renderer instance for the specified diagram type.
    
    Args:
        diagram_type: Type of diagram (e.g., 'mermaid', 'plantuml')
        
    Returns:
        Renderer instance
        
    Raises:
        ValueError: If no renderer is found for the diagram type
    """
    renderer_class = get_renderer_class(diagram_type)
    return renderer_class()