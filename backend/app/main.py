from fastapi import FastAPI
from .core.database import engine
from .models.user import Base
from .api import auth

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth.router, prefix="/auth", tags=["auth"])

@app.get("/")
async def root():
    return {"message": "Welcome to Stojanovic-One API"}