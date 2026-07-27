from app.rag.loader import load_pdf
from app.rag.splitter import split_documents

docs = load_pdf("upload/sample.pdf")
chunks = split_documents(docs)

print(f"Pages:{len(docs)}")
print(f"Chunks:{len(chunks)}")
print(chunks[0].metadata)
print(chunks[0].page_content)
