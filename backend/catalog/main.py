from fastapi import FastAPI

app = FastAPI(title="Product Catalog Service")


@app.get("/health")
def health():
    return {"status": "ok"}
