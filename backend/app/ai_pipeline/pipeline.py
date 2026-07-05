import logging
from sqlalchemy.orm import Session
from typing import Dict, Any

from app import models
from app.ai_pipeline.providers import (
    BaseTranslationProvider, BaseLLMProvider, BaseEmbeddingsProvider,
    MockTranslationProvider, MockLLMProvider, MockEmbeddingsProvider
)
from app.ai_pipeline.language_detection import LanguageDetector
from app.ai_pipeline.translation import Translator
from app.ai_pipeline.categorization import Categorizer
from app.ai_pipeline.sentiment import SentimentAnalyzer
from app.ai_pipeline.clustering import ClusteringService
from app.ai_pipeline.priority_engine import PriorityEngine
from app.ai_pipeline.summarizer import Summarizer

logger = logging.getLogger("ai_pipeline.orchestrator")

class AIPipeline:
    def __init__(
        self,
        translation_provider: BaseTranslationProvider = None,
        llm_provider: BaseLLMProvider = None,
        embeddings_provider: BaseEmbeddingsProvider = None
    ):
        self.translation_provider = translation_provider or MockTranslationProvider()
        self.llm_provider = llm_provider or MockLLMProvider()
        self.embeddings_provider = embeddings_provider or MockEmbeddingsProvider()

        # Initialize stages with providers
        self.language_detector = LanguageDetector()
        self.translator = Translator(self.translation_provider)
        self.categorizer = Categorizer(self.llm_provider)
        self.sentiment_analyzer = SentimentAnalyzer(self.llm_provider)
        self.clustering_service = ClusteringService(self.embeddings_provider)
        self.priority_engine = PriorityEngine()
        self.summarizer = Summarizer(self.llm_provider)

    def process(
        self,
        db: Session,
        submission: models.CitizenSubmission
    ) -> Dict[str, Any]:
        logger.info(f"=== Starting AI Processing Pipeline for Submission: {submission.id} ===")
        text = submission.description
        ward = submission.ward

        # 1. Language Detection
        lang = self.language_detector.detect(text)

        # 2. Translation
        english_text = self.translator.translate(text, lang)

        # 3. Categorization
        category = self.categorizer.categorize(english_text)

        # 4. Sentiment & Urgency
        sentiment_result = self.sentiment_analyzer.analyze(english_text)
        sentiment = sentiment_result["sentiment"]
        urgency_score = sentiment_result["urgency_score"]

        # 5. Clustering (resolves and saves/links to AICluster in database)
        ward_name = ward.name if ward else "Unknown Ward"
        cluster = self.clustering_service.assign_cluster(db, english_text, category, ward_name)

        # 6. Summarization
        summary = self.summarizer.summarize(english_text)

        # 7. Priority Score Calculations (using ward and cluster metadata)
        priority_result = self.priority_engine.calculate_score(
            urgency_score=urgency_score,
            category=category,
            sentiment=sentiment,
            ward=ward,
            cluster=cluster
        )

        # 8. Assistant Metadata Preparation (structured metadata for prompt retrieval)
        assistant_metadata = {
            "submission_id": submission.id,
            "category": category,
            "detected_language": lang,
            "sentiment": sentiment,
            "urgency": urgency_score,
            "priority_score": priority_result["priority_score"],
            "cluster_name": cluster.cluster_name,
            "ward_name": ward_name,
            "population_affected": ward.demographics.get("population", 0) if ward and ward.demographics else 0,
            "roads_condition": ward.infrastructure_metrics.get("roads_condition_score", 0) if ward and ward.infrastructure_metrics else 0,
            "summary": summary
        }

        logger.info(f"=== AI Processing Pipeline Finished for Submission: {submission.id} ===")
        
        return {
            "detected_language": lang,
            "english_translation": english_text,
            "category": category,
            "sentiment": sentiment,
            "urgency_score": urgency_score,
            "cluster_name": cluster.cluster_name,
            "cluster_id": cluster.id,
            "summary": summary,
            "priority": priority_result,
            "metadata": assistant_metadata
        }
