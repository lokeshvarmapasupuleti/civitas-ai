import functools
import logging
from typing import Optional, Any, Dict
from app.services.cache.interface import BaseCacheProvider
from app.services.cache.providers import InMemoryCacheProvider, MockRedisCacheProvider

logger = logging.getLogger("services.cache.service")

class CacheService:
    _instance: Optional['CacheService'] = None
    _provider: Optional[BaseCacheProvider] = None

    def __init__(self, provider: Optional[BaseCacheProvider] = None):
        if provider is None:
            provider = InMemoryCacheProvider()
        self._provider = provider

    @classmethod
    def get_instance(cls) -> 'CacheService':
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @classmethod
    def set_global_provider(cls, provider: BaseCacheProvider):
        cls.get_instance()._provider = provider
        logger.info(f"Global cache provider updated to: {provider.__class__.__name__}")

    def get(self, key: str) -> Optional[Any]:
        res = self._provider.get(key)
        if res is not None and isinstance(res, dict) and "value" in res:
            return res["value"]
        return None

    def set(self, key: str, value: Any, ttl_seconds: int = 300) -> bool:
        wrapper = {"value": value}
        return self._provider.set(key, wrapper, ttl_seconds)

    def delete(self, key: str) -> bool:
        return self._provider.delete(key)

    def clear(self) -> bool:
        return self._provider.clear()

    def get_metrics(self) -> Dict[str, Any]:
        return self._provider.get_metrics()

def cached(ttl_seconds: int = 300, key_prefix: str = "cache"):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Exclude self/cls from args string computation if methods are decorated
            # For simplicity, convert all arguments to deterministic strings
            args_repr = [repr(a) for a in args]
            kwargs_repr = [f"{k}={repr(v)}" for k, v in sorted(kwargs.items())]
            
            # Construct unique signature key
            args_str = ",".join(args_repr + kwargs_repr)
            key = f"{key_prefix}:{func.__module__}.{func.__name__}({args_str})"
            
            cache = CacheService.get_instance()
            cached_val = cache.get(key)
            if cached_val is not None:
                return cached_val
                
            val = func(*args, **kwargs)
            cache.set(key, val, ttl_seconds)
            return val
        return wrapper
    return decorator
