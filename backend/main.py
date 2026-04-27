from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from rag.loader import load_pdf
from rag.chain import get_rag_chain, parse_chain_response
import tempfile
import os

app = FastAPI()

# Local + LAN (Vite "Network" URL, e.g. http://10.0.0.122:8080) for dev
_LAN_DEV = (
    r"http://(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}"
    r"|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}):(8080|5173)"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=_LAN_DEV,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chain = get_rag_chain()

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    if not (file.filename or "").lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            contents = await file.read()
            tmp.write(contents)
            tmp_path = tmp.name

        chunks = load_pdf(tmp_path)
        full_text = "\n".join(chunk["text"] for chunk in chunks)

        response = chain.invoke({"query": full_text})
        parsed = parse_chain_response(response["result"])

        return parsed

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)