from pathlib import Path

from app.config import settings
from app.rag.embedder import embeddings
from app.rag.loader import load_pdf
from app.rag.qdrant_client import client
from app.rag.splitter import split_documents
from app.utils.hash import generate_chunk_id
from qdrant_client.models import PointStruct

# Number of chunks processed per batch.
# Helps avoid timeouts and keeps memory usage low.
BATCH_SIZE = 20


def ingest_pdf(pdf_path: str) -> int:
    """
    Complete PDF ingestion pipeline.

    Pipeline:
        PDF
            ↓
        Load
            ↓
        Split
            ↓
        Batch Embeddings
            ↓
        Batch Upload to Qdrant

    Returns:
        int: Number of chunks ingested.
    """

    # Load PDF
    documents = load_pdf(pdf_path)

    # Split into chunks
    chunks = split_documents(documents)

    document_name = Path(pdf_path).name

    total_chunks = len(chunks)

    print(f"Found {total_chunks} chunks")

    uploaded = 0

    # Process in batches
    for start in range(0, total_chunks, BATCH_SIZE):
        batch_chunks = chunks[start : start + BATCH_SIZE]

        texts = [chunk.page_content for chunk in batch_chunks]

        vectors = embeddings.embed_documents(texts)

        points = []

        for local_index, (chunk, vector) in enumerate(zip(batch_chunks, vectors)):
            global_index = start + local_index

            point = PointStruct(
                id=generate_chunk_id(
                    document_name=document_name,
                    page=chunk.metadata.get("page", 0),
                    chunk_index=global_index,
                ),
                vector=vector,
                payload={
                    "text": chunk.page_content,
                    "document_name": document_name,
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

    print("✅ Ingestion Complete")

    return uploaded
