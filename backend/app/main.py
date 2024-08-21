from fastapi import FastAPI
from .core.database import Base, engine
from .models import user
from .api.endpoints import users
from .api import auth_routes
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Stojanovic-One API",
    description="API for Stojanovic-One project",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI endpoint
    redoc_url="/redoc",  # ReDoc endpoint
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])


@app.get("/")
async def root():
    return {"message": "Welcome to Stojanovic-One API"}