from abc import ABC, abstractmethod
from typing import List, Optional

class BaseAIProvider(ABC):
    @abstractmethod
    def chat(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """
        Generates a chat completion.
        """
        pass

    @abstractmethod
    def get_embedding(self, text: str) -> List[float]:
        """
        Generates vector embeddings for similarity search.
        """
        pass

    @abstractmethod
    def analyze_image(self, image_bytes: bytes, prompt: str) -> str:
        """
        Performs vision analysis on image data.
        """
        pass

    @abstractmethod
    def ocr(self, image_bytes: bytes) -> str:
        """
        Performs optical character recognition (OCR).
        """
        pass

    @abstractmethod
    def speech_to_text(self, audio_bytes: bytes) -> str:
        """
        Transcribes speech audio bytes to text.
        """
        pass

    @abstractmethod
    def summarize(self, text: str) -> str:
        """
        Summarizes input text dynamically.
        """
        pass

    @abstractmethod
    def classify(self, text: str, categories: List[str]) -> str:
        """
        Classifies input text into categories.
        """
        pass

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Compatibility hook for legacy AI pipeline modules."""
        return self.chat(prompt, system_prompt)

    def translate(self, text: str, source_lang: str, target_lang: str = "en") -> str:
        """Compatibility hook for legacy translation flows."""
        return self.chat(
            f"Translate the following text from {source_lang} to {target_lang}:\n\n{text}",
            "You are a translation assistant."
        )

    def get_embeddings(self, text: str) -> List[float]:
        """Compatibility hook for legacy embedding workflows."""
        return self.get_embedding(text)
