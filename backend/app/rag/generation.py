from app.config import settings
from app.rag.prompts import RAG_SYSTEM_PROMPT
from app.rag.retrieval import retrieve
from langchain_google_genai import ChatGoogleGenerativeAI

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GOOGLE_API_KEY,
    temperature=0,
)


def generate_answer(question: str, top_k: int = 5) -> str:

    retrieved_chunks = retrieve(
        query=question,
        limit=top_k,
    )

    if not retrieved_chunks:
        return "I couldn't find any relevant information in the uploaded documents."

    context = "\n\n".join(
        payload["text"]
        for point in retrieved_chunks
        if (payload := point.payload) is not None
    )

    prompt = RAG_SYSTEM_PROMPT.format(context=context)

    response = llm.invoke(
        [
            ("system", prompt),
            ("human", question),
        ]
    )

    content = response.content

    if isinstance(content, str):
        return content

    return "\n".join(map(str, content))
