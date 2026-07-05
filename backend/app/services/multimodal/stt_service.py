from app.services.multimodal.providers import BaseSpeechToText, MockSpeechToText

class STTService:
    def __init__(self, provider: BaseSpeechToText = None):
        self.provider = provider or MockSpeechToText()

    def transcribe(self, audio_bytes: bytes) -> str:
        if not audio_bytes:
            return ""
        return self.provider.transcribe(audio_bytes)
