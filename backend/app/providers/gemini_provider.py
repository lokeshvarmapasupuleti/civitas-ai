"""
Gemini AI provider.

Supports both SDK variants:
  - Modern:  google-genai  (import google.genai)
  - Legacy:  google-generativeai  (import google.generativeai)

The modern SDK is tried first; if it is not installed the legacy SDK is used
instead.  If neither is available, or if the API call fails (e.g. quota
exceeded, invalid key), the call is transparently forwarded to the fallback
provider (MockAIProvider by default) and a warning is logged so the issue is
easy to diagnose.
"""

import logging
import mimetypes
from typing import List, Optional

from app.providers.base import BaseAIProvider
from app.providers.mock_provider import MockAIProvider

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# SDK detection – resolve once at import time
# ---------------------------------------------------------------------------
_GENAI_MODERN = False   # google.genai  (google-genai package)
_GENAI_LEGACY = False   # google.generativeai  (google-generativeai package)

try:
    import google.genai as _genai_modern_mod  # noqa: F401
    _GENAI_MODERN = True
    logger.debug("Gemini: using modern google.genai SDK")
except ImportError:
    try:
        import google.generativeai as _genai_legacy_mod  # noqa: F401
        _GENAI_LEGACY = True
        logger.debug("Gemini: using legacy google.generativeai SDK")
    except ImportError:
        logger.warning(
            "Gemini: neither google-genai nor google-generativeai is installed. "
            "All calls will fall back to the mock provider."
        )


# ---------------------------------------------------------------------------
# Helper – build a configured client/module for the active SDK
# ---------------------------------------------------------------------------

def _get_genai(api_key: str):
    """
    Return a ready-to-use genai module/client configured with *api_key*.

    Returns ``(module_or_client, sdk_variant)`` where sdk_variant is
    ``"modern"`` or ``"legacy"``.  Raises ``ImportError`` if no SDK is
    available.
    """
    if _GENAI_MODERN:
        import google.genai as genai  # type: ignore
        client = genai.Client(api_key=api_key)
        return client, "modern"
    if _GENAI_LEGACY:
        import google.generativeai as genai  # type: ignore
        genai.configure(api_key=api_key)
        return genai, "legacy"
    raise ImportError("No Gemini SDK installed.")


# ---------------------------------------------------------------------------
# Provider
# ---------------------------------------------------------------------------

