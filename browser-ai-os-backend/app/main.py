from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import metrics


import os

from app.api import files, notes, chat, terminal, settings
from app.database import engine, Base

# Tables
Base.metadata.create_all(bind=engine)

# Storage
os.makedirs("storage/files", exist_ok=True)

app = FastAPI(
    title="Browser AI OS API",
    description="Backend API for Browser-Based AI Operating System",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(metrics.router, prefix="/api/metrics", tags=["Metrics"])

# Static files
app.mount("/storage", StaticFiles(directory="storage"), name="storage")

# Routers
app.include_router(files.router, prefix="/api/files", tags=["Files"])
app.include_router(notes.router, prefix="/api/notes", tags=["Notes"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(terminal.router, prefix="/api/terminal", tags=["Terminal"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])

@app.get("/")
async def root():
    return {
        "message": "Browser AI OS API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)