"""
Word Budget Manager for efficient content generation.
Manages word allocation across sections and prevents excessive API usage.
"""

from typing import Dict, List, Optional
from dataclasses import dataclass
from generator.modules.logger import get_logger

logger = get_logger("word_budget_manager")


@dataclass
class SectionBudget:
    """Word budget allocation for a section."""

    name: str
    target_words: int
    max_words: int
    min_words: int
    priority: float = 1.0  # Higher priority gets more words if available


@dataclass
class ContentMetrics:
    """Metrics for generated content."""

    word_count: int
    character_count: int
    within_budget: bool
    utilization: float  # percentage of target words used


class WordBudgetManager:
    """Manages word budgets across article sections to optimize API usage."""

    def __init__(self, total_article_words: int = 1200):
        self.total_article_words = total_article_words
        self.section_budgets: Dict[str, SectionBudget] = {}
        self.allocated_words = 0
        self.logger = logger

        # Default section priorities and allocations
        self.default_allocations = {
            "introduction": 0.15,  # 15% - 180 words
            "material_research": 0.20,  # 20% - 240 words
            "contaminants": 0.15,  # 15% - 180 words
            "substrates": 0.15,  # 15% - 180 words
            "comparison": 0.20,  # 20% - 240 words
            "conclusion": 0.10,  # 10% - 120 words
            "table": 0.05,  # 5%  - 60 words (data tables)
        }

    def allocate_budgets(self, sections: List[str]) -> Dict[str, SectionBudget]:
        """Allocate word budgets to sections based on priorities."""
        self.logger.info(
            f"Allocating {self.total_article_words} words across {len(sections)} sections"
        )

        # Calculate total allocation percentage for provided sections
        total_allocation = sum(
            self.default_allocations.get(section, 0.1) for section in sections
        )

        # If sections don't match defaults, distribute evenly
        if total_allocation == 0:
            allocation_per_section = 1.0 / len(sections)
            self.logger.warning(
                f"No default allocations found, distributing evenly: {allocation_per_section:.2%} per section"
            )
        else:
            # Normalize allocations to 100%
            allocation_per_section = None

        for section in sections:
            if total_allocation > 0:
                section_percentage = (
                    self.default_allocations.get(section, 0.1) / total_allocation
                )
            else:
                section_percentage = allocation_per_section

            target_words = int(self.total_article_words * section_percentage)

            # Add some buffer (±20%) for flexibility
            min_words = max(50, int(target_words * 0.8))
            max_words = int(target_words * 1.2)

            budget = SectionBudget(
                name=section,
                target_words=target_words,
                max_words=max_words,
                min_words=min_words,
                priority=self.default_allocations.get(section, 0.1),
            )

            self.section_budgets[section] = budget
            self.allocated_words += target_words

            self.logger.info(
                f"Section '{section}': {target_words} words (range: {min_words}-{max_words})"
            )

        return self.section_budgets

    def get_section_budget(self, section_name: str) -> Optional[SectionBudget]:
        """Get the budget for a specific section."""
        return self.section_budgets.get(section_name)

    def calculate_max_tokens(self, section_name: str) -> int:
        """Calculate appropriate max_tokens for API call based on word budget."""
        budget = self.get_section_budget(section_name)
        if not budget:
            # Fallback for unknown sections
            self.logger.warning(
                f"No budget found for section '{section_name}', using default"
            )
            return 2000

        # Rough estimate: 1 word ≈ 1.3 tokens, add 20% buffer for API overhead
        estimated_tokens = int(budget.max_words * 1.3 * 1.2)

        # Ensure reasonable bounds
        max_tokens = max(500, min(estimated_tokens, 8000))

        self.logger.debug(
            f"Section '{section_name}': {budget.max_words} max words → {max_tokens} max tokens"
        )
        return max_tokens

    def analyze_content(self, content: str, section_name: str) -> ContentMetrics:
        """Analyze content against section budget."""
        word_count = len(content.split())
        character_count = len(content)

        budget = self.get_section_budget(section_name)
        if not budget:
            # No budget set, assume it's within limits
            return ContentMetrics(
                word_count=word_count,
                character_count=character_count,
                within_budget=True,
                utilization=0.0,
            )

        within_budget = budget.min_words <= word_count <= budget.max_words
        utilization = (
            word_count / budget.target_words if budget.target_words > 0 else 0.0
        )

        metrics = ContentMetrics(
            word_count=word_count,
            character_count=character_count,
            within_budget=within_budget,
            utilization=utilization,
        )

        self.logger.info(
            f"Section '{section_name}': {word_count} words "
            f"(target: {budget.target_words}, range: {budget.min_words}-{budget.max_words}) "
            f"- {'✅' if within_budget else '⚠️'} {utilization:.1%} utilization"
        )

        return metrics

    def should_skip_detection(
        self, content: str, section_name: str, iteration: int
    ) -> bool:
        """Determine if detection should be skipped to save API calls."""
        metrics = self.analyze_content(content, section_name)

        # Skip detection if:
        # 1. Content is grossly over budget (needs length reduction, not detection)
        # 2. It's a later iteration and content is reasonable
        # 3. Section is very short (tables, etc.)

        if metrics.utilization > 1.5:  # 50% over budget
            self.logger.info(
                f"Skipping detection for '{section_name}' - content too long ({metrics.utilization:.1%} of target)"
            )
            return True

        if iteration > 2 and metrics.within_budget:
            self.logger.info(
                f"Skipping detection for '{section_name}' iteration {iteration} - content within budget"
            )
            return True

        if metrics.word_count < 100:  # Very short content
            self.logger.info(
                f"Skipping detection for '{section_name}' - content too short for meaningful detection"
            )
            return True

        return False

    def get_budget_summary(self) -> Dict[str, any]:
        """Get summary of all section budgets."""
        return {
            "total_article_words": self.total_article_words,
            "allocated_words": self.allocated_words,
            "sections": {
                name: {
                    "target_words": budget.target_words,
                    "range": f"{budget.min_words}-{budget.max_words}",
                    "priority": budget.priority,
                    "percentage": f"{(budget.target_words / self.total_article_words) * 100:.1f}%",
                }
                for name, budget in self.section_budgets.items()
            },
        }

    def adjust_prompt_for_budget(self, prompt: str, section_name: str) -> str:
        """Inject word count constraints into the prompt."""
        budget = self.get_section_budget(section_name)
        if not budget:
            return prompt

        # Add word count constraint to the prompt
        word_constraint = f"\n\nIMPORTANT: Keep your response to approximately {budget.target_words} words (between {budget.min_words}-{budget.max_words} words). This section should be {budget.target_words} words as part of a {self.total_article_words}-word article."

        return prompt + word_constraint
