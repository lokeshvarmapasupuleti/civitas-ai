import hashlib
import random
from typing import List, Optional
from app.ai_pipeline.providers.base import (
    BaseWhisperProvider,
    BaseTranslationProvider,
    BaseEmbeddingsProvider,
    BaseLLMProvider
)

class MockWhisperProvider(BaseWhisperProvider):
    def transcribe(self, audio_data: bytes) -> str:
        return "Clean transcribed text from mock citizen request audio."

class MockTranslationProvider(BaseTranslationProvider):
    def translate(self, text: str, source_lang: str, target_lang: str = "en") -> str:
        source_lower = source_lang.lower()
        if source_lower == "en" or source_lower == target_lang.lower():
            return text
            
        lower_text = text.lower()
        
        # Simple dictionary-based mapping for demo/testing inputs (English, Hindi, Gujarati)
        if "पानी" in lower_text or "paani" in lower_text or "પાણી" in lower_text:
            return "Our ward has severe water supply shortage and drinking water is muddy."
        elif "सड़क" in lower_text or "sadak" in lower_text or "રસ્તા" in lower_text or "ખાડા" in lower_text:
            return "Potholes on the road connecting to school are causing safety hazards."
        elif "अस्पताल" in lower_text or "hospital" in lower_text or "દવાખાનું" in lower_text:
            return "There is no primary health centre in our ward. Closest clinic is very far."
        elif "बिजली" in lower_text or "light" in lower_text or "લાઈટ" in lower_text:
            return "Street lights are not working, making roads unsafe at night."
            
        return f"[Mock Translation of: '{text}' from {source_lang} to {target_lang}]"

class MockEmbeddingsProvider(BaseEmbeddingsProvider):
    def get_embeddings(self, text: str) -> List[float]:
        # Generate hash-deterministic mock embedding vector of size 128
        hash_val = hashlib.sha256(text.encode()).digest()
        random.seed(int.from_bytes(hash_val, byteorder="big"))
        return [random.uniform(-1.0, 1.0) for _ in range(128)]

class MockLLMProvider(BaseLLMProvider):
    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        lower_prompt = prompt.lower()
        
        # Match expected tasks (categorization, sentiment, summary, priority reason)
        if "categor" in lower_prompt:
            text_part = lower_prompt.split("text:")[-1] if "text:" in lower_prompt else lower_prompt
            if "water" in text_part:
                return "Water Supply"
            elif "road" in text_part or "pothole" in text_part:
                return "Road Repair"
            elif "health" in text_part or "clinic" in text_part or "hospital" in text_part:
                return "Healthcare Access"
            elif "light" in text_part or "dark" in text_part:
                return "Street Lighting"
            elif "garbage" in text_part or "waste" in text_part or "sewer" in text_part:
                return "Sanitation"
            return "General"
            
        elif "sentiment" in lower_prompt or "urgency" in lower_prompt:
            text_part = lower_prompt.split("text:")[-1] if "text:" in lower_prompt else lower_prompt
            if "emergency" in text_part or "accident" in text_part:
                return "Emergency,0.95"
            elif "critical" in text_part or "severe" in text_part or "danger" in text_part:
                return "Critical/Angry,0.85"
            elif "shortage" in text_part or "broken" in text_part or "pothole" in text_part:
                return "Concerned,0.65"
            return "Neutral,0.30"
            
        elif "summar" in lower_prompt:
            text_part = lower_prompt.split("sentence:")[-1] if "sentence:" in lower_prompt else lower_prompt
            if "water" in text_part:
                return "Citizen requests municipal extension due to severe water shortage."
            elif "road" in text_part or "pothole" in text_part:
                return "Request for pothole repairs on the school connector route."
            elif "health" in text_part:
                return "Demand for a local healthcare sub-centre to reduce travel distances."
            return "Citizen requesting municipal infrastructural upgrades in the ward."
            
        elif "priority" in lower_prompt or "breakdown" in lower_prompt:
            return "AI Analysis indicates a severe infrastructure gap matching high local demand density."
            
        return "Default mock LLM completion."
