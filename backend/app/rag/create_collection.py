from qdrant_client.models import (
    Distance,
    PayloadSchemaType,
    VectorParams,
)

from app.config import settings
from app.rag.qdrant_client import client


def create_collection() -> None:
    """
    Creates the Qdrant collection if it doesn't already exist
    and creates payload indexes used for filtering.
    """

    collections = client.get_collections().collections

    collection_names = {collection.name for collection in collections}

    if settings.COLLECTION_NAME not in collection_names:
        client.create_collection(
            collection_name=settings.COLLECTION_NAME,
            vectors_config=VectorParams(
                size=3072,
                distance=Distance.COSINE,
            ),
        )

        print(f"Created collection: {settings.COLLECTION_NAME}")

    else:
        print(f"Collection '{settings.COLLECTION_NAME}' already exists.")

    payload_indexes = [
        ("user_id", PayloadSchemaType.KEYWORD),
        ("document_id", PayloadSchemaType.KEYWORD),
        ("document_name", PayloadSchemaType.KEYWORD),
        ("page", PayloadSchemaType.INTEGER),
        ("chunk_index", PayloadSchemaType.INTEGER),
        ("content_hash", PayloadSchemaType.KEYWORD),
    ]

    for field_name, schema_type in payload_indexes:
        try:
            client.create_payload_index(
                collection_name=settings.COLLECTION_NAME,
                field_name=field_name,
                field_schema=schema_type,
            )
            print(f"Created payload index: {field_name}")

        except Exception:
            # Ignore if the index already exists
            pass

    print("Collection is ready.")


if __name__ == "__main__":
    create_collection()
