from app.providers.base import BaseAIProvider
from app.providers.factory import AIProviderFactory

class OCRService:
    def __init__(self, provider: BaseAIProvider = None):
        self.provider = provider or AIProviderFactory.get_provider()

    def extract_text(self, image_bytes: bytes) -> str:
        if not image_bytes:
            return ""
        return self.provider.ocr(image_bytes)