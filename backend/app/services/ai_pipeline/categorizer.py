from abc import ABC, abstractmethod
from app.providers.factory import AIProviderFactory

class BaseCategorizer(ABC):
    @abstractmethod
    def categorize(self, text: str) -> str:
        pass

class MockCategorizer(BaseCategorizer):
    def categorize(self, text: str) -> str:
        if not text:
            return "Other"
        lower_text = text.lower()
        if "pothole" in lower_text or "road" in lower_text or "bypass" in lower_text:
            return "Road Repair"
        if "water" in lower_text or "leak" in lower_text or "pipe" in lower_text or "sewage" in lower_text:
            return "Water Supply"
        if "garbage" in lower_text or "waste" in lower_text or "dump" in lower_text or "litter" in lower_text:
            return "Sanitation"
        if "light" in lower_text or "streetlight" in lower_text:
            return "Streetlight"
        return "Other"

class ProviderCategorizer(BaseCategorizer):
    def categorize(self, text: str) -> str:
        provider = AIProviderFactory.get_provider()
        categories = ["Road Repair", "Water Supply", "Sanitation", "Streetlight", "Other"]
        try:
            res = provider.classify(text, categories)
            if res in categories:
                return res
            return MockCategorizer().categorize(text)
        except Exception:
            return MockCategorizer().categorize(text)
