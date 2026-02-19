from fastapi import Depends
import io

from src.core.speech import SpeechService 

class MediaService: 
    def __init__(self, service: SpeechService = Depends()):
        self.service = service 

    async def process_audio(self, audio_file: bytes) -> str:
        result = await self.service.speech_to_text(audio_file)
        return result
    
    async def generate_audio(self, text: str) -> io.BytesIO:
        audio_fp = await self.service.text_to_speech(text)
        return audio_fp