import logging
from app.ai_pipeline.providers import BaseTranslationProvider, MockTranslationProvider

logger = logging.getLogger("ai_pipeline.translation")

class Translator:
    def __init__(self, provider: BaseTranslationProvider = None):
        self.provider = provider or MockTranslationProvider()
        
    def translate(self, text: str, source_lang: str) -> str:
        logger.info(f"Translation Stage Started (Source Language: {source_lang})...")
        translated_text = self.provider.translate(text, source_lang, "en")
        logger.info(f"Translation Stage Finished. Result preview: '{translated_text[:60]}...'")
        return translated_text
