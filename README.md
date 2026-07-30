# RAG Chat Backend

A production-oriented Retrieval-Augmented Generation (RAG) backend built with FastAPI, PostgreSQL, Qdrant, LangChain, and Gemini.

---

## Tech Stack

- FastAPI
- PostgreSQL (Supabase)
- SQLAlchemy + Alembic
- Qdrant Vector Database
- LangChain
- Gemini 2.5 Flash
- Repository & Service Pattern

---

# Current Architecture

```
Frontend
    │
    ▼
FastAPI Routes
    │
    ├──────────────┐
    ▼              ▼
DocumentService   ChatService
    │              │
    ▼              ▼
Repositories   ConversationRepository
    │              │
    ▼              ▼
 PostgreSQL     PostgreSQL
       │
       ▼
    RAG Pipeline
       │
       ▼
    Qdrant + Gemini
```

---

# Upload Flow

```
Upload PDF
    │
    ▼
POST /documents
    │
    ▼
Save PDF locally
(upload/)
    │
    ▼
Create document metadata
(PostgreSQL)
    │
    ▼
Parse PDF
    │
    ▼
Split into chunks
    │
    ▼
Generate embeddings
    │
    ▼
Store chunks in Qdrant
    │
    ▼
Update document status
(READY)
```

### PostgreSQL stores

- User metadata
- Document metadata
- Conversation metadata
- Chat messages

### Qdrant stores

- Document embeddings
- Chunk text
- Page numbers
- Document ID
- User ID

---

# Chat Flow (Current)

```
User Question
    │
    ▼
POST /chat
    │
    ▼
ChatService
    │
    ▼
Save user message
(PostgreSQL)
    │
    ▼
Retrieve relevant chunks
(Qdrant)
    │
    ▼
Build prompt
    │
    ▼
Gemini
    │
    ▼
Save assistant response
(PostgreSQL)
    │
    ▼
Return answer
```

---

# Current Features

- PDF Upload
- Automatic Chunking
- Embedding Generation
- Vector Search
- Context-aware Answer Generation
- Conversation Storage
- Message History Storage
- Document Metadata Storage
- Multi-document support per user

---

# Current Limitation

Conversation history is **stored**, but it is **not used during retrieval**.

Current retrieval uses only:

```
Latest User Question
        +
Selected Document ID
```

Example:

```
User:
What is Kubernetes?

Assistant:
...

User:
What does it mean?
```

The retriever searches using only:

```
"What does it mean?"
```

It does **not** use previous conversation history to rewrite or disambiguate the question.

---

# Next Milestones

## 1. Google Authentication

- Google OAuth
- JWT verification
- Remove `DUMMY_USER_ID`

## 2. Conversational RAG

- Load recent conversation history
- Rewrite follow-up questions into standalone questions
- Retrieve using the rewritten question
- Improve follow-up question accuracy

## 3. Streaming Responses

- Server-Sent Events (SSE)
- Token-by-token response streaming

## 4. Production Improvements

- Background document processing
- Better error handling
- Rate limiting
- Logging & monitoring
