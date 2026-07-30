from langchain_qdrant import QdrantVectorStore

from app.config import settings
from app.rag.embedder import embeddings
from app.rag.qdrant_client import client

vector_store = QdrantVectorStore(
    client=client,
    collection_name=settings.COLLECTION_NAME,
    embedding=embeddings,
)
