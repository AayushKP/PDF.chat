from uuid import UUID

from sqlalchemy.orm import Session, selectinload

from app.db.models import Conversation, Message


class ConversationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_conversation(
        self, *, user_id: str, title: str, document_id: UUID
    ) -> Conversation:
        conversation = Conversation(
            user_id=user_id, title=title, document_id=document_id
        )

        self.db.add(conversation)
        self.db.commit()
        self.db.refresh(conversation)

        return conversation

    def list_conversations(
        self,
        user_id: str,
    ) -> list[Conversation]:
        return (
            self.db.query(Conversation)
            .filter(Conversation.user_id == user_id)
            .order_by(Conversation.created_at.desc())
            .all()
        )

    def add_message(
        self,
        *,
        conversation_id: UUID,
        role: str,
        content: str,
        citations: list | None = None,
    ) -> Message:
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            citations=citations,
        )

        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)

        return message

    def delete_conversation(
        self,
        conversation: Conversation,
    ) -> None:
        self.db.delete(conversation)
        self.db.commit()

    def get_conversation_by_user(
        self,
        conversation_id: UUID,
        user_id: str,
    ) -> Conversation | None:
        return (
            self.db.query(Conversation)
            .options(selectinload(Conversation.messages))
            .filter(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id,
            )
            .first()
        )

    def get_recent_messages(
        self,
        conversation_id: UUID,
        limit: int = 6,
    ) -> list[Message]:
        return (
            self.db.query(Message)
            .filter(
                Message.conversation_id == conversation_id,
            )
            .order_by(Message.created_at.desc())
            .limit(limit)
            .all()[::-1]
        )
