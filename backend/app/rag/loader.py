from pathlib import Path

from langchain_community.document_loaders import PyPDFLoader


def load_pdf(pdf_path: str):
    """
    Loads a pdf and returs a list of langchain Documents
    """
    loader = PyPDFLoader(pdf_path)
    documents = loader.load()

    return documents
