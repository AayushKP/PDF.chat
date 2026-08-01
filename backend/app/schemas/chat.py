from uuid import UUID

# Basemodel used for validation and API schemas
from pydantic import BaseModel


class ChatRequest(BaseModel):
    question: str
    document_id: UUID | None = None
    conversation_id: UUID | None = None
