import urllib.request
import json
from typing import List, Optional
from app.providers.base import BaseAIProvider
from app.providers.mock_provider import MockAIProvider

class HuggingFaceProvider(BaseAIProvider):
    def __init__(self, api_key: Optional[str] = None, fallback: Optional[BaseAIProvider] = None):
        self.api_key = api_key
        self.fallback = fallback or MockAIProvider()

    def chat(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        if not self.api_key:
            return self.fallback.chat(prompt, system_instruction)
        try:
            # Under the hood, calls HF serverless inference for llama-3
            url = "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct"
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            system_prompt = system_instruction or "You are a municipal assistant."
            data = {
                "inputs": f"<|system|>\n{system_prompt}\n<|user|>\n{prompt}\n<|assistant|>",
                "parameters": {"max_new_tokens": 256}
            }
            req = urllib.request.Request(url, data=json.dumps(data).encode(), headers=headers)
            with urllib.request.urlopen(req, timeout=5) as res:
                response = json.loads(res.read().decode())
                # HF returns list of dicts with generated_text
                if isinstance(response, list) and len(response) > 0:
                    return response[0].get("generated_text", "")
                return str(response)
        except Exception:
            return self.fallback.chat(prompt, system_instruction)

    def get_embedding(self, text: str) -> List[float]:
        if not self.api_key:
            return self.fallback.get_embedding(text)
        try:
            url = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
            headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
            data = {"inputs": text}
            req = urllib.request.Request(url, data=json.dumps(data).encode(), headers=headers)
            with urllib.request.urlopen(req, timeout=5) as res:
                response = json.loads(res.read().decode())
                # Return vector list
                return response
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
