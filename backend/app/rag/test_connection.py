from app.rag.qdrant_client import client

collections = client.get_collections()

print(collections)
