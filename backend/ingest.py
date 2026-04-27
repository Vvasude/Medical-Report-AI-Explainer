from rag.loader import load_pdf
from rag.embeddings import store_chunks
from pathlib import Path

GUIDELINES_DIR = Path("data/guidelines")

def ingest_all():
    pdf_files = list(GUIDELINES_DIR.glob("*.pdf"))
    
    if not pdf_files:
        print("No PDFs found in data/guidelines/")
        return
    
    for pdf_path in pdf_files:
        print(f"Processing {pdf_path.name}...")
        chunks = load_pdf(str(pdf_path))
        store_chunks(chunks)
        print(f"Done — {len(chunks)} pages ingested from {pdf_path.name}")
    
    print("\nIngestion complete.")

if __name__ == "__main__":
    ingest_all()