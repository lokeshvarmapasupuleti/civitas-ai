from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseSimilaritySearch(ABC):
    @abstractmethod
    def find_similar_cases(self, text: str, category: str, limit: int = 2) -> List[Dict[str, Any]]:
        pass

class MockSimilaritySearch(BaseSimilaritySearch):
    def find_similar_cases(self, text: str, category: str, limit: int = 2) -> List[Dict[str, Any]]:
        # High quality static historically similar cases database
        cases_db = {
            "Road Repair": [
                {
                    "reference_id": "CIV-2026-0042",
                    "description": "Large potholes near Ward 8 primary healthcare center causing traffic disruption.",
                    "similarity_score": 0.92,
                    "status": "Resolved",
                    "resolution_time": "14.2 hours",
                    "department": "Public Works Department (PWD)"
                },
                {
                    "reference_id": "CIV-2026-0129",
                    "description": "Pavement collapse on Main Bypass road after monsoon rains.",
                    "similarity_score": 0.88,
                    "status": "Resolved",
                    "resolution_time": "36.0 hours",
                    "department": "Public Works Department (PWD)"
                }
            ],
            "Water Supply": [
                {
                    "reference_id": "CIV-2026-0091",
                    "description": "Main water pipeline leak on Ring Road sector 2.",
                    "similarity_score": 0.94,
                    "status": "Resolved",
                    "resolution_time": "12.0 hours",
                    "department": "Water Supply & Sewerage Board"
                },
                {
                    "reference_id": "CIV-2026-0211",
                    "description": "Low supply pressure and contaminated water delivery in Ward 3.",
                    "similarity_score": 0.85,
                    "status": "Resolved",
                    "resolution_time": "48.0 hours",
                    "department": "Water Supply & Sewerage Board"
                }
            ]
        }
        
        return cases_db.get(category, [
            {
                "reference_id": "CIV-2026-0010",
                "description": "General civic grievance regarding municipal infrastructure maintenance.",
                "similarity_score": 0.82,
                "status": "Resolved",
                "resolution_time": "24.5 hours",
                "department": "Municipal Administration"
            }
        ])[:limit]
