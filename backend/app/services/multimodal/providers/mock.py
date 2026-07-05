from app.services.multimodal.providers.base import BaseSpeechToText, BaseOCR

class MockSpeechToText(BaseSpeechToText):
    def transcribe(self, audio_bytes: bytes) -> str:
        return (
            "[Transcribed Audio]: The main road near the government primary school has massive potholes "
            "and requires urgent resurfacing. Children are finding it unsafe to commute."
        )

class MockOCR(BaseOCR):
    def extract_text(self, image_bytes: bytes) -> str:
        return (
            "[Scanned OCR Text]: Handwritten petition regarding drainage overflow issues on Street 4. "
            "Stagnant water is causing severe hygiene concerns for local residents."
        )
