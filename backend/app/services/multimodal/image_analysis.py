from abc import ABC, abstractmethod
from typing import List
from pydantic import BaseModel, Field
from app.providers.factory import AIProviderFactory

class DetectedObject(BaseModel):
    label: str = Field(..., description="The name of the detected object (e.g. Potholes, Garbage)")
    confidence: float = Field(..., description="Detection confidence score (0.0 to 1.0)")
    box: List[float] = Field(default_factory=list, description="Bounding coordinates [ymin, xmin, ymax, xmax]")

class ImageAnalysisResult(BaseModel):
    detected_objects: List[DetectedObject] = Field(..., description="List of municipal hazards or assets detected")

class BaseImageAnalyzer(ABC):
    @abstractmethod
    def analyze_image(self, image_bytes: bytes) -> ImageAnalysisResult:
        pass

class MockImageAnalyzer(BaseImageAnalyzer):
    def analyze_image(self, image_bytes: bytes) -> ImageAnalysisResult:
        length = len(image_bytes)
        objects = []
        
        # Determine hazard type based on modulo of byte length to cover all requested classes
        mod = length % 4
        if mod == 0:
            objects.append(DetectedObject(label="Potholes", confidence=0.94, box=[0.4, 0.2, 0.8, 0.7]))
            objects.append(DetectedObject(label="Road damage", confidence=0.89, box=[0.3, 0.1, 0.9, 0.8]))
        elif mod == 1:
            objects.append(DetectedObject(label="Garbage", confidence=0.92, box=[0.5, 0.3, 0.9, 0.7]))
            objects.append(DetectedObject(label="Illegal dumping", confidence=0.85, box=[0.4, 0.2, 0.9, 0.8]))
        elif mod == 2:
            objects.append(DetectedObject(label="Water leakage", confidence=0.91, box=[0.6, 0.4, 0.8, 0.6]))
            objects.append(DetectedObject(label="Flooding", confidence=0.88, box=[0.5, 0.1, 0.9, 0.9]))
        else:
            objects.append(DetectedObject(label="Streetlight", confidence=0.95, box=[0.1, 0.4, 0.4, 0.6]))
            objects.append(DetectedObject(label="Electric pole", confidence=0.90, box=[0.0, 0.3, 0.9, 0.5]))
            
        return ImageAnalysisResult(detected_objects=objects)

class UnifiedImageAnalyzer(BaseImageAnalyzer):
    def analyze_image(self, image_bytes: bytes) -> ImageAnalysisResult:
        # Use the unified provider abstraction for image analysis
        provider = AIProviderFactory.get_provider()
        analysis_text = provider.analyze_image(image_bytes, "Identify municipal hazards or assets in this image. List detected objects with labels.")
        
        # Parse the analysis text into detected objects (simplified parsing)
        objects = []
        if "pothole" in analysis_text.lower():
            objects.append(DetectedObject(label="Potholes", confidence=0.85, box=[0.0, 0.0, 0.0, 0.0]))
        if "garbage" in analysis_text.lower() or "waste" in analysis_text.lower():
            objects.append(DetectedObject(label="Garbage", confidence=0.85, box=[0.0, 0.0, 0.0, 0.0]))
        if "water" in analysis_text.lower() or "leak" in analysis_text.lower():
            objects.append(DetectedObject(label="Water leakage", confidence=0.85, box=[0.0, 0.0, 0.0, 0.0]))
        if "light" in analysis_text.lower() or "streetlight" in analysis_text.lower():
            objects.append(DetectedObject(label="Streetlight", confidence=0.85, box=[0.0, 0.0, 0.0, 0.0]))
        
        # Fallback if no objects detected
        if not objects:
            objects.append(DetectedObject(label="General", confidence=0.5, box=[0.0, 0.0, 0.0, 0.0]))
        
        return ImageAnalysisResult(detected_objects=objects)
