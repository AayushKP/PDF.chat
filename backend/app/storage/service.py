import hashlib
import os
import tempfile
from pathlib import Path
from uuid import uuid4

from app.config import settings
from app.storage.client import r2_client
from fastapi import UploadFile


class StorageService:
    def generate_document_key(self, filename: str) -> str:
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
                "ContentType": file.content_type or "application/octet-stream",
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

    def download_to_temp(
        self,
        *,
        key: str,
    ) -> str:
        temp_file = tempfile.NamedTemporaryFile(
            suffix=Path(key).suffix or ".pdf",
            delete=False,
        )

        temp_path = temp_file.name
        temp_file.close()

        try:
            r2_client.download_file(
                settings.R2_BUCKET,
                key,
                temp_path,
            )

            return temp_path

        except Exception:
            if os.path.exists(temp_path):
                os.remove(temp_path)

            raise

    def delete_temp_file(
        self,
        path: str,
    ) -> None:
        try:
            if os.path.exists(path):
                os.remove(path)
        except OSError:
            pass

    @staticmethod
    def calculate_hash(data: bytes) -> str:
        return hashlib.sha256(data).hexdigest()
