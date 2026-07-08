import time
from typing import Optional, Any, Dict
from app.services.cache.interface import BaseCacheProvider

class InMemoryCacheProvider(BaseCacheProvider):
    def __init__(self):
        self._store: Dict[str, tuple[Any, float]] = {}  # key -> (value, expires_at)
        self.hits = 0
        self.misses = 0
        self.set_count = 0

    def get(self, key: str) -> Optional[Any]:
        if key not in self._store:
            self.misses += 1
            return None
            
        value, expires_at = self._store[key]
        if time.time() > expires_at:
            # Automatic invalidation of expired cache keys
            del self._store[key]
            self.misses += 1
            return None
            
        self.hits += 1
        return value

    def set(self, key: str, value: Any, ttl_seconds: int) -> bool:
        expires_at = time.time() + ttl_seconds
        self._store[key] = (value, expires_at)
        self.set_count += 1
        return True

    def delete(self, key: str) -> bool:
        if key in self._store:
            del self._store[key]
            return True
        return False

    def clear(self) -> bool:
        self._store.clear()
        self.hits = 0
        self.misses = 0
        self.set_count = 0
        return True

    def get_metrics(self) -> Dict[str, Any]:
        # Filter out expired items for size count
        now = time.time()
        active_keys = [k for k, (_, exp) in self._store.items() if now <= exp]
        
        return {
            "hits": self.hits,
            "misses": self.misses,
            "set_count": self.set_count,
            "size": len(active_keys)
        }

class MockRedisCacheProvider(BaseCacheProvider):
    def __init__(self):
        # Redis stores data mapped as string serialized or direct representation
        self._store: Dict[str, tuple[Any, float]] = {}
        self.hits = 0
        self.misses = 0
        self.set_count = 0

    def get(self, key: str) -> Optional[Any]:
        # Simulate minor network latency ~1ms
        time.sleep(0.001)
        
        if key not in self._store:
            self.misses += 1
            return None
            
        value, expires_at = self._store[key]
        if time.time() > expires_at:
            del self._store[key]
            self.misses += 1
            return None
            
        self.hits += 1
        return value

    def set(self, key: str, value: Any, ttl_seconds: int) -> bool:
        time.sleep(0.001)
        expires_at = time.time() + ttl_seconds
        self._store[key] = (value, expires_at)
        self.set_count += 1
        return True

    def delete(self, key: str) -> bool:
        time.sleep(0.001)
        if key in self._store:
            del self._store[key]
            return True
        return False

    def clear(self) -> bool:
        self._store.clear()
        self.hits = 0
        self.misses = 0
        self.set_count = 0
        return True

    def get_metrics(self) -> Dict[str, Any]:
        now = time.time()
        active_keys = [k for k, (_, exp) in self._store.items() if now <= exp]
        return {
            "hits": self.hits,
            "misses": self.misses,
            "set_count": self.set_count,
            "size": len(active_keys),
            "connection_status": "connected",
            "redis_version": "7.0.12"
        }
