from abc import ABC, abstractmethod

class BaseLLMAssistant(ABC):
    @abstractmethod
    def query(self, question: str) -> str:
        """Sends a question to the LLM and returns the text response."""
        pass
