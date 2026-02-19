from pydub import AudioSegment, effects 
from gtts import gTTS
import speech_recognition as sr
import io 
import os 

class SpeechService: 
    def __init__(self):
        self.recognizer = sr.Recognizer() 

    async def speech_to_text(self, audio_file: bytes) -> str:
        try: 
            audio_segment = AudioSegment.from_file(io.BytesIO(audio_file))
            audio_segment = effects.normalize(audio_segment) 
            audio_segment = audio_segment.set_channels(1) #convert to mono, good for STT
            wav_io = io.BytesIO()
            audio_segment.export(wav_io, format="wav")
            wav_io.seek(0)

            with sr.AudioFile(wav_io) as source: 
                self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
                audio_data = self.recognizer.record(source)

            text = self.recognizer.recognize_google(audio_data)
            return text
        except sr.UnknownValueError:
            return "Could not understand audio"
        except sr.RequestError as e:
            return f"Service error: {e}"
        except Exception as e:
            return f"Conversion error: {str(e)}"
        
    async def text_to_speech(self, text: str) -> io.BytesIO:
        tts = gTTS(text=text, lang="en")
        audio_fp = io.BytesIO() #audio buffer 
        tts.write_to_fp(audio_fp)
        audio_fp.seek(0) #reset the pointer so fastapi can read it
        return audio_fp