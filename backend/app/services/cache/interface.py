from abc import ABC, abstractmethod
from typing import Optional, Any, Dict

class BaseCacheProvider(ABC):
    @abstractmethod
    def get(self, key: str) -> Optional[Any]:
        """
        Retrieves an item from the cache.
        Returns None if key is missing or expired.
        """
        pass

    @abstractmethod
    def set(self, key: str, value: Any, ttl_seconds: int) -> bool:
        """
        Sets an item in the cache with a specified TTL.
        """
        pass

    @abstractmethod
    def delete(self, key: str) -> bool:
        """
        Deletes an item from the cache.
        """
        pass

    @abstractmethod
    def clear(self) -> bool:
        """
        Clears all items in the cache.
        """
        pass

    @abstractmethod
    def get_metrics(self) -> Dict[str, Any]:
        """
        Returns metrics counters (hits, misses, set_count, size).
        """
        pass
