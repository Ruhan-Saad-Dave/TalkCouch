from fastapi import APIRouter, Depends, HTTPException, status

from src.services.v2.question_service import QuestionService
from src.services.v2.media_service import MediaService 

question_app = APIRouter(
    prefix="/v1",
    tags=["questions/v1"]
)

@question_app.get("/jam", status_code=status.HTTP_200_OK)
async def get_jam_question(service: QuestionService = Depends()):
    questions = await service.jam_question()
    if not questions:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate question"
            )
    return {"question": questions}

@question_app.get("/jumble", status_code=status.HTTP_200_OK)
async def get_jumble_question(service: QuestionService = Depends()):
    jumbled_sentences, answers = await service.jumble_question()
    if not jumbled_sentences or not answers: 
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to generate question"
        )
    return {"questions": jumbled_sentences, "answers": answers}
    
@question_app.get("/scenario", status_code=status.HTTP_200_OK)
async def get_scenario_question(service: QuestionService = Depends()):
    questions = await service.scenario_question() 
    if not questions: 
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate question"
        )
    return {"question": questions}

@question_app.get("/speech", status_code=status.HTTP_200_OK)
async def get_speech_question(service: QuestionService = Depends()):
    question, audio_fp = await service.speech_question() 
    if not question or not audio_fp: 
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate question"
        )
    return {"question": question, "audio": audio_fp.getvalue()}

@question_app.get("/summary", status_code=status.HTTP_200_OK)
async def get_summary_question(service: QuestionService = Depends()):
    question = await service.summary_question() 
    if not question: 
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate question"
        )
    return {"question": question}