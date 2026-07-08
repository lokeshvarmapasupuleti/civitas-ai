from abc import ABC, abstractmethod
from app.providers.factory import AIProviderFactory

class BaseLanguageDetector(ABC):
    @abstractmethod
    def detect_language(self, text: str) -> str:
        pass

class MockLanguageDetector(BaseLanguageDetector):
    def detect_language(self, text: str) -> str:
        if not text:
            return "en"
        # Determine language based on scripts present
        hi_characters = ["क", "ख", "ग", "घ", "अ", "आ", "इ", "ई", "उ", "ऊ", "ऋ", "ए", "ऐ", "ओ", "औ"]
        gu_characters = ["ક", "ખ", "ગ", "ઘ", "અ", "આ", "ઇ", "ઈ", "ઉ", "ઊ", "ઋ", "એ", "ઐ", "ઓ", "ઔ"]
        
        for char in hi_characters:
            if char in text:
                return "hi"
        for char in gu_characters:
            if char in text:
                return "gu"
        return "en"

class ProviderLanguageDetector(BaseLanguageDetector):
    def detect_language(self, text: str) -> str:
        if not text:
            return "en"
        provider = AIProviderFactory.get_provider()
        prompt = "Analyze the language of the following text. Respond with only its 2-letter ISO code (e.g., 'en', 'hi', 'gu') and nothing else:\n\n" + text
        try:
            res = provider.chat(prompt).strip().lower()
            if len(res) == 2:
                return res
            return MockLanguageDetector().detect_language(text)
        except Exception:
            return MockLanguageDetector().detect_language(text)
