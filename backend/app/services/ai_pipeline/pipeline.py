import uuid
import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

from app.services.ai_pipeline.language import BaseLanguageDetector, MockLanguageDetector, ProviderLanguageDetector
from app.services.ai_pipeline.translation import BaseTranslator, MockTranslator, ProviderTranslator
from app.services.ai_pipeline.sentiment import BaseSentimentAnalyzer, MockSentimentAnalyzer, ProviderSentimentAnalyzer
from app.services.ai_pipeline.urgency import BaseUrgencyDetector, MockUrgencyDetector, ProviderUrgencyDetector
from app.services.ai_pipeline.categorizer import BaseCategorizer, MockCategorizer, ProviderCategorizer
from app.services.ai_pipeline.department import BaseDepartmentRouter, MockDepartmentRouter
from app.services.ai_pipeline.priority import BasePriorityPredictor, MockPriorityPredictor
from app.services.ai_pipeline.similarity import BaseSimilaritySearch, MockSimilaritySearch
from app.services.ai_pipeline.recommendation import BaseRecommendationGenerator, MockRecommendationGenerator, ProviderRecommendationGenerator, ExecutiveRecommendationReport
from app.services.ai_pipeline.budget import BaseBudgetPredictor, RuleBasedBudgetPredictor, MockBudgetEstimator, BudgetPrediction
from app.services.ai_pipeline.sla import BaseSLAPredictor, RuleBasedSLAPredictor, MockSLAPredictor, SLAPrediction
from app.services.ai_pipeline.explainability import BaseExplainabilityReporter, MockExplainabilityReporter, ProviderExplainabilityReporter, ExplainabilityReport

logger = logging.getLogger("ai_pipeline.modular")

class PipelineResult(BaseModel):
    reference_id: str = Field(..., description="Unique grievance tracking reference ID")
    language: str = Field(..., description="Detected language code (e.g. en, hi, gu)")
    translated_text: str = Field(..., description="English translated description text")
    entities: List[str] = Field(default_factory=list, description="Extracted named entities")
    sentiment: str = Field(..., description="Detected citizen sentiment")
    urgency: float = Field(..., description="Urgency index score (0.0 to 1.0)")
    category: str = Field(..., description="Predicted grievance category")
    department: str = Field(..., description="Routed municipal department")
    priority: str = Field(..., description="Urgency priority level (e.g. Critical, High, Medium, Low)")
    confidence: float = Field(..., description="Model confidence classification score")
    budget_estimate: float = Field(..., description="Estimated cost parameter in INR")
    sla_prediction: str = Field(..., description="Predicted SLA timeline threshold")
    historically_similar_cases: List[Dict[str, Any]] = Field(default_factory=list, description="Top matching historical entries")
    recommendations: List[str] = Field(default_factory=list, description="AI recommended resolution steps")
    risk_level: str = Field(..., description="Mitigation risk rating (Low, Medium, High)")
    reasoning: str = Field(..., description="Explainable reasoning summary")
    executive_summary: str = Field(..., description="Consolidated report executive summary")
    explainability: ExplainabilityReport = Field(..., description="Explainable AI reasoning report metadata")
    budget_prediction: BudgetPrediction = Field(..., description="AI Budget Prediction details")
    sla_prediction_details: SLAPrediction = Field(..., description="SLA Prediction details")
    recommendation_report: ExecutiveRecommendationReport = Field(..., description="Executive Recommendation Report details")

