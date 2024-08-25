from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core import database
from ..models.user import User as UserModel
from ..schemas.user import UserCreate
from ..core.auth0 import verify_token

router = APIRouter()

@router.post("/register")
async def register(user: UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = UserModel(email=user.email)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully"}

@router.get("/me")
async def read_users_me(payload: dict = Depends(verify_token)):
    return {"email": payload["email"], "sub": payload["sub"]}