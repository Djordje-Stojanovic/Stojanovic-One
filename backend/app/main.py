from fastapi import FastAPI, Depends
from .core.database import Base, engine
from .api.endpoints import users
from fastapi.middleware.cors import CORSMiddleware
from .core.error_handler import custom_exception_handler
from .core.logger import logger
from .core.auth0 import verify_token

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Stojanovic-One API",
    description="API for Stojanovic-One project",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(Exception, custom_exception_handler)

app.include_router(users.router, prefix="/users", tags=["users"], dependencies=[Depends(verify_token)])

@app.get("/")
async def root():
    logger.info("Root endpoint accessed")
    return {"message": "Welcome to Stojanovic-One API"}