import math
from abc import ABC, abstractmethod
from typing import List

class BaseEmbeddingProvider(ABC):
    @abstractmethod
    def get_embedding(self, text: str) -> List[float]:
        pass

    def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        return [self.get_embedding(t) for t in texts]

class SentenceTransformersProvider(BaseEmbeddingProvider):
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model_name = model_name

    def get_embedding(self, text: str) -> List[float]:
        # Under the hood, this would call SentenceTransformer(self.model_name).encode(text)
        # For mock compatibility, we delegate to the deterministic Mock provider
        return MockEmbeddingProvider().get_embedding(text)

class OpenAIEmbeddingProvider(BaseEmbeddingProvider):
    def __init__(self, api_key: str = "mock-key", model: str = "text-embedding-3-small"):
        self.api_key = api_key
        self.model = model

    def get_embedding(self, text: str) -> List[float]:
        # Under the hood, this would call openai.Embeddings.create(input=text, model=self.model)
        return MockEmbeddingProvider().get_embedding(text)

class GeminiEmbeddingProvider(BaseEmbeddingProvider):
    def __init__(self, api_key: str = "mock-key", model: str = "models/text-embedding-004"):
        self.api_key = api_key
        self.model = model

    def get_embedding(self, text: str) -> List[float]:
        # Under the hood, this would call genai.embed_content(model=self.model, contents=text)
        return MockEmbeddingProvider().get_embedding(text)

class MockEmbeddingProvider(BaseEmbeddingProvider):
    def __init__(self):
        # A vocabulary of 50 common municipal grievance keywords
        self.vocab = [
            "pothole", "road", "paving", "street", "highway", "bridge", "bypass",
            "water", "leak", "sewer", "drain", "sewage", "supply", "pipe", "overflow",
            "garbage", "trash", "clean", "waste", "litter", "dump", "bin",
            "light", "lamp", "bulb", "dark", "electricity", "power", "wire", "cable",
            "school", "hospital", "dangerous", "hazard", "safety", "accident", "injury",
            "traffic", "delay", "broken", "dirty", "odor", "smell", "mosquito", "flies",
            "complaint", "emergency", "repair", "maintenance", "constituency"
        ]

    def get_embedding(self, text: str) -> List[float]:
        if not text:
            return [0.0] * len(self.vocab)
            
        lower_text = text.lower()
        vector = []
        
        # 1. Populating keyword features
        for word in self.vocab:
            val = 1.0 if word in lower_text else 0.0
            vector.append(val)
            
        # 2. Add soft character frequency distribution padding to prevent zero vectors
        # and represent letter similarity
        for char in "abcdefghijklmnopqrstuvwxyz":
            vector.append(lower_text.count(char) * 0.05)
            
        # 3. Unit normalize the vector (L2 norm = 1.0)
        sq_sum = sum(x * x for x in vector)
        norm = math.sqrt(sq_sum)
        
        if norm == 0:
            # Prevent zero division
            return [1.0 / math.sqrt(len(vector))] * len(vector)
            
        return [x / norm for x in vector]
