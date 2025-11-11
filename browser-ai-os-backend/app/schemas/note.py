from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class NoteCreate(BaseModel):
    title: str
    content: str = ""
    tags: Optional[List[str]] = []
    pinned: bool = False

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    pinned: Optional[bool] = None

class NoteResponse(BaseModel):
    id: int
    title: str
    content: str
    tags: List[str]
    pinned: bool
    created_at: datetime
    modified_at: datetime
    
    class Config:
        from_attributes = True

class AIEnhanceRequest(BaseModel):
    action: str  # 'improve', 'summarize', 'outline', 'expand'
    content: str