import logging
from app.ai_pipeline.providers import BaseLLMProvider, MockLLMProvider

logger = logging.getLogger("ai_pipeline.categorization")

class Categorizer:
    def __init__(self, provider: BaseLLMProvider = None):
        self.provider = provider or MockLLMProvider()
        
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
