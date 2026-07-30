from langchain_google_genai import ChatGoogleGenerativeAI

from app.config import settings
from app.rag.prompts import RAG_SYSTEM_PROMPT
from app.rag.retriever import retrieve
from app.rag.schemas import RAGResponse, Source

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GOOGLE_API_KEY,
    temperature=0,
)


def generate_answer(
    question: str,
    user_id: str,
    document_id: str | None = None,
    top_k: int = 5,
) -> RAGResponse:
    """
    Generate an answer using Retrieval-Augmented Generation (RAG).

    Parameters
    ----------
    question:
        User question.

    user_id:
        Current authenticated user.

    document_id:
        Optional document filter.

    top_k:
        Number of chunks to retrieve.
    """

    retrieved_chunks = retrieve(
        query=question,
        user_id=user_id,
        document_id=document_id,
        limit=top_k,
    )

    context_parts: list[str] = []

    seen: set[tuple[str, int]] = set()

    sources: list[Source] = []

    for chunk in retrieved_chunks:
        context_parts.append(chunk["text"])

        key = (
            chunk["document_name"],
            chunk["page"],
        )

        if key not in seen:
            seen.add(key)

            sources.append(
                Source(
                    document_name=chunk["document_name"],
                    page=chunk["page"] + 1,
                )
            )

    context = "\n\n".join(context_parts)

    prompt = RAG_SYSTEM_PROMPT.format(
        context=context,
    )

    response = llm.invoke(
        [
            ("system", prompt),
            ("human", question),
        ]
    )

    answer = response.content

    if not isinstance(answer, str):
        answer = str(answer)

    return RAGResponse(
        answer=answer,
        sources=sources,
    )
