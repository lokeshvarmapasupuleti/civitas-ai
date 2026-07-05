import logging
import re
import time
from typing import Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session
from app.services.assistant import sql_queries

logger = logging.getLogger("assistant.query_router")

# Simple in-memory cache
_query_cache: Dict[str, Tuple[float, Dict[str, Any]]] = {}
CACHE_TTL = 60.0  # 60 seconds caching

class QueryRouter:
    def route_and_execute(self, db: Session, question: str) -> Dict[str, Any]:
        normalized_q = question.strip().lower()
        
        # 1. Check Cache
        now = time.time()
        if normalized_q in _query_cache:
            cached_time, cached_val = _query_cache[normalized_q]
            if now - cached_time < CACHE_TTL:
                logger.info(f"Cache Hit for query: '{question}'")
                return cached_val
                
        logger.info(f"Cache Miss. Routing and executing query: '{question}'")
        
        # 2. Match intents and query database
        intent, data = self._detect_and_query(db, normalized_q)
        
        result = {
            "intent": intent,
            "data": data,
            "confidence": 0.95 if intent != "fallback" else 0.50
        }
        
        # Cache the result
        _query_cache[normalized_q] = (now, result)
        
        return result

    def _detect_and_query(self, db: Session, query: str) -> Tuple[str, Any]:
        # A. Why should the MP approve this project?
        if "mp approve" in query or "should the mp" in query or "why approve" in query:
            keywords = "road"
            if "school" in query or "education" in query:
                keywords = "school"
            elif "health" in query or "clinic" in query or "hospital" in query:
                keywords = "health"
            elif "water" in query or "supply" in query:
                keywords = "water"
            elif "light" in query or "electricity" in query:
                keywords = "light"
            return "mp_approval_details", sql_queries.get_mp_project_approval_details(db, keywords)
            
        # B. Highest healthcare demand ward
        elif "healthcare demand" in query or "highest healthcare" in query:
            return "highest_healthcare_demand", sql_queries.get_highest_healthcare_demand_ward(db)
            
        # C. Why is Ward X ranked highest?
        elif "why is ward" in query or "why ward" in query:
            match = re.search(r"ward\s*(\d+)", query)
            ward_name = f"Ward {match.group(1)}" if match else "Ward 1"
            return "ward_ranking_explanation", sql_queries.get_ward_ranking_details(db, ward_name)
            
        # D. Show top recommendations
        elif "top recommendations" in query or "show recommendations" in query or "show top" in query:
            return "top_recommendations", sql_queries.get_top_recommendations(db)
            
        # E. Summarize water-related complaints
        elif "water-related" in query or "water complaints" in query or "summarize water" in query:
            return "water_complaints_summary", sql_queries.get_water_complaints_summary(db)
            
        # F. Monthly Category Count (e.g. "How many road repair complaints were submitted this month?")
        elif "complaints were submitted this month" in query or ("how many" in query and "this month" in query):
            category = "Road Repair"
            if "water" in query:
                category = "Water Supply"
            elif "health" in query:
                category = "Healthcare Access"
            elif "light" in query:
                category = "Street Lighting"
            elif "sanitation" in query or "garbage" in query:
                category = "Sanitation"
            elif "transit" in query or "bus" in query or "transport" in query:
                category = "Public Transport"
            count = sql_queries.get_monthly_category_count(db, category)
            return "monthly_category_count", {"category": category, "count": count}
            
        # G. Top 5 wards by complaints
        elif "top 5 wards" in query or "top wards" in query:
            return "top_5_wards", sql_queries.get_top_5_wards_by_complaints(db)
            
        # H. Category distribution
        elif "category distribution" in query or "complaint categories" in query or "distribution of complaints" in query:
            return "category_distribution", sql_queries.get_category_distribution(db)
            
        # I. Average priority score
        elif "average priority" in query or "mean priority" in query or "avg priority" in query:
            avg_score = sql_queries.get_average_priority_score(db)
            return "average_priority_score", {"average_score": avg_score}
            
        # J. Highest urgency cluster
        elif "highest urgency cluster" in query or "most urgent cluster" in query or "top cluster" in query:
            return "highest_urgency_cluster", sql_queries.get_highest_urgency_cluster(db)
            
        # K. Recently submitted complaints
        elif "recent complaints" in query or "recently submitted" in query:
            return "recent_complaints", sql_queries.get_recently_submitted_complaints(db)
            
        # Fallback
        return "fallback", {}
