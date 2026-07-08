from abc import ABC, abstractmethod
from typing import List
from pydantic import BaseModel, Field

class BudgetPrediction(BaseModel):
    repair_cost: float = Field(..., description="Estimated cost parameter in INR (₹)")
    required_workforce: int = Field(..., description="Estimated number of personnel required")
    equipment_needed: List[str] = Field(..., description="List of heavy machinery/tools required")
    expected_completion_time: str = Field(..., description="Expected duration (e.g. 24 Hours, 3 Days)")
    emergency_level: str = Field(..., description="Emergency classification level (Low, Medium, High, Critical)")
    budget_category: str = Field(..., description="Routed municipal budget account head")
    confidence: float = Field(..., description="Prediction model confidence score")

class BaseBudgetPredictor(ABC):
    @abstractmethod
    def predict_budget(self, category: str, priority: str) -> BudgetPrediction:
        pass

# Rule Engine Configuration Parameters
BUDGET_RULES = {
    "Road Repair": {
        "base_cost": 200000.0,
        "workforce_base": 8,
        "equipment": ["Asphalt Paver", "Road Roller", "Dumper Truck"],
        "base_days": 5,
        "budget_category": "Capital Infrastructure (Roads)"
    },
    "Water Supply": {
        "base_cost": 100000.0,
        "workforce_base": 4,
        "equipment": ["Excavator", "Welding Machine", "Water Pump"],
        "base_days": 2,
        "budget_category": "Utilities (Water & Sewerage)"
    },
    "Sanitation": {
        "base_cost": 30000.0,
        "workforce_base": 6,
        "equipment": ["Compactor Truck", "Shovels", "Disinfectant Spray"],
        "base_days": 1,
        "budget_category": "Public Health & Hygiene"
    },
    "Street Lighting": {
        "base_cost": 50000.0,
        "workforce_base": 3,
        "equipment": ["Cherry Picker Truck", "Wire Strippers", "Multimeter"],
        "base_days": 2,
        "budget_category": "Utilities (Electrical)"
    }
}

class RuleBasedBudgetPredictor(BaseBudgetPredictor):
    def predict_budget(self, category: str, priority: str) -> BudgetPrediction:
        # Resolve category parameters from rule configuration
        params = BUDGET_RULES.get(category, {
            "base_cost": 45000.0,
            "workforce_base": 2,
            "equipment": ["Standard Tool Kit"],
            "base_days": 3,
            "budget_category": "Municipal General Reserves"
        })

        # Priority multiplier variables
        cost_mult = 1.0
        workforce_mult = 1.0
        days_mult = 1.0
        confidence = 0.85

        if priority == "Critical":
            cost_mult = 1.5
            workforce_mult = 1.8
            days_mult = 0.5  # Critical cases require faster dispatch
            confidence = 0.94
        elif priority == "High":
            cost_mult = 1.2
            workforce_mult = 1.3
            days_mult = 0.8
            confidence = 0.90
        elif priority == "Low":
            cost_mult = 0.8
            workforce_mult = 0.6
            days_mult = 1.5
            confidence = 0.80

        calculated_cost = params["base_cost"] * cost_mult
        calculated_workforce = max(1, int(params["workforce_base"] * workforce_mult))
        calculated_days = max(1.0, params["base_days"] * days_mult)
        
        time_unit = "Days" if calculated_days > 1 else "Hours"
        time_val = int(calculated_days) if calculated_days > 1 else int(calculated_days * 24)
        completion_str = f"{time_val} {time_unit}"

        return BudgetPrediction(
            repair_cost=calculated_cost,
            required_workforce=calculated_workforce,
            equipment_needed=params["equipment"],
            expected_completion_time=completion_str,
            emergency_level=priority,
            budget_category=params["budget_category"],
            confidence=confidence
        )

# Backward Compatibility Wrapper
class MockBudgetEstimator(RuleBasedBudgetPredictor):
    def estimate_budget(self, category: str, priority: str) -> float:
        pred = self.predict_budget(category, priority)
        return pred.repair_cost
