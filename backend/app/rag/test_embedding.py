from app.rag.embedder import embeddings

vector = embeddings.embed_query("FastAPI is a Python Framework.")

print(f"Dimesions: {len(vector)}")
print(vector[:5])
