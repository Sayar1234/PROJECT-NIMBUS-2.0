from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from app.database import Base

class TerminalCommand(Base):
    __tablename__ = "terminal_commands"
    
    id = Column(Integer, primary_key=True, index=True)
    command = Column(Text, nullable=False)
    output = Column(Text, nullable=True)
    status = Column(String, default="success")  # 'success' or 'error'
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "command": self.command,
            "output": self.output,
            "status": self.status,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }