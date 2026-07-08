import urllib.request
import json
from typing import List, Optional
from app.providers.base import BaseAIProvider
from app.providers.mock_provider import MockAIProvider

class OllamaProvider(BaseAIProvider):
    def __init__(self, base_url: str = "http://localhost:11434", fallback: Optional[BaseAIProvider] = None):
        self.base_url = base_url
        self.fallback = fallback or MockAIProvider()

    def chat(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        try:
            url = f"{self.base_url}/api/generate"
            headers = {"Content-Type": "application/json"}
            system_prompt = system_instruction or ""
            data = {
                "model": "llama3",
                "prompt": prompt,
                "system": system_prompt,
                "stream": False
            }
            req = urllib.request.Request(url, data=json.dumps(data).encode(), headers=headers)
            with urllib.request.urlopen(req, timeout=3) as res:
                response = json.loads(res.read().decode())
                return response.get("response", "")
        except Exception:
            return self.fallback.chat(prompt, system_instruction)

    def get_embedding(self, text: str) -> List[float]:
        try:
            url = f"{self.base_url}/api/embeddings"
            headers = {"Content-Type": "application/json"}
            data = {
                "model": "nomic-embed-text",
                "prompt": text
            }
            req = urllib.request.Request(url, data=json.dumps(data).encode(), headers=headers)
            with urllib.request.urlopen(req, timeout=3) as res:
                response = json.loads(res.read().decode())
                return response.get("embedding", [])
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
