"""
Main FastAPI application for AI-based test case generator
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.api.routes import router
from app.services.llm_service import LLMService
from app.services.storage_service import StorageService
from app.database import init_db

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="AI Test Case Generator API",
    description="Generate test cases from user stories using AI",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes (no prefix to match frontend expectations)
app.include_router(router, tags=["test-cases"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Test Case Generator API",
        "version": "1.0.0",
        "docs": "/api/docs"
    }



# Instrument startup and shutdown to help diagnose unexpected lifespans
@app.on_event("startup")
async def _log_startup():
    import os, subprocess
    print("APP EVENT: startup called")
    try:
        pid = os.getpid()
        ppid = os.getppid()
        print(f"DIAG: pid={pid} ppid={ppid}")
        # show a short tasklist of python processes to help identify parent/child
        try:
            out = subprocess.check_output(["tasklist", "/FI", "IMAGENAME eq python.exe"], shell=False, text=True)
            print("DIAG: tasklist python.exe entries:\n" + out)
        except Exception as e:
            print("DIAG: failed to run tasklist:", e)

        # Initialize database tables
        try:
            init_db()
            print("APP EVENT: database tables initialized")
        except Exception as e:
            print("APP EVENT: failed to init database:", e)

        # Initialize services here (avoid import-time network calls)
        try:
            skip = os.getenv("SKIP_SERVICE_INIT", "0")
            if skip == "1":
                print("APP EVENT: SKIP_SERVICE_INIT=1, skipping service initialization")
            else:
                app.state.llm_service = LLMService()
                app.state.storage = StorageService()
                print("APP EVENT: services initialized on app.state")
        except Exception as e:
            print("APP EVENT: failed to init services:", e)

    except Exception as e:
        print("DIAG: startup diag failed:", e)


@app.on_event("shutdown")
async def _log_shutdown():
    print("APP EVENT: shutdown called")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
