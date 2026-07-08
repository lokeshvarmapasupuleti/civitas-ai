# app/services/multimodal/__init__.py
from app.services.multimodal.ocr import (
    BaseOCRProvider,
    GoogleVisionOCRProvider,
    TesseractOCRProvider,
    AzureOCRProvider,
    GeminiVisionOCRProvider,
    MockOCRProvider,
    OCRResult,
    BoundingBox
)
from app.services.multimodal.speech_to_text import (
    BaseSpeechProvider,
    WhisperSpeechProvider,
    GoogleSpeechProvider,
    AzureSpeechProvider,
    GeminiSpeechProvider,
    MockSpeechProvider,
    SpeechResult
)
from app.services.multimodal.image_analysis import (
    BaseImageAnalyzer,
    MockImageAnalyzer,
    DetectedObject,
    ImageAnalysisResult
)
from app.services.multimodal.document_parser import (
    BaseDocumentParser,
    MockDocumentParser,
    DocumentParserResult
)
from app.services.multimodal.pipeline import (
    MultimodalPipelineOrchestrator,
    MultimodalPipelineResult
)
from app.services.multimodal.ocr_service import OCRService
from app.services.multimodal.stt_service import STTService
