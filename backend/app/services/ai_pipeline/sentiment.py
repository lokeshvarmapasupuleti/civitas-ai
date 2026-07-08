from abc import ABC, abstractmethod
from app.providers.factory import AIProviderFactory

class BaseSentimentAnalyzer(ABC):
    @abstractmethod
    def analyze_sentiment(self, text: str) -> str:
        pass

class MockSentimentAnalyzer(BaseSentimentAnalyzer):
    def analyze_sentiment(self, text: str) -> str:
        if not text:
            return "Neutral"
        lower_text = text.lower()
        if "dangerous" in lower_text or "critical" in lower_text or "emergency" in lower_text or "accident" in lower_text:
            return "Critical/Angry"
        if "hazard" in lower_text or "broken" in lower_text or "pothole" in lower_text:
            return "Concerned"
        return "Neutral"

class ProviderSentimentAnalyzer(BaseSentimentAnalyzer):
    def analyze_sentiment(self, text: str) -> str:
        provider = AIProviderFactory.get_provider()
        prompt = "Analyze the sentiment of this complaint. Respond with only one of these words: 'Critical/Angry', 'Concerned', 'Neutral', or 'Emergency' and nothing else:\n\n" + text
        try:
            res = provider.chat(prompt).strip()
            if any(opt in res for opt in ['Critical', 'Angry', 'Concerned', 'Neutral', 'Emergency']):
                return res
            return MockSentimentAnalyzer().analyze_sentiment(text)
        except Exception:
            return MockSentimentAnalyzer().analyze_sentiment(text)
