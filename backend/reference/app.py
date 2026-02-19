from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.jumble import generate_sentences, calculate_score
import uuid

app = FastAPI()

# In-memory storage for quizzes
quizzes = {}

# CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/api/sentences")
def get_sentences():
    quiz_id = str(uuid.uuid4())
    questions, answers = generate_sentences()
    quizzes[quiz_id] = {"questions": questions, "answers": answers}
    return {"quiz_id": quiz_id, "questions": questions}

@app.post("/api/submit")
def submit_answer(data: dict):
    quiz_id = data["quiz_id"]
    question_index = data["question_index"]
    user_answer = data["user_answer"]

    if quiz_id not in quizzes:
        return {"error": "Quiz not found"}

    quiz = quizzes[quiz_id]
    if question_index >= len(quiz["answers"]):
        return {"error": "Invalid question index"}

    correct_answer = quiz["answers"][question_index]
    score = calculate_score(user_answer, correct_answer)
    
    return {"correct_answer": correct_answer, "score": score}
