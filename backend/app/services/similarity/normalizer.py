import re

class TextNormalizer:
    def normalize(self, text: str) -> str:
        if not text:
            return ""
        text = text.lower().strip()
        # Remove punctuation
        text = re.sub(r"[^\w\s\d-]", "", text)
        # Remove multiple whitespaces
        text = " ".join(text.split())
        return text
