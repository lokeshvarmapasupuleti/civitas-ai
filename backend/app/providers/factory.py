import os
from typing import Optional
from app.providers.base import BaseAIProvider
from app.providers.mock_provider import MockAIProvider
from app.providers.openai_provider import OpenAIProvider
from app.providers.gemini_provider import GeminiProvider
from app.providers.ollama_provider import OllamaProvider
from app.providers.huggingface_provider import HuggingFaceProvider
from app.providers.azure_provider import AzureOpenAIProvider

class AIProviderFactory:
    _instance: Optional[BaseAIProvider] = None

    @classmethod
    def get_provider(cls) -> BaseAIProvider:
        if cls._instance is not None:
            return cls._instance
            
        provider_name = os.getenv("AI_PROVIDER", "mock").lower()
        app_env = os.getenv("APP_ENV", os.getenv("ENVIRONMENT", "development")).lower()
        production_env = app_env in {"prod", "production"}
        if production_env and provider_name == "mock":
            raise RuntimeError("AI_PROVIDER must be set to a production provider outside development/testing.")
        
        fallback_provider = MockAIProvider()
        if provider_name == "openai":
            key = os.getenv("OPENAI_API_KEY")
            cls._instance = OpenAIProvider(api_key=key, fallback=fallback_provider)
        elif provider_name == "gemini":
            key = os.getenv("GEMINI_API_KEY")
            cls._instance = GeminiProvider(api_key=key, fallback=fallback_provider)
        elif provider_name == "ollama":
            host = os.getenv("OLLAMA_HOST", "http://localhost:11434")
            cls._instance = OllamaProvider(base_url=host, fallback=fallback_provider)
        elif provider_name == "huggingface":
            key = os.getenv("HF_API_KEY")
            cls._instance = HuggingFaceProvider(api_key=key, fallback=fallback_provider)
        elif provider_name == "azure":
            key = os.getenv("AZURE_OPENAI_KEY")
            endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
            deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT")
            cls._instance = AzureOpenAIProvider(api_key=key, endpoint=endpoint, deployment_name=deployment, fallback=fallback_provider)
        elif provider_name == "mock":
            # Default fallback mock provider
            cls._instance = fallback_provider
        else:
            if production_env:
                raise RuntimeError(f"Unsupported AI_PROVIDER '{provider_name}'.")
            cls._instance = MockAIProvider()
            
        return cls._instance

    @classmethod
    def reset_provider(cls):
        cls._instance = None
