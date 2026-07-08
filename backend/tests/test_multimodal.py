import pytest
from app.services.multimodal.ocr import MockOCRProvider
from app.services.multimodal.speech_to_text import MockSpeechProvider
from app.services.multimodal.image_analysis import MockImageAnalyzer, UnifiedImageAnalyzer
from app.services.multimodal.document_parser import MockDocumentParser
from app.services.multimodal.pipeline import MultimodalPipelineOrchestrator, MultimodalPipelineResult

def test_ocr_provider():
    provider = MockOCRProvider()
    res = provider.extract_text(b"some_image_bytes")
    
    assert res.extracted_text is not None
    assert res.detected_language in ["en", "hi", "gu"]
    assert res.confidence > 0
    assert len(res.bounding_boxes) > 0

def test_speech_provider():
    provider = MockSpeechProvider()
    res = provider.transcribe(b"some_audio_bytes")
    
    assert res.transcript is not None
    assert res.detected_language in ["en", "hi", "gu"]
    assert res.confidence > 0
    assert res.duration > 0

def test_image_analyzer():
    # Test MockImageAnalyzer
    analyzer = MockImageAnalyzer()
    
    # Test modulo differences to hit various categories
    res1 = analyzer.analyze_image(b"abcd") # length 4 (mod 0) -> potholes, road damage
    res2 = analyzer.analyze_image(b"abcde") # length 5 (mod 1) -> garbage, illegal dumping
    res3 = analyzer.analyze_image(b"abcdef") # length 6 (mod 2) -> water leakage, flooding
    res4 = analyzer.analyze_image(b"abcdefg") # length 7 (mod 3) -> streetlight, electric pole
    
    labels1 = [obj.label for obj in res1.detected_objects]
    labels2 = [obj.label for obj in res2.detected_objects]
    labels3 = [obj.label for obj in res3.detected_objects]
    labels4 = [obj.label for obj in res4.detected_objects]
    
    assert "Potholes" in labels1 or "Road damage" in labels1
    assert "Garbage" in labels2 or "Illegal dumping" in labels2
    assert "Water leakage" in labels3 or "Flooding" in labels3
    assert "Streetlight" in labels4 or "Electric pole" in labels4

def test_unified_image_analyzer():
    # Test UnifiedImageAnalyzer (uses AIProviderFactory)
    analyzer = UnifiedImageAnalyzer()
    res = analyzer.analyze_image(b"test_image_bytes")
    
    assert isinstance(res.detected_objects, list)
    assert len(res.detected_objects) > 0

def test_document_parser():
    parser = MockDocumentParser()
    res = parser.parse_document(b"pdf_bytes", "grievance_memo.pdf")
    
    assert "grievance_memo.pdf" in res.extracted_text
    assert res.page_count == 1
    assert res.metadata["format"] == "PDF"

def test_multimodal_orchestrator_audio():
    orchestrator = MultimodalPipelineOrchestrator()
    # Modulo length % 3 == 2 for English text output
    audio_bytes = b"abcdefgh" # length 8 (mod 2)
    
    result = orchestrator.process_file(
        file_bytes=audio_bytes,
        filename="complaint.mp3",
        mime_type="audio/mp3"
    )
    
    assert isinstance(result, MultimodalPipelineResult)
    assert result.multimodal_type == "audio"
    assert "potholes" in result.extracted_query_text.lower()
    
    # Assert STT properties
    assert result.speech_details is not None
    # Note: Unified provider returns 0.0 for confidence/duration when using mock fallback
    assert result.speech_details.detected_language == "en"
    
    # Assert AI Pipeline ran successfully on transcription text
    assert result.ai_pipeline_result.category == "Road Repair"

def test_multimodal_orchestrator_image():
    orchestrator = MultimodalPipelineOrchestrator()
    # Modulo length % 3 == 2 for English text output
    image_bytes = b"abcdefgh" # length 8 (mod 2)
    
    result = orchestrator.process_file(
        file_bytes=image_bytes,
        filename="pothole_photo.png",
        mime_type="image/png"
    )
    
    assert isinstance(result, MultimodalPipelineResult)
    assert result.multimodal_type == "image"
    
    # Assert OCR and Image Analysis properties
    assert result.ocr_details is not None
    assert result.ocr_details.detected_language == "en"
    
    assert result.image_analysis_details is not None
    labels = [o.label for o in result.image_analysis_details.detected_objects]
    # UnifiedImageAnalyzer may return 'General' if no specific objects detected
    assert len(labels) > 0
    
    # Assert AI Pipeline ran successfully on OCR text
    assert result.ai_pipeline_result.category == "Road Repair"

def test_multimodal_orchestrator_document():
    orchestrator = MultimodalPipelineOrchestrator()
    result = orchestrator.process_file(
        file_bytes=b"pdf_file_contents",
        filename="report.pdf",
        mime_type="application/pdf"
    )
    
    assert isinstance(result, MultimodalPipelineResult)
    assert result.multimodal_type == "document"
    assert result.document_details is not None
    assert result.document_details.page_count == 1
    assert result.ai_pipeline_result is not None

def test_services_edge_cases():
    from app.services.multimodal.ocr_service import OCRService
    from app.services.multimodal.stt_service import STTService
    
    assert OCRService().extract_text(None) == ""
    assert OCRService().extract_text(b"") == ""
    
    assert STTService().transcribe(None) == ""
    assert STTService().transcribe(b"") == ""
