from fastapi import Depends
from typing import List
import difflib
import string
import json
import io

from src.services.v2.llm_service import LLMService
from src.services.v2.media_service import MediaService


class EvaluationService:
    def __init__(self, llm_service: LLMService = Depends(), media_service: MediaService = Depends()):
        self.llm_service = llm_service
        self.media_service = media_service

    async def transcribe(self, audio: io.BytesIO) -> str:
        return await self.media_service.transcribe_audio(audio)

    # --- Streaming feedback generators (JAM, Scenario, Summary) ---

    async def stream_jam_feedback(self, question: str, user_answer: str):
        yield json.dumps({"type": "answer", "value": user_answer})
        prompt = (
            f"The user was asked to speak on this topic for one minute:\n{question}\n\n"
            f"The user's talk:\n{user_answer}\n\n"
            "Evaluate how well they covered the topic without hesitation or deviation."
        )
        try:
            async for token in self.llm_service.stream_feedback(prompt):
                if token:
                    yield json.dumps({"type": "token", "value": token})
        except Exception:
            yield json.dumps({"type": "error", "value": "AI feedback failed. Please try again."})

    async def stream_scenario_feedback(self, scenario: str, user_answer: str):
        yield json.dumps({"type": "answer", "value": user_answer})
        prompt = (
            f"Scenario:\n{scenario}\n\n"
            f"The user's response:\n{user_answer}\n\n"
            "Evaluate the quality of their decision and reasoning."
        )
        try:
            async for token in self.llm_service.stream_feedback(prompt):
                if token:
                    yield json.dumps({"type": "token", "value": token})
        except Exception:
            yield json.dumps({"type": "error", "value": "AI feedback failed. Please try again."})

    async def stream_summary_feedback(self, summary_question: str, user_answer: str):
        yield json.dumps({"type": "answer", "value": user_answer})
        prompt = (
            f"Original text:\n{summary_question}\n\n"
            f"User's verbal explanation:\n{user_answer}\n\n"
            "Evaluate how well they captured the key points of the original text."
        )
        try:
            async for token in self.llm_service.stream_feedback(prompt):
                if token:
                    yield json.dumps({"type": "token", "value": token})
        except Exception:
            yield json.dumps({"type": "error", "value": "AI feedback failed. Please try again."})

    # --- Instant evaluations (Jumble, Speech) ---

    async def evaluate_jumble(self, user_answers: List[str], correct_answers: List[str]):
        score = 0
        total_score = 0
        results = []
        for i in range(min(len(user_answers), len(correct_answers))):
            correct = correct_answers[i]
            user = user_answers[i]
            total_score += len(correct)
            char_score = sum(
                1 for j in range(min(len(user), len(correct))) if user[j] == correct[j]
            )
            score += char_score
            results.append({
                "user": user,
                "correct": correct,
                "is_exact": user.strip().lower() == correct.strip().lower(),
            })
        accuracy = (score / total_score) * 100 if total_score > 0 else 0
        return score, total_score, accuracy, results

    async def evaluate_speech(self, question: str, user_answer_audio: io.BytesIO):
        user_answer = await self.media_service.transcribe_audio(user_answer_audio)
        translator = str.maketrans('', '', string.punctuation)
        clean_question = question.lower().translate(translator)
        clean_user = user_answer.lower().translate(translator)
        similarity = difflib.SequenceMatcher(None, clean_question, clean_user).ratio()
        accuracy = f"{similarity * 100:.2f}%"
        return user_answer, accuracy
