from pathlib import Path

from qdrant_client.models import PointStruct

from app.config import settings
from app.rag.embedder import embeddings
from app.rag.loader import load_pdf
from app.rag.qdrant_client import client
from app.rag.splitter import split_documents
from app.utils.hash import (
    content_hash,
    generate_chunk_uuid,
)

BATCH_SIZE = 10


def ingest_pdf(
    path: str,
    document_id: str,
    user_id: str,
) -> dict:
    """
    Complete ingestion pipeline.

    PDF
        ↓
    Load
        ↓
    Split
        ↓
    Embed
        ↓
    Upload to Qdrant

    Returns
    -------
    {
        "page_count": int,
        "chunk_count": int
    }
    """

    pdf_path = Path(path)
    document_name = pdf_path.name

    documents = load_pdf(str(pdf_path))

    page_count = len(documents)

    chunks = split_documents(documents)

    chunk_count = len(chunks)

    print(f"Found {chunk_count} chunks")

    uploaded = 0

    for batch_start in range(0, chunk_count, BATCH_SIZE):
        batch_chunks = chunks[batch_start : batch_start + BATCH_SIZE]

        batch_texts = [chunk.page_content for chunk in batch_chunks]

        batch_vectors = embeddings.embed_documents(batch_texts)

        points = []

        for local_index, (chunk, vector) in enumerate(zip(batch_chunks, batch_vectors)):
            global_chunk_index = batch_start + local_index

            page = chunk.metadata.get("page", 0)

            point = PointStruct(
                id=generate_chunk_uuid(
                    document_name=document_name,
                    page=page,
                    chunk_index=global_chunk_index,
                ),
                vector=vector,
                payload={
                    "document_id": document_id,
                    "user_id": user_id,
                    "document_name": document_name,
                    "page": page,
                    "chunk_index": global_chunk_index,
                    "text": chunk.page_content,
                    "content_hash": content_hash(chunk.page_content),
                },
            )

            points.append(point)

        client.upsert(
            collection_name=settings.COLLECTION_NAME,
            points=points,
            wait=True,
        )

        uploaded += len(points)

        print(f"Uploaded {uploaded}/{chunk_count}")

    print("Ingestion Complete")

    return {
        "page_count": page_count,
        "chunk_count": chunk_count,
    }
