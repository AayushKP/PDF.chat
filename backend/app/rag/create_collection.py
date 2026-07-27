from app.config import settings
from app.rag.qdrant_client import client
from qdrant_client.models import Distance, VectorParams

client.create_collection(
    collection_name=settings.COLLECTION_NAME,
    vectors_config=VectorParams(
        size=3072,
        distance=Distance.COSINE,
    ),
)

print("Collection created.")