class GeminiProvider(BaseAIProvider):
    """AI provider backed by Google Gemini."""

    _CHAT_MODEL = "gemini-2.5-flash"
    _EMBED_MODEL = "models/text-embedding-004"

    def __init__(
        self,
        api_key: Optional[str] = None,
        fallback: Optional[BaseAIProvider] = None,
    ):
        self.api_key = api_key
        self.fallback = fallback or MockAIProvider()

        if not self.api_key:
            logger.warning(
                "GeminiProvider initialised without an API key — "
                "all calls will be handled by the fallback provider."
            )
        if not (_GENAI_MODERN or _GENAI_LEGACY):
            logger.warning(
                "GeminiProvider initialised but no Gemini SDK is installed — "
                "all calls will be handled by the fallback provider."
            )

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _ready(self) -> bool:
        """True when we have a key and at least one SDK is available."""
        return bool(self.api_key) and (_GENAI_MODERN or _GENAI_LEGACY)

    def _generate(self, parts: list, model: str = _CHAT_MODEL) -> str:
        """
        Call generate_content via whichever SDK is active and return the
        response text.  Raises on error so callers can catch and fall back.
        """
        client_or_mod, variant = _get_genai(self.api_key)

        if variant == "modern":
            response = client_or_mod.models.generate_content(
                model=model,
                contents=parts,
            )
            return response.text

        # legacy
        model_obj = client_or_mod.GenerativeModel(model_name=model)
        response = model_obj.generate_content(parts)
        return response.text

    def _generate_with_system(
        self, prompt: str, system_instruction: Optional[str], model: str = _CHAT_MODEL
    ) -> str:
        """generate_content with an optional system instruction."""
        client_or_mod, variant = _get_genai(self.api_key)

        if variant == "modern":
            config = {}
            if system_instruction:
                config["system_instruction"] = system_instruction
            response = client_or_mod.models.generate_content(
                model=model,
                contents=prompt,
                config=config or None,
            )
            return response.text

        # legacy
        model_obj = client_or_mod.GenerativeModel(
            model_name=model,
            system_instruction=system_instruction,
        )
        response = model_obj.generate_content(prompt)
        return response.text

    # ------------------------------------------------------------------
    # BaseAIProvider interface
    # ------------------------------------------------------------------

    def chat(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        if not self._ready():
            return self.fallback.chat(prompt, system_instruction)
        try:
            return self._generate_with_system(prompt, system_instruction)
        except Exception as exc:
            logger.warning("GeminiProvider.chat failed (%s) — using fallback.", exc)
            return self.fallback.chat(prompt, system_instruction)

    def get_embedding(self, text: str) -> List[float]:
        if not self._ready():
            return self.fallback.get_embedding(text)
        try:
            client_or_mod, variant = _get_genai(self.api_key)
            if variant == "modern":
                response = client_or_mod.models.embed_content(
                    model=self._EMBED_MODEL,
                    contents=text,
                )
                return response.embeddings[0].values
            # legacy
            response = client_or_mod.embed_content(
                model=self._EMBED_MODEL,
                content=text,
            )
            return response["embedding"]
        except Exception as exc:
            logger.warning("GeminiProvider.get_embedding failed (%s) — using fallback.", exc)
            return self.fallback.get_embedding(text)

    def analyze_image(self, image_bytes: bytes, prompt: str) -> str:
        if not self._ready() or not image_bytes:
            return self.fallback.analyze_image(image_bytes, prompt)
        try:
            mime_type = mimetypes.guess_type("image.jpg")[0] or "image/jpeg"
            image_part = {"mime_type": mime_type, "data": image_bytes}
            result = self._generate([prompt, image_part])
            return result or self.fallback.analyze_image(image_bytes, prompt)
        except Exception as exc:
            logger.warning("GeminiProvider.analyze_image failed (%s) — using fallback.", exc)
            return self.fallback.analyze_image(image_bytes, prompt)

    def ocr(self, image_bytes: bytes) -> str:
        if not self._ready() or not image_bytes:
            return self.fallback.ocr(image_bytes)
        try:
            mime_type = mimetypes.guess_type("image.jpg")[0] or "image/jpeg"
            image_part = {"mime_type": mime_type, "data": image_bytes}
            ocr_prompt = (
                "Extract all text visible in this image. "
                "Return only the extracted text, nothing else."
            )
            result = self._generate([ocr_prompt, image_part])
            return result or self.fallback.ocr(image_bytes)
        except Exception as exc:
            logger.warning("GeminiProvider.ocr failed (%s) — using fallback.", exc)
            return self.fallback.ocr(image_bytes)

    def speech_to_text(self, audio_bytes: bytes) -> str:
        if not self._ready() or not audio_bytes:
            return self.fallback.speech_to_text(audio_bytes)
        try:
            mime_type = mimetypes.guess_type("audio.wav")[0] or "audio/wav"
            audio_part = {"mime_type": mime_type, "data": audio_bytes}
            transcribe_prompt = (
                "Transcribe the speech in this audio. "
                "Return only the transcribed text, nothing else."
            )
            result = self._generate([transcribe_prompt, audio_part])
            return result or self.fallback.speech_to_text(audio_bytes)
        except Exception as exc:
            logger.warning("GeminiProvider.speech_to_text failed (%s) — using fallback.", exc)
            return self.fallback.speech_to_text(audio_bytes)

    def summarize(self, text: str) -> str:
        return self.chat(f"Summarize the following text:\n\n{text}")

    def classify(self, text: str, categories: List[str]) -> str:
        prompt = (
            f"Classify this text into exactly one of these categories: "
            f"{', '.join(categories)}.\n\nText: {text}\n\n"
            f"Reply with only the category name."
        )
        return self.chat(prompt)
