import uuid

from fastapi import (
    APIRouter,
    BackgroundTasks,
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
from app.auth.dependencies import get_current_user
from app.auth.schemas import CurrentUser
from app.schemas.chat import ChatRequest
from app.services.chat_service import ChatService
from app.services.document_service import DocumentService

router = APIRouter()


@router.post("/documents")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user),
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
        user_id=current_user.id,
    )

    return document


@router.get("/documents")
async def list_documents(
    current_user: CurrentUser = Depends(get_current_user),
    service: DocumentService = Depends(get_document_service),
):
    return service.list_documents(
        current_user.id,
    )


@router.post("/chat")
async def chat(
    request: ChatRequest,
    current_user: CurrentUser = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service),
):
    return service.chat(
        user_id=current_user.id,
        question=request.question,
        document_id=request.document_id,
        conversation_id=request.conversation_id,
    )


@router.get("/conversations")
async def list_conversations(
    current_user: CurrentUser = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service),
):
    return service.list_conversations(
        current_user.id,
    )


@router.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: uuid.UUID,
    current_user: CurrentUser = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service),
):
    return service.get_conversation(
        conversation_id=conversation_id,
        user_id=current_user.id,
    )


@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: uuid.UUID,
    current_user: CurrentUser = Depends(get_current_user),
    service: DocumentService = Depends(get_document_service),
):
    try:
        service.delete_document(
            document_id=document_id,
            user_id=current_user.id,
        )
        return {"message": "Document deleted."}
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: uuid.UUID,
    current_user: CurrentUser = Depends(get_current_user),
    service: ChatService = Depends(get_chat_service),
):
    service.delete_conversation(
        conversation_id=conversation_id,
        user_id=current_user.id,
    )

    return {"message": "Conversation deleted."}
