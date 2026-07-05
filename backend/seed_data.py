import os
import random
import sys
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Ensure we can import from app
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import SessionLocal, engine, Base
from app import models

load_dotenv()

def seed_db():
    db = SessionLocal()
    try:
        print("Clearing existing data...")
        db.query(models.AIAnalysis).delete()
        db.query(models.CitizenSubmission).delete()
        db.query(models.Recommendation).delete()
        db.query(models.AICluster).delete()
        db.query(models.PublicDataset).delete()
        db.query(models.Ward).delete()
        db.commit()

        print("Seeding 12 Wards...")
        wards = []
        for i in range(1, 13):
            name = f"Ward {i}"
            # Coordinates centered around a Rajkot-like region
            lat = 22.3039 + (i * 0.005) - 0.03
            lng = 70.8022 + (i * 0.003) - 0.02
            
            demographics = {
                "population": random.randint(12000, 48000),
                "literacy_rate": round(random.uniform(68.0, 92.0), 1),
                "position": [lat, lng],
                "area_sq_km": round(random.uniform(2.5, 8.0), 1)
            }
            
            infrastructure_metrics = {
                "schools_count": random.randint(3, 12),
                "healthcare_facilities": random.randint(1, 5),
                "roads_condition_score": random.randint(3, 8),
                "avg_hospital_distance_km": round(random.uniform(1.2, 7.5), 1),
                "avg_school_distance_km": round(random.uniform(0.5, 3.2), 1)
            }
            
            ward = models.Ward(
                name=name,
                demographics=demographics,
                infrastructure_metrics=infrastructure_metrics
            )
            db.add(ward)
            wards.append(ward)
        db.commit()
        # Refresh to get IDs
        for w in wards:
            db.refresh(w)

        print("Seeding ~1200 Citizen Submissions and AI Analyses...")
        categories = ["Healthcare Access", "Sanitation", "Road Repair", "Street Lighting", "Water Supply", "Public Transport"]
        sentiments = ["Critical/Angry", "Concerned", "Emergency", "Neutral"]
        statuses = ["Pending", "In Progress", "Approved", "Completed"]
        
        # Descriptions template
        templates = {
            "Healthcare Access": [
                "Nearest health post is over {dist}km away. Emergency medical response is extremely delayed in {ward}.",
                "Primary health center has severe shortage of doctors. Long queues and lack of basic medicines in {ward}.",
                "Need an emergency ambulance station. High density sectors in {ward} have no quick transport to hospital."
            ],
            "Sanitation": [
                "Garbage overflow on main marketplace road in {ward} is causing foul smell and health hazards. Garbage trucks rarely visit.",
                "Open sewers near school area in {ward} are causing mosquito breeding. Immediate cleanup and piping needed.",
                "Public dustbins in {ward} are broken or missing. Littering is becoming a huge issue in residential parks."
            ],
            "Road Repair": [
                "The connector road in {ward} is full of potholes, causing frequent accidents. Needs resurfacing immediately.",
                "Water logging on the main street of {ward} due to choked drains during rains, damaging road quality.",
                "Access route leading to the local primary school in {ward} is unpaved, dusty in summer and mud-filled in monsoon."
            ],
            "Street Lighting": [
                "Dusk to dawn dark patches on main road in {ward}. Very unsafe for children and women returning late.",
                "Multiple street light bulbs are fused along highway route passing through {ward}. Visibility is extremely poor.",
                "Dark street lanes in {ward} are attracting anti-social elements. Need new LED light pole installation."
            ],
            "Water Supply": [
                "Water supply is received only once in 3 days for 30 minutes in parts of {ward}. Pressure is very low.",
                "Drinking water received from municipal line in {ward} is muddy and has foul smell. Pipeline repair needed.",
                "Severe groundwater depletion in {ward}. Need rainwater harvesting projects and municipal line extension."
            ],
            "Public Transport": [
                "Bus service frequency is low. Residents of {ward} wait for over 45 minutes during peak office hours.",
                "Need a bus shelter and designated stop near the sub-centre in {ward} to prevent boarding hazards.",
                "Absence of affordable public transit makes local auto-rickshaws charge exorbitant rates in {ward}."
            ]
        }

        submissions_to_add = []
        now = datetime.utcnow()

        for j in range(1200):
            ward = random.choice(wards)
            category = random.choice(categories)
            sentiment = random.choice(sentiments)
            # Make dates span over the last 90 days
            days_ago = random.randint(0, 90)
            date_submitted = now - timedelta(days=days_ago, hours=random.randint(0, 23))
            
            # Select description
            dist_val = round(random.uniform(4.5, 9.0), 1)
            desc_template = random.choice(templates[category])
            description = desc_template.format(dist=dist_val, ward=ward.name)
            
            status = random.choice(statuses)
            
            sub_id = f"#PP-{j+8000}"
            
            reporter = random.choice([
                "Aravind Kumar", "Sunita Sharma", "Rahul Patel", "Deepika Rao",
                "Rajesh Mehta", "Pooja Shah", "Anil Mishra", "Vikram Singh",
                None, None # 20% Anonymous
            ])

            submission = models.CitizenSubmission(
                id=sub_id,
                category=category,
                ward_id=ward.id,
                description=description,
                reporter_name=reporter,
                sentiment=sentiment,
                date=date_submitted,
                status=status
            )
            submissions_to_add.append(submission)

        db.add_all(submissions_to_add)
        db.commit()

        # Generate corresponding AI Analyses (batching to avoid massive memory load)
        print("Generating corresponding AI Analyses...")
        analyses_to_add = []
        for sub in submissions_to_add:
            confidence = round(random.uniform(0.82, 0.99), 2)
            urgency = round(random.uniform(0.40, 0.98), 2)
            
            analysis = models.AIAnalysis(
                submission_id=sub.id,
                summary=f"AI Summary: Request regards '{sub.category}' in {sub.ward.name}. Demand density in this sector is high.",
                extracted_needs=[sub.category.lower(), "ward_need"],
                confidence_score=confidence,
                urgency_score=urgency
            )
            analyses_to_add.append(analysis)
            
        db.add_all(analyses_to_add)
        db.commit()

        print("Seeding 80 AI Recommendations...")
        recommendation_templates = [
            ("Upgrade Primary School Infrastructure", "Primary school building renovation, sanitation facility building, and classroom expansions.", "₹25 Lakhs", "800 students"),
            ("Build Community Health Centre", "New sub-centre setup with basic diagnostic facilities and emergency unit.", "₹60 Lakhs", "15,000 residents"),
            ("Repair Internal Roads", "Resurfacing of main lanes with standard asphalt and concrete drains.", "₹35 Lakhs", "6,000 residents"),
            ("Install Street Lighting", "Erection of 120 new LED street lights in high priority dark zones.", "₹15 Lakhs", "9,500 residents"),
            ("Extend Drinking Water Pipeline", "New distribution line connection from headworks with metered taps.", "₹45 Lakhs", "12,000 residents"),
            ("Construct Drainage Network", "Concrete stormwater drainage network installation to prevent seasonal waterlogging.", "₹50 Lakhs", "8,000 residents"),
            ("Optimize Public Transit Bus Routes", "Introduction of 4 mini-bus shuttle routes linking transit hubs.", "₹20 Lakhs", "4,500 commuters"),
            ("Renovate Public Sanitation Block", "Reconstruction of public toilets with greywater recycling facility.", "₹18 Lakhs", "3,000 people daily")
        ]

        recs_to_add = []
        for k in range(80):
            ward = random.choice(wards)
            rec_tpl = random.choice(recommendation_templates)
            title_prefix, desc_detail, budget, impact = rec_tpl
            title = f"{title_prefix} in {ward.name}"
            
            score = random.randint(72, 98)
            risk = random.choice(["Low", "Medium", "High"])
            completion = f"{random.randint(4, 18)} months"
            
            ai_reasoning = (
                f"Highly recommended due to {score}% aggregate demand index in {ward.name}. "
                f"Addresses critical gap: {desc_detail} Expected impact is high ({impact}) with a moderate budget footprint ({budget})."
            )

            rec = models.Recommendation(
                title=title,
                ward_id=ward.id,
                score=score,
                budget=budget,
                impact=impact,
                completion_time=completion,
                risk_level=risk,
                ai_reasoning=ai_reasoning
            )
            recs_to_add.append(rec)
            
        db.add_all(recs_to_add)
        db.commit()

        print("Seeding 12 AI Clusters...")
        cluster_names = [
            ("School Accessibility & Safety", "Clustered reports about broken school boundaries and unpaved school paths."),
            ("Emergency Health Access Gap", "High density of health complaints with distance to nearest clinic exceeding 6km."),
            ("Commercial Road Potholes", "Pothole complaints clustered around the main marketplace and transport hubs."),
            ("Dark Spot Crime Prevention", "Correlated citizen reports linking dark lanes to vandalism and safety risks."),
            ("Contaminated Water Pipeline", "Multiple reports indicating muddy drinking water in adjacent sectors."),
            ("Peak-Hour Bus Commute Delay", "Clustered complaints regarding transit shortages during office and school rush hours.")
        ]

        clusters_to_add = []
        for idx, cl_tpl in enumerate(cluster_names):
            name, summary = cl_tpl
            for w_idx in range(1, 3): # 2 wards per cluster type
                ward_name = f"Ward {random.randint(1, 12)}"
                cluster = models.AICluster(
                    cluster_name=f"{ward_name} {name}",
                    summary=summary + f" Highly affects residential sectors in {ward_name}.",
                    submission_count=random.randint(15, 68),
                    ward=ward_name,
                    priority_score=random.randint(75, 96)
                )
                clusters_to_add.append(cluster)

        db.add_all(clusters_to_add)
        db.commit()

        print("Seeding Public Datasets...")
        dataset = models.PublicDataset(
            name="constituent_census_2026",
            dataset_type="demographics",
            data={
                "total_electorate": 350000,
                "urban_ratio": 0.82,
                "median_age": 29.4
            }
        )
        db.add(dataset)
        db.commit()

        print("Database seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
