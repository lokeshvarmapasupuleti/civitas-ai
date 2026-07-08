import math
import logging
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from app import models
from app.services.similarity.normalizer import TextNormalizer
from app.services.similarity.embeddings import BaseEmbeddingProvider, MockEmbeddingProvider
from app.services.ai_pipeline.department import MockDepartmentRouter

logger = logging.getLogger("services.similarity.engine")

class SemanticSimilarityEngine:
    def __init__(self, embedding_provider: BaseEmbeddingProvider = None):
        self.normalizer = TextNormalizer()
        self.embeddings = embedding_provider or MockEmbeddingProvider()
        self.dept_router = MockDepartmentRouter()

    def calculate_cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        if not vec1 or not vec2 or len(vec1) != len(vec2):
            return 0.0
            
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        norm_a = math.sqrt(sum(a * a for a in vec1))
        norm_b = math.sqrt(sum(b * b for b in vec2))
        
        if norm_a == 0 or norm_b == 0:
            return 0.0
            
        return dot_product / (norm_a * norm_b)

    def find_duplicates(
        self, 
        db: Session, 
        query_text: str, 
        exclude_id: str = None, 
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        logger.info(f"Running semantic similarity search for: '{query_text[:50]}...'")
        
        # 1. Normalize and embed the query text
        norm_query = self.normalizer.normalize(query_text)
        query_vec = self.embeddings.get_embedding(norm_query)

        # 2. Fetch historical records
        submissions = db.query(models.CitizenSubmission).all()
        
        scored_records = []
        for sub in submissions:
            # Skip the query case itself
            if exclude_id and sub.id == exclude_id:
                continue
                
            norm_sub_desc = self.normalizer.normalize(sub.description)
            sub_vec = self.embeddings.get_embedding(norm_sub_desc)
            
            sim_score = self.calculate_cosine_similarity(query_vec, sub_vec)
            
            # Map categories to departments and officers
            dept = self.dept_router.route_department(sub.category)
            
            officer_map = {
                "Public Works Department (PWD)": "Er. Rajesh Kumar (Executive Engineer)",
                "Water Supply & Sewerage Board": "Er. Sandeep N. (Asst. Board Director)",
                "Health & Sanitation Division": "Dr. Amit Sharma (Chief Health Officer)",
                "Electricity & Streetlighting Dept": "Er. Priya Verma (Superintendent Officer)"
            }
            officer = officer_map.get(dept, "Shri K. L. Rao (Admn. Officer)")

            # Map status to resolution history
            res_history = "Awaiting verification from division officers."
            if sub.status == "Resolved":
                res_history = "Resolved. Verified and closed on-site."
            elif sub.status == "In Progress":
                res_history = "Work order dispatched. Field operations active."

            scored_records.append({
                "reference_id": sub.id,
                "description": sub.description,
                "similarity_score": round(sim_score, 4),
                "similarity_percentage": round(sim_score * 100, 2),
                "resolution_history": res_history,
                "officer_assigned": officer,
                "ward": sub.ward.name if sub.ward else "Unknown Ward",
                "department": dept,
                "status": sub.status
            })

        # 3. Sort by similarity score descending and slice
        scored_records.sort(key=lambda x: x["similarity_score"], reverse=True)
        return scored_records[:limit]
