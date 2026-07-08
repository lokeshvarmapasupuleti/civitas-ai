from abc import ABC, abstractmethod
from typing import Dict, Any

class BasePriorityPredictor(ABC):
    @abstractmethod
    def predict_priority(self, urgency_score: float, category: str, sentiment: str) -> Dict[str, Any]:
        pass

class MockPriorityPredictor(BasePriorityPredictor):
    def predict_priority(self, urgency_score: float, category: str, sentiment: str) -> Dict[str, Any]:
        # Map urgency to a 0-100 range priority score
        citizen_frequency = 25
        urgency = int(urgency_score * 20)
        population_affected = 12
        infrastructure_gap = 10
        cost_penalty = -5 if category in ["Road Repair", "Water Supply"] else 0
        strategic_importance = 15 if category in ["Water Supply"] else 10
        
        priority_score = min(100, max(0, citizen_frequency + urgency + population_affected + infrastructure_gap + cost_penalty + strategic_importance))
        
        if priority_score >= 80:
            priority_level = "Critical"
        elif priority_score >= 60:
            priority_level = "High"
        elif priority_score >= 40:
            priority_level = "Medium"
        else:
            priority_level = "Low"
            
        confidence = round(0.85 + (urgency_score * 0.13), 2)
        reason = f"Calculated priority level of {priority_level} (score: {priority_score}) based on urgency factor of {urgency}."
        
        return {
            "priority": priority_level,
            "priority_score": priority_score,
            "breakdown": {
                "citizen_frequency": citizen_frequency,
                "urgency": urgency,
                "population_affected": population_affected,
                "infrastructure_gap": infrastructure_gap,
                "cost_penalty": cost_penalty,
                "strategic_importance": strategic_importance
            },
            "reason": reason,
            "confidence": confidence
        }
