from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware 
from starlette.responses import RedirectResponse
import sys

from src.api.v1.questions import question_app
from src.api.v1.evaluation import evaluation_app

app = FastAPI(
    title="Talk Couch Backend Server",
    description="Backend server for the Talk Couch application, providing APIs for user management, chat handling, and integration with external services.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.include_router(question_app, prefix="/api/questions")
app.include_router(evaluation_app, prefix="/api/evaluation")

@app.get("/")
async def root():
    return RedirectResponse(url="/docs")

@app.post("/shutdown")
async def shutdown():
    sys.exit(0)