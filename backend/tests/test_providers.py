import pytest
import os
from app.providers import (
    AIProviderFactory,
    MockAIProvider,
    OpenAIProvider,
    GeminiProvider,
    OllamaProvider,
    HuggingFaceProvider,
    AzureOpenAIProvider
)

def test_mock_provider_operations():
    provider = MockAIProvider()
    
    # Chat
    assert "Mock Chat" in provider.chat("Hello")
    
    # Embeddings
    vec = provider.get_embedding("Civitas AI")
    assert len(vec) == 76
    l2_norm = sum(x * x for x in vec)
    assert abs(l2_norm - 1.0) < 1e-5
    
    # Vision
    assert "Mock Vision" in provider.analyze_image(b"data", "Describe")
    
    # OCR - MockAIProvider returns realistic mock text based on byte length
    ocr_result = provider.ocr(b"image")
    assert isinstance(ocr_result, str)
    assert len(ocr_result) > 0
    
    # Speech - MockAIProvider returns realistic mock text based on byte length
    speech_result = provider.speech_to_text(b"audio")
    assert isinstance(speech_result, str)
    assert len(speech_result) > 0
    
    # Summarize
    assert "Summary of input" in provider.summarize("Long text context")
    
    # Classify
    assert provider.classify("Repair roads", ["Roads", "Water"]) == "Roads"

def test_factory_swapping():
    # 1. Mock
    os.environ["AI_PROVIDER"] = "mock"
    AIProviderFactory.reset_provider()
    p = AIProviderFactory.get_provider()
    assert isinstance(p, MockAIProvider)
    
    # 2. OpenAI
    os.environ["AI_PROVIDER"] = "openai"
    os.environ["OPENAI_API_KEY"] = "sk-test"
    AIProviderFactory.reset_provider()
    p = AIProviderFactory.get_provider()
    assert isinstance(p, OpenAIProvider)
    assert p.api_key == "sk-test"
    
    # 3. Gemini
    os.environ["AI_PROVIDER"] = "gemini"
    os.environ["GEMINI_API_KEY"] = "gem-test"
    AIProviderFactory.reset_provider()
    p = AIProviderFactory.get_provider()
    assert isinstance(p, GeminiProvider)
    assert p.api_key == "gem-test"
    
    # 4. Ollama
    os.environ["AI_PROVIDER"] = "ollama"
    AIProviderFactory.reset_provider()
    p = AIProviderFactory.get_provider()
    assert isinstance(p, OllamaProvider)
    
    # 5. Hugging Face
    os.environ["AI_PROVIDER"] = "huggingface"
    os.environ["HF_API_KEY"] = "hf-test"
    AIProviderFactory.reset_provider()
    p = AIProviderFactory.get_provider()
    assert isinstance(p, HuggingFaceProvider)
    assert p.api_key == "hf-test"
    
    # 6. Azure
    os.environ["AI_PROVIDER"] = "azure"
    os.environ["AZURE_OPENAI_KEY"] = "az-key"
    os.environ["AZURE_OPENAI_ENDPOINT"] = "az-endpoint"
    os.environ["AZURE_OPENAI_DEPLOYMENT"] = "az-deployment"
    AIProviderFactory.reset_provider()
    p = AIProviderFactory.get_provider()
    assert isinstance(p, AzureOpenAIProvider)
    assert p.api_key == "az-key"
    assert p.endpoint == "az-endpoint"
    assert p.deployment_name == "az-deployment"
    
    # Reset back to mock
    os.environ["AI_PROVIDER"] = "mock"
    AIProviderFactory.reset_provider()

