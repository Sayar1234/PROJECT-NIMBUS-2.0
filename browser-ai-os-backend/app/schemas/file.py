from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FileCreate(BaseModel):
    name: str
    type: str  # 'file' or 'folder'
    parent_path: Optional[str] = None
    content: Optional[str] = None

class FileUpdate(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None

class FileResponse(BaseModel):
    id: int
    name: str
    path: str
    type: str
    mime_type: Optional[str]
    size: int
    parent_path: Optional[str]
    is_folder: bool
    created_at: datetime
    modified_at: datetime
    
    class Config:
        from_attributes = True