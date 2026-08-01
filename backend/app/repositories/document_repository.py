from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models import Document, DocumentStatus


class DocumentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        *,
        user_id: str,
        filename: str,
    ) -> Document:
        document = Document(
            user_id=user_id,
            filename=filename,
            page_count=0,
            chunk_count=0,
            status=DocumentStatus.PROCESSING,
        )

        self.db.add(document)
        self.db.commit()
        self.db.refresh(document)

        return document

    def update_counts(
        self,
        document: Document,
        page_count: int,
        chunk_count: int,
    ):
        document.page_count = page_count
        document.chunk_count = chunk_count

        self.db.commit()
        self.db.refresh(document)

    def update_status(
        self,
        document: Document,
        status: DocumentStatus,
    ):
        document.status = status

        self.db.commit()
        self.db.refresh(document)

    def get_by_id(
        self,
        document_id: UUID,
    ) -> Document | None:
        return self.db.query(Document).filter(Document.id == document_id).first()

    def list_by_user(
        self,
        user_id: str,
    ):
        return (
            self.db.query(Document)
            .filter(Document.user_id == user_id)
            .order_by(Document.created_at.desc())
            .all()
        )

    def delete(
        self,
        document: Document,
    ):
        self.db.delete(document)
        self.db.commit()
