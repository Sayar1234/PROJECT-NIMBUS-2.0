from pydantic import BaseModel
from typing import List
from datetime import datetime

class ChatRequest(BaseModel):
    message: str

class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    timestamp: datetime
    
    class Config:
        from_attributes = True

class ChatResponse(BaseModel):
    response: str
    history: List[ChatMessageResponse]