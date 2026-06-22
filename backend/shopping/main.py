from fastapi import FastAPI

app = FastAPI(title="Shopping List Service")


@app.get("/health")
def health():
    return {"status": "ok"}
