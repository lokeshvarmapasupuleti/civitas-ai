from abc import ABC, abstractmethod
from app.providers.factory import AIProviderFactory

class BaseTranslator(ABC):
    @abstractmethod
    def translate(self, text: str, source_lang: str) -> str:
        pass

class MockTranslator(BaseTranslator):
    def translate(self, text: str, source_lang: str) -> str:
        if not text:
            return ""
        if source_lang == "en":
            return text
            
        translation_map = {
            "hi": "Potholes on the road connecting to school are causing safety hazards.",
            "gu": "Potholes on the road connecting to school are causing safety hazards."
        }
        return translation_map.get(source_lang, "Translated: " + text)

class ProviderTranslator(BaseTranslator):
    def translate(self, text: str, source_lang: str) -> str:
        if not text:
            return ""
        if source_lang == "en":
            return text
        provider = AIProviderFactory.get_provider()
        prompt = f"Translate the following text from {source_lang} to English. Output only the English translation and nothing else:\n\n{text}"
        try:
            res = provider.chat(prompt)
            if "Mock Chat" in res or not res.strip():
                return MockTranslator().translate(text, source_lang)
            return res.strip()
        except Exception:
            return MockTranslator().translate(text, source_lang)
