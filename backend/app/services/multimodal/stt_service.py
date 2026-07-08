from app.providers.base import BaseAIProvider
from app.providers.factory import AIProviderFactory

class STTService:
    def __init__(self, provider: BaseAIProvider = None):
        self.provider = provider or AIProviderFactory.get_provider()

    def transcribe(self, audio_bytes: bytes) -> str:
        if not audio_bytes:
            return ""
        return self.provider.speech_to_text(audio_bytes)