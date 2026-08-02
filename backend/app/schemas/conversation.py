from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class MessageResponse(BaseModel):
    id: UUID
    role: str
    content: str
    citations: list | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationResponse(BaseModel):
    id: UUID
    title: str
    document_id: UUID
    created_at: datetime
    messages: list[MessageResponse]

    model_config = {"from_attributes": True}


class ConversationListItem(BaseModel):
    id: UUID
    title: str
    document_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}

