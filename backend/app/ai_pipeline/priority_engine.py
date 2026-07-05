import logging
from typing import Dict, Any
from app import models

logger = logging.getLogger("ai_pipeline.priority_engine")

class PriorityEngine:
    def calculate_score(
        self,
        urgency_score: float,
        category: str,
        sentiment: str,
        ward: models.Ward,
        cluster: models.AICluster
    ) -> Dict[str, Any]:
        logger.info("Priority Engine Stage Started...")
        
        # 1. citizen_frequency: base on cluster submission count
        frequency_count = cluster.submission_count if cluster else 1
        citizen_frequency = min(35, max(10, frequency_count * 2))
        
        # 2. urgency: map from urgency_score (0.0 to 1.0)
        urgency = int(urgency_score * 20)
        
        # 3. population_affected: base on ward demographics population
        pop = 25000
        if ward and ward.demographics:
            pop = ward.demographics.get("population", 25000)
        population_affected = min(20, max(5, int(pop / 2500)))
        
        # 4. infrastructure_gap: base on ward infrastructure metrics
        infra_gap = 10
        if ward and ward.infrastructure_metrics:
            roads_score = ward.infrastructure_metrics.get("roads_condition_score", 5)
            infra_gap = max(5, 15 - roads_score)
            
        # 5. cost_penalty: negative impact for higher budget categories
        cost_penalty = 0
        if category in ["Healthcare Access", "Road Repair", "Water Supply"]:
            cost_penalty = -5
            
        # 6. strategic_importance: base category weights
        strategic_importance = 15
        if category in ["Healthcare Access", "Water Supply"]:
            strategic_importance = 20
            
        # Total priority_score sum
        priority_score = min(100, max(0, citizen_frequency + urgency + population_affected + infra_gap + cost_penalty + strategic_importance))
        
        confidence = round(0.85 + (urgency_score * 0.13), 2)
        
        reason = (
            f"Calculated priority score of {priority_score} for {category} in {ward.name if ward else 'Unknown Ward'}. "
            f"Driven by high urgency ({urgency}) and an infrastructure gap rating of {infra_gap}."
        )
        
        result = {
            "priority_score": priority_score,
            "breakdown": {
                "citizen_frequency": citizen_frequency,
                "urgency": urgency,
                "population_affected": population_affected,
                "infrastructure_gap": infra_gap,
                "cost_penalty": cost_penalty,
                "strategic_importance": strategic_importance
            },
            "reason": reason,
            "confidence": confidence
        }
        
        logger.info(f"Priority Engine Stage Finished. Score: {priority_score}, Reason: '{reason}'")
        return result
