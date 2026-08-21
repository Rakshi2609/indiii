import logging
import os
import shutil
import uuid
from pathlib import Path
from typing import Tuple
from fastapi import HTTPException, UploadFile, status

from app.core.config import settings

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".webp", ".tiff", ".tif"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/tiff",
    "application/octet-stream",  # Fallback for some clients
}


class StorageService:
    def __init__(self, base_dir: Path | None = None) -> None:
        self.base_dir = base_dir or settings.upload_path
        self._ensure_dir()

    def _ensure_dir(self) -> None:
        """Create upload directory if it does not exist."""
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def validate_file(self, file: UploadFile) -> None:
        """Validate uploaded file extension and content type."""
        filename = file.filename or ""
        ext = Path(filename).suffix.lower()

        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format '{ext}'. Allowed formats: {sorted(list(ALLOWED_EXTENSIONS))}"
            )

        if file.content_type and file.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported MIME type '{file.content_type}'."
            )

    async def save_file(self, file: UploadFile) -> Tuple[str, str, int, str]:
        """
        Save an UploadFile to local disk.
        Returns: (stored_filename, absolute_file_path, file_size_bytes, mime_type)
        """
        self.validate_file(file)

        original_name = file.filename or "unknown_file"
        ext = Path(original_name).suffix.lower() or ".pdf"
        stored_filename = f"{uuid.uuid4().hex}{ext}"
        destination_path = self.base_dir / stored_filename

        file_size = 0
        try:
            with open(destination_path, "wb") as buffer:
                # Read file in 64KB chunks to optimize memory usage
                while chunk := await file.read(65536):
                    buffer.write(chunk)
                    file_size += len(chunk)
        except Exception as e:
            if destination_path.exists():
                destination_path.unlink(missing_ok=True)
            logger.error(f"Failed to save uploaded file {original_name}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to save file: {str(e)}"
            )
        finally:
            await file.seek(0)

        # Enforce file size limit
        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if file_size > max_bytes:
            destination_path.unlink(missing_ok=True)
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
            )

        mime_type = file.content_type or "application/octet-stream"
        logger.info(f"File stored: {stored_filename} ({file_size} bytes)")
        return stored_filename, str(destination_path), file_size, mime_type

    def get_file_path(self, filename: str) -> Path:
        """Get the absolute path to a stored file."""
        target_path = self.base_dir / filename
        if not target_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"File '{filename}' not found on storage."
            )
        return target_path

    def delete_file(self, filename: str) -> bool:
        """Delete a stored file from disk."""
        target_path = self.base_dir / filename
        if target_path.exists():
            try:
                target_path.unlink()
                logger.info(f"File deleted from storage: {filename}")
                return True
            except OSError as e:
                logger.error(f"Error deleting file {filename}: {e}")
                return False
        return False


# Singleton storage instance
storage_service = StorageService()
