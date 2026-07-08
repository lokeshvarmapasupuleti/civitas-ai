from abc import ABC, abstractmethod
from typing import List, Dict, Any
from pydantic import BaseModel, Field
from app.providers.factory import AIProviderFactory

class BoundingBox(BaseModel):
    text: str = Field(..., description="The word or segment text")
    x_min: float = Field(..., description="Minimum x coordinate (0.0 to 1.0)")
    y_min: float = Field(..., description="Minimum y coordinate (0.0 to 1.0)")
    x_max: float = Field(..., description="Maximum x coordinate (0.0 to 1.0)")
    y_max: float = Field(..., description="Maximum y coordinate (0.0 to 1.0)")

class OCRResult(BaseModel):
    extracted_text: str = Field(..., description="Extracted text from the image")
    detected_language: str = Field(..., description="Detected language code (e.g. en, hi, gu)")
    confidence: float = Field(..., description="OCR confidence score (0.0 to 1.0)")
    bounding_boxes: List[BoundingBox] = Field(default_factory=list, description="Extracted word bounding boxes")

class BaseOCRProvider(ABC):
    @abstractmethod
    def extract_text(self, image_bytes: bytes) -> OCRResult:
        pass

class GoogleVisionOCRProvider(BaseOCRProvider):
    def extract_text(self, image_bytes: bytes) -> OCRResult:
        # Under the hood, this would call google.cloud.vision.ImageAnnotatorClient().text_detection(...)
        # For now, use the unified provider abstraction
        provider = AIProviderFactory.get_provider()
        text = provider.ocr(image_bytes)
        return OCRResult(
            extracted_text=text,
            detected_language="en",
            confidence=0.0,
            bounding_boxes=[]
        )

class TesseractOCRProvider(BaseOCRProvider):
    def extract_text(self, image_bytes: bytes) -> OCRResult:
        # Under the hood, this would call pytesseract.image_to_string(...)
        # For now, use the unified provider abstraction
        provider = AIProviderFactory.get_provider()
        text = provider.ocr(image_bytes)
        return OCRResult(
            extracted_text=text,
            detected_language="en",
            confidence=0.0,
            bounding_boxes=[]
        )

class AzureOCRProvider(BaseOCRProvider):
    def extract_text(self, image_bytes: bytes) -> OCRResult:
        # Under the hood, this would call azure.cognitiveservices.vision.computervision.ComputerVisionClient().read_in_stream(...)
        # For now, use the unified provider abstraction
        provider = AIProviderFactory.get_provider()
        text = provider.ocr(image_bytes)
        return OCRResult(
            extracted_text=text,
            detected_language="en",
            confidence=0.0,
            bounding_boxes=[]
        )

class GeminiVisionOCRProvider(BaseOCRProvider):
    def extract_text(self, image_bytes: bytes) -> OCRResult:
        # Use the unified provider abstraction with Gemini
        provider = AIProviderFactory.get_provider()
        text = provider.ocr(image_bytes)
        return OCRResult(
            extracted_text=text,
            detected_language="en",
            confidence=0.0,
            bounding_boxes=[]
        )

class MockOCRProvider(BaseOCRProvider):
    def extract_text(self, image_bytes: bytes) -> OCRResult:
        # Check bytes length to return realistic mock content
        length = len(image_bytes)
        
        # Determine language based on modulo
        if length % 3 == 0:
            text = "वार्ड 12 में सड़क टूटी हुई है और गहरा गड्ढा है"
            lang = "hi"
            boxes = [
                BoundingBox(text="वार्ड", x_min=0.1, y_min=0.1, x_max=0.2, y_max=0.15),
                BoundingBox(text="12", x_min=0.22, y_min=0.1, x_max=0.28, y_max=0.15),
                BoundingBox(text="सड़क", x_min=0.3, y_min=0.1, x_max=0.42, y_max=0.15),
                BoundingBox(text="गड्ढा", x_min=0.5, y_min=0.1, x_max=0.65, y_max=0.15)
            ]
        elif length % 3 == 1:
            text = "નળમાંથી ગંદુ પાણી આવે છે"
            lang = "gu"
            boxes = [
                BoundingBox(text="નળમાંથી", x_min=0.1, y_min=0.2, x_max=0.3, y_max=0.25),
                BoundingBox(text="ગંદુ", x_min=0.32, y_min=0.2, x_max=0.45, y_max=0.25),
                BoundingBox(text="પાણી", x_min=0.48, y_min=0.2, x_max=0.6, y_max=0.25)
            ]
        else:
            text = "Severe road damage and big potholes near block C market entrance."
            lang = "en"
            boxes = [
                BoundingBox(text="Severe", x_min=0.1, y_min=0.1, x_max=0.25, y_max=0.15),
                BoundingBox(text="potholes", x_min=0.3, y_min=0.1, x_max=0.45, y_max=0.15),
                BoundingBox(text="market", x_min=0.5, y_min=0.1, x_max=0.65, y_max=0.15)
            ]
            
        return OCRResult(
            extracted_text=text,
            detected_language=lang,
            confidence=0.92,
            bounding_boxes=boxes
        )
