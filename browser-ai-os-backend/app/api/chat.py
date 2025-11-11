from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.chat import ChatMessage
from app.schemas.chat import ChatRequest, ChatResponse, ChatMessageResponse
from app.services.ai_service import ai_service
from app.config import settings

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def send_message(request: ChatRequest, db: Session = Depends(get_db)):
    """Send a message and get AI response"""
    try:
        # Save user message
        user_message = ChatMessage(
            role="user",
            content=request.message
        )
        db.add(user_message)
        db.commit()
        
        # Get recent chat history for context
        recent_messages = db.query(ChatMessage).order_by(
            ChatMessage.timestamp.desc()
        ).limit(settings.max_chat_history).all()
        recent_messages.reverse()
        
        # Build messages for Claude
        messages = []
        for msg in recent_messages:
            messages.append({
                "role": msg.role,
                "content": msg.content
            })
        
        # Get AI response
        ai_response = await ai_service.chat(messages)
        
        # Save assistant message
        assistant_message = ChatMessage(
            role="assistant",
            content=ai_response
        )
        db.add(assistant_message)
        db.commit()
        
        # Get updated history
        history = db.query(ChatMessage).order_by(ChatMessage.timestamp.asc()).all()
        
        return {
            "response": ai_response,
            "history": [msg.to_dict() for msg in history]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=List[ChatMessageResponse])
async def get_chat_history(db: Session = Depends(get_db)):
    """Get chat history"""
    messages = db.query(ChatMessage).order_by(ChatMessage.timestamp.asc()).all()
    return [msg.to_dict() for msg in messages]

@router.delete("/history")
async def clear_chat_history(db: Session = Depends(get_db)):
    """Clear chat history"""
    db.query(ChatMessage).delete()
    db.commit()
    return {"message": "Chat history cleared successfully"}