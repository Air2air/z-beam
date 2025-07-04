"""
Enhanced content generation service with proper interface implementation.
"""

import json
import re
from typing import Optional
from generator.core.interfaces.services import (
    IContentGenerator,
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

logger = get_logger("content_service")


class ContentGenerationService(IContentGenerator):
    """Service for generating content with AI/human detection."""

    def __init__(
        self,
        api_client: IAPIClient,
        detection_service: IDetectionService,
        prompt_repository: IPromptRepository,
    ):
        self._api_client = api_client
        self._detection_service = detection_service
        self._prompt_repository = prompt_repository

    def generate_section(
        self,
        request: GenerationRequest,
        section_config: SectionConfig,
        context: GenerationContext,
    ) -> GenerationResult:
        """Generate content for a single section with optional detection."""
        logger.info(
            f"Generating section: {section_config.name} (ai_detect: {section_config.ai_detect})"
        )

        # Get the prompt template
        prompt_template = self._prompt_repository.get_prompt(
            section_config.prompt_file.replace(".txt", ""), "sections"
        )
        if not prompt_template:
            raise ContentGenerationError(
                f"Prompt template not found: {section_config.prompt_file}",
                section=section_config.name,
            )

        # Generate initial content
        initial_content = self._generate_initial_content(
            request, section_config, context, prompt_template.content
        )

        # If no AI detection required, return immediately
        if not section_config.ai_detect:
            logger.info(
                f"Section {section_config.name} skipping detection (ai_detect=false)"
            )
            return GenerationResult(
                content=initial_content, threshold_met=True, iterations_completed=1
            )

        # Run through detection iterations
        return self._generate_with_detection_iterations(
            request, section_config, context, initial_content
        )

    def _generate_initial_content(
        self,
        request: GenerationRequest,
        section_config: SectionConfig,
        context: GenerationContext,
        prompt_template: str,
    ) -> str:
        """Generate the initial content for a section."""
        try:
            # Format the prompt with context variables
            formatted_prompt = prompt_template.format(**context.variables)

            # Call the API
            content = self._api_client.call_api(
                prompt=formatted_prompt,
                model=request.model,
                temperature=request.temperature,
                max_tokens=request.max_tokens,
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
                f"Failed to generate initial content: {str(e)}",
                section=section_config.name,
            ) from e

    def _generate_with_detection_iterations(
        self,
        request: GenerationRequest,
        section_config: SectionConfig,
        context: GenerationContext,
        initial_content: str,
    ) -> GenerationResult:
        """Generate content with detection iterations."""
        current_content = initial_content
        ai_score = None
        human_score = None
        previous_ai_score = None
        previous_human_score = None

        # Display iteration start banner
        self._display_iteration_banner(section_config.name, request)

        for iteration in range(1, request.iterations_per_section + 1):
            logger.info(
                f"Detection iteration {iteration}/{request.iterations_per_section} for {section_config.name}"
            )

            # Run AI detection
            ai_score = self._detection_service.detect_ai_likelihood(
                current_content, context, iteration
            )

            # Run human detection
            human_score = self._detection_service.detect_human_likelihood(
                current_content, context, iteration
            )

            # Display iteration results
            self._display_iteration_results(
                iteration,
                request.iterations_per_section,
                ai_score,
                human_score,
                previous_ai_score,
                previous_human_score,
                request.ai_detection_threshold,
                request.human_detection_threshold,
                section_config.name,
            )

            # Check if thresholds are met
            ai_threshold_met = ai_score.score <= request.ai_detection_threshold
            human_threshold_met = human_score.score <= request.human_detection_threshold

            if ai_threshold_met and human_threshold_met:
                self._display_success_banner(
                    section_config.name, iteration, ai_score, human_score
                )
                return GenerationResult(
                    content=current_content,
                    ai_score=ai_score,
                    human_score=human_score,
                    threshold_met=True,
                    iterations_completed=iteration,
                )

            # If not the last iteration, improve the content
            if iteration < request.iterations_per_section:
                current_content = self._improve_content(
                    current_content, ai_score, human_score, context, request
                )

            # Store scores for next iteration comparison
            previous_ai_score = ai_score
            previous_human_score = human_score

        # Return final result even if thresholds not met
        self._display_final_banner(
            section_config.name,
            request.iterations_per_section,
            ai_score,
            human_score,
            request,
        )
        return GenerationResult(
            content=current_content,
            ai_score=ai_score,
            human_score=human_score,
            threshold_met=False,
            iterations_completed=request.iterations_per_section,
        )

    def _improve_content(
        self,
        content: str,
        ai_score: AIScore,
        human_score: AIScore,
        context: GenerationContext,
        request: GenerationRequest,
    ) -> str:
        """Improve content based on detection feedback."""
        try:
            # Get the improvement prompt
            improvement_prompt = self._prompt_repository.get_prompt(
                "initial_prompt", "detection"
            )

            if not improvement_prompt:
                logger.warning(
                    "No improvement prompt found, returning original content"
                )
                return content

            # Combine feedback from both detectors
            combined_feedback = f"AI Detection Feedback: {ai_score.feedback}\n\nHuman Detection Feedback: {human_score.feedback}"

            # Format improvement prompt
            improvement_variables = {
                **context.variables,
                "previous_version": content,  # Fix: use previous_version instead of content
                "feedback": combined_feedback,
                "ai_score": ai_score.score,
                "human_score": human_score.score,
            }

            formatted_prompt = improvement_prompt.content.format(
                **improvement_variables
            )

            # Generate improved content
            improved_content = self._api_client.call_api(
                prompt=formatted_prompt,
                model=request.model,
                temperature=request.temperature,
                max_tokens=8192,  # Increase max_tokens for improvement step
            )

            return improved_content.strip() if improved_content else content

        except Exception as e:
            logger.error(f"Failed to improve content: {str(e)}")
            return content  # Return original content if improvement fails

    def _clean_and_validate_content(self, content: str, section_name: str) -> str:
        """Clean and validate content, handling common JSON truncation issues."""
        try:
            # Remove any leading/trailing whitespace
            cleaned_content = content.strip()

            # If the content looks like JSON but might be truncated, try to fix it
            if cleaned_content.startswith("{") and not cleaned_content.endswith("}"):
                logger.warning(
                    f"Detected potentially truncated JSON response for {section_name}"
                )
                # Try to close JSON if it looks incomplete
                if cleaned_content.count("{") > cleaned_content.count("}"):
                    cleaned_content += "}"
                    logger.info(f"Attempted to fix truncated JSON for {section_name}")

            # For JSON responses, validate they parse correctly
            if cleaned_content.startswith("{") and cleaned_content.endswith("}"):
                try:
                    json.loads(cleaned_content)  # Validate JSON structure
                    logger.debug(f"Valid JSON content validated for {section_name}")
                except json.JSONDecodeError as e:
                    logger.error(
                        f"Invalid JSON in response for {section_name}: {str(e)}"
                    )
                    # If JSON is invalid, we might still want to use the content as-is
                    # depending on the use case

            return cleaned_content

        except Exception as e:
            logger.warning(f"Content cleaning failed for {section_name}: {str(e)}")
            return content  # Return original if cleaning fails

    def _display_iteration_banner(
        self, section_name: str, request: GenerationRequest
    ) -> None:
        """Display iteration start banner."""
        CYAN = "\033[96m"
        BOLD = "\033[1m"
        RESET = "\033[0m"

        print(f"\n{CYAN}╭─ {BOLD}Content Generation Iterations{RESET}{CYAN} ─╮{RESET}")
        print(f"{CYAN}│{RESET} {BOLD}Section:{RESET} {section_name.upper()}")
        print(
            f"{CYAN}│{RESET} {BOLD}Target AI Score:{RESET} ≤ {request.ai_detection_threshold}% | {BOLD}Target Human Score:{RESET} ≤ {request.human_detection_threshold}%"
        )
        print(
            f"{CYAN}│{RESET} {BOLD}Max Iterations:{RESET} {request.iterations_per_section}"
        )
        print(f"{CYAN}╰─{'─' * 50}─╯{RESET}")

    def _display_iteration_results(
        self,
        iteration: int,
        max_iterations: int,
        ai_score,
        human_score,
        previous_ai_score,
        previous_human_score,
        ai_threshold: int,
        human_threshold: int,
        section_name: str,
    ) -> None:
        """Display detailed iteration results with score tracking."""
        GREEN = "\033[92m"
        YELLOW = "\033[93m"
        RED = "\033[91m"
        BLUE = "\033[94m"
        CYAN = "\033[96m"
        BOLD = "\033[1m"
        RESET = "\033[0m"

        # Calculate score changes
        ai_change = ""
        human_change = ""
        if previous_ai_score:
            ai_diff = ai_score.score - previous_ai_score.score
            if ai_diff > 0:
                ai_change = f" {RED}(+{ai_diff}){RESET}"
            elif ai_diff < 0:
                ai_change = f" {GREEN}({ai_diff}){RESET}"
            else:
                ai_change = f" {YELLOW}(±0){RESET}"

        if previous_human_score:
            human_diff = human_score.score - previous_human_score.score
            if human_diff > 0:
                human_change = f" {RED}(+{human_diff}){RESET}"
            elif human_diff < 0:
                human_change = f" {GREEN}({human_diff}){RESET}"
            else:
                human_change = f" {YELLOW}(±0){RESET}"

        # Determine threshold status
        ai_status = (
            f"{GREEN}✅ PASS{RESET}"
            if ai_score.score <= ai_threshold
            else f"{RED}❌ FAIL{RESET}"
        )
        human_status = (
            f"{GREEN}✅ PASS{RESET}"
            if human_score.score <= human_threshold
            else f"{RED}❌ FAIL{RESET}"
        )

        print(
            f"\n{BLUE}┌─ {BOLD}Iteration {iteration}/{max_iterations} Results{RESET}{BLUE} ─┐{RESET}"
        )
        print(
            f"{BLUE}│{RESET} {BOLD}AI Score:{RESET} {ai_score.score}%{ai_change} | Target: ≤{ai_threshold}% | {ai_status}"
        )
        print(
            f"{BLUE}│{RESET} {BOLD}Human Score:{RESET} {human_score.score}%{human_change} | Target: ≤{human_threshold}% | {human_status}"
        )

        # Show action for next iteration
        if iteration < max_iterations:
            both_pass = (
                ai_score.score <= ai_threshold and human_score.score <= human_threshold
            )
            if not both_pass:
                print(
                    f"{BLUE}│{RESET} {YELLOW}🔄 Generating improved content for iteration {iteration + 1}...{RESET}"
                )

        print(f"{BLUE}└─{'─' * 60}─┘{RESET}")

    def _display_success_banner(
        self, section_name: str, iteration: int, ai_score, human_score
    ) -> None:
        """Display success banner when thresholds are met."""
        GREEN = "\033[92m"
        BOLD = "\033[1m"
        RESET = "\033[0m"

        print(f"\n{GREEN}╭─ {BOLD}SUCCESS!{RESET}{GREEN} ─╮{RESET}")
        print(f"{GREEN}│{RESET} {BOLD}Section:{RESET} {section_name}")
        print(f"{GREEN}│{RESET} {BOLD}Completed in:{RESET} {iteration} iteration(s)")
        print(f"{GREEN}│{RESET} {BOLD}Final AI Score:{RESET} {ai_score.score}%")
        print(f"{GREEN}│{RESET} {BOLD}Final Human Score:{RESET} {human_score.score}%")
        print(f"{GREEN}│{RESET} 🎉 Both thresholds met!")
        print(f"{GREEN}╰─{'─' * 30}─╯{RESET}")

    def _display_final_banner(
        self, section_name: str, iterations: int, ai_score, human_score, request
    ) -> None:
        """Display final banner when max iterations reached."""
        YELLOW = "\033[93m"
        RED = "\033[91m"
        BOLD = "\033[1m"
        RESET = "\033[0m"

        ai_met = ai_score.score <= request.ai_detection_threshold
        human_met = human_score.score <= request.human_detection_threshold

        if ai_met and human_met:
            color = YELLOW
            status = "⚠️ PARTIAL SUCCESS"
            message = "Thresholds met but max iterations reached"
        else:
            color = RED
            status = "❌ THRESHOLDS NOT MET"
            message = f"Could not reach targets in {iterations} iterations"

        print(f"\n{color}╭─ {BOLD}{status}{RESET}{color} ─╮{RESET}")
        print(f"{color}│{RESET} {BOLD}Section:{RESET} {section_name}")
        print(f"{color}│{RESET} {BOLD}Iterations:{RESET} {iterations}/{iterations}")
        print(
            f"{color}│{RESET} {BOLD}Final AI Score:{RESET} {ai_score.score}% (target: ≤{request.ai_detection_threshold}%)"
        )
        print(
            f"{color}│{RESET} {BOLD}Final Human Score:{RESET} {human_score.score}% (target: ≤{request.human_detection_threshold}%)"
        )
        print(f"{color}│{RESET} {message}")
        print(f"{color}╰─{'─' * 50}─╯{RESET}")
