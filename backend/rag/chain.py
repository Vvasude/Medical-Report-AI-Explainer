from pathlib import Path

import chromadb
from dotenv import load_dotenv
from langchain_classic.chains import RetrievalQA
from langchain_core.prompts import PromptTemplate
from langchain_chroma import Chroma
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings
import os

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

PROMPT_TEMPLATE = """
You are a helpful medical assistant explaining lab results to a patient in plain English.
Use the reference information below to explain each value clearly and simply.
Always recommend consulting a doctor.

Reference context:
{context}

Patient lab results:
{question}

You MUST respond with ONLY valid JSON, no markdown, no backticks, no extra text.
Use this exact structure:
{{
  "summary": "2-3 sentence plain English overall summary",
  "flagged_count": <number of non-normal results>,
  "results": [
    {{
      "test_name": "exact test name",
      "value": <numeric value only>,
      "unit": "unit string",
      "reference_low": <numeric low end of normal range>,
      "reference_high": <numeric high end of normal range>,
      "status": "Normal | Low | High",
      "explanation": "2-3 sentence plain English explanation"
    }}
  ]
}}
"""

def get_rag_chain():
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    api_key = os.getenv("CHROMA_API_KEY")
    tenant = os.getenv("CHROMA_TENANT")
    database = os.getenv("CHROMA_DATABASE")
    if not all([api_key, tenant, database]):
        raise ValueError(
            "Set CHROMA_API_KEY, CHROMA_TENANT, and CHROMA_DATABASE in backend/.env"
        )
    client = chromadb.CloudClient(api_key=api_key, tenant=tenant, database=database)

    vector_store = Chroma(
        client=client,
        collection_name="lab_guidelines",
        embedding_function=embeddings
    )

    model = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite-preview")
    llm = ChatGoogleGenerativeAI(model=model, temperature=0.3)

    prompt = PromptTemplate(
        template=PROMPT_TEMPLATE,
        input_variables=["context", "question"]
    )

    chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vector_store.as_retriever(search_kwargs={"k": 4}),
        chain_type_kwargs={"prompt": prompt}
    )
    return chain