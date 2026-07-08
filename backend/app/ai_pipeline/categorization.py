import logging
from app.providers.base import BaseAIProvider
from app.providers.factory import AIProviderFactory

logger = logging.getLogger("ai_pipeline.categorization")

class Categorizer:
    def __init__(self, provider: BaseAIProvider = None):
        self.provider = provider or AIProviderFactory.get_provider()
        
    def categorize(self, text: str) -> str:
        logger.info("Categorization Stage Started...")
        prompt = (
            f"Categorize the following citizen request into one of these classes: "
            f"Healthcare Access, Sanitation, Road Repair, Street Lighting, Water Supply, Public Transport. "
            f"Text: '{text}'"
        )
        category = self.provider.generate(prompt)
        logger.info(f"Categorization Stage Finished. Result: '{category}'")
        return category
