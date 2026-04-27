import fitz  # PyMuPDF
from pathlib import Path

def load_pdf(file_path: str) -> list[dict]:
    doc = fitz.open(file_path)
    chunks = []
    
    for page_num, page in enumerate(doc):
        text = page.get_text()
        if text.strip():
            chunks.append({
                "text": text,
                "metadata": {
                    "source": Path(file_path).name,
                    "page": page_num + 1
                }
            })
    
    doc.close()
    return chunks