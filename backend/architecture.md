# Backend Architecture & Design Docs

This document describes the backend architecture, data flow pipelines, design choices, and local setup instructions for the `PDF.chat` API server.

---

## 1. System Architecture & Component Mapping

The backend is built as a layered modular system using **FastAPI** (API routing), **SQLAlchemy** (Relational Database mapping), **Boto3** (Cloudflare R2 storage Client), and **Qdrant** (Vector Search engine).

### A. Architectural Component Diagram

```
                                +---------------------------+
                                |  Next.js Client (Browser) |
                                +-------------+-------------+
                                              |
                                              v (HTTP Calls)
+-----------------------------------------------------------------------------------------+
|  API & AUTH LAYER                                                                       |
|                                                                                         |
|   +-----------------------+      +--------------------------+      +-----------------+  |
|   | app/main.py (Startup) | ---> | app/api/routes.py (API)  | <--- | app/auth/deps   |  |
|   +-----------------------+      +------------+-------------+      +--------+--------+  |
|                                               |                             |           |
|                                               |                             v           |
|                                               v                     +---------------+   |
|                                    +---------------------+          | auth/client.py|   |
|                                    | api/dependencies.py |          +---------------+   |
|                                    +----------+----------+                              |
+-----------------------------------------------|-----------------------------------------+
                                                | (Injects Service)
                                                v
+-----------------------------------------------------------------------------------------+
|  BUSINESS SERVICE LAYER                                                                 |
|                                                                                         |
|       +------------------------------------+      +------------------------------+      |
|       | app/services/document_service.py   |      | app/services/chat_service.py |      |
|       +-----------------+------------------+      +-------------+----------------+      |
|                         |                                       |                       |
+-------------------------|---------------------------------------|-----------------------+
                          |                                       |
        +-----------------+-----------------+                     |
        | (Saves Metadata)                  | (Saves File)        | (Coordinates RAG)
        v                                   v                     v
+---------------+                   +---------------+     +-------------------------------+
|  DB / REPO    |                   | STORAGE       |     | RAG ENGINE (app/rag/)         |
|  LAYER        |                   | INTEGRATION   |     |                               |
|               |                   |               |     |  +------------+  +----------+ |
| +-----------+ |                   | +-----------+ |     |  | rewriter.py|  | retriever| |
| | doc_repo  | |                   | | s3 / R2   | |     |  +-----+------+  +----+-----+ |
| +-----+-----+ |                   | | upload    | |     |        |              |       |
|       |       |                   | +-----------+ |     |        v              v       |
|       v       |                   +---------------+     |  +-----+------+  +----+-----+ |
| +-----------+ |                                         |  | embedder.py|  | generator| |
| | Postgres  | | <---------------+ (Saves Counts)        |  +-----+------+  +----+-----+ |
| | (Supabase)| |                                         |        |              |       |
| +-----------+ | <---------------+ (Triggers Ingestion)  |        v              v       |
|               |                                         |  +-----+------+  +----+-----+ |
| +-----------+ |                                         |  | Qdrant DB  |  | Gemini   | |
| | conv_repo | |                                         |  +------------+  +----------+ |
| +-----------+ |                                         |                               |
+---------------+                                         +-------------------------------+
```

---

### B. Detailed File Index

