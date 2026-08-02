from langchain_google_genai import ChatGoogleGenerativeAI

from app.config import settings
from app.rag.prompts import QUESTION_REWRITE_PROMPT

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GOOGLE_API_KEY,
    temperature=0,
)


def rewrite_question(
    *,
    history: str,
    question: str,
) -> str:
    response = llm.invoke(
        [
            (
                "system",
                QUESTION_REWRITE_PROMPT,
            ),
            (
                "human",
                f"""
            Conversation History:

            {history}

            Latest User Question:

            {question}

            Rewrite ONLY the latest question into a standalone question.
            Do not answer it.
            """,
            ),
        ]
    )

    rewritten = response.content

    if not isinstance(rewritten, str):
        rewritten = str(rewritten)

    return rewritten.strip()
