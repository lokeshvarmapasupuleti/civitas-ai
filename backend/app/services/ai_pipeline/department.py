from abc import ABC, abstractmethod

class BaseDepartmentRouter(ABC):
    @abstractmethod
    def route_department(self, category: str) -> str:
        pass

class MockDepartmentRouter(BaseDepartmentRouter):
    def route_department(self, category: str) -> str:
        mapping = {
            "Road Repair": "Public Works Department (PWD)",
            "Water Supply": "Water Supply & Sewerage Board",
            "Sanitation": "Health & Sanitation Division",
            "Street Lighting": "Electricity & Streetlighting Dept"
        }
        return mapping.get(category, "Municipal Administration")
