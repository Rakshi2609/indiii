import logging
from abc import ABC, abstractmethod
from typing import Optional
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

class TransliterationProvider(ABC):
    """Abstract interface for transliteration providers."""
    
    @abstractmethod
    async def transliterate(self, text: str, source_lang: str) -> str:
        """Transliterate Indic text to English (identity preserving)."""
        pass


class RulesBasedTransliterator(TransliterationProvider):
    """
    A deterministic fallback transliterator using phonetic character mapping
    for basic Devanagari and Tamil to Latin script conversion.
    """
    
    DEVANAGARI_MAP = {
        'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri',
        'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
        'क': 'ka', 'ख': 'kha', 'ग': 'ga', 'घ': 'gha', 'ङ': 'nga',
        'च': 'cha', 'छ': 'chha', 'ज': 'ja', 'झ': 'jha', 'ञ': 'nya',
        'ट': 'ta', 'ठ': 'tha', 'ड': 'da', 'ढ': 'dha', 'ण': 'na',
        'त': 'ta', 'थ': 'tha', 'द': 'da', 'ध': 'dha', 'न': 'na',
        'प': 'pa', 'फ': 'pha', 'ब': 'ba', 'भ': 'bha', 'म': 'ma',
        'य': 'ya', 'र': 'ra', 'ल': 'la', 'व': 'va', 'श': 'sha', 'ष': 'sha', 'स': 'sa', 'ह': 'ha',
        'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
        'ं': 'n', 'ः': 'h', '्': '', 'क्षत्रिय': 'ksh', 'ज्ञ': 'gya'
    }

    TAMIL_MAP = {
        'அ': 'a', 'ஆ': 'aa', 'இ': 'i', 'ஈ': 'ee', 'உ': 'u', 'ஊ': 'oo',
        'எ': 'e', 'ஏ': 'ae', 'ஐ': 'ai', 'ஒ': 'o', 'ஓ': 'oe', 'ஔ': 'au',
        'க': 'ka', 'ங': 'nga', 'ச': 'cha', 'ஞ': 'nya', 'ட': 'ta', 'ண': 'na',
        'த': 'ta', 'ந': 'na', 'ப': 'pa', 'ம': 'ma', 'ய': 'ya', 'ர': 'ra',
        'ல': 'la', 'வ': 'va', 'ழ': 'zha', 'ள': 'la', 'ற': 'ra', 'ன': 'na',
        'ா': 'a', 'ி': 'i', 'ீ': 'ee', 'ு': 'u', 'ூ': 'oo', 'ெ': 'e', 'ே': 'ae', 'ை': 'ai', 'ொ': 'o', 'ோ': 'oe', 'ௌ': 'au',
        '்': ''
    }

    def transliterate(self, text: str, source_lang: str) -> str:
        if not text:
            return ""
        
        result = []
        mapping = self.DEVANAGARI_MAP if source_lang in ["mr", "hi", "devanagari"] else self.TAMIL_MAP
        
        # Check if text contains Indic characters, otherwise return as is
        is_indic = any(ord(char) > 127 for char in text)
        if not is_indic:
            return text

        i = 0
        while i < len(text):
            char = text[i]
            # Match multi-character rules if any
            if i + 1 < len(text) and text[i:i+2] in mapping:
                result.append(mapping[text[i:i+2]])
                i += 2
            elif char in mapping:
                result.append(mapping[char])
                i += 1
            else:
                result.append(char)
                i += 1
                
        # Capitalize words
        res_str = "".join(result)
        return " ".join([word.capitalize() for word in res_str.split()])


class SarvamTransliterationProvider(TransliterationProvider):
    """Uses Sarvam's translation/transliteration API backend."""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.fallback = RulesBasedTransliterator()

    async def transliterate(self, text: str, source_lang: str) -> str:
        # If API key is invalid/placeholder, use rules fallback
        if not self.api_key or self.api_key.startswith("your_"):
            return self.fallback.transliterate(text, source_lang)

        url = "https://api.sarvam.ai/translate"
        headers = {
            "api-subscription-key": self.api_key,
            "Content-Type": "application/json"
        }
        
        # For transliteration, we can prompt translation to output phonetics,
        # or use transliteration mode if available. Sarvam's translate API can act as a fallback translation.
        payload = {
            "input": text,
            "source_language_code": f"{source_lang}-IN",
            "target_language_code": "en-IN"
        }
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(url, headers=headers, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    return data.get("translated_text", text)
        except Exception as e:
            logger.warning(f"Sarvam transliteration failed: {e}. Using rule-based fallback.")
            
        return self.fallback.transliterate(text, source_lang)


class TransliterationService:
    def __init__(self):
        self.provider: TransliterationProvider = SarvamTransliterationProvider(settings.SARVAM_API_KEY)

    async def transliterate_name(self, text: str, lang: str = "mr") -> str:
        """Transliterates a personal name, village name, or address to preserve identity."""
        return await self.provider.transliterate(text, lang)

    def translate_text(self, text: str, source_lang: str) -> str:
        """Semantic translation (unimplemented mock fallback wrapper for future extensions)."""
        # Just return the text with annotation for now
        return text

# Singleton instance
transliteration_service = TransliterationService()
