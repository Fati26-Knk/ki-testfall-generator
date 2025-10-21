from fastapi import FastAPI

app = FastAPI()

@app.get('/health')
async def health():
    return {"status": "ok", "message": "mini app running"}

@app.get('/')
async def root():
    return {"hello": "world"}
