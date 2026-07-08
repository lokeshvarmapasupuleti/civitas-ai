import logging
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from app import models
from app.providers.base import BaseAIProvider
from app.providers.factory import AIProviderFactory
from app.ai_pipeline.clustering import ClusteringService
from app.ai_pipeline.priority_engine import PriorityEngine

# Import the new modular AI services orchestrator
from app.services.ai_pipeline.pipeline import AIPipelineOrchestrator

logger = logging.getLogger("ai_pipeline.orchestrator")

class AIPipeline:
    def __init__(
        self,
        provider: Optional[BaseAIProvider] = None
    ):
        self.provider = provider or AIProviderFactory.get_provider()

        # Keep legacy clustering and priority services
        self.clustering_service = ClusteringService(provider=self.provider)
        self.priority_engine = PriorityEngine()

        # Initialize the new production-grade orchestrator
        self.orchestrator = AIPipelineOrchestrator()

    def process(
        self,
        db: Session,
        submission: models.CitizenSubmission
    ) -> Dict[str, Any]:
        logger.info(f"=== Starting AI Processing Pipeline for Submission: {submission.id} ===")
        text = submission.description
        ward = submission.ward
        ward_name = ward.name if ward else "Unknown Ward"

        # 1. Run the new modular services pipeline
        orchestrator_result = self.orchestrator.run_pipeline(text, submission.id)

        # 2. Run the legacy clustering service to link/create AICluster in database
        cluster = self.clustering_service.assign_cluster(
            db, 
            orchestrator_result.translated_text, 
            orchestrator_result.category, 
            ward_name
        )

        # 3. Calculate priority score using legacy priority engine
        priority_result = self.priority_engine.calculate_score(
            urgency_score=orchestrator_result.urgency,
            category=orchestrator_result.category,
            sentiment=orchestrator_result.sentiment,
            ward=ward,
            cluster=cluster
        )

        # 4. Integrate all the new Explainability, Budget, SLA, and Recommendation schemas inside metadata
        assistant_metadata = {
            "submission_id": submission.id,
            "category": orchestrator_result.category,
            "detected_language": orchestrator_result.language,
            "sentiment": orchestrator_result.sentiment,
            "urgency": orchestrator_result.urgency,
            "priority_score": priority_result["priority_score"],
            "cluster_name": cluster.cluster_name,
            "ward_name": ward_name,
            "population_affected": ward.demographics.get("population", 0) if ward and ward.demographics else 0,
            "roads_condition": ward.infrastructure_metrics.get("roads_condition_score", 0) if ward and ward.infrastructure_metrics else 0,
            "summary": orchestrator_result.executive_summary,
            
            # Structuring the new modular services responses into the assistant metadata
            "explainability": orchestrator_result.explainability.model_dump(),
            "budget_prediction": orchestrator_result.budget_prediction.model_dump(),
            "sla_prediction_details": orchestrator_result.sla_prediction_details.model_dump(),
            "recommendation_report": orchestrator_result.recommendation_report.model_dump()
        }

        logger.info(f"=== AI Processing Pipeline Finished for Submission: {submission.id} ===")
        
        return {
            "detected_language": orchestrator_result.language,
            "english_translation": orchestrator_result.translated_text,
            "category": orchestrator_result.category,
            "sentiment": orchestrator_result.sentiment,
            "urgency_score": orchestrator_result.urgency,
            "cluster_name": cluster.cluster_name,
            "cluster_id": cluster.id,
            "summary": orchestrator_result.executive_summary,
            "priority": priority_result,
            "metadata": assistant_metadata
        }