import shutil
import uuid
from pathlib import Path

from app.db.models import DocumentStatus
from app.rag.ingestion import ingest_pdf
from app.repositories.document_repository import DocumentRepository

UPLOAD_DIR = Path("upload")
UPLOAD_DIR.mkdir(exist_ok=True)


class DocumentService:
    def __init__(
        self,
        repository: DocumentRepository,
    ):
        self.repository = repository

    def upload(
        self,
        *,
        file,
        user_id,
    ):
        filename = f"{uuid.uuid4()}_{file.filename}"

        file_path = UPLOAD_DIR / filename

        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        document = self.repository.create(
            user_id=user_id,
            filename=filename,
        )

        try:
            result = ingest_pdf(
                path=str(file_path),
                document_id=str(document.id),
                user_id=str(user_id),
            )

            self.repository.update_counts(
                document=document,
                page_count=result["page_count"],
                chunk_count=result["chunk_count"],
            )

            self.repository.update_status(
                document=document,
                status=DocumentStatus.READY,
            )

            return document

        except Exception:
            self.repository.update_status(
                document=document,
                status=DocumentStatus.FAILED,
            )

            raise

    def list_documents(
        self,
        user_id,
    ):
        return self.repository.list_by_user(user_id)

    def delete_document(
        self,
        *,
        document_id: uuid.UUID,
        user_id: str,
    ):
        document = self.repository.get_by_id(document_id)
        if document is None or document.user_id != user_id:
            raise ValueError("Document not found.")

        # Delete local file if it exists
        file_path = UPLOAD_DIR / document.filename
        if file_path.exists():
            try:
                file_path.unlink()
            except Exception:
                pass

        # Delete vectors from Qdrant if possible
        try:
            from app.config import settings
            from app.rag.qdrant_client import client
            from qdrant_client.http import models

            client.delete(
                collection_name=settings.COLLECTION_NAME,
                points_selector=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="document_id",
                            match=models.MatchValue(value=str(document_id)),
                        )
                    ]
                ),
            )
        except Exception:
            pass

        self.repository.delete(document)
