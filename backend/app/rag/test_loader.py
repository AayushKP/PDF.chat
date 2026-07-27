from app.rag.loader import load_pdf

docs = load_pdf("upload/sample.pdf")
print(f"Pages:{len(docs)}")
print(docs[0].page_content[:500])
print(docs[0].metadata)
