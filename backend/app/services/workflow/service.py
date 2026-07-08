import os
import sqlite3
import logging
from datetime import datetime, timedelta
from typing import List, Optional

from app.services.workflow.models import (
    WorkflowState,
    WorkflowInstance,
    WorkflowAuditLogItem
)
from app.services.workflow.state_machine import WorkflowStateMachine

logger = logging.getLogger("services.workflow.service")

class WorkflowService:
    def __init__(self, db_path: str = None):
        # Set database path in local module folder
        if db_path is None:
            module_dir = os.path.dirname(os.path.abspath(__file__))
            db_path = os.path.join(module_dir, "workflow.db")
            
        self.db_path = db_path
        self.state_machine = WorkflowStateMachine()
        
        # Initialize SQLite database
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS workflow_instances (
                    grievance_id TEXT PRIMARY KEY,
                    current_state TEXT NOT NULL,
                    assigned_officer TEXT,
                    assigned_department TEXT,
                    sla_deadline TEXT,
                    escalation_level INTEGER DEFAULT 0,
                    created_at TEXT NOT NULL
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS workflow_audit_log (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    grievance_id TEXT NOT NULL,
                    from_state TEXT NOT NULL,
                    to_state TEXT NOT NULL,
                    triggered_by TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    comment TEXT,
                    officer TEXT,
                    department TEXT
                )
            """)
            conn.commit()
        finally:
            conn.close()

    def create_instance(self, grievance_id: str, department: str = None) -> WorkflowInstance:
        conn = sqlite3.connect(self.db_path)
        try:
            cursor = conn.cursor()
            
            # Check if instance already exists
            cursor.execute("SELECT grievance_id FROM workflow_instances WHERE grievance_id = ?", (grievance_id,))
            if cursor.fetchone():
                raise ValueError(f"Workflow instance for grievance {grievance_id} already exists.")
                
            created_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
            # Default SLA is 3 days
            sla_deadline = (datetime.utcnow() + timedelta(days=3)).strftime("%Y-%m-%d %H:%M:%S UTC")
            
            cursor.execute("""
                INSERT INTO workflow_instances (
                    grievance_id, current_state, assigned_department, sla_deadline, created_at
                ) VALUES (?, ?, ?, ?, ?)
            """, (
                grievance_id,
                WorkflowState.SUBMITTED.value,
                department,
                sla_deadline,
                created_at
            ))
            
            # Add audit entry
            cursor.execute("""
                INSERT INTO workflow_audit_log (
                    grievance_id, from_state, to_state, triggered_by, timestamp, comment, department
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                grievance_id,
                "None",
                WorkflowState.SUBMITTED.value,
                "System",
                created_at,
                "Grievance submitted by citizen.",
                department
            ))
            
            conn.commit()
            
            return WorkflowInstance(
                grievance_id=grievance_id,
                current_state=WorkflowState.SUBMITTED,
                assigned_department=department,
                sla_deadline=sla_deadline,
                escalation_level=0,
                created_at=created_at
            )
        finally:
            conn.close()

    def get_instance(self, grievance_id: str) -> Optional[WorkflowInstance]:
        conn = sqlite3.connect(self.db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT grievance_id, current_state, assigned_officer, assigned_department, sla_deadline, escalation_level, created_at
                FROM workflow_instances
                WHERE grievance_id = ?
            """, (grievance_id,))
            row = cursor.fetchone()
            if not row:
                return None
                
            return WorkflowInstance(
                grievance_id=row[0],
                current_state=WorkflowState(row[1]),
                assigned_officer=row[2],
                assigned_department=row[3],
                sla_deadline=row[4],
                escalation_level=row[5],
                created_at=row[6]
            )
        finally:
            conn.close()

    def transition_state(
        self,
        grievance_id: str,
        to_state: WorkflowState,
        triggered_by: str,
        officer: str = None,
        department: str = None,
        comment: str = None
    ) -> bool:
        conn = sqlite3.connect(self.db_path)
        try:
            cursor = conn.cursor()
            
            # Get current instance
            cursor.execute("""
                SELECT current_state, assigned_officer, assigned_department
                FROM workflow_instances
                WHERE grievance_id = ?
            """, (grievance_id,))
            row = cursor.fetchone()
            if not row:
                raise ValueError(f"Workflow instance {grievance_id} not found.")
                
            from_state = WorkflowState(row[0])
            current_officer = row[1]
            current_dept = row[2]
            
            # Validate state transition
            if not self.state_machine.is_valid_transition(from_state, to_state):
                raise ValueError(f"Invalid transition from state '{from_state.value}' to state '{to_state.value}'.")
                
            # Update fields if provided, otherwise keep existing
            updated_officer = officer if officer is not None else current_officer
            updated_dept = department if department is not None else current_dept
            
            timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
            
            # Update instance state
            cursor.execute("""
                UPDATE workflow_instances
                SET current_state = ?, assigned_officer = ?, assigned_department = ?
                WHERE grievance_id = ?
            """, (to_state.value, updated_officer, updated_dept, grievance_id))
            
            # Log audit entry
            cursor.execute("""
                INSERT INTO workflow_audit_log (
                    grievance_id, from_state, to_state, triggered_by, timestamp, comment, officer, department
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                grievance_id,
                from_state.value,
                to_state.value,
                triggered_by,
                timestamp,
                comment,
                updated_officer,
                updated_dept
            ))
            
            conn.commit()
            return True
        finally:
            conn.close()

    def escalate_grievance(self, grievance_id: str, comments: str = None) -> bool:
        conn = sqlite3.connect(self.db_path)
        try:
            cursor = conn.cursor()
            
            cursor.execute("SELECT escalation_level, current_state, assigned_officer, assigned_department FROM workflow_instances WHERE grievance_id = ?", (grievance_id,))
            row = cursor.fetchone()
            if not row:
                raise ValueError(f"Workflow instance {grievance_id} not found.")
                
            current_esc = row[0]
            current_state = row[1]
            current_officer = row[2]
            current_dept = row[3]
            
            new_esc = current_esc + 1
            timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
            
            cursor.execute("UPDATE workflow_instances SET escalation_level = ? WHERE grievance_id = ?", (new_esc, grievance_id))
            
            cursor.execute("""
                INSERT INTO workflow_audit_log (
                    grievance_id, from_state, to_state, triggered_by, timestamp, comment, officer, department
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                grievance_id,
                current_state,
                current_state,
                "SLA Monitor",
                timestamp,
                f"Escalation Level raised to {new_esc}. Details: {comments or 'Timeline breached.'}",
                current_officer,
                current_dept
            ))
            
            conn.commit()
            return True
        finally:
            conn.close()

    def get_history(self, grievance_id: str) -> List[WorkflowAuditLogItem]:
        conn = sqlite3.connect(self.db_path)
        history = []
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, grievance_id, from_state, to_state, triggered_by, timestamp, comment, officer, department
                FROM workflow_audit_log
                WHERE grievance_id = ?
                ORDER BY id ASC
            """, (grievance_id,))
            
            rows = cursor.fetchall()
            for row in rows:
                history.append(WorkflowAuditLogItem(
                    id=row[0],
                    grievance_id=row[1],
                    from_state=row[2],
                    to_state=row[3],
                    triggered_by=row[4],
                    timestamp=row[5],
                    comment=row[6],
                    officer=row[7],
                    department=row[8]
                ))
        finally:
            conn.close()
            
        return history

    def clear_history(self):
        conn = sqlite3.connect(self.db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM workflow_instances")
            cursor.execute("DELETE FROM workflow_audit_log")
            conn.commit()
        finally:
            conn.close()
