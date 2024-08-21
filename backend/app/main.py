from fastapi import FastAPI
from .core.database import Base, engine
from .models import user
from .api.endpoints import users
from .api import auth_routes
from fastapi.middleware.cors import CORSMiddleware
from .core.error_handler import custom_exception_handler
from .core.logger import logger

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

app.include_router(auth_routes.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])

@app.get("/")
async def root():
    logger.info("Root endpoint accessed")
    return {"message": "Welcome to Stojanovic-One API"}