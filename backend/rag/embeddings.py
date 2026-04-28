import os
from pathlib import Path

import chromadb
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings

load_dotenv(Path(__file__).resolve().parent.parent / ".env")


def get_chroma_client():
    api_key = os.getenv("CHROMA_API_KEY")
    tenant = os.getenv("CHROMA_TENANT")
    database = os.getenv("CHROMA_DATABASE")
    if not all([api_key, tenant, database]):
        raise ValueError(
            "Set CHROMA_API_KEY, CHROMA_TENANT, and CHROMA_DATABASE in backend/.env"
        )
    return chromadb.CloudClient(api_key=api_key, tenant=tenant, database=database)


def get_embeddings():
    embedding_model = os.getenv("EMBEDDING_MODEL", "models/text-embedding-004")
    return GoogleGenerativeAIEmbeddings(model=embedding_model)


def store_chunks(chunks: list[dict], collection_name: str = "lab_guidelines"):
    client = get_chroma_client()
    embeddings_model = get_embeddings()

    collection = client.get_or_create_collection(collection_name)

    texts = [chunk["text"] for chunk in chunks]
    metadatas = [chunk["metadata"] for chunk in chunks]
    ids = [
        f"{chunk['metadata']['source']}_page_{chunk['metadata']['page']}"
        for chunk in chunks
    ]

    embeddings = embeddings_model.embed_documents(texts)

    collection.add(
        documents=texts,
        embeddings=embeddings,
        metadatas=metadatas,
        ids=ids,
    )

    print(f"Stored {len(chunks)} chunks into '{collection_name}'")
