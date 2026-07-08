from abc import ABC, abstractmethod
from typing import List, Dict, Any
from pydantic import BaseModel, Field
from app.providers.factory import AIProviderFactory

class RoleRecommendationSet(BaseModel):
    immediate_actions: List[str] = Field(..., description="Action items requiring execution within hours/days")
    long_term_actions: List[str] = Field(..., description="Infrastructure planning and structural remediation tasks")
    preventive_measures: List[str] = Field(..., description="Steps designed to minimize recurring failures")
    budget_recommendations: List[str] = Field(..., description="Funding channels or cost-benefit actions")
    inspection_recommendations: List[str] = Field(..., description="Periodic audit requirements and check points")
    escalation_suggestions: List[str] = Field(..., description="Escalation pathways if target SLA timelines are breached")
    legal_compliance_notes: List[str] = Field(..., description="Statutory compliance guidelines or penal codes")
    public_safety_impact: str = Field(..., description="Description of the safety impact rating")

class ExecutiveRecommendationReport(BaseModel):
    target_grievance_category: str = Field(..., description="Categorized area of the recommendation report")
    overall_priority: str = Field(..., description="Urgency priority level")
    citizen: RoleRecommendationSet = Field(..., description="Recommendations visible to the reporting citizen")
    ward_officer: RoleRecommendationSet = Field(..., description="Operational recommendations for the Ward Officer")
    department_officer: RoleRecommendationSet = Field(..., description="Managerial recommendations for the Department Officer")
    commissioner: RoleRecommendationSet = Field(..., description="Strategic recommendations for the Municipal Commissioner")

class BaseRecommendationGenerator(ABC):
    @abstractmethod
    def generate_recommendation_report(self, category: str, priority: str) -> ExecutiveRecommendationReport:
        pass

    @abstractmethod
    def generate_recommendations(self, category: str, priority: str) -> List[str]:
        pass

class MockRecommendationGenerator(BaseRecommendationGenerator):
    def generate_recommendation_report(self, category: str, priority: str) -> ExecutiveRecommendationReport:
        recs = [
            f"Prioritize a development project for the '{category}' need in the constituency area.",
            f"Prepare a budgeted implementation plan with citizen feedback evidence.",
            f"Schedule a field review to confirm beneficiary reach and delivery timeline."
        ]
        role_set = RoleRecommendationSet(
            immediate_actions=recs,
            long_term_actions=["Integrate the project into the annual constituency development plan."],
            preventive_measures=["Track recurring themes and update the hotspot map regularly."],
            budget_recommendations=["Allocate constituency development funds and scheme-linked support."],
            inspection_recommendations=["Review implementation progress after 30 days."],
            escalation_suggestions=["Escalate to the MP's planning desk if the project remains unresolved."],
            legal_compliance_notes=["Align with local planning, procurement, and public works guidelines."],
            public_safety_impact="Improves access, service quality, and public welfare in the constituency."
        )
        return ExecutiveRecommendationReport(
            target_grievance_category=category,
            overall_priority=priority,
            citizen=role_set,
            ward_officer=role_set,
            department_officer=role_set,
            commissioner=role_set
        )

    def generate_recommendations(self, category: str, priority: str) -> List[str]:
        report = self.generate_recommendation_report(category, priority)
        return report.citizen.immediate_actions

class ProviderRecommendationGenerator(BaseRecommendationGenerator):
    def generate_recommendation_report(self, category: str, priority: str) -> ExecutiveRecommendationReport:
        provider = AIProviderFactory.get_provider()
        prompt = (
            f"Generate a bullet-pointed action plan (exactly 3 bullet points) for a proposed development project covering a '{category}' "
            f"development need with a '{priority}' planning priority. Keep bullet points very short and planning-focused."
        )
        try:
            res = provider.chat(prompt)
            if "Mock Chat" in res or not res.strip():
                return MockRecommendationGenerator().generate_recommendation_report(category, priority)
                
            steps = [line.strip().replace("-", "").replace("*", "").strip() for line in res.split("\n") if line.strip()][:3]
            while len(steps) < 3:
                steps.append(f"Advance a constituency development project for '{category}' needs.")
                
            role_set = RoleRecommendationSet(
                immediate_actions=steps,
                long_term_actions=["Incorporate into annual constituency development planning."],
                preventive_measures=["Track repeated needs and update the hotspot model regularly."],
                budget_recommendations=["Fund through constituency development and scheme-linked budgets."],
                inspection_recommendations=["Schedule a post-implementation review with local stakeholders."],
                escalation_suggestions=["Escalate if the project remains unaddressed after the planning window."],
                legal_compliance_notes=["Aligned with public works, procurement, and citizen participation guidance."],
                public_safety_impact="Improves access, resilience, and quality of life for residents."
            )
            return ExecutiveRecommendationReport(
                target_grievance_category=category,
                overall_priority=priority,
                citizen=role_set,
                ward_officer=role_set,
                department_officer=role_set,
                commissioner=role_set
            )
        except Exception:
            return MockRecommendationGenerator().generate_recommendation_report(category, priority)

    def generate_recommendations(self, category: str, priority: str) -> List[str]:
        report = self.generate_recommendation_report(category, priority)
        return report.citizen.immediate_actions

class RuleBasedRecommendationGenerator(ProviderRecommendationGenerator):
    pass
