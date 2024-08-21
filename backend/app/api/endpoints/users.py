from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import timedelta
from ...crud import user_crud
from ...schemas import user as user_schemas
from ...core import database
from ...core import auth

router = APIRouter()


@router.post("/", response_model=user_schemas.User)
def create_user(user: user_schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = user_crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return user_crud.create_user(db=db, user=user)


@router.get("/", response_model=List[user_schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    users = user_crud.get_users(db, skip=skip, limit=limit)
    return users


@router.get("/me", response_model=user_schemas.User)
def read_user_me(current_user: user_schemas.User = Depends(auth.get_current_active_user)):
    return current_user


@router.put("/me", response_model=user_schemas.User)
def update_user_me(
    user_update: user_schemas.UserUpdate,
    current_user: user_schemas.User = Depends(auth.get_current_active_user),
    db: Session = Depends(database.get_db),
):
    try:
        for key, value in user_update.dict(exclude_unset=True).items():
            setattr(current_user, key, value)
        db.commit()
        db.refresh(current_user)
        return current_user
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=422, detail=f"Error updating user: {str(e)}")


@router.delete("/me", status_code=204)
def delete_user_me(
    current_user: user_schemas.User = Depends(auth.get_current_active_user), db: Session = Depends(database.get_db)
):
    db.delete(current_user)
    db.commit()
    return {"ok": True}


@router.get("/{user_id}", response_model=user_schemas.User)
def read_user(user_id: int, db: Session = Depends(database.get_db)):
    db_user = user_crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.put("/{user_id}", response_model=user_schemas.User)
def update_user(
    user_id: int,
    user: user_schemas.UserUpdate,
    db: Session = Depends(database.get_db),
    current_user: user_schemas.User = Depends(auth.get_current_active_user),
):
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this user"
        )
    db_user = user_crud.update_user(db, user_id=user_id, user=user)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_user: user_schemas.User = Depends(auth.get_current_active_user),
):
    if current_user.id != user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this user"
        )
    user_crud.delete_user(db, user_id=user_id)
    return {"ok": True}