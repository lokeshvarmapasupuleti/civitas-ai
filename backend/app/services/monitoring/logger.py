import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional

class StructuredLogger:
    def __init__(self, name: str):
        self.name = name

    def _log(self, level: str, message: str, context: Optional[Dict[str, Any]] = None):
        record = {
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "level": level,
            "logger": self.name,
            "message": message
        }
        if context:
            record["context"] = context
            
        sys.stdout.write(json.dumps(record) + "\n")
        sys.stdout.flush()

    def info(self, message: str, context: Optional[Dict[str, Any]] = None):
        self._log("INFO", message, context)

    def warn(self, message: str, context: Optional[Dict[str, Any]] = None):
        self._log("WARN", message, context)

    def error(self, message: str, context: Optional[Dict[str, Any]] = None):
        self._log("ERROR", message, context)

    def debug(self, message: str, context: Optional[Dict[str, Any]] = None):
        self._log("DEBUG", message, context)
