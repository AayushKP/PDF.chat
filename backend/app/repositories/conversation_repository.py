from uuid import UUID

from sqlalchemy.orm import Session, selectinload

from app.db.models import Conversation, Message


class ConversationRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_conversation(
        self,
        *,
        user_id: UUID,
        title: str,
    ) -> Conversation:
        conversation = Conversation(
            user_id=user_id,
            title=title,
        )

        self.db.add(conversation)
        self.db.commit()
        self.db.refresh(conversation)

        return conversation

    def get_conversation(
        self,
        conversation_id: UUID,
    ) -> Conversation | None:
        return (
            self.db.query(Conversation)
            .options(selectinload(Conversation.messages))
            .filter(Conversation.id == conversation_id)
            .first()
        )

    def list_conversations(
        self,
        user_id: UUID,
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
        user_id: UUID,
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
