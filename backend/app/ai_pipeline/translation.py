import logging
from app.providers.base import BaseAIProvider
from app.providers.factory import AIProviderFactory

logger = logging.getLogger("ai_pipeline.translation")

class Translator:
    def __init__(self, provider: BaseAIProvider = None):
        self.provider = provider or AIProviderFactory.get_provider()
        
    def translate(self, text: str, source_lang: str) -> str:
        logger.info(f"Translation Stage Started (Source Language: {source_lang})...")
        translated_text = self.provider.translate(text, source_lang, "en")
        logger.info(f"Translation Stage Finished. Result preview: '{translated_text[:60]}...'")
        return translated_text
