from app.rag.ingestion import ingest_pdf

count = ingest_pdf("upload/sample.pdf")

print(f"Ingested {count} chunks")
