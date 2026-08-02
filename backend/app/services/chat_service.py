from uuid import UUID

from app.rag.generation import generate_answer
from app.rag.question_rewriter import rewrite_question
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
        user_id: str,
        question: str,
        document_id: UUID | None = None,
        conversation_id: UUID | None = None,
    ):
        """
        Chat Flow

        New Conversation
        ----------------
        question
            +
        document_id

        Existing Conversation
        ---------------------
        question
            +
        conversation_id

        The conversation permanently remembers which document
        it belongs to.
        """

        # ----------------------------
        # New Conversation
        # ----------------------------
        if conversation_id is None:
            if document_id is None:
                raise ValueError("document_id is required for a new conversation.")

            conversation = self.repository.create_conversation(
                user_id=user_id,
                document_id=document_id,
                title=question[:60],
            )

        # ----------------------------
        # Existing Conversation
        # ----------------------------
        else:
            conversation = self.repository.get_conversation_by_user(
                conversation_id=conversation_id,
                user_id=user_id,
            )

            if conversation is None:
                raise ValueError("Conversation not found.")

            # Conversation already knows which PDF it belongs to
            document_id = conversation.document_id

        # ----------------------------------
        # Build conversation history
        # ----------------------------------

        history = ""

        if conversation_id is not None:
            recent_messages = self.repository.get_recent_messages(
                conversation.id,
            )

            history = "\n".join(
                f"{message.role}: {message.content}" for message in recent_messages
            )

        # ----------------------------------
        # Rewrite question
        # ----------------------------------

        standalone_question = rewrite_question(
            history=history,
            question=question,
        )

        # ----------------------------------
        # RAG
        # ----------------------------------

        rag_response = generate_answer(
            question=standalone_question,
            user_id=user_id,
            document_id=str(document_id),
        )

        print("=" * 60)
        print("Original :", question)
        print("Rewritten:", standalone_question)
        print("=" * 60)

        # ----------------------------
        # Store User Message
        # ----------------------------
        self.repository.add_message(
            conversation_id=conversation.id,
            role="user",
            content=question,
        )

        # ----------------------------
        # Store Assistant Message
        # ----------------------------
        self.repository.add_message(
            conversation_id=conversation.id,
            role="assistant",
            content=rag_response.answer,
            citations=[source.model_dump() for source in rag_response.sources],
        )

        # ----------------------------
        # Response
        # ----------------------------
        return {
            "conversation_id": conversation.id,
            "answer": rag_response.answer,
            "sources": rag_response.sources,
        }

    def list_conversations(
        self,
        user_id: str,
    ) -> list[ConversationListItem]:
        conversations = self.repository.list_conversations(
            user_id=user_id,
        )

        return [
            ConversationListItem.model_validate(conversation)
            for conversation in conversations
        ]

    def get_conversation(
        self,
        *,
        conversation_id: UUID,
        user_id: str,
    ) -> ConversationResponse:
        conversation = self.repository.get_conversation_by_user(
            conversation_id=conversation_id,
            user_id=user_id,
        )

        if conversation is None:
            raise ValueError("Conversation not found.")

        return ConversationResponse.model_validate(
            conversation,
        )

    def delete_conversation(
        self,
        *,
        conversation_id: UUID,
        user_id: str,
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
