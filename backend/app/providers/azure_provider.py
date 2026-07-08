from typing import List, Optional
from app.providers.base import BaseAIProvider
from app.providers.mock_provider import MockAIProvider

class AzureOpenAIProvider(BaseAIProvider):
    def __init__(
        self,
        api_key: Optional[str] = None,
        endpoint: Optional[str] = None,
        deployment_name: Optional[str] = None,
        fallback: Optional[BaseAIProvider] = None
    ):
        self.api_key = api_key
        self.endpoint = endpoint
        self.deployment_name = deployment_name
        self.fallback = fallback or MockAIProvider()

    def chat(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        if not self.api_key or not self.endpoint:
            return self.fallback.chat(prompt, system_instruction)
        try:
            import openai
            client = openai.AzureOpenAI(
                api_key=self.api_key,
                api_version="2024-02-15-preview",
                azure_endpoint=self.endpoint
            )
            messages = []
            if system_instruction:
                messages.append({"role": "system", "content": system_instruction})
            messages.append({"role": "user", "content": prompt})
            
            completion = client.chat.completions.create(
                model=self.deployment_name or "gpt-4o",
                messages=messages
            )
            return completion.choices[0].message.content or ""
        except Exception:
            return self.fallback.chat(prompt, system_instruction)

    def get_embedding(self, text: str) -> List[float]:
        if not self.api_key or not self.endpoint:
            return self.fallback.get_embedding(text)
        try:
            import openai
            client = openai.AzureOpenAI(
                api_key=self.api_key,
                api_version="2024-02-15-preview",
                azure_endpoint=self.endpoint
            )
            response = client.embeddings.create(
                model="text-embedding-3-small",
                input=text
            )
            return response.data[0].embedding
        except Exception:
            return self.fallback.get_embedding(text)

    def analyze_image(self, image_bytes: bytes, prompt: str) -> str:
        return self.fallback.analyze_image(image_bytes, prompt)

    def ocr(self, image_bytes: bytes) -> str:
        return self.fallback.ocr(image_bytes)

    def speech_to_text(self, audio_bytes: bytes) -> str:
        return self.fallback.speech_to_text(audio_bytes)

    def summarize(self, text: str) -> str:
        return self.chat(f"Summarize this:\n\n{text}")

    def classify(self, text: str, categories: List[str]) -> str:
        prompt = f"Classify this text into one of these categories: {', '.join(categories)}.\n\nText: {text}"
        return self.chat(prompt)
