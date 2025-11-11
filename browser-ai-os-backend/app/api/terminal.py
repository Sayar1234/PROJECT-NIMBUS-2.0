# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from typing import List
# import json

# from app.database import get_db
# from app.models.terminal import TerminalCommand
# from app.models.file import File
# from app.models.note import Note
# from app.schemas.terminal import TerminalRequest, TerminalResponse
# from app.services.ai_service import ai_service
# from app.config import settings

# router = APIRouter()

# async def get_system_context(db: Session):
#     """Get system context for AI"""
#     files_count = db.query(File).count()
#     notes_count = db.query(Note).count()
#     recent_files = db.query(File).order_by(File.modified_at.desc()).limit(5).all()
#     recent_notes = db.query(Note).order_by(Note.modified_at.desc()).limit(5).all()
    
#     context = {
#         "files_count": files_count,
#         "notes_count": notes_count,
#         "recent_files": [f.name for f in recent_files],
#         "recent_notes": [n.title for n in recent_notes]
#     }
    
#     return context

# @router.post("/execute", response_model=TerminalResponse)
# async def execute_command(request: TerminalRequest, db: Session = Depends(get_db)):
#     """Execute a terminal command using AI"""
#     try:
#         # Get system context
#         context = await get_system_context(db)
        
#         # Get AI to interpret and execute command
#         output = await ai_service.execute_terminal_command(request.command, context)
        
#         # Save command history
#         terminal_cmd = TerminalCommand(
#             command=request.command,
#             output=output,
#             status="success"
#         )
        
#         db.add(terminal_cmd)
#         db.commit()
#         db.refresh(terminal_cmd)
        
#         return terminal_cmd.to_dict()
        
#     except Exception as e:
#         # Save error
#         terminal_cmd = TerminalCommand(
#             command=request.command,
#             output=str(e),
#             status="error"
#         )
#         db.add(terminal_cmd)
#         db.commit()
#         db.refresh(terminal_cmd)
        
#         return terminal_cmd.to_dict()

# @router.get("/history", response_model=List[TerminalResponse])
# async def get_terminal_history(db: Session = Depends(get_db)):
#     """Get terminal command history"""
#     commands = db.query(TerminalCommand).order_by(
#         TerminalCommand.timestamp.desc()
#     ).limit(settings.max_terminal_history).all()
    
#     commands.reverse()
#     return [cmd.to_dict() for cmd in commands]

# @router.delete("/history")
# async def clear_terminal_history(db: Session = Depends(get_db)):
#     """Clear terminal history"""
#     db.query(TerminalCommand).delete()
#     db.commit()
#     return {"message": "Terminal history cleared successfully"}



from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json

from app.database import get_db
from app.models.terminal import TerminalCommand
from app.models.file import File
from app.models.note import Note
from app.schemas.terminal import TerminalRequest, TerminalResponse
from app.services.ai_service import ai_service
from app.config import settings

router = APIRouter()

async def get_system_context(db: Session):
    """Get system context for AI"""
    files_count = db.query(File).count()
    notes_count = db.query(Note).count()
    recent_files = db.query(File).order_by(File.modified_at.desc()).limit(5).all()
    recent_notes = db.query(Note).order_by(Note.modified_at.desc()).limit(5).all()
    
    context = {
        "files_count": files_count,
        "notes_count": notes_count,
        "recent_files": [f.name for f in recent_files],
        "recent_notes": [n.title for n in recent_notes]
    }
    
    return context

@router.post("/execute", response_model=TerminalResponse)
async def execute_command(request: TerminalRequest, db: Session = Depends(get_db)):
    """Execute a terminal command using AI with actual CRUD operations"""
    try:
        # Get system context
        context = await get_system_context(db)
        
        # Get AI to interpret and execute command with database access
        output = await ai_service.execute_terminal_command(
            command=request.command, 
            context=context,
            db=db
        )
        
        # Save command history
        terminal_cmd = TerminalCommand(
            command=request.command,
            output=output,
            status="success"
        )
        
        db.add(terminal_cmd)
        db.commit()
        db.refresh(terminal_cmd)
        
        return terminal_cmd.to_dict()
        
    except Exception as e:
        # Save error
        error_msg = f"❌ Error: {str(e)}"
        terminal_cmd = TerminalCommand(
            command=request.command,
            output=error_msg,
            status="error"
        )
        db.add(terminal_cmd)
        db.commit()
        db.refresh(terminal_cmd)
        
        return terminal_cmd.to_dict()

@router.get("/history", response_model=List[TerminalResponse])
async def get_terminal_history(db: Session = Depends(get_db)):
    """Get terminal command history"""
    commands = db.query(TerminalCommand).order_by(
        TerminalCommand.timestamp.desc()
    ).limit(settings.max_terminal_history).all()
    
    commands.reverse()
    return [cmd.to_dict() for cmd in commands]

@router.delete("/history")
async def clear_terminal_history(db: Session = Depends(get_db)):
    """Clear terminal history"""
    db.query(TerminalCommand).delete()
    db.commit()
    return {"message": "Terminal history cleared successfully"}

@router.get("/examples")
async def get_command_examples():
    """Get example commands for the AI terminal"""
    return {
        "examples": [
            {
                "category": "Files",
                "commands": [
                    "create a file called hello.txt with content Hello World",
                    "list all my files",
                    "read the file hello.txt",
                    "update hello.txt with new content Goodbye World",
                    "delete the file hello.txt",
                    "create a folder called Documents",
                    "search files for .txt"
                ]
            },
            {
                "category": "Notes",
                "commands": [
                    "create a note about my meeting tomorrow",
                    "list all my notes",
                    "show me the note about meeting",
                    "update my meeting note with new agenda",
                    "delete the meeting note",
                    "search notes for work"
                ]
            },
            {
                "category": "System",
                "commands": [
                    "what time is it",
                    "show system info",
                    "calculate 25 * 4",
                    "help"
                ]
            }
        ]
    }