from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime
from app.database import Base

class File(Base):
    __tablename__ = "files"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    path = Column(String, nullable=False, unique=True)
    type = Column(String, nullable=False)  # 'file' or 'folder'
    mime_type = Column(String, nullable=True)
    size = Column(Integer, default=0)  # in bytes
    parent_path = Column(String, nullable=True)
    is_folder = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    modified_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "path": self.path,
            "type": self.type,
            "mime_type": self.mime_type,
            "size": self.size,
            "parent_path": self.parent_path,
            "is_folder": self.is_folder,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "modified_at": self.modified_at.isoformat() if self.modified_at else None,
        }