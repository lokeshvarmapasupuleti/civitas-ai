import logging
import re

logger = logging.getLogger("ai_pipeline.language_detection")

class LanguageDetector:
    def detect(self, text: str) -> str:
        logger.info("Language Detection Stage Started...")
        
        # Check Devanagari script for Hindi: Unicode range U+0900 to U+097F
        if re.search(r"[\u0900-\u097F]", text):
            logger.info("Language Detection: Detected Hindi (hi)")
            return "hi"
            
        # Check Gujarati script: Unicode range U+0A80 to U+0AFF
        elif re.search(r"[\u0a80-\u0aff]", text):
            logger.info("Language Detection: Detected Gujarati (gu)")
            return "gu"
            
        logger.info("Language Detection: Detected English (en)")
        return "en"
