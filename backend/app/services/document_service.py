from uuid import UUID

from rq import Queue

from app.config import settings
from app.queue.client import (
    INGESTION_QUEUE_NAME,
    redis_connection,
)
from app.queue.jobs import process_document
from app.repositories.document_repository import DocumentRepository
from app.storage.service import StorageService


class DocumentService:
    def __init__(
        self,
        repository: DocumentRepository,
        storage: StorageService,
    ):
        self.repository = repository
        self.storage = storage

    def upload(
        self,
        *,
        file,
        user_id,
    ):
        # --------------------------
        # Validation
        # --------------------------

        max_size = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

        file.file.seek(0, 2)
        file_size = file.file.tell()
        file.file.seek(0)

        if file_size == 0:
            raise ValueError("File is empty.")

        if file_size > max_size:
            raise ValueError(
                f"Maximum upload size is {settings.MAX_UPLOAD_SIZE_MB} MB."
            )

        if file.content_type != "application/pdf":
            raise ValueError("Only PDF files are supported.")

        # --------------------------
        # Read file once
        # --------------------------

        file_bytes = file.file.read()
        file.file.seek(0)

        content_hash = self.storage.calculate_hash(file_bytes)

        # --------------------------
        # Generate R2 key
        # --------------------------

        document_key = self.storage.generate_document_key(
            file.filename,
        )

        # --------------------------
        # Upload to R2
        # --------------------------

        self.storage.upload(
            file=file,
            key=document_key,
        )

        document_url = self.storage.get_document_url(
            document_key,
        )

        # --------------------------
        # Create database record
        # --------------------------

        document = self.repository.create(
            user_id=user_id,
            filename=file.filename,
            document_key=document_key,
            document_url=document_url,
            file_size=file_size,
            mime_type=file.content_type,
            content_hash=content_hash,
        )

        # --------------------------
        # Queue ingestion job
        # --------------------------

        queue = Queue(
            name=INGESTION_QUEUE_NAME,
            connection=redis_connection,
        )

        queue.enqueue(
            process_document,
            document_id=str(document.id),
            user_id=str(user_id),
        )

        print(f"Queued document: {document.id}")

        return document

    def list_documents(
        self,
        user_id,
    ):
        return self.repository.list_by_user(
            user_id,
        )

    def delete_document(
        self,
        *,
        document_id: UUID,
        user_id: str,
    ):
        document = self.repository.get_by_id(
            document_id,
        )

        if document is None or document.user_id != user_id:
            raise ValueError("Document not found.")

        # --------------------------
        # Delete vectors from Qdrant
        # --------------------------

        try:
            from qdrant_client.http import models

            from app.rag.qdrant_client import client

            client.delete(
                collection_name=settings.COLLECTION_NAME,
                points_selector=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="document_id",
                            match=models.MatchValue(
                                value=str(document.id),
                            ),
                        )
                    ]
                ),
            )

        except Exception as exc:
            print(f"Failed to delete Qdrant vectors: {exc}")

        # --------------------------
        # Delete document from R2
        # --------------------------

        self.storage.delete(
            key=document.document_key,
        )

        # --------------------------
        # Delete database record
        # --------------------------

        self.repository.delete(
            document,
        )
