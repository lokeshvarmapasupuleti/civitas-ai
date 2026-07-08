from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from pydantic import BaseModel, Field

class SLAPrediction(BaseModel):
    inspection_time: str = Field(..., description="Allocated target duration for field inspections")
    repair_time: str = Field(..., description="Allocated target duration for physical works")
    approval_time: str = Field(..., description="Allocated target duration for commissioner authorizations")
    expected_resolution_date: str = Field(..., description="Calculated resolution deadline date string")

class BaseSLAPredictor(ABC):
    @abstractmethod
    def predict_sla_details(self, category: str, priority: str) -> SLAPrediction:
        pass

# Rule Engine SLA Parameters configuration
SLA_RULES = {
    "Critical": {
        "inspection_hours": 2,
        "repair_hours": 8,
        "approval_hours": 2
    },
    "High": {
        "inspection_hours": 4,
        "repair_hours": 16,
        "approval_hours": 4
    },
    "Medium": {
        "inspection_hours": 8,
        "repair_hours": 32,
        "approval_hours": 8
    },
    "Low": {
        "inspection_hours": 24,
        "repair_hours": 120,
        "approval_hours": 24
    }
}

class RuleBasedSLAPredictor(BaseSLAPredictor):
    def predict_sla_details(self, category: str, priority: str) -> SLAPrediction:
        # Fetch configurations based on priority
        rule = SLA_RULES.get(priority, SLA_RULES["Medium"])

        total_hours = rule["inspection_hours"] + rule["repair_hours"] + rule["approval_hours"]
        
        # Calculate expected resolution date
        now = datetime.utcnow()
        expected_date = now + timedelta(hours=total_hours)
        expected_date_str = expected_date.strftime("%Y-%m-%d %H:%M:%S UTC")

        # Map to friendly display durations
        def to_duration_str(h: int) -> str:
            if h >= 24:
                days = h // 24
                return f"{days} Day" if days == 1 else f"{days} Days"
            return f"{h} Hour" if h == 1 else f"{h} Hours"

        return SLAPrediction(
            inspection_time=to_duration_str(rule["inspection_hours"]),
            repair_time=to_duration_str(rule["repair_hours"]),
            approval_time=to_duration_str(rule["approval_hours"]),
            expected_resolution_date=expected_date_str
        )

# Backward Compatibility Wrapper
class MockSLAPredictor(RuleBasedSLAPredictor):
    def predict_sla(self, category: str, priority: str) -> str:
        # Keeps legacy endpoints functional by returning a string (e.g. 12 Hours)
        rule = SLA_RULES.get(priority, SLA_RULES["Medium"])
        total_hours = rule["inspection_hours"] + rule["repair_hours"] + rule["approval_hours"]
        if total_hours >= 24:
            return f"{total_hours // 24} Days"
        return f"{total_hours} Hours"
