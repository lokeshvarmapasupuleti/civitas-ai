from abc import ABC, abstractmethod

class BaseSpeechToText(ABC):
    @abstractmethod
    def transcribe(self, audio_bytes: bytes) -> str:
        """Transcribe audio binary contents to string text."""
        pass

class BaseOCR(ABC):
    @abstractmethod
    def extract_text(self, image_bytes: bytes) -> str:
        """Extract text content from image binary scan."""
        pass