```
backend/
├── app/
│   ├── api/
│   │   ├── dependencies.py      # Dependency-injection providers for business services (get_document_service, get_chat_service).
│   │   └── routes.py            # API routing handlers (POST /documents, POST /chat, DELETE endpoints).
│   ├── auth/
│   │   ├── client.py            # REST API client wrapping the Better Auth get-session endpoint.
│   │   ├── dependencies.py      # get_current_user provider (cookie session validation).
│   │   └── schemas.py           # Pydantic schema for verified CurrentUser structure.
│   ├── db/
│   │   ├── base.py              # Declares the shared SQLAlchemy declarative Base.
│   │   ├── database.py          # Session factory maker, connection engines, and Postgres session generators.
│   │   └── models.py            # SQLAlchemy tables models mapping User, Document, Conversation, and Message records.
│   ├── rag/
│   │   ├── create_collection.py # Installs collections configuration inside Qdrant with Cosine distance metric.
│   │   ├── embedder.py          # Interface to Google Gemini (text-embedding-004) to compute vector representations.
│   │   ├── generation.py        # Prompts gemini-2.5-flash to formulate citations-grounded responses.
│   │   ├── ingestion.py         # Background worker orchestrating document loaders, splitters, embedders, and vectors client.
│   │   ├── loader.py            # Reads raw file bytes and extracts text blocks using PyPDF.
│   │   ├── prompts.py           # System guidelines and templates for grounded completions and query rewriting.
│   │   ├── question_rewriter.py # Context-aware rewriter mapping follow-ups to standalone queries.
│   │   ├── retriever.py         # Performs filtered semantic query search on Qdrant.
│   │   ├── schemas.py           # Internal data-transfer-object definitions for the RAG loop.
│   │   ├── splitter.py          # Partitions raw text blocks into overlapping segments.
│   │   └── vector_store.py      # Client manager setting up Qdrant client connection pools.
│   ├── repositories/
│   │   ├── conversation_repository.py # SQL operations handling active conversations, messages logging, and query history loading.
│   │   └── document_repository.py     # SQL operations handling document metadata, counts updates, status transitions, and deletion.
│   ├── schemas/
│   │   ├── chat.py              # Pydantic schemas validating Chat request payloads.
│   │   └── conversation.py      # Pydantic schemas formatting Conversation and Message JSON responses.
│   ├── services/
│   │   ├── chat_service.py      # Logic service coordinating history fetches, standalone rewrites, similarity queries, and generation.
│   │   └── document_service.py  # Logic service validating uploads, saving files to R2, setting DB status, and scheduling ingestion tasks.
│   ├── storage/
│   │   ├── client.py            # Instantiates the Boto3 s3 client for Cloudflare R2 bucket connection.
│   │   └── service.py           # Exposes key generator, checksum generator, upload and delete methods.
│   ├── utils/
│   │   └── hash.py              # Encryption hashing helpers.
│   ├── main.py                  # App entry point initializing CORS middleware, lifespan events, and routers.
│   └── config.py                # Pydantic Settings class parsing environment variables.
├── alembic/                     # Database schemas version controller migrations.
└── upload/                      # Temporary storage workspace directory.
```

---

## 2. Design Choices of Two DBs & Roles

To ensure high performance and structured data persistence, the system splits data across two databases:

1. **PostgreSQL (Supabase)**:
   - **Role**: Structured Transactional Ledger (Ground Truth).
   - **Data Stored**: Document metadata (filenames, page/chunk counts), Conversation sessions, Chat messages, and citation lists.
   - **Why**: Handles relational associations, transaction safety, and quick retrieval of structured chat histories.

2. **Qdrant (Vector DB)**:
   - **Role**: High-Performance Semantic Index.
   - **Data Stored**: Semantic text chunks alongside high-dimensional vector embeddings generated by Google Gemini (`text-embedding-004`).
   - **Why**: Allows fast similarity searches based on semantic context, filtered strictly by `document_id` and `user_id` to prevent cross-tenant data leaks.

---

## 3. RAG Pipeline Flow

### A. 1st Request Flow (Starting a New Conversation)

```
[Client]                [FastAPI Backend]        [PostgreSQL]        [Qdrant DB]        [Gemini LLM]
   │                           │                      │                   │                  │
   │─── 1. POST /chat ────────>│                      │                   │                  │
   │    {question, doc_id}     │─── 2. Insert row ───>│                   │                  │
   │                           │      (Conversation)  │                   │                  │
   │                           │────────────────── 3. Similarity Search ─>│                  │
   │                           │                       (doc_id filter)    │                  │
   │                           │<────────────────── 4. Context chunks ────│                  │
   │                           │────────────────────────────────────────── 5. Generate QA ──>│
   │                           │                                           (prompt + context)│
   │                           │<───────────────────────────────────────── 6. Answer ────────│
   │                           │─── 7. Save Msg ─────>│                                      │
   │<── 8. Return JSON ────────│                      │                                      │
   │    {conv_id, answer}      │                      │                                      │
```

