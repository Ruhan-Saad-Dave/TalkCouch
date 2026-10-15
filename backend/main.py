from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import RedirectResponse
from dotenv import load_dotenv
import os

from src.api.v1.questions import question_app
from src.api.v1.evaluation import evaluation_app

load_dotenv()

app = FastAPI(
    title="Talk Couch Backend Server",
    description="Backend server for the Talk Couch application, providing APIs for question generation and response evaluation.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

_origins_env = os.getenv("CORS_ORIGINS", "")
_default_origins = [
    "http://localhost:5173",
    "http://localhost:4173",
    "http://localhost:80",
    "http://localhost",
]
allow_origins = [o.strip() for o in _origins_env.split(",") if o.strip()] or _default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(question_app, prefix="/api/questions")
app.include_router(evaluation_app, prefix="/api/evaluation")


@app.get("/")
async def root():
    return RedirectResponse(url="/docs")
