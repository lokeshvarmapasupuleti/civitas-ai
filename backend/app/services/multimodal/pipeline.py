import logging
from typing import Optional, Any
from pydantic import BaseModel, Field

# Import new AI Pipeline schemas and orchestrator
from app.services.ai_pipeline.pipeline import AIPipelineOrchestrator, PipelineResult

# Import multimodal components
from app.providers.base import BaseAIProvider
from app.providers.factory import AIProviderFactory
from app.services.multimodal.ocr import BaseOCRProvider, OCRResult
from app.services.multimodal.speech_to_text import BaseSpeechProvider, SpeechResult
from app.services.multimodal.image_analysis import BaseImageAnalyzer, MockImageAnalyzer, UnifiedImageAnalyzer, ImageAnalysisResult
from app.services.multimodal.document_parser import BaseDocumentParser, MockDocumentParser, DocumentParserResult

logger = logging.getLogger("services.multimodal.pipeline")

class ProviderOCRAdapter(BaseOCRProvider):
    def __init__(self, provider: BaseAIProvider):
        self.provider = provider

    def extract_text(self, image_bytes: bytes) -> OCRResult:
        if hasattr(self.provider, "extract_text"):
            return self.provider.extract_text(image_bytes)
        text = self.provider.ocr(image_bytes) if hasattr(self.provider, "ocr") else ""
        return OCRResult(
            extracted_text=text or "",
            detected_language="en",
            confidence=0.0,
            bounding_boxes=[]
        )

class ProviderSpeechAdapter(BaseSpeechProvider):
    def __init__(self, provider: BaseAIProvider):
        self.provider = provider

    def transcribe(self, audio_bytes: bytes) -> SpeechResult:
        if hasattr(self.provider, "transcribe"):
            return self.provider.transcribe(audio_bytes)
        transcript = self.provider.speech_to_text(audio_bytes) if hasattr(self.provider, "speech_to_text") else ""
        return SpeechResult(
            transcript=transcript or "",
            detected_language="en",
            confidence=0.0,
            duration=0.0
        )

class MultimodalPipelineResult(BaseModel):
    multimodal_type: str = Field(..., description="The classified input medium (audio, image, document, text)")
    extracted_query_text: str = Field(..., description="The normalized text input resolved from multimodal streams")
    ai_pipeline_result: PipelineResult = Field(..., description="Result of running the main AI Pipeline")
    ocr_details: Optional[OCRResult] = Field(None, description="OCR text/word bounding boxes details (images)")
    speech_details: Optional[SpeechResult] = Field(None, description="Speech duration and transcription metrics (audio)")
    image_analysis_details: Optional[ImageAnalysisResult] = Field(None, description="Detected street level hazards list (images)")
    document_details: Optional[DocumentParserResult] = Field(None, description="Document pages and parsing metadata")

class MultimodalPipelineOrchestrator:
    def __init__(
        self,
        ocr_provider: BaseOCRProvider = None,
        speech_provider: BaseSpeechProvider = None,
        image_analyzer: BaseImageAnalyzer = None,
        document_parser: BaseDocumentParser = None,
        ai_pipeline: AIPipelineOrchestrator = None
    ):
        self.ocr_provider = ocr_provider or ProviderOCRAdapter(AIProviderFactory.get_provider())
        self.speech_provider = speech_provider or ProviderSpeechAdapter(AIProviderFactory.get_provider())
        self.image_analyzer = image_analyzer or UnifiedImageAnalyzer()
        self.document_parser = document_parser or MockDocumentParser()
        self.ai_pipeline = ai_pipeline or AIPipelineOrchestrator()

    def process_file(
        self, 
        file_bytes: bytes, 
        filename: str, 
        mime_type: str
    ) -> MultimodalPipelineResult:
        logger.info(f"Processing multimodal file: {filename} ({mime_type})")
        
        extracted_text = ""
        m_type = "text"
        ocr_res = None
        speech_res = None
        image_res = None
        doc_res = None
        
        # 1. Triage by Mime-Type
        lower_mime = mime_type.lower()
        lower_filename = filename.lower()
        
        if lower_mime.startswith("audio/") or any(ext in lower_filename for ext in [".mp3", ".wav", ".m4a", ".ogg"]):
            m_type = "audio"
            speech_res = self.speech_provider.transcribe(file_bytes)
            extracted_text = speech_res.transcript
            
        elif lower_mime.startswith("image/") or any(ext in lower_filename for ext in [".jpg", ".jpeg", ".png", ".gif"]):
            m_type = "image"
            ocr_res = self.ocr_provider.extract_text(file_bytes)
            image_res = self.image_analyzer.analyze_image(file_bytes)
            extracted_text = ocr_res.extracted_text
            
        elif lower_mime == "application/pdf" or any(ext in lower_filename for ext in [".pdf", ".docx", ".doc"]):
            m_type = "document"
            doc_res = self.document_parser.parse_document(file_bytes, filename)
            extracted_text = doc_res.extracted_text
            
        else:
            m_type = "text"
            try:
                extracted_text = file_bytes.decode("utf-8")
            except Exception:
                extracted_text = "Standard text query submission description placeholder."
                
        # 2. Run the extracted text through the core AI Triage Pipeline
        ai_res = self.ai_pipeline.run_pipeline(extracted_text)
        
        return MultimodalPipelineResult(
            multimodal_type=m_type,
            extracted_query_text=extracted_text,
            ai_pipeline_result=ai_res,
            ocr_details=ocr_res,
            speech_details=speech_res,
            image_analysis_details=image_res,
            document_details=doc_res
        )
