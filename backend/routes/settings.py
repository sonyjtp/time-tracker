from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, datetime
from database import get_db
from models import Settings
from pydantic import BaseModel

router = APIRouter(prefix="/api/settings", tags=["settings"])

class SettingUpdate(BaseModel):
    value: str

class SettingResponse(BaseModel):
    key: str
    value: str

    class Config:
        from_attributes = True

@router.get("/{key}", response_model=SettingResponse)
def get_setting(key: str, db: Session = Depends(get_db)):
    setting = db.query(Settings).filter(Settings.key == key).first()
    if not setting:
        # Return default value for reference_date if not set
        if key == "reference_date":
            today = datetime.now().date()
            return SettingResponse(key="reference_date", value=today.isoformat())
        raise HTTPException(status_code=404, detail="Setting not found")
    return setting

@router.put("/{key}")
def update_setting(key: str, setting: SettingUpdate, db: Session = Depends(get_db)):
    db_setting = db.query(Settings).filter(Settings.key == key).first()
    if db_setting:
        db_setting.value = setting.value
    else:
        db_setting = Settings(key=key, value=setting.value)
        db.add(db_setting)
    db.commit()
    db.refresh(db_setting)
    return SettingResponse(key=db_setting.key, value=db_setting.value)

@router.get("/")
def get_all_settings(db: Session = Depends(get_db)):
    settings = db.query(Settings).all()
    return [SettingResponse(key=s.key, value=s.value) for s in settings]
