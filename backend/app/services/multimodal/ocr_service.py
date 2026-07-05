from app.services.multimodal.providers import BaseOCR, MockOCR

class OCRService:
    def __init__(self, provider: BaseOCR = None):
        self.provider = provider or MockOCR()

    def extract_text(self, image_bytes: bytes) -> str:
        if not image_bytes:
            return ""
        return self.provider.extract_text(image_bytes)
