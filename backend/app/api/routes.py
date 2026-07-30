import uuid

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)
from sqlalchemy.sql.expression import null

from app.api.dependencies import (
    get_chat_service,
    get_document_service,
)
from app.schemas.chat import ChatRequest
from app.services.chat_service import ChatService
from app.services.document_service import DocumentService

router = APIRouter()

# Temporary until Google OAuth is added
DUMMY_USER_ID = uuid.UUID("11111111-1111-1111-1111-111111111111")


@router.post("/documents")
async def upload_document(
    file: UploadFile = File(...),
    service: DocumentService = Depends(get_document_service),
):
    if file.filename is None:
        raise HTTPException(
            status_code=400,
            detail="Filename is missing.",
        )

    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported.",
        )

    document = service.upload(
        file=file,
        user_id=DUMMY_USER_ID,
    )

    return document


@router.get("/documents")
async def list_documents(
    service: DocumentService = Depends(get_document_service),
):
    return service.list_documents(
        DUMMY_USER_ID,
    )


@router.post("/chat")
async def chat(
    request: ChatRequest,
    service: ChatService = Depends(get_chat_service),
):
    return service.chat(
        user_id=DUMMY_USER_ID,
        question=request.question,
        document_id=request.document_id,
        conversation_id=request.conversation_id,
    )


@router.get("/conversations")
async def list_conversations(
    service: ChatService = Depends(get_chat_service),
):
    return service.list_conversations(
        DUMMY_USER_ID,
    )


@router.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: uuid.UUID,
    service: ChatService = Depends(get_chat_service),
):
    return service.get_conversation(
        conversation_id=conversation_id,
        user_id=DUMMY_USER_ID,
    )


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: uuid.UUID,
    service: ChatService = Depends(get_chat_service),
):
    service.delete_conversation(
        conversation_id=conversation_id,
        user_id=DUMMY_USER_ID,
    )

    return {"message": "Conversation deleted."}
