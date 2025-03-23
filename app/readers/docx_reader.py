import docx
import logging

# File extensions this reader handles
FILE_EXTENSIONS = ['.docx']

def read_file(file_path):
    """
    Read contents from a .docx file.
    
    Args:
        file_path: Path to the file to read
        
    Returns:
        Content of the file as a string
    """
    try:
        doc = docx.Document(file_path)
        full_text = []
        
        for para in doc.paragraphs:
            full_text.append(para.text)
            
        return '\n'.join(full_text)
        
    except Exception as e:
        logging.error(f"Error reading docx file {file_path}: {e}")
        return f"Error reading file: {e}"