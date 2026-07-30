from qdrant_client.models import (
    Condition,
    FieldCondition,
    Filter,
    MatchValue,
)

from app.config import settings
from app.rag.embedder import embeddings
from app.rag.qdrant_client import client


def retrieve(
    query: str,
    user_id: str,
    document_id: str | None = None,
    limit: int = 5,
):
    """
    Perform semantic search on Qdrant.

    Parameters
    ----------
    query:
        User question.

    user_id:
        Current authenticated user.

    document_id:
        Optional document filter.

    limit:
        Number of chunks to retrieve.
    """

    query_vector = embeddings.embed_query(query)

    filters: list[Condition] = [
        FieldCondition(
            key="user_id",
            match=MatchValue(
                value=user_id,
            ),
        )
    ]

    if document_id:
        filters.append(
            FieldCondition(
                key="document_id",
                match=MatchValue(
                    value=document_id,
                ),
            )
        )

    search_filter = Filter(
        must=filters,
    )

    results = client.query_points(
        collection_name=settings.COLLECTION_NAME,
        query=query_vector,
        query_filter=search_filter,
        limit=limit,
        with_payload=True,
    )

    return [
        {
            "text": point.payload["text"],
            "page": point.payload["page"],
            "document_name": point.payload["document_name"],
            "score": point.score,
        }
        for point in results.points
        if point.payload is not None
    ]
