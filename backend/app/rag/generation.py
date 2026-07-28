from app.config import settings
from app.rag.prompts import RAG_SYSTEM_PROMPT
from app.rag.retrieval import retrieve
from app.rag.schemas import RAGResponse, Source
from langchain_google_genai import ChatGoogleGenerativeAI

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GOOGLE_API_KEY,
    temperature=0,
)


def generate_answer(
    question: str,
    top_k: int = 5,
) -> RAGResponse:

    retrieved_chunks = retrieve(
        query=question,
        limit=top_k,
    )

    context_parts: list[str] = []

    seen: set[tuple[str, int]] = set()

    sources: list[Source] = []

    for chunk in retrieved_chunks:
        payload = chunk.payload

        if payload is None:
            continue

        context_parts.append(payload["text"])

        key = (
            payload["document_name"],
            payload["page"],
        )

        if key not in seen:
            seen.add(key)

            sources.append(
                Source(
                    document_name=payload["document_name"],
                    page=payload["page"] + 1,
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
