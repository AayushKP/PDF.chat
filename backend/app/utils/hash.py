import hashlib
import uuid


def generate_chunk_uuid(
    document_name: str,
    page: int,
    chunk_index: int,
) -> str:
    """
    Deterministic UUID accepted by Qdrant.

    Uploading the same document twice produces
    the same point IDs.
    """

    key = f"{document_name}:{page}:{chunk_index}"

    return str(
        uuid.uuid5(
            uuid.NAMESPACE_DNS,
            key,
        )
    )


def content_hash(text: str) -> str:
    """
    SHA256 hash of chunk content.
    Useful later for deduplication/versioning.
    """

    return hashlib.sha256(text.encode("utf-8")).hexdigest()
