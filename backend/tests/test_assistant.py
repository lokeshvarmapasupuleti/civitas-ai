import pytest
from app.services.assistant.assistant_service import AssistantService
from app.database import SessionLocal

def test_assistant_all_intents():
    db = SessionLocal()
    service = AssistantService()
    
    questions = [
        "Why should the MP approve this project?",
        "Explain the ranking of Ward 1 (Indiranagar)",
        "Show me the top recommendations",
        "Summarize water complaints",
        "How many Road Repair complaints did we get this month?",
        "What are the top 5 wards with the highest complaints?",
        "What is the category distribution of complaints?",
        "What is the average priority score?",
        "Which cluster has the highest urgency?",
        "Show me recent complaints",
        "What is the highest healthcare demand ward?",
        "Who is the ward officer for Indiranagar?" # Fallback
    ]
    
    try:
        for q in questions:
            res = service.query_assistant(db, q)
            assert "answer" in res
            assert "query_type" in res
            assert "confidence" in res
            assert res["confidence"] > 0.0
            
            # Check cache hit
            res_cached = service.query_assistant(db, q)
            assert res_cached["query_type"] == res["query_type"]
    finally:
        db.close()
