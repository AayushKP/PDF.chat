import time
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

BATCH_SIZE = 50


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
    """

    pipeline_start = time.perf_counter()

    pdf_path = Path(path)
    document_name = pdf_path.name

    # -------------------------
    # Load PDF
    # -------------------------

    start = time.perf_counter()

    documents = load_pdf(str(pdf_path))

    print(f" Load PDF: {time.perf_counter() - start:.2f}s")

    page_count = len(documents)

    # -------------------------
    # Split
    # -------------------------

    start = time.perf_counter()

    chunks = split_documents(documents)

    print(f" Chunking: {time.perf_counter() - start:.2f}s")

    chunk_count = len(chunks)

    print(f"Found {chunk_count} chunks")

    uploaded = 0

    # -------------------------
    # Embed + Upload
    # -------------------------

    for batch_start in range(0, chunk_count, BATCH_SIZE):
        batch_chunks = chunks[batch_start : batch_start + BATCH_SIZE]

        batch_texts = [chunk.page_content for chunk in batch_chunks]

        embed_start = time.perf_counter()

        batch_vectors = embeddings.embed_documents(batch_texts)

        print(
            f" Embedding Batch {batch_start // BATCH_SIZE + 1}: "
            f"{time.perf_counter() - embed_start:.2f}s"
        )

        points = []

        for local_index, (chunk, vector) in enumerate(zip(batch_chunks, batch_vectors)):
            global_chunk_index = batch_start + local_index

            page = chunk.metadata.get("page", 0)

            points.append(
                PointStruct(
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
            )

        upload_start = time.perf_counter()

        client.upsert(
            collection_name=settings.COLLECTION_NAME,
            points=points,
            wait=False,
        )

        print(
            f"⬆️ Upload Batch {batch_start // BATCH_SIZE + 1}: "
            f"{time.perf_counter() - upload_start:.2f}s"
        )

        uploaded += len(points)

        print(f"Uploaded {uploaded}/{chunk_count}")

    print(f"\nTotal Ingestion Time: {time.perf_counter() - pipeline_start:.2f}s")

    return {
        "page_count": page_count,
        "chunk_count": chunk_count,
    }
