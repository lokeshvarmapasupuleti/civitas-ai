import pytest
from app.services.ai_pipeline.language import MockLanguageDetector
from app.services.ai_pipeline.translation import MockTranslator
from app.services.ai_pipeline.sentiment import MockSentimentAnalyzer
from app.services.ai_pipeline.urgency import MockUrgencyDetector
from app.services.ai_pipeline.categorizer import MockCategorizer
from app.services.ai_pipeline.department import MockDepartmentRouter
from app.services.ai_pipeline.priority import MockPriorityPredictor
from app.services.ai_pipeline.similarity import MockSimilaritySearch
from app.services.ai_pipeline.recommendation import MockRecommendationGenerator
from app.services.ai_pipeline.budget import MockBudgetEstimator
from app.services.ai_pipeline.sla import MockSLAPredictor
from app.services.ai_pipeline.explainability import MockExplainabilityReporter
from app.services.ai_pipeline.pipeline import AIPipelineOrchestrator, PipelineResult

def test_language_detector():
    detector = MockLanguageDetector()
    assert detector.detect_language("गड्ढे हैं") == "hi"
    assert detector.detect_language("ખાડાઓ છે") == "gu"
    assert detector.detect_language("Huge potholes on the road") == "en"

def test_translator():
    translator = MockTranslator()
    assert translator.translate("Huge potholes on the road", "en") == "Huge potholes on the road"
    assert "safety hazards" in translator.translate("गड्ढे हैं", "hi")

def test_sentiment_analyzer():
    analyzer = MockSentimentAnalyzer()
    assert analyzer.analyze_sentiment("This is highly dangerous and fatal!") == "Critical/Angry"
    assert analyzer.analyze_sentiment("There are some minor potholes.") == "Concerned"
    assert analyzer.analyze_sentiment("Everything is fine.") == "Neutral"

def test_urgency_detector():
    detector = MockUrgencyDetector()
    assert detector.detect_urgency("dangerous road accident threat") == 0.85
    assert detector.detect_urgency("potholes leak broken drainage") == 0.65
    assert detector.detect_urgency("other general queries") == 0.30

def test_categorizer():
    categorizer = MockCategorizer()
    assert categorizer.categorize("fix the potholes on the bypass highway") == "Road Repair"
    assert categorizer.categorize("leakage sewage water pipe overflow") == "Water Supply"
    assert categorizer.categorize("garbage litter cleanup") == "Sanitation"

def test_department_router():
    router = MockDepartmentRouter()
    assert router.route_department("Road Repair") == "Public Works Department (PWD)"
    assert router.route_department("Water Supply") == "Water Supply & Sewerage Board"
    assert router.route_department("General") == "Municipal Administration"

def test_priority_predictor():
    predictor = MockPriorityPredictor()
    res = predictor.predict_priority(0.85, "Road Repair", "Critical/Angry")
    assert res["priority"] in ["Critical", "High"]
    assert res["priority_score"] > 50
    assert "breakdown" in res

def test_similarity_search():
    search = MockSimilaritySearch()
    cases = search.find_similar_cases("potholes", "Road Repair", limit=1)
    assert len(cases) == 1
    assert "reference_id" in cases[0]

def test_recommendation_generator():
    generator = MockRecommendationGenerator()
    recs = generator.generate_recommendations("Road Repair", "Critical")
    assert len(recs) > 0
    assert any("development" in r.lower() or "project" in r.lower() or "asphalt" in r.lower() or "barricade" in r.lower() for r in recs)
    
    report = generator.generate_recommendation_report("Road Repair", "Critical")
    assert report.target_grievance_category == "Road Repair"
    assert len(report.ward_officer.immediate_actions) > 0
    assert report.commissioner.public_safety_impact is not None

def test_budget_estimator():
    estimator = MockBudgetEstimator()
    pred = estimator.predict_budget("Road Repair", "Critical")
    assert pred.repair_cost > 0.0
    assert pred.required_workforce > 0
    assert len(pred.equipment_needed) > 0
    assert pred.budget_category == "Capital Infrastructure (Roads)"

def test_sla_predictor():
    predictor = MockSLAPredictor()
    pred = predictor.predict_sla_details("Road Repair", "Critical")
    assert pred.inspection_time == "2 Hours"
    assert pred.repair_time == "8 Hours"
    assert pred.approval_time == "2 Hours"
    assert pred.expected_resolution_date is not None

def test_explainability_reporter():
    reporter = MockExplainabilityReporter()
    rep = reporter.generate_report(
        text="Potholes near school", 
        category="Road Repair", 
        priority="High",
        department="Public Works Department (PWD)",
        sla="24 Hours"
    )
    assert rep.risk_assessment is not None
    assert "PWD" in rep.department_reasoning
    assert rep.executive_summary is not None
    assert "development" in rep.executive_summary.lower() or "planning" in rep.executive_summary.lower()

def test_orchestrator_pipeline():
    orchestrator = AIPipelineOrchestrator()
    result = orchestrator.run_pipeline("There is a severe water leakage problem on the main street.")
    
    assert isinstance(result, PipelineResult)
    assert result.category == "Water Supply"
    assert result.language == "en"
    assert result.department == "Water Supply & Sewerage Board"
    assert result.budget_estimate > 0
    assert len(result.recommendations) > 0
    assert "risk" in result.risk_level.lower()
    
    # Explainability checks
    assert result.explainability is not None
    assert result.explainability.confidence > 0
    assert "Water" in result.explainability.department_reasoning
    assert len(result.explainability.alternative_departments) > 0

    # Budget & SLA details checks
    assert result.budget_prediction.repair_cost == result.budget_estimate
    assert result.sla_prediction_details.inspection_time is not None
    assert result.sla_prediction_details.expected_resolution_date is not None

    # Recommendation checks
    assert result.recommendation_report is not None
    assert result.recommendation_report.citizen.immediate_actions is not None
    assert len(result.recommendation_report.commissioner.budget_recommendations) > 0
