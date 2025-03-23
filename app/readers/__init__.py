import os
import glob
import importlib
import logging

# Initialize a registry of readers
_readers = {}

def _default_reader(file_path):
    """Default text file reader if no specific reader is found for the file extension."""
    logging.debug(f"Using default text reader for {file_path}")
    from .text_reader import read_file
    return read_file(file_path)

# Dynamically import all modules in the current directory
def _load_readers():
    """Dynamically load all reader modules."""
    module_dir = os.path.dirname(__file__)
    module_files = glob.glob(os.path.join(module_dir, '*.py'))
    
    for module_file in module_files:
        module_name = os.path.basename(module_file)[:-3]  # Strip the .py extension
        
        if module_name == '__init__':
            continue  # Skip the __init__.py file
        
        try:
            # Dynamically import the module
            module = importlib.import_module(f'.{module_name}', package=__package__)
            
            # Check if the module has 'FILE_EXTENSIONS' and 'read_file'
            if hasattr(module, 'FILE_EXTENSIONS') and hasattr(module, 'read_file'):
                for ext in module.FILE_EXTENSIONS:
                    _readers[ext.lower()] = module.read_file
                    logging.debug(f"Registered reader for extension {ext} from module {module_name}")
            else:
                logging.warning(f"Module {module_name} does not have FILE_EXTENSIONS or read_file function.")
                
        except Exception as e:
            logging.error(f"Failed to import reader module {module_name}: {e}")

# Load readers on module import
_load_readers()

def get_file_reader(file_extension):
    """
    Return the appropriate reader function based on the file extension.
    
    Args:
        file_extension: File extension including dot (e.g., '.py', '.txt')
        
    Returns:
        Function to read the file content
    """
    reader = _readers.get(file_extension.lower(), _default_reader)
    
    reader_name = reader.__module__.split('.')[-1]
    if reader == _default_reader:
        logging.info(f"No specific reader found for extension '{file_extension}'. Using default reader.")
    else:
        logging.debug(f"Using reader '{reader_name}' for extension '{file_extension}'.")
        
    return reader