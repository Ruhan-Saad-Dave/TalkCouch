import speech_recognition as sr
import wave
import os

from src.llm import get_model

model = get_model()
message = "Generate a topic for a one minute talk session. The topic should be engaging and open-ended to encourage detailed discussion. Only include the topic and dont include any explaination or other stuff"

def generate_topic():
    result = model.invoke(message)
    topic = result.content
    return topic, topic, None, "", ""

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

def check_answer(topic, audio_filepath):
    if audio_filepath is None:
        return "No audio recorded. Please record your audio first."
    user_answer = record_speech(audio_filepath)
    
    try:
        # Open the .wav file to read its properties
        with wave.open(audio_filepath, 'rb') as wf:
            frames = wf.getnframes()
            rate = wf.getframerate()
            duration_seconds = frames / float(rate)

        # Clean up the temporary file created by Gradio
        os.remove(audio_filepath)

        if duration_seconds < 60:
            return user_answer, "Audio is too short. Please record at least 1 minute of audio."
        
    except wave.Error as e:
        print(f"Error processing audio file: {e}. Please ensure you are recording in WAV format.")
        return user_answer, "Error proocessing audio file."
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return user_answer, "Error proocessing audio file."
    
    feedback_prompt = f"""
    The user is asked to talk on the topic:
    ---
    {topic}
    ---
    The user's talk is:
    ---
    {user_answer}
    ---
    Please evaluate how well the user explained the topic. Provide concise feedback.
    """
    try:
        feedback_result = model.invoke(feedback_prompt)
        feedback = feedback_result.content
    except Exception as e:
        print(f"An error occurred: {e}")
        feedback = "The resources are exhausted"

    return user_answer, feedback