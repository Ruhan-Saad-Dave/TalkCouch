from pydub import AudioSegment, effects
from gtts import gTTS
from fastapi import HTTPException, status
import speech_recognition as sr
import io
import os

class SpeechService:
    def __init__(self):
        self.recognizer = sr.Recognizer()

    async def speech_to_text(self, audio_file: io.BytesIO) -> str:
        try:
            audio_segment = AudioSegment.from_file(audio_file)
            audio_segment = effects.normalize(audio_segment)
            audio_segment = audio_segment.set_channels(1)
            wav_io = io.BytesIO()
            audio_segment.export(wav_io, format="wav")
            wav_io.seek(0)

            with sr.AudioFile(wav_io) as source:
                self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
                audio_data = self.recognizer.record(source)

            text = self.recognizer.recognize_google(audio_data)
            return text
        except sr.UnknownValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not understand your audio. Please speak clearly and try again."
            )
        except sr.RequestError as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Speech recognition service unavailable: {e}"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to process audio: {str(e)}"
            )

    async def text_to_speech(self, text: str) -> io.BytesIO:
        try:
            tts = gTTS(text=text, lang="en")
            audio_fp = io.BytesIO()
            tts.write_to_fp(audio_fp)
            audio_fp.seek(0)
            return audio_fp
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Text-to-speech service unavailable: {str(e)}"
            )