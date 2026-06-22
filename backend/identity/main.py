from fastapi import FastAPI

app = FastAPI(title="Identity Service")


@app.get("/health")
def health():
    return {"status": "ok"}
