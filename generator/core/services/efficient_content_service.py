"""
Enhanced content generation service with word budget management and API efficiency.
"""

from typing import Dict, List, Optional
from generator.core.services.content_service import ContentGenerationService
from generator.core.services.word_budget_manager import (
    WordBudgetManager,
    ContentMetrics,
)
from generator.core.interfaces.services import (
    IAPIClient,
    IDetectionService,
    IPromptRepository,
)
from generator.core.domain.models import (
    GenerationRequest,
    GenerationContext,
    SectionConfig,
    GenerationResult,
    AIScore,
)
from generator.core.exceptions import ContentGenerationError
from generator.modules.logger import get_logger

logger = get_logger("efficient_content_service")


class EfficientContentGenerationService(ContentGenerationService):
    """Enhanced content service with word budget management and reduced API usage."""

    def __init__(
        self,
        api_client: IAPIClient,
        detection_service: IDetectionService,
        prompt_repository: IPromptRepository,
        max_article_words: int = 1200,
    ):
        super().__init__(api_client, detection_service, prompt_repository)
        self.word_budget_manager = WordBudgetManager(max_article_words)
        self.logger = logger

    def generate_article_sections(
        self,
        request: GenerationRequest,
        section_configs: List[SectionConfig],
        context: GenerationContext,
    ) -> Dict[str, GenerationResult]:
        """Generate all sections with coordinated word budget management."""

        # Allocate word budgets across all sections
        section_names = [config.name for config in section_configs]
        budgets = self.word_budget_manager.allocate_budgets(section_names)

        # Log budget summary
        budget_summary = self.word_budget_manager.get_budget_summary()
        self.logger.info(
            f"📊 Word Budget Summary: {budget_summary['total_article_words']} words across {len(section_names)} sections"
        )

        for section_name, budget_info in budget_summary["sections"].items():
            self.logger.info(
                f"   {section_name}: {budget_info['target_words']} words ({budget_info['percentage']})"
            )

        # Generate sections with budget constraints
        results = {}
        total_api_calls = 0

        for config in section_configs:
            self.logger.info(f"\n🔧 Generating section: {config.name}")

            # Enhance request with budget-aware settings
            budget_aware_request = self._create_budget_aware_request(
                request, config.name
            )

            # Generate section with enhanced efficiency
            result = self.generate_section_efficiently(
                budget_aware_request, config, context
            )

            # Track metrics
            metrics = self.word_budget_manager.analyze_content(
                result.content, config.name
            )
            total_api_calls += self._estimate_api_calls(result)

            results[config.name] = result

            self.logger.info(
                f"✅ Section '{config.name}' complete: {metrics.word_count} words "
                f"({metrics.utilization:.1%} of target), {result.iterations_completed} iterations"
            )

        # Final summary
        total_words = sum(len(result.content.split()) for result in results.values())
        self.logger.info(f"\n🎯 Article Generation Complete:")
        self.logger.info(
            f"   Total words: {total_words}/{self.word_budget_manager.total_article_words}"
        )
        self.logger.info(f"   Total API calls: ~{total_api_calls}")
        self.logger.info(
            f"   Sections completed: {len(results)}/{len(section_configs)}"
        )

        return results

    def generate_section_efficiently(
        self,
        request: GenerationRequest,
        section_config: SectionConfig,
        context: GenerationContext,
    ) -> GenerationResult:
        """Generate a section with enhanced efficiency and budget awareness."""

        # Get section budget
        budget = self.word_budget_manager.get_section_budget(section_config.name)
        if budget:
            self.logger.info(
                f"📏 Section budget: {budget.target_words} words "
                f"(range: {budget.min_words}-{budget.max_words})"
            )

        # Get the prompt template with budget constraints
        prompt_template = self._prompt_repository.get_prompt(
            section_config.prompt_file.replace(".txt", ""), "sections"
        )
        if not prompt_template:
            raise ContentGenerationError(
                f"Prompt template not found: {section_config.prompt_file}",
                section=section_config.name,
            )

        # Enhance prompt with word budget
        enhanced_prompt = self.word_budget_manager.adjust_prompt_for_budget(
            prompt_template.content, section_config.name
        )

        # Generate initial content with budget-aware max_tokens
        initial_content = self._generate_budget_aware_content(
            request, section_config, context, enhanced_prompt
        )

        # Check if content meets budget requirements
        metrics = self.word_budget_manager.analyze_content(
            initial_content, section_config.name
        )

        # If no AI detection required or content is way off budget, return early
        if not section_config.ai_detect:
            self.logger.info(
                f"Section {section_config.name} skipping detection (ai_detect=false)"
            )
            return GenerationResult(
                content=initial_content, threshold_met=True, iterations_completed=1
            )

        if not metrics.within_budget and metrics.utilization > 1.5:
            self.logger.warning(
                f"Content significantly over budget ({metrics.utilization:.1%}), "
                "skipping detection to focus on length reduction"
            )
            # Try to generate shorter content
            shorter_content = self._generate_shorter_content(
                request, section_config, context, enhanced_prompt, metrics
            )
            return GenerationResult(
                content=shorter_content, threshold_met=False, iterations_completed=2
            )

        # Run efficient detection iterations
        return self._generate_with_efficient_detection(
            request, section_config, context, initial_content
        )

    def _create_budget_aware_request(
        self, request: GenerationRequest, section_name: str
    ) -> GenerationRequest:
        """Create a request with budget-aware max_tokens."""
        budget_max_tokens = self.word_budget_manager.calculate_max_tokens(section_name)

        return GenerationRequest(
            material=request.material,
            sections=request.sections,
            provider=request.provider,
            model=request.model,
            ai_detection_threshold=request.ai_detection_threshold,
            human_detection_threshold=request.human_detection_threshold,
            iterations_per_section=request.iterations_per_section,
            temperature=request.temperature,
            max_tokens=min(
                request.max_tokens, budget_max_tokens
            ),  # Use budget constraint
            force_regenerate=request.force_regenerate,
        )

    def _generate_budget_aware_content(
        self,
        request: GenerationRequest,
        section_config: SectionConfig,
        context: GenerationContext,
        prompt_template: str,
    ) -> str:
        """Generate content with budget awareness."""
        try:
            # Format the prompt with context variables
            formatted_prompt = prompt_template.format(**context.variables)

            # Call the API with budget-aware max_tokens
            content = self._api_client.call_api(
                prompt=formatted_prompt,
                model=request.model,
                temperature=request.temperature,
                max_tokens=request.max_tokens,  # Already budget-aware from _create_budget_aware_request
            )

            if not content or not content.strip():
                raise ContentGenerationError(
                    "Empty content returned from API", section=section_config.name
                )

            # Clean and validate the content
            cleaned_content = self._clean_and_validate_content(
                content, section_config.name
            )
            return cleaned_content

        except Exception as e:
            raise ContentGenerationError(
                f"Failed to generate budget-aware content: {str(e)}",
                section=section_config.name,
            ) from e

    def _generate_shorter_content(
        self,
        request: GenerationRequest,
        section_config: SectionConfig,
        context: GenerationContext,
        prompt_template: str,
        metrics: ContentMetrics,
    ) -> str:
        """Generate shorter content when initial content is too long."""

        budget = self.word_budget_manager.get_section_budget(section_config.name)
        if not budget:
            return ""  # Can't shorten without budget info

        # Create a more restrictive prompt
        length_instruction = f"\n\nCRITICAL: This response MUST be exactly {budget.target_words} words or less. The previous attempt was {metrics.word_count} words which is too long. Be concise and focused."

        restrictive_prompt = prompt_template + length_instruction
        formatted_prompt = restrictive_prompt.format(**context.variables)

        # Use even more restrictive max_tokens
        restrictive_max_tokens = int(budget.target_words * 1.0)  # No buffer

        try:
            content = self._api_client.call_api(
                prompt=formatted_prompt,
                model=request.model,
                temperature=0.7,  # Lower temperature for more controlled output
                max_tokens=restrictive_max_tokens,
            )

            return (
                self._clean_and_validate_content(content, section_config.name)
                if content
                else ""
            )

        except Exception as e:
            self.logger.error(
                f"Failed to generate shorter content for {section_config.name}: {e}"
            )
            return ""

    def _generate_with_efficient_detection(
        self,
        request: GenerationRequest,
        section_config: SectionConfig,
        context: GenerationContext,
        initial_content: str,
    ) -> GenerationResult:
        """Generate content with efficient detection - fewer API calls."""

        current_content = initial_content
        ai_score = None
        human_score = None

        # Efficient detection strategy:
        # 1. Only run detection on iterations 1 and final
        # 2. Skip detection if content is way over budget
        # 3. Reduce total iterations for efficiency

        max_efficient_iterations = min(
            request.iterations_per_section, 3
        )  # Cap at 3 for efficiency

        for iteration in range(1, max_efficient_iterations + 1):
            self.logger.info(
                f"Efficient iteration {iteration}/{max_efficient_iterations} for {section_config.name}"
            )

            # Check if we should skip detection for efficiency
            if self.word_budget_manager.should_skip_detection(
                current_content, section_config.name, iteration
            ):
                self.logger.info(
                    f"Skipping detection for iteration {iteration} (efficiency optimization)"
                )

                # Create dummy scores to continue
                ai_score = AIScore(score=25, feedback="Skipped for efficiency")
                human_score = AIScore(score=25, feedback="Skipped for efficiency")

                # If this isn't the last iteration, try to improve content
                if iteration < max_efficient_iterations:
                    current_content = self._improve_content_efficiently(
                        current_content, context, request, section_config.name
                    )
                continue

            # Run detection only when necessary
            if iteration == 1 or iteration == max_efficient_iterations:
                self.logger.info(f"Running detection for iteration {iteration}")

                # Run AI detection
                ai_score = self._detection_service.detect_ai_likelihood(
                    current_content, context, iteration
                )

                # Run human detection
                human_score = self._detection_service.detect_human_likelihood(
                    current_content, context, iteration
                )

                # Check if thresholds are met
                ai_threshold_met = ai_score.score <= request.ai_detection_threshold
                human_threshold_met = (
                    human_score.score <= request.human_detection_threshold
                )

                if ai_threshold_met and human_threshold_met:
                    self.logger.info(f"✅ Thresholds met in iteration {iteration}")
                    return GenerationResult(
                        content=current_content,
                        ai_score=ai_score,
                        human_score=human_score,
                        threshold_met=True,
                        iterations_completed=iteration,
                    )

            # Improve content for next iteration (but only if not the last)
            if iteration < max_efficient_iterations:
                current_content = self._improve_content_efficiently(
                    current_content, context, request, section_config.name
                )

        # Return final result
        return GenerationResult(
            content=current_content,
            ai_score=ai_score or AIScore(score=50, feedback="Not tested"),
            human_score=human_score or AIScore(score=50, feedback="Not tested"),
            threshold_met=False,
            iterations_completed=max_efficient_iterations,
        )

    def _improve_content_efficiently(
        self,
        content: str,
        context: GenerationContext,
        request: GenerationRequest,
        section_name: str,
    ) -> str:
        """Improve content efficiently with budget awareness."""

        try:
            budget = self.word_budget_manager.get_section_budget(section_name)

            # Simple improvement prompt focused on length and quality
            improvement_variables = {
                **context.variables,
                "content": content,
                "target_words": budget.target_words if budget else 200,
                "section_name": section_name,
            }

            improvement_prompt = f"""Please improve this {section_name} content to be more human-like and exactly {improvement_variables["target_words"]} words:

{content}

Make it sound more natural, reduce AI-like phrases, and ensure it's exactly {improvement_variables["target_words"]} words."""

            # Generate improved content with budget constraint
            max_tokens = self.word_budget_manager.calculate_max_tokens(section_name)

            improved_content = self._api_client.call_api(
                prompt=improvement_prompt,
                model=request.model,
                temperature=0.8,
                max_tokens=max_tokens,
            )

            return improved_content.strip() if improved_content else content

        except Exception as e:
            self.logger.error(
                f"Failed to improve content efficiently for {section_name}: {e}"
            )
            return content

    def _estimate_api_calls(self, result: GenerationResult) -> int:
        """Estimate number of API calls used for this section."""
        # Rough estimate based on iterations and detection
        base_calls = result.iterations_completed  # Content generation calls

        if result.ai_score and result.ai_score.score != 50:  # Detection was run
            detection_calls = 2  # AI + Human detection
        else:
            detection_calls = 0

        improvement_calls = max(0, result.iterations_completed - 1)  # Improvement calls

        return base_calls + detection_calls + improvement_calls
