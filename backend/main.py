from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware 

from src.api.v1.questions import question_app

app = FastAPI(
    title="Talk Couch Backend Server",
    description="Backend server for the Talk Couch application, providing APIs for user management, chat handling, and integration with external services.",
    version="1.0.0",
)


app.include_router(question_app, prefix="/api/questions")