class AIPipelineOrchestrator:
    def __init__(
        self,
        language_detector: BaseLanguageDetector = None,
        translator: BaseTranslator = None,
        sentiment_analyzer: BaseSentimentAnalyzer = None,
        urgency_detector: BaseUrgencyDetector = None,
        categorizer: BaseCategorizer = None,
        department_router: BaseDepartmentRouter = None,
        priority_predictor: BasePriorityPredictor = None,
        similarity_search: BaseSimilaritySearch = None,
        recommendation_generator: BaseRecommendationGenerator = None,
        budget_estimator: BaseBudgetPredictor = None,
        sla_predictor: BaseSLAPredictor = None,
        explainability_reporter: BaseExplainabilityReporter = None
    ):
        self.language_detector = language_detector or ProviderLanguageDetector()
        self.translator = translator or ProviderTranslator()
        self.sentiment_analyzer = sentiment_analyzer or ProviderSentimentAnalyzer()
        self.urgency_detector = urgency_detector or ProviderUrgencyDetector()
        self.categorizer = categorizer or ProviderCategorizer()
        self.department_router = department_router or MockDepartmentRouter()
        self.priority_predictor = priority_predictor or MockPriorityPredictor()
        self.similarity_search = similarity_search or MockSimilaritySearch()
        self.recommendation_generator = recommendation_generator or ProviderRecommendationGenerator()
        self.budget_estimator = budget_estimator or MockBudgetEstimator()
        self.sla_predictor = sla_predictor or MockSLAPredictor()
        self.explainability_reporter = explainability_reporter or ProviderExplainabilityReporter()

    def clean_text(self, text: str) -> str:
        if not text:
            return ""
        # Clean double linebreaks and spaces
        cleaned = text.strip()
        cleaned = " ".join(cleaned.split())
        return cleaned

    def extract_entities(self, text: str) -> List[str]:
        if not text:
            return []
        # Extract keywords as named entities
        keywords = ["pothole", "road", "school", "water", "leak", "garbage", "light", "hospital", "pipe", "wire", "drain"]
        found = []
        lower_text = text.lower()
        for kw in keywords:
            if kw in lower_text:
                found.append(kw)
        
        # Check for Ward numbers
        import re
        ward_match = re.search(r"ward\s*\d+", lower_text)
        if ward_match:
            found.append(ward_match.group(0))
            
        return list(set(found))

    def run_pipeline(self, description: str, reference_id: Optional[str] = None) -> PipelineResult:
        logger.info("Initializing Modular AI Pipeline Flow...")
        ref_id = reference_id or f"CIV-{uuid.uuid4().hex[:6].upper()}"

        # 1. Text Cleaning
        cleaned = self.clean_text(description)

        # 2. Language Detection
        lang = self.language_detector.detect_language(cleaned)

        # 3. Translation
        translated = self.translator.translate(cleaned, lang)

        # 4. Entity Extraction
        entities = self.extract_entities(translated)

        # 5. Sentiment Analysis
        sentiment = self.sentiment_analyzer.analyze_sentiment(translated)

        # 6. Urgency Detection
        urgency = self.urgency_detector.detect_urgency(translated)

        # 7. Category Classification
        category = self.categorizer.categorize(translated)

        # 8. Department Routing
        dept = self.department_router.route_department(category)

        # 9. Priority Prediction
        priority_res = self.priority_predictor.predict_priority(urgency, category, sentiment)
        priority_level = priority_res["priority"]
        confidence = priority_res["confidence"]

        # 10. Historical Similarity Search
        sim_cases = self.similarity_search.find_similar_cases(translated, category)

        # 11. Budget Estimation
        budget_pred = self.budget_estimator.predict_budget(category, priority_level)
        budget = budget_pred.repair_cost

        # 12. SLA Prediction
        sla_details = self.sla_predictor.predict_sla_details(category, priority_level)
        sla = self.sla_predictor.predict_sla(category, priority_level)

        # 13. Recommendation Generation
        rec_report = self.recommendation_generator.generate_recommendation_report(category, priority_level)
        recommendations = self.recommendation_generator.generate_recommendations(category, priority_level)

        # 14. Explainability Report
        explain_report = self.explainability_reporter.generate_report(
            text=translated,
            category=category,
            priority=priority_level,
            department=dept,
            sla=sla
        )

        logger.info(f"AI Pipeline Flow Completed successfully for: {ref_id}")

        return PipelineResult(
            reference_id=ref_id,
            language=lang,
            translated_text=translated,
            entities=entities,
            sentiment=sentiment,
            urgency=urgency,
            category=category,
            department=dept,
            priority=priority_level,
            confidence=confidence,
            budget_estimate=budget,
            sla_prediction=sla,
            historically_similar_cases=sim_cases,
            recommendations=recommendations,
            risk_level=explain_report.risk_assessment,
            reasoning=explain_report.reasoning,
            executive_summary=explain_report.executive_summary,
            explainability=explain_report,
            budget_prediction=budget_pred,
            sla_prediction_details=sla_details,
            recommendation_report=rec_report
        )
