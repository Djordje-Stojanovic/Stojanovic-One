from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ...crud import user_crud
from ...schemas import user as user_schemas
from ...core import database
from ...core.auth0 import verify_token

router = APIRouter()

@router.get("/me", response_model=user_schemas.User)
async def read_user_me(payload: dict = Depends(verify_token), db: Session = Depends(database.get_db)):
    user = user_crud.get_user_by_email(db, email=payload["email"])
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/me", response_model=user_schemas.User)
async def update_user_me(
    user_update: user_schemas.UserUpdate,
    payload: dict = Depends(verify_token),
    db: Session = Depends(database.get_db),
):
    user = user_crud.get_user_by_email(db, email=payload["email"])
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user_crud.update_user(db, db_user=user, user_update=user_update)