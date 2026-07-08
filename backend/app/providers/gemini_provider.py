from typing import List, Optional
from app.providers.base import BaseAIProvider
from app.providers.mock_provider import MockAIProvider

class GeminiProvider(BaseAIProvider):
    def __init__(self, api_key: Optional[str] = None, fallback: Optional[BaseAIProvider] = None):
        self.api_key = api_key
        self.fallback = fallback or MockAIProvider()

    def chat(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        if not self.api_key:
            return self.fallback.chat(prompt, system_instruction)
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel(
                model_name="gemini-2.5-flash",
                system_instruction=system_instruction
            )
            response = model.generate_content(prompt)
            return response.text
        except Exception:
            return self.fallback.chat(prompt, system_instruction)

    def get_embedding(self, text: str) -> List[float]:
        if not self.api_key:
            return self.fallback.get_embedding(text)
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            response = genai.embed_content(
                model="models/text-embedding-004",
                content=text
            )
            return response["embedding"]
        except Exception:
            return self.fallback.get_embedding(text)

    def analyze_image(self, image_bytes: bytes, prompt: str) -> str:
        if not self.api_key or not image_bytes:
            return self.fallback.analyze_image(image_bytes, prompt)
        try:
            import google.generativeai as genai
            import mimetypes

            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel(model_name="gemini-2.5-flash")
            mime_type, _ = mimetypes.guess_type("image.jpg")
            response = model.generate_content([
                prompt,
                {"mime_type": mime_type or "image/jpeg", "data": image_bytes}
            ])
            return getattr(response, "text", "") or self.fallback.analyze_image(image_bytes, prompt)
        except Exception:
            return self.fallback.analyze_image(image_bytes, prompt)

    def ocr(self, image_bytes: bytes) -> str:
        if not self.api_key or not image_bytes:
            return self.fallback.ocr(image_bytes)
        try:
            import google.generativeai as genai
            import mimetypes

            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel(model_name="gemini-2.5-flash")
            mime_type, _ = mimetypes.guess_type("image.jpg")
            response = model.generate_content([
                "Extract all text visible in this image. Return only the extracted text, nothing else.",
                {"mime_type": mime_type or "image/jpeg", "data": image_bytes}
            ])
            return getattr(response, "text", "") or self.fallback.ocr(image_bytes)
        except Exception:
            return self.fallback.ocr(image_bytes)

    def speech_to_text(self, audio_bytes: bytes) -> str:
        if not self.api_key or not audio_bytes:
            return self.fallback.speech_to_text(audio_bytes)
        try:
            import google.generativeai as genai
            import mimetypes

            genai.configure(api_key=self.api_key)
            model = genai.GenerativeModel(model_name="gemini-2.5-flash")
            mime_type, _ = mimetypes.guess_type("audio.wav")
            response = model.generate_content([
                "Transcribe the speech in this audio. Return only the transcribed text, nothing else.",
                {"mime_type": mime_type or "audio/wav", "data": audio_bytes}
            ])
            return getattr(response, "text", "") or self.fallback.speech_to_text(audio_bytes)
        except Exception:
            return self.fallback.speech_to_text(audio_bytes)

    def summarize(self, text: str) -> str:
        return self.chat(f"Summarize the following text:\n\n{text}")

    def classify(self, text: str, categories: List[str]) -> str:
        prompt = f"Classify this text into one of these categories: {', '.join(categories)}.\n\nText: {text}"
        return self.chat(prompt)
