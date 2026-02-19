from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from functools import lru_cache
import os

@lru_cache() # This makes it a singleton automatically!
def get_llm_model():
    load_dotenv()
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash", 
        temperature=0.7,
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )