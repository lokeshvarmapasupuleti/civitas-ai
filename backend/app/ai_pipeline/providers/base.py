from abc import ABC, abstractmethod
from typing import List, Optional

class BaseWhisperProvider(ABC):
    @abstractmethod
    def transcribe(self, audio_data: bytes) -> str:
        """Transcribes raw audio to text."""
        pass

class BaseTranslationProvider(ABC):
    @abstractmethod
    def translate(self, text: str, source_lang: str, target_lang: str = "en") -> str:
        """Translates text from source language to target language."""
        pass

class BaseEmbeddingsProvider(ABC):
    @abstractmethod
    def get_embeddings(self, text: str) -> List[float]:
        """Generates vector embeddings for a given text."""
        pass

class BaseLLMProvider(ABC):
    @abstractmethod
    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Generates text completion based on a prompt."""
        pass
