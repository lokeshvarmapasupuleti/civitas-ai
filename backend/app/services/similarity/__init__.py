# app/services/similarity/__init__.py
from app.services.similarity.normalizer import TextNormalizer
from app.services.similarity.embeddings import (
    BaseEmbeddingProvider,
    SentenceTransformersProvider,
    OpenAIEmbeddingProvider,
    GeminiEmbeddingProvider,
    MockEmbeddingProvider
)
from app.services.similarity.similarity_engine import SemanticSimilarityEngine
