from abc import ABC, abstractmethod
from pydantic import BaseModel, Field
from app.providers.factory import AIProviderFactory

class SpeechResult(BaseModel):
    transcript: str = Field(..., description="Transcribed text from the audio input")
    detected_language: str = Field(..., description="Detected language code (e.g. en, hi, gu)")
    confidence: float = Field(..., description="Transcription confidence score (0.0 to 1.0)")
    duration: float = Field(..., description="Audio length in seconds")

class BaseSpeechProvider(ABC):
    @abstractmethod
    def transcribe(self, audio_bytes: bytes) -> SpeechResult:
        pass

class WhisperSpeechProvider(BaseSpeechProvider):
    def transcribe(self, audio_bytes: bytes) -> SpeechResult:
        # Under the hood, this would call openai.audio.transcriptions.create(file=audio_bytes, model="whisper-1")
        # For now, use the unified provider abstraction
        provider = AIProviderFactory.get_provider()
        text = provider.speech_to_text(audio_bytes)
        return SpeechResult(
            transcript=text,
            detected_language="en",
            confidence=0.0,
            duration=0.0
        )

class GoogleSpeechProvider(BaseSpeechProvider):
    def transcribe(self, audio_bytes: bytes) -> SpeechResult:
        # Under the hood, this would call google.cloud.speech.SpeechClient().recognize(...)
        # For now, use the unified provider abstraction
        provider = AIProviderFactory.get_provider()
        text = provider.speech_to_text(audio_bytes)
        return SpeechResult(
            transcript=text,
            detected_language="en",
            confidence=0.0,
            duration=0.0
        )

class AzureSpeechProvider(BaseSpeechProvider):
    def transcribe(self, audio_bytes: bytes) -> SpeechResult:
        # Under the hood, this would call azure.cognitiveservices.speech.SpeechRecognizer().recognize_once(...)
        # For now, use the unified provider abstraction
        provider = AIProviderFactory.get_provider()
        text = provider.speech_to_text(audio_bytes)
        return SpeechResult(
            transcript=text,
            detected_language="en",
            confidence=0.0,
            duration=0.0
        )

class GeminiSpeechProvider(BaseSpeechProvider):
    def transcribe(self, audio_bytes: bytes) -> SpeechResult:
        # Use the unified provider abstraction with Gemini
        provider = AIProviderFactory.get_provider()
        text = provider.speech_to_text(audio_bytes)
        return SpeechResult(
            transcript=text,
            detected_language="en",
            confidence=0.0,
            duration=0.0
        )

class MockSpeechProvider(BaseSpeechProvider):
    def transcribe(self, audio_bytes: bytes) -> SpeechResult:
        length = len(audio_bytes)
        
        # Determine language and content based on audio byte length modulo
        if length % 3 == 0:
            text = "ये गली की बत्ती पिछले चार दिनों से नहीं जल रही है और रात में बहुत अंधेरा रहता है।"
            lang = "hi"
            duration = 6.5
        elif length % 3 == 1:
            text = "ગટરનું પાણી રસ્તા પર વહી રહ્યું છે, ગંદકી બહુ વધી ગઈ છે."
            lang = "gu"
            duration = 5.2
        else:
            text = "Potholes and broken roads are causing massive traffic delays in sector 3 ward office."
            lang = "en"
            duration = 7.8
            
        return SpeechResult(
            transcript=text,
            detected_language=lang,
            confidence=0.88,
            duration=duration
        )
