from fastapi import FastAPI
from .core.database import engine
from .models.user import Base

Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Welcome to Stojanovic-One API"}