import shutil
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.rag.generation import generate_answer
from app.rag.ingestion import ingest_pdf
from app.schemas.chat import ChatRequest

router = APIRouter()

UPLOAD_DIR = Path("upload")

UPLOAD_DIR.mkdir(exist_ok=True)


@router.post("/documents")
async def upload_document(
    file: UploadFile = File(...),
):
    if file.filename is None:
        raise HTTPException(
            status_code=400,
            detail="Filename is missing.",
        )

    file_path = UPLOAD_DIR / file.filename
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are supported.",
        )

    file_path = UPLOAD_DIR / file.filename

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    chunks = ingest_pdf(str(file_path))

    return {
        "message": "Document uploaded successfully.",
        "chunks": chunks,
    }


@router.post("/chat")
async def chat(
    request: ChatRequest,
):
    return generate_answer(request.question)
