import pytest
from sqlalchemy.orm import Session
from app import models
from app.database import SessionLocal
from app.services.similarity.normalizer import TextNormalizer
from app.services.similarity.embeddings import MockEmbeddingProvider
from app.services.similarity.similarity_engine import SemanticSimilarityEngine

def test_text_normalizer():
    normalizer = TextNormalizer()
    assert normalizer.normalize("Huge POTHOLES, on the road...") == "huge potholes on the road"
    assert normalizer.normalize("  leakage!  ") == "leakage"

def test_mock_embedding_provider():
    provider = MockEmbeddingProvider()
    vec = provider.get_embedding("Potholes on the road near hospital.")
    
    assert isinstance(vec, list)
    assert len(vec) > 50  # vocab + alphabet padding
    # Assert unit normalized (L2 norm is approximately 1.0)
    l2_norm = sum(x * x for x in vec)
    assert abs(l2_norm - 1.0) < 1e-5
    
    # 1. Test batch get_embeddings
    assert len(provider.get_embeddings(["road", "water"])) == 2
    
    # 2. Test empty text embedding handling
    empty_vec = provider.get_embedding("")
    assert len(empty_vec) == len(provider.vocab)
    assert all(x == 0.0 for x in empty_vec)
    
    # 3. Test zero norm edge case (non-alphabetic input)
    special_vec = provider.get_embedding("!!!")
    assert len(special_vec) == len(provider.vocab) + 26
    
    # 4. Test other provider classes for code coverage
    from app.services.similarity.embeddings import (
        SentenceTransformersProvider,
        OpenAIEmbeddingProvider,
        GeminiEmbeddingProvider
    )
    assert len(SentenceTransformersProvider().get_embedding("pothole")) > 0
    assert len(OpenAIEmbeddingProvider().get_embedding("pothole")) > 0
    assert len(GeminiEmbeddingProvider().get_embedding("pothole")) > 0

def test_cosine_similarity():
    engine = SemanticSimilarityEngine()
    vec1 = [1.0, 0.0, 0.0]
    vec2 = [0.0, 1.0, 0.0]
    vec3 = [1.0, 0.0, 0.0]
    
    assert engine.calculate_cosine_similarity(vec1, vec2) == 0.0
    assert abs(engine.calculate_cosine_similarity(vec1, vec3) - 1.0) < 1e-5

def test_find_duplicates():
    db = SessionLocal()
    try:
        # Fetch a test case from the database (seeded by test_pipeline or seed_data)
        ward = db.query(models.Ward).first()
        if not ward:
            pytest.skip("No ward found. Seed database first.")
            
        # Insert a sample case
        sub1 = models.CitizenSubmission(
            id="#SIM-TEST-1",
            category="Road Repair",
            ward_id=ward.id,
            description="Severe street damage and potholes on highway sector 4.",
            sentiment="Neutral",
            status="Pending"
        )
        sub2 = models.CitizenSubmission(
            id="#SIM-TEST-2",
            category="Water Supply",
            ward_id=ward.id,
            description="Contaminated drinking water delivery in local block pipes.",
            sentiment="Neutral",
            status="Pending"
        )
        
        # Clean any old test records
        db.query(models.CitizenSubmission).filter(models.CitizenSubmission.id.in_(["#SIM-TEST-1", "#SIM-TEST-2"])).delete()
        db.commit()
        
        db.add(sub1)
        db.add(sub2)
        db.commit()
        
        engine = SemanticSimilarityEngine()
        
        # Query with road repair description
        matches = engine.find_duplicates(db, "Potholes on highway road", exclude_id="#SIM-TEST-3")
        
        assert len(matches) > 0
        # The first match should be the road repair grievance (since it contains keyword 'highway' and 'road')
        first_match = matches[0]
        assert first_match["reference_id"] == "#SIM-TEST-1"
        assert first_match["similarity_percentage"] > 0
        assert "ward" in first_match
        assert "officer_assigned" in first_match
        assert "department" in first_match
        
        # Clean up
        db.query(models.CitizenSubmission).filter(models.CitizenSubmission.id.in_(["#SIM-TEST-1", "#SIM-TEST-2"])).delete()
        db.commit()
    finally:
        db.close()
