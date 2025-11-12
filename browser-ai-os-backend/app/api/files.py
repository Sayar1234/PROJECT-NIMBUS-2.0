from fastapi import APIRouter, Depends, HTTPException, UploadFile, File as FastAPIFile
from sqlalchemy.orm import Session
from typing import List
import os
import shutil
from datetime import datetime

from app.database import get_db
from app.models.file import File
from app.schemas.file import FileCreate, FileUpdate, FileResponse
from app.config import settings

router = APIRouter()

@router.get("/", response_model=List[FileResponse])
async def list_files(path: str = "/", db: Session = Depends(get_db)):
    """List all files and folders"""
    if path == "/":
        files = db.query(File).filter(File.parent_path == None).all()
    else:
        files = db.query(File).filter(File.parent_path == path).all()
    
    return [file.to_dict() for file in files]

@router.post("/", response_model=FileResponse)
async def create_file_or_folder(file_data: FileCreate, db: Session = Depends(get_db)):
    """Create a new file or folder"""
    # path
    if file_data.parent_path:
        file_path = f"{file_data.parent_path}/{file_data.name}"
    else:
        file_path = f"/{file_data.name}"
    
    # exists
    existing = db.query(File).filter(File.path == file_path).first()
    if existing:
        raise HTTPException(status_code=400, detail="File or folder already exists")
    
    # db entry
    db_file = File(
        name=file_data.name,
        path=file_path,
        type=file_data.type,
        parent_path=file_data.parent_path,
        is_folder=file_data.type == "folder",
        size=0
    )
    
    # fs
    full_path = os.path.join(settings.storage_path, file_path.lstrip("/"))
    
    if file_data.type == "folder":
        os.makedirs(full_path, exist_ok=True)
    else:
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w") as f:
            f.write(file_data.content or "")
        db_file.size = os.path.getsize(full_path)
        db_file.mime_type = "text/plain"
    
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    
    return db_file.to_dict()

@router.post("/upload")
async def upload_file(
    file: UploadFile = FastAPIFile(...),
    parent_path: str = "/",
    db: Session = Depends(get_db)
):
    """Upload a file"""
    # path
    if parent_path and parent_path != "/":
        file_path = f"{parent_path}/{file.filename}"
    else:
        file_path = f"/{file.filename}"
    
    # exists
    existing = db.query(File).filter(File.path == file_path).first()
    if existing:
        raise HTTPException(status_code=400, detail="File already exists")
    
    # save
    full_path = os.path.join(settings.storage_path, file_path.lstrip("/"))
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    
    with open(full_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # db entry
    db_file = File(
        name=file.filename,
        path=file_path,
        type="file",
        mime_type=file.content_type,
        size=os.path.getsize(full_path),
        parent_path=parent_path if parent_path != "/" else None,
        is_folder=False
    )
    
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    
    return db_file.to_dict()

@router.get("/{file_id}", response_model=FileResponse)
async def get_file(file_id: int, db: Session = Depends(get_db)):
    """Get file details"""
    db_file = db.query(File).filter(File.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    return db_file.to_dict()

@router.get("/{file_id}/content")
async def get_file_content(file_id: int, db: Session = Depends(get_db)):
    """Get file content"""
    db_file = db.query(File).filter(File.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    if db_file.is_folder:
        raise HTTPException(status_code=400, detail="Cannot read folder content")
    
    full_path = os.path.join(settings.storage_path, db_file.path.lstrip("/"))
    
    try:
        with open(full_path, "r") as f:
            content = f.read()
        return {"content": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{file_id}", response_model=FileResponse)
async def update_file(file_id: int, file_data: FileUpdate, db: Session = Depends(get_db)):
    """Update file"""
    db_file = db.query(File).filter(File.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    full_path = os.path.join(settings.storage_path, db_file.path.lstrip("/"))
    
    # rename
    if file_data.name:
        old_path = full_path
        new_path = os.path.join(os.path.dirname(full_path), file_data.name)
        os.rename(old_path, new_path)
        db_file.name = file_data.name
        db_file.path = db_file.path.replace(db_file.name, file_data.name)
    
    # update content
    if file_data.content is not None and not db_file.is_folder:
        with open(full_path, "w") as f:
            f.write(file_data.content)
        db_file.size = os.path.getsize(full_path)
    
    db_file.modified_at = datetime.utcnow()
    db.commit()
    db.refresh(db_file)
    
    return db_file.to_dict()

@router.delete("/{file_id}")
async def delete_file(file_id: int, db: Session = Depends(get_db)):
    """Delete file or folder"""
    db_file = db.query(File).filter(File.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    full_path = os.path.join(settings.storage_path, db_file.path.lstrip("/"))
    
    # delete fs
    if os.path.exists(full_path):
        if db_file.is_folder:
            shutil.rmtree(full_path)
        else:
            os.remove(full_path)
    
    # delete db
    db.delete(db_file)
    db.commit()
    
    return {"message": "File deleted successfully"}