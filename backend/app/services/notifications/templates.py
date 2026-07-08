from typing import Dict, Any, Tuple
from app.services.notifications.models import NotificationType

# Government-branded message subject and body templates
TEMPLATES: Dict[NotificationType, Tuple[str, str]] = {
    NotificationType.CRITICAL_GRIEVANCE: (
        "CRITICAL ALERT: Urgent Action Required - {ref_id}",
        "Hon'ble Officer, a critical grievance {ref_id} has been registered under category '{category}' in Ward '{ward}'. Description: '{description}'. Kindly inspect immediately."
    ),
    NotificationType.OFFICER_ASSIGNED: (
        "TASK ASSIGNMENT: Grievance {ref_id} Routed to your Desk",
        "Dear {officer_name}, you have been assigned as the resolving officer for grievance {ref_id} (Category: '{category}') in Ward '{ward}'. Estimated SLA target timeline: {sla}."
    ),
    NotificationType.SLA_REMINDER: (
        "SLA WARNING: Deadline Approaching - {ref_id}",
        "Attention Officer, the target SLA timeline of {sla} for resolving grievance {ref_id} is approaching its limit. Current Status: '{status}'. Please complete works or request approval extensions."
    ),
    NotificationType.ESCALATION: (
        "ESCALATION ALERT: Ticket {ref_id} Escalated",
        "Dear Assistant Commissioner, grievance {ref_id} has breached its assigned resolution timeline in Ward '{ward}' and is escalated to your division desk for immediate intervention."
    ),
    NotificationType.RESOLUTION_COMPLETED: (
        "RESOLUTION UPDATE: Grievance {ref_id} Resolved",
        "Dear Citizen {reporter_name}, your grievance {ref_id} regarding '{category}' in Ward '{ward}' has been marked as Resolved by the assigned officer. Thank you for using Civitas AI."
    ),
    NotificationType.CITIZEN_FEEDBACK: (
        "FEEDBACK RECEIVED: Citizen Review on {ref_id}",
        "Dear Officer, citizen feedback has been received for resolved grievance {ref_id}. Rating: {rating} Stars. Comments: '{comments}'."
    )
}

class TemplateEngine:
    def render(self, n_type: NotificationType, data: Dict[str, Any]) -> Tuple[str, str]:
        tpl = TEMPLATES.get(n_type)
        if not tpl:
            return "Civitas AI Notification", "General update regarding Civitas AI grievance tracking."
            
        subject_tpl, body_tpl = tpl
        
        # Safely render variables with fallback placeholders
        def safe_format(template: str, variables: Dict[str, Any]) -> str:
            # Gather all format placeholders in the string
            import re
            placeholders = re.findall(r"\{([a-zA-Z_0-9]+)\}", template)
            format_dict = {}
            for p in placeholders:
                format_dict[p] = str(variables.get(p, f"[{p.upper()}]"))
            return template.format(**format_dict)

        return safe_format(subject_tpl, data), safe_format(body_tpl, data)
