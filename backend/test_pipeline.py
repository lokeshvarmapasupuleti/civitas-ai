import os
import sys
from dotenv import load_dotenv

# Ensure we can import from app
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import SessionLocal
from app import models
from app.ai_pipeline import AIPipeline

load_dotenv()

def run_tests():
    db = SessionLocal()
    try:
        # Get Ward 1
        ward = db.query(models.Ward).filter(models.Ward.name == "Ward 1").first()
        if not ward:
            print("Ward 1 not found in database. Run seed_data.py first.")
            return
            
        print("Inserting sample testing submissions...")
        samples = [
            ("#TEST-EN", "There are huge potholes on the road near primary school in Ward 1. It is very dangerous."),
            ("#TEST-HI", "वार्ड 1 के प्राथमिक स्कूल के पास सड़क पर बहुत बड़े गड्ढे हैं। यह बहुत खतरनाक है।"),
            ("#TEST-GU", "વૉર્ડ 1 માં પ્રાથમિક શાળા નજીક રસ્તા પર મોટા ખાડાઓ છે. આ બહુ જોખમી છે.")
        ]
        
        db_subs = []
        for sub_id, desc in samples:
            # Clean old test cases if they exist
            existing = db.query(models.CitizenSubmission).filter(models.CitizenSubmission.id == sub_id).first()
            if existing:
                db.query(models.AIAnalysis).filter(models.AIAnalysis.submission_id == sub_id).delete()
                db.delete(existing)
            db.commit()
            
            sub = models.CitizenSubmission(
                id=sub_id,
                category="Road Repair",
                ward_id=ward.id,
                description=desc,
                sentiment="Neutral",
                status="Pending"
            )
            db.add(sub)
            db_subs.append(sub)
            
        db.commit()
        for s in db_subs:
            db.refresh(s)
            
        print("Running AI Processing Pipeline on all three languages...")
        pipeline = AIPipeline()
        
        for sub in db_subs:
            print(f"\n--- Processing {sub.id} ---")
            print(f"Original Text: {sub.description}")
            result = pipeline.process(db, sub)
            
            print(f"Detected Lang: {result['detected_language']}")
            print(f"English Translation: {result['english_translation']}")
            print(f"Assigned Category: {result['category']}")
            print(f"Sentiment: {result['sentiment']} | Urgency: {result['urgency_score']}")
            print(f"Cluster Assigned: {result['cluster_name']}")
            print(f"Summary: {result['summary']}")
            print(f"Priority Score: {result['priority']['priority_score']}")
            print(f"Breakdown: {result['priority']['breakdown']}")
            print(f"Reason: {result['priority']['reason']}")
            
        print("\nAll pipeline tests completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
