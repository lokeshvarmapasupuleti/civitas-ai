import threading
from typing import Callable, Any
from fastapi import BackgroundTasks

from app.background.queue_interface import BaseQueueProvider

class FastAPIBackgroundTasksProvider(BaseQueueProvider):
    def __init__(self, background_tasks: BackgroundTasks):
        self.background_tasks = background_tasks

    def enqueue(self, task_fn: Callable[..., Any], *args: Any, **kwargs: Any) -> str:
        # Resolve job_id from args or kwargs (standard convention)
        job_id = kwargs.get("job_id") or (args[0] if args else None)
        if not job_id:
            import uuid
            job_id = str(uuid.uuid4())
            kwargs["job_id"] = job_id
            
        self.background_tasks.add_task(task_fn, *args, **kwargs)
        return job_id

class MockRedisQueueProvider(BaseQueueProvider):
    def enqueue(self, task_fn: Callable[..., Any], *args: Any, **kwargs: Any) -> str:
        job_id = kwargs.get("job_id") or (args[0] if args else None)
        if not job_id:
            import uuid
            job_id = str(uuid.uuid4())
            kwargs["job_id"] = job_id
            
        # Spawn execution in a background thread to simulate Redis Queue daemon worker
        t = threading.Thread(target=task_fn, args=args, kwargs=kwargs, daemon=True)
        t.start()
        return job_id

class MockCeleryProvider(BaseQueueProvider):
    def enqueue(self, task_fn: Callable[..., Any], *args: Any, **kwargs: Any) -> str:
        job_id = kwargs.get("job_id") or (args[0] if args else None)
        if not job_id:
            import uuid
            job_id = str(uuid.uuid4())
            kwargs["job_id"] = job_id
            
        # Spawn execution in a background thread to simulate Celery daemon worker
        t = threading.Thread(target=task_fn, args=args, kwargs=kwargs, daemon=True)
        t.start()
        return job_id
