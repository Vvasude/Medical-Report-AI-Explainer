import os
from pathlib import Path

from dotenv import load_dotenv
import chromadb
from rag.chain import get_rag_chain

_env = Path(__file__).resolve().parent / ".env"
load_dotenv(_env)


def _require_chroma_env() -> tuple[str, str, str]:
    api_key = os.getenv("CHROMA_API_KEY")
    tenant = os.getenv("CHROMA_TENANT")
    database = os.getenv("CHROMA_DATABASE")
    missing = [n for n, v in (
        ("CHROMA_API_KEY", api_key),
        ("CHROMA_TENANT", tenant),
        ("CHROMA_DATABASE", database),
    ) if not v]
    if missing:
        raise SystemExit(
            f"Missing env vars: {', '.join(missing)}. "
            "Copy tenant + database from the Chroma Cloud dashboard; create an API key there."
        )
    return api_key, tenant, database

# Google Gemini test connection
# llm = ChatGoogleGenerativeAI(model="gemini-3.1-flash-lite-preview")
# response = llm.invoke("Say hello in one sentence")
# print(response.content)

# Chroma Cloud: use CloudClient (dashboard snippet), not HttpClient with a custom host.
api_key, tenant, database = _require_chroma_env()
chroma_client = chromadb.CloudClient(api_key=api_key, tenant=tenant, database=database)
print("Chroma heartbeat (ns):", chroma_client.heartbeat())
print("Chroma collections:", [c.name for c in chroma_client.list_collections()])



if os.getenv("RUN_RAG_LLM", "1") == "0":
    print("Skipping RAG LLM invoke (RUN_RAG_LLM=0). Chroma checks above are enough for infra smoke test.")
else:
    chain = get_rag_chain()
    test_input = """
Hemoglobin: 10.2 g/dL
WBC: 11.5 x10^9/L
Platelets: 145 x10^9/L
"""
    try:
        response = chain.invoke({"query": test_input})
        print(response["result"])
    except Exception as e:
        err = str(e)
        if "429" in err or "RESOURCE_EXHAUSTED" in err:
            print(
                "\nGemini returned 429 (quota exhausted or no free quota for this model).\n"
                "Try in backend/.env: GEMINI_MODEL=gemini-2.5-flash-lite "
                "or GEMINI_MODEL=gemini-3.1-flash-lite-preview\n"
                "Or wait for the daily/minute reset, or enable billing: "
                "https://ai.google.dev/gemini-api/docs/rate-limits\n"
            )
        raise