from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # App settings
    app_name: str = "Browser AI OS"
    debug: bool = True
    
    # Database
    database_url: str = "sqlite:///./data/app.db"
    
    # File storage
    storage_path: str = "./storage/files"
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    
    # Groq API (FREE)
    groq_api_key: str = ""  # Set via environment variable
    groq_model: str = "llama-3.1-70b-versatile"  # Free model
    max_tokens: int = 4096
    
    # Terminal
    max_terminal_history: int = 100
    
    # Chat
    max_chat_history: int = 50
    
    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()