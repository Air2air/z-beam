# Generator Refactoring Plan - Python Best Practices

## 📋 Refactoring Analysis & Plan

### Current Architecture Issues
1. **Monolithic modules**: `content_generator.py` (524 lines) doing too much
2. **Mixed concerns**: Business logic mixed with infrastructure 
3. **Inconsistent patterns**: Error handling, logging, type hints
4. **Tight coupling**: Modules directly importing each other
5. **Limited abstractions**: No interfaces or abstract base classes

### Proposed Improvements

## 1. Domain-Driven Design (DDD) Structure

### Core Domain Models
```python
# generator/core/domain/models.py
from dataclasses import dataclass
from typing import Optional, Dict, Any, List
from enum import Enum
from abc import ABC, abstractmethod

class DetectionResult(Enum):
    PASS = "pass"
    FAIL = "fail" 
    THRESHOLD_MET = "threshold_met"

@dataclass(frozen=True)
class AIScore:
    score: int
    feedback: str
    iteration: int
    
@dataclass(frozen=True) 
class SectionConfig:
    name: str
    ai_detect: bool
    prompt_file: str
    section_type: str
    generate: bool = True
    order: int = 0

@dataclass
class GenerationRequest:
    material: str
    sections: List[str]
    provider: str
    model: str
    ai_detection_threshold: int
    human_detection_threshold: int
    iterations_per_section: int = 3
```

### Service Interfaces
```python
# generator/core/interfaces/services.py
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class IContentGenerator(ABC):
    @abstractmethod
    def generate_section(self, request: GenerationRequest) -> str:
        pass

class IDetectionService(ABC):
    @abstractmethod  
    def detect_ai_likelihood(self, content: str) -> AIScore:
        pass
    
    @abstractmethod
    def detect_human_likelihood(self, content: str) -> AIScore:
        pass

class IAPIClient(ABC):
    @abstractmethod
    def call_api(self, prompt: str, **kwargs) -> str:
        pass
```

## 2. Dependency Injection & Configuration

### Service Container
```python
# generator/core/container.py
from typing import Dict, Any
from generator.core.interfaces.services import IContentGenerator, IDetectionService, IAPIClient

class ServiceContainer:
    def __init__(self):
        self._services: Dict[str, Any] = {}
        self._singletons: Dict[str, Any] = {}
    
    def register_singleton(self, interface: type, implementation: type):
        self._services[interface.__name__] = implementation
    
    def get(self, interface: type):
        if interface.__name__ in self._singletons:
            return self._singletons[interface.__name__]
            
        impl_class = self._services.get(interface.__name__)
        if impl_class:
            instance = impl_class()
            self._singletons[interface.__name__] = instance
            return instance
        raise ValueError(f"No implementation registered for {interface}")
```

## 3. Improved Error Handling

### Structured Exception Hierarchy
```python
# generator/exceptions.py (ENHANCED)
from dataclasses import dataclass
from typing import Optional, Dict, Any

@dataclass
class ErrorContext:
    operation: str
    module: str
    details: Optional[Dict[str, Any]] = None

class GeneratorException(Exception):
    def __init__(self, message: str, context: Optional[ErrorContext] = None):
        super().__init__(message)
        self.context = context

class ValidationError(GeneratorException):
    pass

class APIError(GeneratorException):
    def __init__(self, message: str, provider: str, status_code: Optional[int] = None):
        context = ErrorContext("api_call", "api_client", {"provider": provider, "status_code": status_code})
        super().__init__(message, context)
```

## 4. Business Services Layer

### Content Generation Service
```python
# generator/core/services/content_service.py
from generator.core.interfaces.services import IContentGenerator, IDetectionService
from generator.core.domain.models import GenerationRequest, SectionConfig, AIScore

class ContentGenerationService:
    def __init__(self, 
                 content_generator: IContentGenerator,
                 detection_service: IDetectionService):
        self._content_generator = content_generator
        self._detection_service = detection_service
    
    def generate_with_detection(self, request: GenerationRequest, section: SectionConfig) -> str:
        if not section.ai_detect:
            return self._content_generator.generate_section(request)
        
        return self._generate_with_iterations(request, section)
    
    def _generate_with_iterations(self, request: GenerationRequest, section: SectionConfig) -> str:
        content = self._content_generator.generate_section(request)
        
        for iteration in range(request.iterations_per_section):
            ai_score = self._detection_service.detect_ai_likelihood(content)
            human_score = self._detection_service.detect_human_likelihood(content)
            
            if self._meets_thresholds(ai_score, human_score, request):
                return content
                
            # Generate improved content based on feedback
            content = self._improve_content(content, ai_score, human_score)
        
        return content
```

