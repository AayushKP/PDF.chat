import time

from langchain_community.document_loaders import PyPDFLoader


def load_pdf(pdf_path: str):
    start = time.perf_counter()

    loader = PyPDFLoader(pdf_path)

    print(f"Create Loader: {time.perf_counter() - start:.2f}s")

    start = time.perf_counter()

    documents = loader.load()

    print(f"Parse PDF: {time.perf_counter() - start:.2f}s")

    return documents
