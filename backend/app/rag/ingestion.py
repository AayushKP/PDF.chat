from pathlib import Path

from app.config import settings
from app.rag.embedder import embeddings
from app.rag.loader import load_pdf
from app.rag.qdrant_client import client
from app.rag.splitter import split_documents
from app.utils.hash import (
    content_hash,
    generate_chunk_uuid,
)
from qdrant_client.models import PointStruct

BATCH_SIZE = 10


def ingest_pdf(pdf_path: str) -> int:
    """
    Complete ingestion pipeline.

    PDF
        ↓
    Load
        ↓
    Split
        ↓
    Embed (Batch)
        ↓
    Upload (Batch)

    Returns
    -------
    int
        Number of chunks uploaded.
    """

    document_name = Path(pdf_path).name

    documents = load_pdf(pdf_path)

    chunks = split_documents(documents)

    total_chunks = len(chunks)

    print(f"Found {total_chunks} chunks")

    uploaded = 0

    for batch_start in range(0, total_chunks, BATCH_SIZE):
        batch_chunks = chunks[batch_start : batch_start + BATCH_SIZE]

        batch_texts = [chunk.page_content for chunk in batch_chunks]

        batch_vectors = embeddings.embed_documents(batch_texts)

        points = []

        for local_index, (chunk, vector) in enumerate(zip(batch_chunks, batch_vectors)):
            global_index = batch_start + local_index

            point = PointStruct(
                id=generate_chunk_uuid(
                    document_name=document_name,
                    page=chunk.metadata.get("page", 0),
                    chunk_index=global_index,
                ),
                vector=vector,
                payload={
                    "text": chunk.page_content,
                    "document_name": document_name,
                    "content_hash": content_hash(chunk.page_content),
                    **chunk.metadata,
                },
            )

            points.append(point)

        client.upsert(
            collection_name=settings.COLLECTION_NAME,
            points=points,
            wait=True,
        )

        uploaded += len(points)

        print(f"Uploaded {uploaded}/{total_chunks}")

    print("Ingestion Complete")

    return uploaded
