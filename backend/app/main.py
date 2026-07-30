from app.api.routes import router
from fastapi import FastAPI

app = FastAPI(
    title="PDF.chat",
    version="1.0.0",
)

app.include_router(router)


@app.get("/")
def health():
    return {"status": "healthy", "message": "chatwpdf is running"}
