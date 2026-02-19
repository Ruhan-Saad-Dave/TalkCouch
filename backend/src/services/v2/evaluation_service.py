from fastapi import Depends, HTTPException 
from typing import Tuple, List 
import difflib
import string
import io

from src.services.v2.llm_service import LLMService 
from src.services.v2.media_service import MediaService

class EvaluationService:
    def __init__(self, llm_service: LLMService = Depends(), media_service: MediaService = Depends()):
        self.llm_service = llm_service 
        self.media_service = media_service

    async def evaluate_jam(self, question: str, user_answer_audio: io.BytesIO):
        user_answer = await self.media_service.transcribe_audio(user_answer_audio)
        feedback_prompt = f"""
            The user is asked to talk on the topic:
            ---
            {question}
            ---
            The user's talk is:
            ---
            {user_answer}
            ---
            Please evaluate how well the user explained the topic. Provide concise feedback.
            If the user's answer is not good enough, suggest ways to improve it, or give your own answer.

            Format your feedback using Markdown:
            - Use bullet points or numbered lists for suggestions, with each point on a new line.
            - Use double asterisks (**) for bolding key phrases for emphasis. Do not use single asterisks for italics.
        """
        result = await self.llm_service.get_question(feedback_prompt).content 
        return user_answer, result


    async def evaluate_jumble(self, user_answers: List[str], correct_answers: List[str]):
        score = 0
        total_score = 0
        for i in range(len(user_answers)):
            total_score += len(correct_answers[i])
            for character in range(len(user_answers[i])):
                if user_answers[i][character] == correct_answers[i][character]:
                    score += 1
        accuracy = (score / total_score) * 100 if total_score > 0 else 0
        return score, total_score, accuracy

    async def evaluate_scenario(self, scenario: str, user_answer_audio: io.BytesIO):
        user_answer = await self.media_service.trascribe_audio(user_answer_audio)
        feedback_prompt = f"""
            The user is asked to say what they would do in the following scenario:
            ---
            {scenario}
            ---
            The user's answer is:
            ---
            {user_answer}
            ---
            Please evaluate how well the user explained their decision and logic. Provide concise feedback.
            If the user's answer is not good enough, suggest ways to improve it, or give your own answer.

            Format your feedback using Markdown:
            - Use bullet points or numbered lists for suggestions, with each point on a new line.
            - Use double asterisks (**) for bolding key phrases for emphasis. Do not use single asterisks for italics.
        """
        result = await self.llm_service.get_question(feedback_prompt).content
        return user_answer, result

    async def evaluate_speech(self, question: str, user_answer_audio: io.BytesIO):
        user_answer = await self.media_service.trascribe_audio(user_answer_audio)
        translator = str.maketrans('', '', string.punctuation)
        clean_question = question.lower().translate(translator)
        clean_user_answer = user_answer.lower().translate(translator)
        similarity = difflib.SequenceMatcher(None, clean_question, clean_user_answer).ratio()
        accuracy = f"{similarity * 100:.2f}%"
        return user_answer, accuracy
        
    async def evaluate_summary(self, summary_question: str, user_answer_audio: io.BytesIO):
        user_answer = await self.media_service.trascribe_audio(user_answer_audio)
        feedback_prompt = f"""
            The original text is:
            ---
            {summary_question}
            ---

            The user's explanation is:
            ---
            {user_answer}
            ---

            Please evaluate how well the user explained or summarized the original text. Provide concise feedback.
            If the user's answer is not good enough, suggest ways to improve it, or give your own answer.

            Format your feedback using Markdown:
            - Use bullet points or numbered lists for suggestions, with each point on a new line.
            - Use double asterisks (**) for bolding key phrases for emphasis. Do not use single asterisks for italics.
        """
        result = await self.llm_service.get_question(feedback_prompt).content
        return user_answer, result