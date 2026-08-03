# RAG Backend Improvement Roadmap

## 1. Intent Classification ⭐ High Priority

**Problem:** Every query currently goes through retrieval, even when retrieval isn't appropriate.

**Examples**

- Give me a roadmap
- Summarize this PDF
- Teach me this document
- Generate interview questions
- Create flashcards

**Solution**

```
Question
    │
    ▼
Intent Classifier
    ├── Fact Question → RAG Pipeline
    └── Document Task → Full Document Pipeline
```

Possible intents:

- FACT_QUERY
- DOCUMENT_SUMMARY
- ROADMAP
- STUDY_PLAN
- NOTES
- MCQ_GENERATION
- FLASHCARDS

---

## 2. Full Document Reasoning ⭐ High Priority

**Problem:** Retrieval works at chunk level, so document-level tasks often fail.

Examples:

- Summarize the document
- Give me a 30-day roadmap
- Explain everything in this PDF

**Solution**

Store the extracted full document text during ingestion.

```
PDF
 ↓
Extract Full Text
 ↓
Store Full Text
 ↓
Chunk
 ↓
Embeddings
 ↓
Qdrant
```

Document-level requests should bypass retrieval and use the stored full text.

---

## 3. Multi-Document Conversations ⭐ High Priority

Current:

```
Conversation
    ↓
document_id
```

Target:

```
Conversation
      ↓
ConversationDocuments
      ↓
Doc A
Doc B
Doc C
```

Retriever should support:

```python
retrieve(
    query=...,
    document_ids=[doc1, doc2, doc3]
)
```

Allows:

- Compare multiple PDFs
- Search across uploaded PDFs
- Generate one roadmap from multiple documents

---

## 4. Upload & Processing Performance ⭐ High Priority

Current issue:

- 1 MB PDF → Few seconds
- 36 MB PDF → 3–4 minutes

Need to optimize the entire ingestion pipeline.

### Improvements

- Background document processing
- Parallel page extraction
- Parallel chunk embedding generation
- Batch embedding API calls
- Async upload pipeline
- Streaming file processing (avoid loading entire file into memory)
- Faster PDF parsing
- Incremental progress updates
- Queue-based workers (Celery/RQ/Arq)
- Cache duplicate documents using content hash
- Skip re-embedding unchanged documents

Target Flow:

```
Upload
 ↓
Save Metadata
 ↓
Return Immediately
 ↓
Background Worker
 ↓
Extract
 ↓
Chunk
 ↓
Batch Embeddings
 ↓
Qdrant
 ↓
READY
```

---

## 5. Streaming Responses

Current:

```
Question
 ↓
Wait
 ↓
Complete Answer
```

Target:

```
Question
 ↓
Gemini Streaming
 ↓
SSE/WebSocket
 ↓
Typing Effect
```

---

## 6. Hybrid Search

Current:

```
Embedding
 ↓
Vector Search
```

Target:

```
Vector Search
+
BM25 Keyword Search
 ↓
Merged Results
```

Improves:

- APIs
- Function names
- Error messages
- Exact keywords

---

## 7. Reranking

Current:

```
Top 5 Chunks
 ↓
LLM
```

Target:

```
Top 20
 ↓
Cross Encoder
 ↓
Best 5
 ↓
LLM
```

Improves grounding and answer quality.

---

## 8. Better Prompt Engineering

Create dedicated prompts for:

- Question rewriting
- Document summarization
- Roadmap generation
- Notes generation
- Flashcards
- MCQs
- Comparative analysis

---

## 9. Automatic Conversation Titles

Instead of:

```
Explain Kubernetes...
```

Generate:

```
Kubernetes Fundamentals
```

using the LLM.

---

## 10. Complete Document Cleanup

Deleting a document should also:

- Delete PostgreSQL metadata
- Delete Qdrant vectors
- Delete uploaded file
- Delete conversations
- Delete messages

---

## 11. Query Expansion

Beyond question rewriting:

- Synonym expansion
- Acronym expansion
- Keyword extraction
- Multi-query retrieval

---

## 12. Retrieval Evaluation

Track:

- Retrieval scores
- Citation accuracy
- Grounding quality
- Top-k relevance
- Failed retrievals

---

## 13. Observability

Production monitoring:

- Request latency
- Retrieval latency
- Embedding latency
- LLM latency
- Token usage
- Cost tracking
- Structured logging

---

# Final Target Architecture

```
User
 ↓
Intent Classification
 ↓
Question Rewriting
 ↓
Query Expansion
 ↓
Hybrid Retrieval
 ↓
Reranking
 ↓
Gemini (Streaming)
 ↓
Grounded Answer + Citations
```
