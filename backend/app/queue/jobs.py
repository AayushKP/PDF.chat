from uuid import UUID

from app.config import settings
from app.db.database import SessionLocal
from app.db.models import DocumentStatus
from app.rag.ingestion import ingest_pdf
from app.repositories.document_repository import DocumentRepository
from app.storage.service import StorageService


def process_document(
    document_id: str,
    user_id: str,
):
    """
    Background job responsible for processing one document.

    Flow:

    PostgreSQL
        ↓
    R2
        ↓
    Temporary local PDF
        ↓
    RAG ingestion
        ↓
    Qdrant
        ↓
    PostgreSQL READY
    """

    db = SessionLocal()

    try:
        repository = DocumentRepository(db)

        document = repository.get_by_id(UUID(document_id))

        if document is None:
            print(f"Document {document_id} not found.")
            return

        # Safety check
        if str(document.user_id) != str(user_id):
            print(f"User mismatch for document {document_id}.")
            return

        # Don't process an already completed document
        if document.status == DocumentStatus.READY:
            print(f"Document {document_id} already processed.")
            return

        storage = StorageService()

        repository.update_status(
            document=document,
            status=DocumentStatus.PROCESSING,
        )

        print(f"Processing document {document_id}")

        # --------------------------------
        # Download PDF from R2
        # --------------------------------

        temp_path = storage.download_to_temp(
            key=document.document_key,
        )

        try:
            # --------------------------------
            # Run RAG ingestion
            # --------------------------------

            result = ingest_pdf(
                path=temp_path,
                document_id=str(document.id),
                user_id=str(user_id),
            )

        finally:
            # --------------------------------
            # Remove temporary processing file
            # --------------------------------

            storage.delete_temp_file(temp_path)

        # --------------------------------
        # Update document metadata
        # --------------------------------

        repository.update_counts(
            document=document,
            page_count=result["page_count"],
            chunk_count=result["chunk_count"],
        )

        repository.update_status(
            document=document,
            status=DocumentStatus.READY,
        )

        print(f"Document {document_id} READY")

    except Exception as exc:
        print(f"❌ Document {document_id} failed: {exc}")

        try:
            repository = DocumentRepository(db)

            document = repository.get_by_id(UUID(document_id))

            if document:
                repository.update_status(
                    document=document,
                    status=DocumentStatus.FAILED,
                )

        except Exception as status_error:
            print(f"Failed to update document status: {status_error}")

        raise

    finally:
        db.close()
