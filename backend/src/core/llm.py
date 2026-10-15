from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from fastapi import Depends, Header, HTTPException, status
from functools import lru_cache
import os

load_dotenv()


@lru_cache(maxsize=128)
def get_llm_model(api_key: str) -> ChatGoogleGenerativeAI:
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.7,
        google_api_key=api_key,
    )


def get_api_key(x_api_key: str | None = Header(default=None)) -> str:
    key = x_api_key or os.getenv("GOOGLE_API_KEY", "")
    if not key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No API key provided. Please add your Google Gemini API key on the Settings page.",
        )
    return key


def get_llm_model_dep(api_key: str = Depends(get_api_key)) -> ChatGoogleGenerativeAI:
    return get_llm_model(api_key)
