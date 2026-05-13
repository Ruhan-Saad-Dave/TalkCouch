from fastapi import APIRouter, Depends, status, Form, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
import io

from src.services.v2.evaluation_service import EvaluationService

evaluation_app = APIRouter(
    prefix="/v1",
    tags=["evaluation/v1"]
)


class JumbleRequest(BaseModel):
    user_answers: List[str]
    correct_answers: List[str]


@evaluation_app.post("/jam", status_code=status.HTTP_200_OK)
async def evaluate_jam(
    question: str = Form(...),
    user_answer_audio: bytes = File(...),
    service: EvaluationService = Depends(),
):
    user_answer = await service.transcribe(io.BytesIO(user_answer_audio))

    async def generate():
        async for chunk in service.stream_jam_feedback(question, user_answer):
            yield chunk + "\n"

    return StreamingResponse(generate(), media_type="application/x-ndjson")


@evaluation_app.post("/scenario", status_code=status.HTTP_200_OK)
async def evaluate_scenario(
    scenario: str = Form(...),
    user_answer_audio: bytes = File(...),
    service: EvaluationService = Depends(),
):
    user_answer = await service.transcribe(io.BytesIO(user_answer_audio))

    async def generate():
        async for chunk in service.stream_scenario_feedback(scenario, user_answer):
            yield chunk + "\n"

    return StreamingResponse(generate(), media_type="application/x-ndjson")


@evaluation_app.post("/summary", status_code=status.HTTP_200_OK)
async def evaluate_summary(
    summary_question: str = Form(...),
    user_answer_audio: bytes = File(...),
    service: EvaluationService = Depends(),
):
    user_answer = await service.transcribe(io.BytesIO(user_answer_audio))

    async def generate():
        async for chunk in service.stream_summary_feedback(summary_question, user_answer):
            yield chunk + "\n"

    return StreamingResponse(generate(), media_type="application/x-ndjson")


@evaluation_app.post("/speech", status_code=status.HTTP_200_OK)
async def evaluate_speech(
    question: str = Form(...),
    user_answer_audio: bytes = File(...),
    service: EvaluationService = Depends(),
):
    user_answer, accuracy = await service.evaluate_speech(question, io.BytesIO(user_answer_audio))
    return {"user_answer": user_answer, "accuracy": accuracy}


@evaluation_app.post("/jumble", status_code=status.HTTP_200_OK)
async def evaluate_jumble(request: JumbleRequest, service: EvaluationService = Depends()):
    score, total_score, accuracy, results = await service.evaluate_jumble(
        request.user_answers, request.correct_answers
    )
    return {"score": score, "total_score": total_score, "accuracy": accuracy, "results": results}
