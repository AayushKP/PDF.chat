from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.repositories.conversation_repository import ConversationRepository
from app.repositories.document_repository import DocumentRepository
from app.services.chat_service import ChatService
from app.services.document_service import DocumentService
from app.storage.service import StorageService


def get_document_service(
    db: Session = Depends(get_db),
) -> DocumentService:
    return DocumentService(
        repository=DocumentRepository(db),
        storage=StorageService(),
    )


def get_chat_service(
    db: Session = Depends(get_db),
) -> ChatService:
    return ChatService(
        ConversationRepository(db),
    )


def get_storage_service() -> StorageService:
    return StorageService()
