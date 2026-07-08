import logging
from sqlalchemy.orm import Session
from typing import Optional
from app import models
from app.providers.base import BaseAIProvider
from app.providers.factory import AIProviderFactory

logger = logging.getLogger("ai_pipeline.clustering")

class ClusteringService:
    def __init__(self, provider: BaseAIProvider = None):
        self.provider = provider or AIProviderFactory.get_provider()
        
    def assign_cluster(self, db: Session, text: str, category: str, ward_name: str) -> models.AICluster:
        logger.info(f"Clustering Stage Started (Ward: {ward_name}, Category: {category})...")
        
        # 1. Generate text embedding (ready for future sentence embedding similarity / pgvector)
        embedding = self.provider.get_embedding(text)
        logger.info(f"Generated text embedding vector (length: {len(embedding)}) for similarity calculations.")
        
        # 2. Check for matches in database
        db_clusters = db.query(models.AICluster).all()
        matched_cluster: Optional[models.AICluster] = None
        
        # Current mock similarity: match based on category keywords and ward
        for cluster in db_clusters:
            if cluster.ward.lower() == ward_name.lower():
                category_words = set(category.lower().split())
                cluster_words = set(cluster.cluster_name.lower().split())
                if category_words.intersection(cluster_words):
                    matched_cluster = cluster
                    break
                    
        if matched_cluster:
            logger.info(f"Clustering Stage: Found existing matched cluster '{matched_cluster.cluster_name}'")
            matched_cluster.submission_count += 1
            db.commit()
            db.refresh(matched_cluster)
            return matched_cluster
            
        # 3. If no match is found, create a new AI Cluster in the database
        cluster_name = f"{ward_name} {category} Cluster"
        summary = f"Clustered citizen reports regarding '{category}' in {ward_name}."
        logger.info(f"Clustering Stage: No matching cluster found. Creating new cluster '{cluster_name}'")
        
        new_cluster = models.AICluster(
            cluster_name=cluster_name,
            summary=summary,
            submission_count=1,
            ward=ward_name,
            priority_score=75  # default initial priority score
        )
        db.add(new_cluster)
        db.commit()
        db.refresh(new_cluster)
        return new_cluster