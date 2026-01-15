from langchain_google_genai import ChatGoogleGenerativeAI 
from dotenv import load_dotenv
import speech_recognition as sr
from gtts import gTTS
import difflib
import os
import string
from src.llm import get_model

message = "Generate a sentence suitable for speech practice. Make sure to only provide the sentence without any additional text or explaination."

def generate_text():
    model = get_model()
    result = model.invoke(message)
    return result.content

def generate_speech():
    content = generate_text()
    tts = gTTS(text=content, lang='en')
    speech_file = "generated_speech.mp3"
    tts.save(speech_file)
    return speech_file, content

def record_speech(recorded_audio):
    if recorded_audio is None:
        return "No audio recorded."
    
    r = sr.Recognizer()
    with sr.AudioFile(recorded_audio) as source:
        audio_data = r.record(source)
        try:
            text = r.recognize_google(audio_data)
            return text
        except sr.UnknownValueError:
            return "Could not understand audio"
        except sr.RequestError as e:
            return f"Could not request results; {e}"

def check_correctness(recorded_audio, generated_text):
    user_answer = record_speech(recorded_audio)
    
    translator = str.maketrans('', '', string.punctuation)
    clean_generated_text = generated_text.lower().translate(translator)
    clean_user_answer = user_answer.lower().translate(translator)
    
    similarity = difflib.SequenceMatcher(None, clean_generated_text, clean_user_answer).ratio()
    accuracy = f"{similarity * 100:.2f}%"
    return generated_text, user_answer, accuracy