from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

_model = None

def get_model():
    """
    Returns a singleton instance of the ChatGoogleGenerativeAI model.
    Initializes the model on the first call.
    """
    global _model
    if _model is None:
        load_dotenv()
        _model = ChatGoogleGenerativeAI(model="gemini-2.5-flash")
    return _model
