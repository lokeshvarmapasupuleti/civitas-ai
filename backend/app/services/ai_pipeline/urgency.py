from abc import ABC, abstractmethod
from app.providers.factory import AIProviderFactory

class BaseUrgencyDetector(ABC):
    @abstractmethod
    def detect_urgency(self, text: str) -> float:
        pass

class MockUrgencyDetector(BaseUrgencyDetector):
    def detect_urgency(self, text: str) -> float:
        if not text:
            return 0.30
        lower_text = text.lower()
        if "dangerous" in lower_text or "emergency" in lower_text or "accident" in lower_text:
            return 0.85
        if "pothole" in lower_text or "leakage" in lower_text or "broken" in lower_text or "drain" in lower_text:
            return 0.65
        return 0.30

class ProviderUrgencyDetector(BaseUrgencyDetector):
    def detect_urgency(self, text: str) -> float:
        provider = AIProviderFactory.get_provider()
        prompt = "Analyze the urgency of this complaint on a scale of 0.0 to 1.0 (where 1.0 is extremely urgent). Respond with only the numeric float value and nothing else:\n\n" + text
        try:
            res = provider.chat(prompt).strip()
            val = float(res)
            if 0.0 <= val <= 1.0:
                return val
            return MockUrgencyDetector().detect_urgency(text)
        except Exception:
            return MockUrgencyDetector().detect_urgency(text)
