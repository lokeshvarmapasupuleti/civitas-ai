import logging
from app.ai_pipeline.providers import BaseLLMProvider, MockLLMProvider

logger = logging.getLogger("ai_pipeline.sentiment")

class SentimentAnalyzer:
    def __init__(self, provider: BaseLLMProvider = None):
        self.provider = provider or MockLLMProvider()
        
    def analyze(self, text: str) -> dict:
        logger.info("Sentiment Analysis Stage Started...")
        prompt = (
            f"Analyze the sentiment and estimate urgency (0.0 to 1.0) of this request. "
            f"Respond in the format: '<sentiment_label>,<urgency_score>'. "
            f"Valid sentiment labels: Critical/Angry, Concerned, Emergency, Neutral. "
            f"Text: '{text}'"
        )
        res = self.provider.generate(prompt)
        
        try:
            parts = res.split(",")
            sentiment = parts[0].strip()
            urgency_score = float(parts[1].strip())
        except Exception:
            sentiment = "Concerned"
            urgency_score = 0.50
            
        logger.info(f"Sentiment Analysis Stage Finished. Sentiment: '{sentiment}', Urgency Score: {urgency_score}")
        return {"sentiment": sentiment, "urgency_score": urgency_score}
