import logging
import os
from typing import List, Optional
from app.providers.base import BaseAIProvider
from app.providers.mock_provider import MockAIProvider

logger = logging.getLogger(__name__)

class OpenAIProvider(BaseAIProvider):
    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        fallback: Optional[BaseAIProvider] = None,
    ):
        self.api_key = api_key
        # Allow override via env; supports OpenRouter and other compatible APIs
        self.base_url = base_url or os.getenv("OPENAI_BASE_URL") or None
        self.model = model or os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        self.fallback = fallback or MockAIProvider()

        if self.base_url:
            logger.info("OpenAIProvider using custom base URL: %s (model: %s)", self.base_url, self.model)

    def _client(self):
        import openai
        kwargs = {"api_key": self.api_key}
        if self.base_url:
            kwargs["base_url"] = self.base_url
        return openai.OpenAI(**kwargs)

    def chat(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        if not self.api_key:
            return self.fallback.chat(prompt, system_instruction)
        try:
            messages = []
            if system_instruction:
                messages.append({"role": "system", "content": system_instruction})
            messages.append({"role": "user", "content": prompt})

            completion = self._client().chat.completions.create(
                model=self.model,
                messages=messages,
            )
            return completion.choices[0].message.content or ""
        except Exception as exc:
            logger.warning("OpenAIProvider.chat failed (%s) — using fallback.", exc)
            return self.fallback.chat(prompt, system_instruction)

    def get_embedding(self, text: str) -> List[float]:
        if not self.api_key:
            return self.fallback.get_embedding(text)
        try:
            response = self._client().embeddings.create(
                model="text-embedding-3-small",
                input=text,
            )
            return response.data[0].embedding
        except Exception as exc:
            logger.warning("OpenAIProvider.get_embedding failed (%s) — using fallback.", exc)
            return self.fallback.get_embedding(text)

    def analyze_image(self, image_bytes: bytes, prompt: str) -> str:
        return self.fallback.analyze_image(image_bytes, prompt)

    def ocr(self, image_bytes: bytes) -> str:
        return self.fallback.ocr(image_bytes)

    def speech_to_text(self, audio_bytes: bytes) -> str:
        return self.fallback.speech_to_text(audio_bytes)

    def summarize(self, text: str) -> str:
        return self.chat(f"Summarize the following text:\n\n{text}")

    def classify(self, text: str, categories: List[str]) -> str:
        prompt = (
            f"Classify this text into exactly one of these categories: {', '.join(categories)}.\n\n"
            f"Text: {text}\n\nReply with only the category name."
        )
        return self.chat(prompt)
