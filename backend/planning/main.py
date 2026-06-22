from fastapi import FastAPI

app = FastAPI(title="Meal Planning Service")


@app.get("/health")
def health():
    return {"status": "ok"}
