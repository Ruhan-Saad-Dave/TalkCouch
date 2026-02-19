from fastapi import Depends
from typing import Tuple, List
import random
import re

from src.services.v2.llm_service import LLMService
from src.services.v2.media_service import MediaService

class QuestionService:
    def __init__(self, llm_service: LLMService = Depends(), media_service: MediaService = Depends()):
        self.llm_service = llm_service
        self.media_service = media_service

    async def jam_question(self) -> str:
        instruction = "Generate a topic for a one minute talk session. The topic should be engaging and open-ended to encourage detailed discussion. Only include the topic and dont include any explaination or other stuff"
        question = await self.llm_service.get_question(instruction)
        return question

    async def jumble_question(self) -> Tuple[List[str], List[str]]:
        instruction = "Generate 10 sentences which are unrelated to each other. These sentences will be used for jumbling sentence quiz. Only give the result and dont give any numbers at the beginning."
        result = await self.llm_service.get_question(instruction)
        sentences = result.strip().split("\n")
        answers = [sentence.strip() for sentence in sentences if sentence.strip()]
        # Remove any numbering from the model's output
        answers = [re.sub(r'^\d+\.\s*', '', sentence) for sentence in answers]
        words = [sentence.split() for sentence in answers]
        questions = [ws[:] for ws in words] # Create a copy of the word lists
        for question in questions:
            random.shuffle(question)
        jumbled_sentences = [" ".join(question) for question in questions]
        return jumbled_sentences, answers


    async def scenario_question(self) -> str:
        instruction = "Generate a scenario based question to test what the user will do at that situation. Only give the question and do not give any explaination."
        question = await self.llm_service.get_question(instruction)
        return question

    async def speech_question(self) -> str:
        instruction = "Generate a sentence suitable for speech practice. Make sure to only provide the sentence without any additional text or explaination."
        question = await self.llm_service.get_question(instruction)
        audio_fp = await self.media_service.generate_audio(question)
        return question, audio_fp

    async def summary_question(self) -> str:
        instruction = "Generate a paragraph of text where the sentences are related, note that it will be used by the user to practice their explaination ability. Make sure to only provide sentences without any additional text or explaination."
        question = await self.llm_service.get_question(instruction)
        return question