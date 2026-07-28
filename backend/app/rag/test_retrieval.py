from app.rag.retrieval import retrieve

results = retrieve(
    query="Forward Deployed Engineering",
    limit=3,
)

print()

print("=" * 80)

for index, point in enumerate(results, start=1):
    payload = point.payload or {}

    print(f"\nResult {index}")

    print("-" * 80)

    print("Score :", point.score)

    print("Page  :", payload.get("page"))

    print("Source:", payload.get("document_name"))

    print()

    print(payload.get("text"))

    print()
