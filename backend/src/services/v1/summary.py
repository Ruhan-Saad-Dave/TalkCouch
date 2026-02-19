from langchain_google_genai import ChatGoogleGenerativeAI 
from dotenv import load_dotenv
import speech_recognition as sr
from gtts import gTTS
import os
from src.llm import get_model

message = "Generate a paragraph of text where the sentences are related, note that it will be used by the user to practice their explaination ability. Make sure to only provide sentences without any additional text or explaination."
model = get_model()

def generate_text():
    try:
        result = model.invoke(message)
        return result.content
    except Exception as e:
        print(f"An error occurred: {e}")
        return "The resources are exhausted"

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
    
    feedback_prompt = f"""
    The original text is:
    ---
    {generated_text}
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
    try:
        feedback_result = model.invoke(feedback_prompt)
        feedback = feedback_result.content
    except Exception as e:
        print(f"An error occurred: {e}")
        feedback = "The resources are exhausted"

    feedback = "### Model's Feedback\n" + feedback
    return generated_text, user_answer, feedback