# -*- coding: utf-8 -*-
"""
Document text extractor helper for PIZHAI.
Extracts raw text from PDF, DOCX, and TXT files.
"""

import logging
from pathlib import Path

logger = logging.getLogger(__name__)

def extract_text_from_file(filepath: str) -> str:
    """
    Extract text content based on file extension.
    Supports .txt, .pdf, and .docx files.
    """
    path = Path(filepath)
    ext = path.suffix.lower()
    
    if not path.exists():
        raise FileNotFoundError(f"File not found: {filepath}")

    if ext == ".txt":
        return _extract_txt(path)
    elif ext == ".pdf":
        return _extract_pdf(path)
    elif ext == ".docx":
        return _extract_docx(path)
    else:
        raise ValueError(f"Unsupported file format: {ext}")

def _extract_txt(path: Path) -> str:
    # Try different encodings
    for encoding in ("utf-8", "utf-8-sig", "latin-1", "cp1252"):
        try:
            with open(path, "r", encoding=encoding) as f:
                return f.read().strip()
        except UnicodeDecodeError:
            continue
    raise UnicodeDecodeError("txt", b"", 0, 0, "Failed to decode text file with standard encodings.")

def _extract_pdf(path: Path) -> str:
    try:
        import pypdf
        reader = pypdf.PdfReader(str(path))
        text_parts = []
        for idx, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                text_parts.append(text)
        return "\n\n".join(text_parts).strip()
    except Exception as e:
        logger.error(f"PDF extraction error: {e}")
        raise RuntimeError(f"Failed to extract text from PDF: {e}")

def _extract_docx(path: Path) -> str:
    try:
        import docx
        doc = docx.Document(str(path))
        text_parts = [p.text for p in doc.paragraphs]
        return "\n".join(text_parts).strip()
    except Exception as e:
        logger.error(f"Word document extraction error: {e}")
        raise RuntimeError(f"Failed to extract text from DOCX: {e}")
