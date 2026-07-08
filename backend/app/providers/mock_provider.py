from typing import List, Optional
from app.providers.base import BaseAIProvider

class MockAIProvider(BaseAIProvider):
    def chat(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        return f"Mock Chat response to: '{prompt[:30]}...' with instruction: '{system_instruction}'"

    def generate(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        return self.chat(prompt, system_prompt)

    def translate(self, text: str, source_lang: str, target_lang: str = "en") -> str:
        if source_lang.lower() == target_lang.lower():
            return text
        return f"[Mock Translation of: '{text}' from {source_lang} to {target_lang}]"

    def get_embedding(self, text: str) -> List[float]:
        import math
        val = sum(ord(c) for c in text)
        raw_vec = [math.sin(val + i) for i in range(76)]
        norm = math.sqrt(sum(x * x for x in raw_vec))
        return [x / norm for x in raw_vec]

    def analyze_image(self, image_bytes: bytes, prompt: str) -> str:
        return f"Mock Vision analysis for {len(image_bytes)} bytes image using prompt: '{prompt}'"

    def ocr(self, image_bytes: bytes) -> str:
        length = len(image_bytes)
        if length % 3 == 0:
            return "वार्ड 12 में सड़क टूटी हुई है और गहरा गड्ढा है"
        if length % 3 == 1:
            return "હાલમાં ગંદુ પાણી αυτές છે"
        return "Severe road damage and big potholes near block C market entrance."

    def speech_to_text(self, audio_bytes: bytes) -> str:
        length = len(audio_bytes)
        if length % 3 == 0:
            return "ये गली की बत्ती पिछले चार दिनों से नहीं जल रही है और रात में बहुत अंधेरा रहता है।"
        if length % 3 == 1:
            return "ગટરનું પાણી રસ્તા પર વહી રહ્યું છે, ગંદકી બહુ વધી ગઈ છે."
        return "Potholes and broken roads are causing massive traffic delays in sector 3 ward office."

    def summarize(self, text: str) -> str:
        return f"Summary of input context ({len(text)} characters): Focuses on municipal complaint resolution."

    def classify(self, text: str, categories: List[str]) -> str:
        if not categories:
            return "General"
        # Match based on partial word matches (e.g. 'water' matches 'Water Supply')
        text_lower = text.lower()
        for cat in categories:
            cat_words = [w.strip() for w in cat.lower().replace("(", "").replace(")", "").split() if len(w.strip()) > 3]
            if any(w in text_lower for w in cat_words):
                return cat
        return categories[0]
