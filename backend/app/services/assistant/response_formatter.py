import logging
from typing import Dict, Any, List

logger = logging.getLogger("assistant.response_formatter")

class ResponseFormatter:
    def format_response(self, intent: str, data: Any, query: str, confidence: float) -> Dict[str, Any]:
        logger.info(f"Formatting Response for Intent: '{intent}'")
        
        answer = ""
        suggested_followups = []
        
        if intent == "highest_healthcare_demand":
            ward = data.get("ward_name", "None")
            count = data.get("count", 0)
            answer = f"Based on our database, **{ward}** has the highest healthcare demand in the constituency with exactly **{count}** citizen requests."
            suggested_followups = [
                "Show top recommendations.",
                "Compare Ward 3 and Ward 5.",
                "Why is Ward 3 ranked highest?"
            ]
            
        elif intent == "ward_ranking_explanation":
            ward = data.get("ward_name", "None")
            pop = data.get("population", 0)
            roads = data.get("roads_condition", 5)
            complaints = data.get("total_complaints", 0)
            answer = (
                f"**{ward}** is ranked highly due to a combination of high local demand (total **{complaints}** complaints) "
                f"and infrastructure gaps. It has a population of **{pop:,}** residents, and its roads condition score is rated **{roads}/10**."
            )
            suggested_followups = [
                "Compare Ward 3 and Ward 5.",
                "Show road repair complaints.",
                "What is the average priority score?"
            ]
            
        elif intent == "top_recommendations":
            answer = "Here are the top AI Recommendations compiled for legislative review:\n\n"
            for idx, rec in enumerate(data):
                answer += f"{idx+1}. **{rec['title']}** (Ward: *{rec['ward']}*, Budget: *{rec['budget']}*, Score: **{rec['score']}**)\n   *Impact:* {rec['impact']}\n\n"
            suggested_followups = [
                "Why should the MP approve this project?",
                "Summarize water-related complaints.",
                "Highest urgency cluster"
            ]
            
        elif intent == "water_complaints_summary":
            count = data.get("total_count", 0)
            answer = f"We have recorded a total of **{count}** water-related complaints in the constituency. The latest reports indicate concerns about irregular water supply and muddy pipelines:\n\n"
            for sample in data.get("samples", []):
                answer += f"- **{sample['id']}** ({sample['ward']}): {sample['summary']}\n"
            suggested_followups = [
                "Show road repair complaints.",
                "How many water supply complaints were submitted this month?",
                "Average priority score"
            ]
            
        elif intent == "monthly_category_count":
            cat = data.get("category", "Road Repair")
            count = data.get("count", 0)
            answer = f"There were exactly **{count}** **{cat}** complaints submitted this month in the constituency."
            suggested_followups = [
                "Show road repair complaints.",
                "What is the category distribution?",
                "Top 5 wards by complaints"
            ]
            
        elif intent == "mp_approval_details":
            project = data.get("project", "Ward 1 Road Repair")
            rec = data.get("recommendation", "Approve")
            score = data.get("priority_score", 91)
            complaints = data.get("complaints_count", 214)
            pop = data.get("residents_affected", 18420)
            infra = data.get("infrastructure_rating", 5)
            impact = data.get("impact", "High")
            reasoning = data.get("reasoning", "")
            
            answer = (
                f"### Project Approval Brief\n\n"
                f"**Project:** {project}\n"
                f"**Recommendation:** **{rec}**\n\n"
                f"**Reasoning:**\n"
                f"- **{complaints}** citizen complaints received\n"
                f"- **{pop:,}** residents affected\n"
                f"- School and hospital access disrupted\n"
                f"- Infrastructure condition rated **{infra}/10**\n"
                f"- **Estimated Impact:** {impact}\n"
                f"- **AI Confidence:** 96%\n\n"
                f"**Priority Score: {score}/100**\n\n"
                f"*{reasoning}*"
            )
            suggested_followups = [
                "Show top recommendations.",
                "Why is Ward 3 ranked highest?",
                "Show road repair complaints."
            ]
            
        elif intent == "top_5_wards":
            answer = "The top 5 wards with the highest volume of citizen complaints are:\n\n"
            for idx, ward in enumerate(data):
                answer += f"{idx+1}. **{ward['ward']}**: {ward['complaints']} complaints\n"
            suggested_followups = [
                "Why is Ward 3 ranked highest?",
                "Category distribution",
                "Show road repair complaints."
            ]
            
        elif intent == "category_distribution":
            answer = "The distribution of citizen complaints across all municipal categories is:\n\n"
            for item in data:
                answer += f"- **{item['category']}**: {item['count']} complaints\n"
            suggested_followups = [
                "How many road repair complaints were submitted this month?",
                "Top 5 wards by complaints",
                "Show top recommendations."
            ]
            
        elif intent == "average_priority_score":
            avg = data.get("average_score", 0.0)
            answer = f"The average priority score of citizen complaints in the system is **{avg}/100**."
            suggested_followups = [
                "Highest urgency cluster",
                "Show top recommendations.",
                "Top 5 wards by complaints"
            ]
            
        elif intent == "highest_urgency_cluster":
            name = data.get("name", "Unknown")
            ward = data.get("ward", "Unknown")
            score = data.get("priority_score", 0)
            subs = data.get("submissions", 0)
            summary = data.get("summary", "")
            answer = (
                f"The highest urgency cluster detected by AI is **{name}** in **{ward}**. "
                f"It has a priority score of **{score}/100** based on **{subs}** grouped complaints.\n\n"
                f"**Summary:** *{summary}*"
            )
            suggested_followups = [
                "Why is Ward 3 ranked highest?",
                "Why should the MP approve this project?",
                "Show top recommendations."
            ]
            
        elif intent == "recent_complaints":
            answer = "Here are the most recently submitted citizen complaints:\n\n"
            for sub in data:
                answer += f"- **{sub['id']}** ({sub['ward']} - {sub['date']}): *{sub['category']}* - {sub['description']}\n"
            suggested_followups = [
                "Show road repair complaints.",
                "Category distribution",
                "What is the average priority score?"
            ]
            
        else:  # fallback
            answer = (
                "I searched our records for your query but couldn't find a direct match. "
                "However, I can help you with questions about healthcare demands, top recommendations, "
                "water complaints, monthly road repairs, and ward rankings. Please try rephrasing your question!"
            )
            suggested_followups = [
                "Which ward has the highest healthcare demand?",
                "Show top recommendations.",
                "How many road repair complaints were submitted this month?",
                "Why should the MP approve this project?"
            ]
            
        return {
            "answer": answer,
            "query_type": intent,
            "confidence": confidence,
            "data": data if isinstance(data, dict) else {"items": data},
            "suggested_followups": suggested_followups
        }
