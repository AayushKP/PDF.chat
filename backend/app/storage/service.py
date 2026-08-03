# ALL STORAGE RELATED SERVICES
import hashlib
from pathlib import Path
from uuid import uuid4

from app.config import settings
from app.storage.client import r2_client
from fastapi import UploadFile


class StorageService:
    def generate_document_key(
        self,
        filename: str,
    ) -> str:
        extension = Path(filename).suffix

        return f"documents/{uuid4()}{extension}"

    def upload(
        self,
        *,
        file: UploadFile,
        key: str,
    ) -> str:
        r2_client.upload_fileobj(
            Fileobj=file.file,
            Bucket=settings.R2_BUCKET,
            Key=key,
            ExtraArgs={
                "ContentType": file.content_type,
            },
        )

        return key

    def delete(
        self,
        *,
        key: str,
    ) -> None:
        r2_client.delete_object(
            Bucket=settings.R2_BUCKET,
            Key=key,
        )

    def get_document_url(
        self,
        key: str,
    ) -> str:
        return (
            f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/"
            f"{settings.R2_BUCKET}/{key}"
        )

    @staticmethod
    def calculate_hash(
        data: bytes,
    ) -> str:
        return hashlib.sha256(data).hexdigest()
