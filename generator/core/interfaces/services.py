"""
Service interfaces for the Z-Beam generator.
These define the contracts that implementations must follow.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from generator.core.domain.models import (
    GenerationRequest,
    GenerationContext,
    GenerationResult,
    AIScore,
    SectionConfig,
    PromptTemplate,
    CacheEntry,
    ArticleMetadata,
)


class IContentGenerator(ABC):
    """Interface for content generation services."""

    @abstractmethod
    def generate_section(
        self,
        request: GenerationRequest,
        section_config: SectionConfig,
        context: GenerationContext,
    ) -> GenerationResult:
        """Generate content for a single section."""
        pass


class IDetectionService(ABC):
    """Interface for AI/human detection services."""

    @abstractmethod
    def detect_ai_likelihood(
        self,
        content: str,
        context: GenerationContext,
        iteration: int = 1,
        temperature: float = 0.3,
        timeout: int = 60,
    ) -> AIScore:
        """Detect AI-like characteristics in content."""
        pass

    @abstractmethod
    def detect_human_likelihood(
        self,
        content: str,
        context: GenerationContext,
        iteration: int = 1,
        temperature: float = 0.3,
        timeout: int = 60,
    ) -> AIScore:
        """Detect overly human-like characteristics in content."""
        pass


class IAPIClient(ABC):
    """Interface for AI API clients."""

    @abstractmethod
    def call_api(
        self,
        prompt: str,
        model: str,
        temperature: float = 1.0,
        max_tokens: int = 2048,
        **kwargs,
    ) -> str:
        """Make an API call to the AI provider."""
        pass

    @abstractmethod
    def get_provider_name(self) -> str:
        """Get the name of the AI provider."""
        pass


class IPromptRepository(ABC):
    """Interface for prompt storage and retrieval."""

    @abstractmethod
    def get_prompt(self, name: str, category: str) -> Optional[PromptTemplate]:
        """Retrieve a prompt template by name and category."""
        pass

    @abstractmethod
    def list_prompts(self, category: Optional[str] = None) -> List[PromptTemplate]:
        """List available prompt templates."""
        pass

    @abstractmethod
    def save_prompt(self, prompt: PromptTemplate) -> None:
        """Save a prompt template."""
        pass


class ICacheRepository(ABC):
    """Interface for content caching."""

    @abstractmethod
    def get(self, key: str) -> Optional[CacheEntry]:
        """Retrieve a cache entry by key."""
        pass

    @abstractmethod
    def set(
        self, key: str, content: str, metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """Store a cache entry."""
        pass

    @abstractmethod
    def delete(self, key: str) -> None:
        """Delete a cache entry."""
        pass

    @abstractmethod
    def clear_expired(self, max_age_seconds: float) -> int:
        """Clear expired cache entries and return count of deleted entries."""
        pass


class IFileHandler(ABC):
    """Interface for file operations."""

    @abstractmethod
    def read_file(self, file_path: str) -> str:
        """Read content from a file."""
        pass

    @abstractmethod
    def write_file(self, file_path: str, content: str) -> None:
        """Write content to a file."""
        pass

    @abstractmethod
    def file_exists(self, file_path: str) -> bool:
        """Check if a file exists."""
        pass

    @abstractmethod
    def create_directory(self, dir_path: str) -> None:
        """Create a directory if it doesn't exist."""
        pass


class IMetadataGenerator(ABC):
    """Interface for metadata generation."""

    @abstractmethod
    def generate_metadata(
        self,
        material: str,
        material_config: Dict[str, Any],
        article_config: Dict[str, Any],
        author_metadata: Dict[str, Any],
        ai_scores: Dict[str, int],
        category: str = "material",
    ) -> ArticleMetadata:
        """Generate article metadata."""
        pass


class IValidationService(ABC):
    """Interface for content validation."""

    @abstractmethod
    def validate_mdx(self, content: str) -> tuple[bool, List[str]]:
        """Validate MDX content and return (is_valid, errors)."""
        pass

    @abstractmethod
    def sanitize_content(self, content: str) -> str:
        """Sanitize content for safe output."""
        pass


class IConfigurationService(ABC):
    """Interface for configuration management."""

    @abstractmethod
    def get_provider_config(self, provider: str) -> Dict[str, Any]:
        """Get configuration for a specific provider."""
        pass

    @abstractmethod
    def get_section_configs(self) -> Dict[str, SectionConfig]:
        """Get all section configurations."""
        pass

    @abstractmethod
    def get_api_keys(self) -> Dict[str, str]:
        """Get API keys for all providers."""
        pass
