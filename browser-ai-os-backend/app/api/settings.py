from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json

from app.database import get_db
from app.models.setting import Setting

router = APIRouter()

DEFAULT_SETTINGS = {
    "theme": "dark",
    "accent_color": "#3b82f6",
    "wallpaper": "default",
    "font_size": "medium",
    "file_view": "grid",
    "auto_save_interval": 30,
    "terminal_history_limit": 100,
    "ai_model": "claude-sonnet-4-20250514"
}

@router.get("/")
async def get_settings(db: Session = Depends(get_db)):
    """Get all settings"""
    settings = db.query(Setting).all()
    
    if not settings:
        # Initialize default settings
        for key, value in DEFAULT_SETTINGS.items():
            setting = Setting(key=key, value=json.dumps(value))
            db.add(setting)
        db.commit()
        
        settings = db.query(Setting).all()
    
    result = {}
    for setting in settings:
        try:
            result[setting.key] = json.loads(setting.value)
        except:
            result[setting.key] = setting.value
    
    return result

@router.get("/{key}")
async def get_setting(key: str, db: Session = Depends(get_db)):
    """Get a specific setting"""
    setting = db.query(Setting).filter(Setting.key == key).first()
    
    if not setting:
        # Return default if exists
        if key in DEFAULT_SETTINGS:
            return {key: DEFAULT_SETTINGS[key]}
        raise HTTPException(status_code=404, detail="Setting not found")
    
    try:
        value = json.loads(setting.value)
    except:
        value = setting.value
    
    return {key: value}

@router.put("/")
async def update_settings(settings_data: dict, db: Session = Depends(get_db)):
    """Update multiple settings"""
    for key, value in settings_data.items():
        setting = db.query(Setting).filter(Setting.key == key).first()
        
        if setting:
            setting.value = json.dumps(value)
        else:
            setting = Setting(key=key, value=json.dumps(value))
            db.add(setting)
    
    db.commit()
    
    return {"message": "Settings updated successfully"}

@router.put("/{key}")
async def update_setting(key: str, value: dict, db: Session = Depends(get_db)):
    """Update a specific setting"""
    setting = db.query(Setting).filter(Setting.key == key).first()
    
    setting_value = value.get("value")
    
    if setting:
        setting.value = json.dumps(setting_value)
    else:
        setting = Setting(key=key, value=json.dumps(setting_value))
        db.add(setting)
    
    db.commit()
    
    return {key: setting_value}

@router.post("/reset")
async def reset_settings(db: Session = Depends(get_db)):
    """Reset all settings to defaults"""
    db.query(Setting).delete()
    
    for key, value in DEFAULT_SETTINGS.items():
        setting = Setting(key=key, value=json.dumps(value))
        db.add(setting)
    
    db.commit()
    
    return {"message": "Settings reset to defaults", "settings": DEFAULT_SETTINGS}