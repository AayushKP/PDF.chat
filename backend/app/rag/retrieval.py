from app.config import settings
from app.rag.embedder import embeddings
from app.rag.qdrant_client import client
from qdrant_client.models import (
    FieldCondition,
    Filter,
    MatchValue,
)


def retrieve(
    query: str,
    limit: int = 5,
    document_name: str | None = None,
):
    """
    Perform semantic search on Qdrant.

    Parameters
    ----------
    query:
        User question.

    limit:
        Number of chunks to retrieve.

    document_name:
        Optional metadata filter.
    """

    query_vector = embeddings.embed_query(query)

    search_filter = None

    if document_name:
        search_filter = Filter(
            must=[
                FieldCondition(
                    key="document_name",
                    match=MatchValue(
                        value=document_name,
                    ),
                )
            ]
        )

    results = client.query_points(
        collection_name=settings.COLLECTION_NAME,
        query=query_vector,
        query_filter=search_filter,
        limit=limit,
        with_payload=True,
    )

    return results.points
