import speech_recognition as sr

from src.llm import get_model

model = get_model()
message = "Generate a scenario based question to test what the user will do at that situation. Only give the question and do not give any explaination."

def generate_scenario():
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
    
    feedback_prompt = f"""
    The user is asked to say what they would do in the following scenario:
    ---
    {topic}
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
    try:
        feedback_result = model.invoke(feedback_prompt)
        feedback = feedback_result.content
    except Exception as e:
        print(f"An error occurred: {e}")
        feedback = "The resources are exhausted"

    feedback = "### Model Feedback\n" + feedback
    return user_answer, feedback
