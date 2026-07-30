from uuid import UUID


class ChatRequest(BaseModel):
    question: str
    document_id: UUID | None = None
    conversation_id: UUID | None = None
