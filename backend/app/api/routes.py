import uuid

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)

from app.rag.generation import generate_answer
from app.schemas.chat import ChatRequest
from app.services.document_service import DocumentService

from .dependencies import get_document_service

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

    return {
        "message": "Document uploaded successfully.",
        "document": {
            "id": str(document.id),
            "filename": document.filename,
            "page_count": document.page_count,
            "chunk_count": document.chunk_count,
            "status": document.status.value,
            "created_at": document.created_at,
        },
    }


@router.get("/documents")
async def list_documents(
    service: DocumentService = Depends(get_document_service),
):
    documents = service.list_documents(DUMMY_USER_ID)

    return [
        {
            "id": str(document.id),
            "filename": document.filename,
            "page_count": document.page_count,
            "chunk_count": document.chunk_count,
            "status": document.status.value,
            "created_at": document.created_at,
        }
        for document in documents
    ]


@router.post("/chat")
async def chat(
    request: ChatRequest,
):
    return generate_answer(
        question=request.question,
        user_id=str(DUMMY_USER_ID),
        document_id=request.document_id,
    )
