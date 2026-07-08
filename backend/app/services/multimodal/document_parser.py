from abc import ABC, abstractmethod
from pydantic import BaseModel, Field

class DocumentParserResult(BaseModel):
    extracted_text: str = Field(..., description="Extracted text from the document")
    page_count: int = Field(..., description="Number of pages parsed")
    metadata: dict = Field(default_factory=dict, description="Extracted document metadata properties")

class BaseDocumentParser(ABC):
    @abstractmethod
    def parse_document(self, file_bytes: bytes, filename: str) -> DocumentParserResult:
        pass

class MockDocumentParser(BaseDocumentParser):
    def parse_document(self, file_bytes: bytes, filename: str) -> DocumentParserResult:
        return DocumentParserResult(
            extracted_text=f"Municipal complaint document details from {filename}. Verified ward 3 bypass concerns.",
            page_count=1,
            metadata={"filename": filename, "format": "PDF"}
        )
