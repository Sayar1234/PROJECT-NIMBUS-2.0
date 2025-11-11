from pydantic import BaseModel
from datetime import datetime

class TerminalRequest(BaseModel):
    command: str

class TerminalResponse(BaseModel):
    id: int
    command: str
    output: str
    status: str
    timestamp: datetime
    
    class Config:
        from_attributes = True