from langchain_core.messages import HumanMessage
from google.api_core.exceptions import ResourceExhausted
from fastapi import Depends, HTTPException, status

from src.core.llm import get_llm_model

class LLMService:
    def __init__(self, llm_model=Depends(get_llm_model)):
        self.llm_model = llm_model 

    async def get_question(self, instruction: str) -> str:
        try: 
            result = await self.llm_model.ainvoke([HumanMessage(content=instruction)])
            question = result.content 
            return question
        except ResourceExhausted as e:
            print(f"LLM Resource Exhausted: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="The AI model is currently overloaded. Please try again later."
            )
        except Exception as e:
            print(f"Unexpected LLM error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An unexpected error occured with the AI model. Please try again later."
            )
 