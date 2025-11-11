from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse, AIEnhanceRequest
from app.services.ai_service import ai_service

router = APIRouter()

@router.get("/", response_model=List[NoteResponse])
async def list_notes(db: Session = Depends(get_db)):
    """List all notes"""
    notes = db.query(Note).order_by(Note.pinned.desc(), Note.modified_at.desc()).all()
    return [note.to_dict() for note in notes]

@router.post("/", response_model=NoteResponse)
async def create_note(note_data: NoteCreate, db: Session = Depends(get_db)):
    """Create a new note"""
    db_note = Note(
        title=note_data.title,
        content=note_data.content,
        tags=",".join(note_data.tags) if note_data.tags else "",
        pinned=note_data.pinned
    )
    
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    
    return db_note.to_dict()

@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(note_id: int, db: Session = Depends(get_db)):
    """Get a specific note"""
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    return note.to_dict()

@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(note_id: int, note_data: NoteUpdate, db: Session = Depends(get_db)):
    """Update a note"""
    db_note = db.query(Note).filter(Note.id == note_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    if note_data.title is not None:
        db_note.title = note_data.title
    if note_data.content is not None:
        db_note.content = note_data.content
    if note_data.tags is not None:
        db_note.tags = ",".join(note_data.tags)
    if note_data.pinned is not None:
        db_note.pinned = note_data.pinned
    
    db_note.modified_at = datetime.utcnow()
    db.commit()
    db.refresh(db_note)
    
    return db_note.to_dict()

@router.delete("/{note_id}")
async def delete_note(note_id: int, db: Session = Depends(get_db)):
    """Delete a note"""
    db_note = db.query(Note).filter(Note.id == note_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    db.delete(db_note)
    db.commit()
    
    return {"message": "Note deleted successfully"}

@router.post("/ai-enhance")
async def ai_enhance_note(request: AIEnhanceRequest):
    """Use AI to enhance note content"""
    try:
        result = await ai_service.enhance_note(request.action, request.content)
        return {"enhanced_content": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search/{query}")
async def search_notes(query: str, db: Session = Depends(get_db)):
    """Search notes by title or content"""
    notes = db.query(Note).filter(
        (Note.title.contains(query)) | (Note.content.contains(query))
    ).all()
    
    return [note.to_dict() for note in notes]