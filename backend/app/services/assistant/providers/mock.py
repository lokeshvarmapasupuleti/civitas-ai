from app.services.assistant.providers.base import BaseLLMAssistant

class MockLLMAssistant(BaseLLMAssistant):
    def query(self, question: str) -> str:
        return f"[Mock LLM Response] Answer to: '{question}' using mock LLM generation."
