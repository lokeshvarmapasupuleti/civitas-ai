import logging
from app.providers.base import BaseAIProvider
from app.providers.factory import AIProviderFactory

logger = logging.getLogger("ai_pipeline.summarizer")

class Summarizer:
    def __init__(self, provider: BaseAIProvider = None):
        self.provider = provider or AIProviderFactory.get_provider()
        
    def summarize(self, text: str) -> str:
        logger.info("Summarizer Stage Started...")
        prompt = f"Summarize the following citizen request in one concise sentence: '{text}'"
        summary = self.provider.generate(prompt)
        logger.info(f"Summarizer Stage Finished. Summary: '{summary}'")
        return summary
