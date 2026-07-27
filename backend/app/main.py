from fastapi import FastAPI

app = FastAPI(title="chatwpdf API")


@app.get("/")
def health():
    return {"status": "healthy", "message": "chatwpdf is running"}