1. **Client Request**: The client sends a `POST /chat` request containing the initial `question` and `document_id`.
2. **Conversation Registration**: The backend registers a new conversation session row in PostgreSQL.
3. **Similarity Search**: The backend uses Gemini `text-embedding-004` to embed the user's query and performs a similarity search in Qdrant, filtered strictly by `document_id` and `user_id`.
4. **Context Retrieval**: Qdrant returns the most relevant text chunks (context).
5. **Answer Generation**: The backend formats a grounded QA prompt containing the retrieved context and question, sending it to `gemini-2.5-flash`.
6. **LLM Completion**: Gemini returns the generated answer alongside source page citations.
7. **Database Persistence**: The backend stores the user's prompt and assistant's response/citations in the PostgreSQL `messages` table.
8. **Client Response**: The backend returns the `conversation_id`, markdown `answer`, and inline comma-separated `sources` to the client.

### B. Subsequent Request Flow (Follow-up Chat Turns)

```
[Client]                [FastAPI Backend]        [PostgreSQL]        [Qdrant DB]        [Gemini LLM]
   │                           │                      │                   │                  │
   │─── 1. POST /chat ────────>│                      │                   │                  │
   │    {question, conv_id}    │─── 2. Fetch history >│                   │                  │
   │                           │────────────────────────────────────────── 3. Rewrite Q ────>│
   │                           │                                              (past turns)   │
   │                           │<───────────────────────────────────────── 4. Standalone Q ──│
   │                           │────────────────── 5. Similarity Search ─>│                  │
   │                           │                       (doc_id filter)    │                  │
   │                           │<────────────────── 6. Context chunks ────│                  │
   │                           │────────────────────────────────────────── 7. Generate QA ──>│
   │                           │                                           (prompt + context)│
   │                           │<───────────────────────────────────────── 8. Answer ────────│
   │                           │─── 9. Save Msg ─────>│                                      │
   │<── 10. Return JSON ───────│                      │                                      │
   │    {answer, sources}      │                      │                                      │
```

1. **Client Request**: The client sends a `POST /chat` containing the new `question` and existing `conversation_id`.
2. **History Retrieval**: The backend fetches past message history (up to last 10 messages) from PostgreSQL.
3. **Query Rewriting**: To ensure pronouns or context references are resolved, the backend asks Gemini to rewrite the user's new question into a standalone question based on history.
4. **Standalone Query**: Gemini returns the rewrittenStandalone query.
5. **Similarity Search**: The standalone query is embedded and matched in Qdrant (filtered by the linked conversation `document_id` and `user_id`).
6. **Context Retrieval**: Qdrant returns semantic matches.
7. **Answer Generation**: The backend prompts Gemini to formulate a grounded response using the retrieved context.
8. **LLM Completion**: Gemini returns the answer and page citations.
9. **Database Persistence**: New messages are saved in PostgreSQL.
10. **Client Response**: The backend returns the answer and sources.

---

## 4. User Extraction without SQLAlchemy Managing the User Table

Rather than managing a duplicate `user` table inside SQLAlchemy and storing passwords, the backend integrates with **Better Auth**:

1. **Session Interception**: FastAPI intercepts incoming request cookies via the `get_current_user` dependency.
2. **Auth Service Verification**: The backend calls the Better Auth session endpoint, forwarding the cookie header:
   ```python
   data = await better_auth.get_session(cookie)
   user = data.get("user")
   ```
3. **Deriving User ID**: The backend extracts `user["id"]` directly from this verified session. This user ID string is mapped as a foreign key on documents and conversations, eliminating the need for SQLAlchemy to manage or query a local user model.

---

## 5. Local Setup Guide

Follow these steps to run the backend server locally:

### 1. Prerequisites

- Python 3.11+
- PostgreSQL database
- Qdrant cloud account or local Qdrant instance

### 2. Installation

Create a virtual environment and install dependencies:

```bash
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
```

### 3. Environment Setup

Create a `.env` file in the `backend/` directory:

```env
GOOGLE_API_KEY=your_gemini_api_key
QDRANT_URL=your_qdrant_instance_url
QDRANT_API_KEY=your_qdrant_api_key
COLLECTION_NAME=pdf.chat
DATABASE_URL=postgresql+psycopg://user:password@host:port/database_name
FRONTEND_URL=http://localhost:3000
```

### 4. Database Migrations

Run Alembic migrations to construct database tables:

```bash
alembic upgrade head
```

### 5. Run the Server

Start the Uvicorn development server:

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The API documentation will be available at `http://127.0.0.1:8000/docs`.
