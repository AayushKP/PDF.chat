import hashlib


def generate_chunk_id(
    document_name: str,
    page: int,
    chunk_index: int,
) -> str:
    """
    Stable ID for every chunk.
    """

    text = f"{document_name}:{page}:{chunk_index}"

    return hashlib.sha256(text.encode()).hexdigest()
