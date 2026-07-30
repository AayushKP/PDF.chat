from uuid import UUID

from app.rag.generation import generate_answer
from app.repositories.conversation_repository import ConversationRepository
from app.schemas.conversation import (
    ConversationListItem,
    ConversationResponse,
)


class ChatService:
    def __init__(
        self,
        repository: ConversationRepository,
    ):
        self.repository = repository

    def chat(
        self,
        *,
        user_id: UUID,
        question: str,
        document_id: UUID | None = None,
        conversation_id: UUID | None = None,
    ):
        """
        Creates a conversation if needed,
        stores the user's message,
        performs RAG,
        stores the assistant's response,
        returns the answer.
        """

        if conversation_id is None:
            conversation = self.repository.create_conversation(
                user_id=user_id,
                title=question[:60],
            )
        else:
            conversation = self.repository.get_conversation_by_user(
                conversation_id=conversation_id,
                user_id=user_id,
            )

            if conversation is None:
                raise ValueError("Conversation not found.")

        # Save user message
        self.repository.add_message(
            conversation_id=conversation.id,
            role="user",
            content=question,
        )

        # Generate answer using existing RAG pipeline
        rag_response = generate_answer(
            question=question,
            user_id=str(user_id),
            document_id=str(document_id) if document_id else None,
        )

        # Save assistant message
        self.repository.add_message(
            conversation_id=conversation.id,
            role="assistant",
            content=rag_response.answer,
            citations=[source.model_dump() for source in rag_response.sources],
        )

        return {
            "conversation_id": conversation.id,
            "answer": rag_response.answer,
            "sources": rag_response.sources,
        }

    def list_conversations(
        self,
        user_id: UUID,
    ) -> list[ConversationListItem]:
        conversations = self.repository.list_conversations(
            user_id=user_id,
        )

        return [ConversationListItem.model_validate(c) for c in conversations]

    def get_conversation(
        self,
        *,
        conversation_id: UUID,
        user_id: UUID,
    ) -> ConversationResponse:
        conversation = self.repository.get_conversation_by_user(
            conversation_id=conversation_id,
            user_id=user_id,
        )

        if conversation is None:
            raise ValueError("Conversation not found.")

        return ConversationResponse.model_validate(conversation)

    def delete_conversation(
        self,
        *,
        conversation_id: UUID,
        user_id: UUID,
    ) -> None:
        conversation = self.repository.get_conversation_by_user(
            conversation_id=conversation_id,
            user_id=user_id,
        )

        if conversation is None:
            raise ValueError("Conversation not found.")

        self.repository.delete_conversation(
            conversation,
        )
