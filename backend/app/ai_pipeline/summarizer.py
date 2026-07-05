import logging
from app.ai_pipeline.providers import BaseLLMProvider, MockLLMProvider

logger = logging.getLogger("ai_pipeline.summarizer")

class Summarizer:
    def __init__(self, provider: BaseLLMProvider = None):
        self.provider = provider or MockLLMProvider()
        
    def summarize(self, text: str) -> str:
        logger.info("Summarizer Stage Started...")
        prompt = f"Summarize the following citizen request in one concise sentence: '{text}'"
        summary = self.provider.generate(prompt)
        logger.info(f"Summarizer Stage Finished. Summary: '{summary}'")
        return summary
