import pytest
import time
from app.services.cache import CacheService, InMemoryCacheProvider, MockRedisCacheProvider, cached

def test_cache_providers_basic_operations():
    for provider in [InMemoryCacheProvider(), MockRedisCacheProvider()]:
        # 1. Test set and get
        assert provider.set("test_key", "value_123", ttl_seconds=10) is True
        
        # We wrap in dict inside service, but raw provider sets directly
        assert provider.get("test_key") == "value_123"
        
        # 2. Test delete
        assert provider.delete("test_key") is True
        assert provider.get("test_key") is None
        
        # 3. Test clear
        provider.set("k1", "v1", 10)
        provider.set("k2", "v2", 10)
        assert provider.clear() is True
        assert provider.get("k1") is None
        assert provider.get("k2") is None

def test_cache_ttl_invalidation():
    provider = InMemoryCacheProvider()
    # Set with 0.1 second TTL
    provider.set("short_key", "temp_value", ttl_seconds=1)
    assert provider.get("short_key") == "temp_value"
    
    # Wait for expiry
    time.sleep(1.1)
    
    # Verify automatically invalidated
    assert provider.get("short_key") is None
    
    metrics = provider.get_metrics()
    assert metrics["size"] == 0
    assert metrics["misses"] == 1

def test_cached_decorator():
    cache = CacheService.get_instance()
    cache.clear()
    
    call_count = 0
    
    @cached(ttl_seconds=5, key_prefix="test_dec")
    def calculate_cube(n: int) -> int:
        nonlocal call_count
        call_count += 1
        return n * n * n
        
    # First call (miss)
    res1 = calculate_cube(3)
    assert res1 == 27
    assert call_count == 1
    
    # Second call (hit)
    res2 = calculate_cube(3)
    assert res2 == 27
    assert call_count == 1  # Should NOT increment
    
    # Third call with different argument (miss)
    res3 = calculate_cube(4)
    assert res3 == 64
    assert call_count == 2
    
    # Metrics verify
    metrics = cache.get_metrics()
    assert metrics["hits"] == 1
    assert metrics["misses"] == 2
