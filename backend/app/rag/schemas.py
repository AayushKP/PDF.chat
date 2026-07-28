from pydantic import BaseModel


class Source(BaseModel):
    document_name: str
    page: int


class RAGResponse(BaseModel):
    answer: str
    sources: list[Source]
