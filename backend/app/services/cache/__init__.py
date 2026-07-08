# app/services/cache/__init__.py
from app.services.cache.interface import BaseCacheProvider
from app.services.cache.providers import InMemoryCacheProvider, MockRedisCacheProvider
from app.services.cache.service import CacheService, cached
