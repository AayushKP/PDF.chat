from app.rag.generation import generate_answer

response = generate_answer("What is a Forward Deployed AI Engineer?")

print()

print("=" * 80)

print(response.answer)

print()

print("Sources")

for source in response.sources:
    print(f"- {source.document_name} (Page {source.page})")