## 5. Infrastructure Layer

### Repository Pattern for Data Access
```python
# generator/infrastructure/storage/repositories.py
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Optional, Dict, Any

class IPromptRepository(ABC):
    @abstractmethod
    def get_prompt(self, name: str, category: str) -> Optional[str]:
        pass

class FilePromptRepository(IPromptRepository):
    def __init__(self, prompts_dir: Path):
        self._prompts_dir = prompts_dir
    
    def get_prompt(self, name: str, category: str) -> Optional[str]:
        file_path = self._prompts_dir / category / f"{name}.txt"
        if file_path.exists():
            return file_path.read_text(encoding="utf-8")
        return None
```

## 6. Configuration as Code

### Type-Safe Configuration
```python
# generator/config/settings.py (ENHANCED)
from pydantic import BaseSettings, Field
from typing import Optional, Dict, List

class APISettings(BaseSettings):
    gemini_api_key: Optional[str] = Field(None, env="GEMINI_API_KEY")
    xai_api_key: Optional[str] = Field(None, env="XAI_API_KEY")
    deepseek_api_key: Optional[str] = Field(None, env="DEEPSEEK_API_KEY")

class GenerationSettings(BaseSettings):
    default_temperature: float = Field(1.0, ge=0.0, le=2.0)
    default_ai_threshold: int = Field(25, ge=0, le=100)
    default_human_threshold: int = Field(25, ge=0, le=100)
    max_iterations_per_section: int = Field(3, ge=1, le=10)

class AppSettings(BaseSettings):
    api: APISettings = APISettings()
    generation: GenerationSettings = GenerationSettings()
    
    class Config:
        env_file = ".env"
        env_nested_delimiter = "__"
```

## 7. Testing Architecture

### Test Doubles & Fixtures
```python
# tests/fixtures.py
import pytest
from generator.core.domain.models import GenerationRequest, SectionConfig

@pytest.fixture
def sample_generation_request():
    return GenerationRequest(
        material="aluminum",
        sections=["introduction", "table"],
        provider="GEMINI", 
        model="gemini-2.5-flash",
        ai_detection_threshold=25,
        human_detection_threshold=25
    )

@pytest.fixture  
def ai_detect_section():
    return SectionConfig(
        name="introduction",
        ai_detect=True,
        prompt_file="introduction.txt",
        section_type="text"
    )
```

## 8. Performance & Monitoring

### Instrumentation Decorators
```python
# generator/infrastructure/monitoring/decorators.py
import functools
import time
from generator.modules.logger import get_logger

def monitor_performance(operation_name: str):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            logger = get_logger(func.__module__)
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                duration = time.time() - start_time
                logger.info(f"[PERF] {operation_name}: {duration:.3f}s")
                return result
            except Exception as e:
                duration = time.time() - start_time  
                logger.error(f"[PERF] {operation_name} FAILED: {duration:.3f}s - {e}")
                raise
        return wrapper
    return decorator
```

## Implementation Priority

### Phase 1: Foundation (Week 1)
1. Create domain models (`core/domain/models.py`)
2. Define service interfaces (`core/interfaces/`)
3. Enhance exception handling (`exceptions.py`)
4. Setup dependency injection container

### Phase 2: Services (Week 2)  
5. Implement business services (`core/services/`)
6. Create repository pattern for data access
7. Refactor API clients to use interfaces

### Phase 3: Infrastructure (Week 3)
8. Move infrastructure concerns to separate layer
9. Implement configuration as code with Pydantic
10. Add performance monitoring decorators

### Phase 4: Testing & Documentation (Week 4)
11. Create comprehensive test suite with fixtures
12. Document new architecture
13. Create migration guide from old to new structure

## Benefits of This Refactoring

### Code Quality
- **Single Responsibility**: Each class has one clear purpose
- **Type Safety**: Full type hints with Pydantic validation  
- **Testability**: Dependency injection enables easy mocking
- **Maintainability**: Clear separation of concerns

### Business Value
- **Reliability**: Better error handling and validation
- **Performance**: Instrumentation and monitoring built-in
- **Scalability**: Modular architecture supports growth
- **Developer Experience**: Clear interfaces and documentation

## Migration Strategy

### Backward Compatibility
- Keep existing `/modules` for gradual migration
- Create adapter classes to bridge old/new APIs
- Deprecation warnings for old patterns

### Risk Mitigation  
- Implement new features in new architecture
- Migrate existing features incrementally
- Maintain comprehensive test coverage
- Feature flags for gradual rollout

This refactoring transforms the generator from a collection of scripts into a well-architected, maintainable system following Python best practices while preserving all existing functionality.
