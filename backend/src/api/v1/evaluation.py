from fastapi import APIRouter, Depends, HTTPException, status 
from typing import List
import io

from src.services.v2.evaluation_service import EvaluationService 

evaluation_app = APIRouter(
    prefix="/v1",
    tags=["evaluation/v1"]
)

@evaluation_app.post("/jam", status_code=status.HTTP_200_OK)
async def evaluate_jam(question: str, user_answer_audio: bytes, service: EvaluationService = Depends()):
    user_answer_audio_fp = io.BytesIO(user_answer_audio)
    user_answer, feedback = await service.evaluate_jam(question, user_answer_audio_fp)
    return {"user_answer": user_answer, "feedback": feedback}

@evaluation_app.post("/jumble", status_code=status.HTTP_200_OK)
async def evaluate_jumble(user_answers: List[str], correct_answers: List[str], service: EvaluationService = Depends()):
    score, total_score, accuracy = await service.evaluate_jumble(user_answers, correct_answers)
    return {"score": score, "total_score": total_score, "accuracy": accuracy}

@evaluation_app.post("/scenario", status_code=status.HTTP_200_OK)
async def evaluate_scenario(scenario: str, user_answer_audio: bytes, service: EvaluationService = Depends()):
    user_answer_audio_fp = io.BytesIO(user_answer_audio)
    user_answer, feedback = await service.evaluate_scenario(scenario, user_answer_audio_fp)
    return {"user_answer": user_answer, "feedback": feedback}

@evaluation_app.post("/summary", status_code=status.HTTP_200_OK)
async def evaluate_summary(summary: str, service: EvaluationService = Depends()):
    feedback = await service.evaluate_summary(summary)
    return {"feedback": feedback}

@evaluation_app.post("/speech", status_code=status.HTTP_200_OK)
async def evaluate_speech(user_answer_audio: bytes, service: EvaluationService = Depends()):
    user_answer_audio_fp = io.BytesIO(user_answer_audio)
    feedback = await service.evaluate_speech(user_answer_audio_fp)
    return {"feedback": feedback}