def test_uncovered_providers():
    # OpenAI Provider methods coverage
    op = OpenAIProvider(api_key=None)
    assert "Mock Chat" in op.chat("hello")
    assert len(op.get_embedding("hello")) == 76
    assert "Mock Vision" in op.analyze_image(b"data", "desc")
    # OCR returns realistic mock text when no API key
    ocr_result = op.ocr(b"data")
    assert isinstance(ocr_result, str)
    assert len(ocr_result) > 0
    # Speech returns realistic mock text when no API key
    speech_result = op.speech_to_text(b"data")
    assert isinstance(speech_result, str)
    assert len(speech_result) > 0
    assert "Mock Chat" in op.summarize("hello")
    assert "Mock Chat" in op.classify("hello", ["hello"])

    # Gemini Provider methods coverage
    gp = GeminiProvider(api_key=None)
    assert "Mock Chat" in gp.chat("hello")
    assert len(gp.get_embedding("hello")) == 76
    assert "Mock Vision" in gp.analyze_image(b"data", "desc")
    # OCR returns realistic mock text when no API key
    ocr_result = gp.ocr(b"data")
    assert isinstance(ocr_result, str)
    assert len(ocr_result) > 0
    # Speech returns realistic mock text when no API key
    speech_result = gp.speech_to_text(b"data")
    assert isinstance(speech_result, str)
    assert len(speech_result) > 0
    assert "Mock Chat" in gp.summarize("hello")
    assert "Mock Chat" in gp.classify("hello", ["hello"])

    # Ollama Provider methods coverage
    ol = OllamaProvider()
    assert "Mock Chat" in ol.chat("hello")
    assert len(ol.get_embedding("hello")) == 76
    assert "Mock Vision" in ol.analyze_image(b"data", "desc")
    # OCR returns realistic mock text
    ocr_result = ol.ocr(b"data")
    assert isinstance(ocr_result, str)
    assert len(ocr_result) > 0
    # Speech returns realistic mock text
    speech_result = ol.speech_to_text(b"data")
    assert isinstance(speech_result, str)
    assert len(speech_result) > 0
    assert "Mock Chat" in ol.summarize("hello")
    assert "Mock Chat" in ol.classify("hello", ["hello"])

    # Hugging Face Provider methods coverage
    hp = HuggingFaceProvider(api_key=None)
    assert "Mock Chat" in hp.chat("hello")
    assert len(hp.get_embedding("hello")) == 76
    assert "Mock Vision" in hp.analyze_image(b"data", "desc")
    # OCR returns realistic mock text
    ocr_result = hp.ocr(b"data")
    assert isinstance(ocr_result, str)
    assert len(ocr_result) > 0
    # Speech returns realistic mock text
    speech_result = hp.speech_to_text(b"data")
    assert isinstance(speech_result, str)
    assert len(speech_result) > 0
    assert "Mock Chat" in hp.summarize("hello")
    assert "Mock Chat" in hp.classify("hello", ["hello"])

    # Azure OpenAI Provider methods coverage
    ap = AzureOpenAIProvider(api_key=None)
    assert "Mock Chat" in ap.chat("hello")
    assert len(ap.get_embedding("hello")) == 76
    assert "Mock Vision" in ap.analyze_image(b"data", "desc")
    # OCR returns realistic mock text
    ocr_result = ap.ocr(b"data")
    assert isinstance(ocr_result, str)
    assert len(ocr_result) > 0
    # Speech returns realistic mock text
    speech_result = ap.speech_to_text(b"data")
    assert isinstance(speech_result, str)
    assert len(speech_result) > 0
    assert "Mock Chat" in ap.summarize("hello")
    assert "Mock Chat" in ap.classify("hello", ["hello"])

def test_providers_exceptions():
    # Provide dummy parameters that trigger actual API initialization logic but fail on execution, covering exception handlers.
    op = OpenAIProvider(api_key="invalid-key")
    assert "Mock Chat" in op.chat("hello")
    assert len(op.get_embedding("hello")) == 76
    
    gp = GeminiProvider(api_key="invalid-key")
    assert "Mock Chat" in gp.chat("hello")
    assert len(gp.get_embedding("hello")) == 76
    
    ol = OllamaProvider(base_url="http://invalid-localhost:9999")
    assert "Mock Chat" in ol.chat("hello")
    assert len(ol.get_embedding("hello")) == 76
    
    hp = HuggingFaceProvider(api_key="invalid-key")
    assert "Mock Chat" in hp.chat("hello")
    assert len(hp.get_embedding("hello")) == 76
    
    ap = AzureOpenAIProvider(api_key="invalid-key", endpoint="https://invalid-endpoint.com")
    assert "Mock Chat" in ap.chat("hello")
    assert len(ap.get_embedding("hello")) == 76
