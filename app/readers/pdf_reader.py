import pdfplumber
import logging
import fitz  # PyMuPDF for PDF image extraction
import pytesseract
from PIL import Image

# File extensions this reader handles
FILE_EXTENSIONS = ['.pdf']

def read_file(file_path):
    """
    Extract text from a PDF file, using OCR if necessary.
    
    Args:
        file_path: Path to the file to read
        
    Returns:
        Content of the file as a string
    """
    try:
        text = ''
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text
        
        # If no text was extracted, try OCR
        if not text.strip():
            logging.info(f"No text extracted from {file_path}, performing OCR.")
            text = _ocr_pdf_file(file_path)
            
        return text
        
    except Exception as e:
        logging.error(f"Error reading PDF file {file_path}: {e}")
        return f"Error reading file: {e}"

def _ocr_pdf_file(file_path):
    """
    Perform OCR on a PDF file.
    
    Args:
        file_path: Path to the PDF file
        
    Returns:
        Extracted text from OCR
    """
    try:
        text = ''
        with fitz.open(file_path) as doc:
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                pix = page.get_pixmap()
                img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                text += pytesseract.image_to_string(img)
                
        return text
        
    except Exception as e:
        logging.error(f"Error performing OCR on PDF file {file_path}: {e}")
        return f"Error performing OCR: {e}"