from langchain_core.messages import HumanMessage, SystemMessage
from google.api_core.exceptions import ResourceExhausted
from fastapi import Depends, HTTPException, status
from typing import AsyncGenerator

from src.core.llm import get_llm_model

_QUESTION_SYSTEM = (
    "You are a communication practice assistant. "
    "Output exactly what is requested with no preamble, explanation, or extra commentary."
)

_EVALUATION_SYSTEM = (
    "You are a communication coach giving feedback on spoken English practice exercises. "
    "Be concise and constructive. Structure your response with 3-5 bullet points. "
    "Use **bold** for key terms only. Do not use single asterisks for italics."
)


class LLMService:
    def __init__(self, llm_model=Depends(get_llm_model)):
        self.llm_model = llm_model

    async def get_question(self, instruction: str) -> str:
        try:
            result = await self.llm_model.ainvoke([
                SystemMessage(content=_QUESTION_SYSTEM),
                HumanMessage(content=instruction),
            ])
            return result.content
        except ResourceExhausted as e:
            print(f"LLM Resource Exhausted: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="The AI model is currently overloaded. Please try again later.",
            )
        except Exception as e:
            print(f"Unexpected LLM error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An unexpected error occurred with the AI model. Please try again later.",
            )

    async def stream_feedback(self, prompt: str) -> AsyncGenerator[str, None]:
        async for chunk in self.llm_model.astream([
            SystemMessage(content=_EVALUATION_SYSTEM),
            HumanMessage(content=prompt),
        ]):
            yield chunk.content
