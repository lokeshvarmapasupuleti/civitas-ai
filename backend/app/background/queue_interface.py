from abc import ABC, abstractmethod
from typing import Callable, Any, Dict

class BaseQueueProvider(ABC):
    @abstractmethod
    def enqueue(self, task_fn: Callable[..., Any], *args: Any, **kwargs: Any) -> str:
        """
        Enqueues a task function with parameters.
        Returns the generated unique Job ID.
        """
        pass
