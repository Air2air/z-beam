"""
Detection service for AI and human-like content analysis.
"""

from generator.core.domain.models import AIScore, GenerationContext, TemperatureConfig
from generator.core.interfaces.services import (
    IDetectionService,
    IAPIClient,
    IPromptRepository,
)
from generator.core.exceptions import DetectionError
from generator.core.services.prompt_optimizer_compatible import (
    PromptOptimizerCompatible,
)
from generator.modules.logger import get_logger
from typing import List, Optional

logger = get_logger("detection_service")


class DetectionService(IDetectionService):
    """Service for detecting AI and human-like characteristics in content."""

    def __init__(self, api_client: IAPIClient, prompt_repository: IPromptRepository):
        self._api_client = api_client
        self._prompt_repository = prompt_repository

        # Initialize logger
        from generator.modules.logger import get_logger

        self.logger = get_logger("detection_service")

        # Get the model from the api_client provider
        provider = getattr(api_client, "_provider", "DEEPSEEK")  # Default fallback

        # Try to get provider settings from run.py
        try:
            import sys
            import os
            import importlib.util

            # Add the project root to sys.path to ensure proper import
            project_root = os.path.dirname(
                os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
            )

            # Use spec-based loading to avoid circular imports
            run_path = os.path.join(project_root, "run.py")
            spec = importlib.util.spec_from_file_location("run_module", run_path)
            run_module = importlib.util.module_from_spec(spec)
            sys.modules["run_module"] = run_module
            spec.loader.exec_module(run_module)

            # Get the model from PROVIDER_MODELS
            provider_models = getattr(run_module, "PROVIDER_MODELS", {})
            self._model = provider_models.get(provider, {}).get(
                "model", "deepseek-chat"
            )
        except Exception as e:
            # Fallback to default if can't import
            self._model = "deepseek-chat"
            self.logger.warning(
                f"Could not load model config from run.py: {e}. Using default model."
            )

        # Initialize prompt optimizer for performance tracking and optimization
        self._optimizer = PromptOptimizerCompatible()
        # Available prompt variations for optimization
        self._ai_prompt_variations = [
            "ai_detection_enhanced",  # New enhanced prompt as default
            "ai_detection_prompt_minimal",
            "ai_detection_v1",
            "ai_detection_v2",
            "ai_detection_v3",
            "ai_detection_v4",
        ]
        self._human_prompt_variations = [
            "human_detection_enhanced",  # New enhanced prompt as default
            "human_detection_prompt_minimal",
            "human_detection_v1",
            "human_detection_v2",
            "human_detection_v3",
            "human_detection_v4",
        ]
        # Track performance of different prompts (legacy - migrating to optimizer)
        self._prompt_performance = {}

    def detect_ai_likelihood(
        self,
        content: str,
        context: GenerationContext,
        iteration: int = 1,
        temperature: float = 0.3,
        timeout: int = 60,
        temperature_config: Optional[TemperatureConfig] = None,
    ) -> AIScore:
        """Detect AI-like characteristics in content using optimal prompt variation."""
        section_name = context.get_variable("section_name", "Unknown")
        optimal_prompt = self._optimizer.get_optimal_prompt(
            "ai", iteration, section_name, self._ai_prompt_variations
        )
        logger.info(
            f"Using AI detection prompt variation: {optimal_prompt} (iteration {iteration})"
        )

        # Use detection_temp from temperature_config if available, otherwise fallback to legacy temperature
        detection_temp = (
            temperature_config.detection_temp if temperature_config else temperature
        )

        return self._run_detection(
            content,
            context,
            iteration,
            optimal_prompt,
            "ai",
            section_name,
            detection_temp,
            timeout,
        )

    def detect_human_likelihood(
        self,
        content: str,
        context: GenerationContext,
        iteration: int = 1,
        temperature: float = 0.3,
        timeout: int = 60,
        temperature_config: Optional[TemperatureConfig] = None,
    ) -> AIScore:
        """Detect overly human-like characteristics in content using optimal prompt variation."""
        section_name = context.get_variable("section_name", "Unknown")
        optimal_prompt = self._optimizer.get_optimal_prompt(
            "human", iteration, section_name, self._human_prompt_variations
        )
        logger.info(
            f"Using human detection prompt variation: {optimal_prompt} (iteration {iteration})"
        )

        # Use detection_temp from temperature_config if available, otherwise fallback to legacy temperature
        detection_temp = (
            temperature_config.detection_temp if temperature_config else temperature
        )

        return self._run_detection(
            content,
            context,
            iteration,
            optimal_prompt,
            "human",
            section_name,
            detection_temp,
            timeout,
        )

    def _run_detection(
        self,
        content: str,
        context: GenerationContext,
        iteration: int,
        prompt_name: str,
        detection_type: str,
        section_name: str,
        temperature: float = 0.3,
        timeout: int = 60,
        temperature_config: Optional[TemperatureConfig] = None,
    ) -> AIScore:
        """Run detection analysis using the specified prompt."""
        try:
            # Get the detection prompt
            prompt_template = self._prompt_repository.get_prompt(
                prompt_name, "detection"
            )
            if not prompt_template:
                raise DetectionError(
                    f"Detection prompt not found: {prompt_name}",
                    detection_type=detection_type,
                )

            # Format the prompt with content and context
            # Truncate content to prevent token limit issues
            truncated_content = self._truncate_content_for_detection(content)

            detection_variables = {
                **context.variables,
                "content": truncated_content,
                "content_type": context.content_type,
                "audience_level": context.get_variable(
                    "audience_level", "professional"
                ),
            }

            formatted_prompt = prompt_template.content.format(**detection_variables)

            # Call the API for detection with timeout handling and progress tracking
            try:
                import time

                # API call with minimal logging
                start_time = time.time()
                response = self._api_client.call_api(
                    prompt=formatted_prompt,
                    model=self._model,  # Use provider-specific model instead of hardcoded
                    temperature=temperature,  # Use temperature from configuration
                    max_tokens=4000,  # Increased to 4000 to handle longer responses
                    timeout=timeout,  # Use timeout from configuration
                )
                duration = time.time() - start_time

                # Warn about slow calls
                if duration > 20:
                    self.logger.warning(
                        f"⚠️ Slow API response: {duration:.2f}s (>20s threshold)"
                    )

            except Exception as e:
                duration = time.time() - start_time if "start_time" in locals() else 0
                self.logger.error(
                    f"❌ {detection_type} detection API call failed after {duration:.2f}s: {str(e)}"
                )
                # Return a default score to continue processing
                return AIScore(
                    score=50,  # Neutral score
                    feedback=f"Detection failed due to API error: {str(e)}",
                    iteration=iteration,
                    detection_type=detection_type,
                )

            logger.debug(f"Raw {detection_type} detection response: {response}")

            # Parse the detection response
            score, feedback = self._parse_detection_response(response, detection_type)

            # Track prompt performance using the optimizer
            success = score <= 50  # Success is when score is within threshold
            self._optimizer.track_performance(
                prompt_name, detection_type, score, iteration, success, section_name
            )

            # Also track in legacy system for backward compatibility
            self.track_prompt_performance(
                prompt_name, detection_type, score, iteration, success
            )

            # Display fancy terminal output for detection results
            self._display_detection_results(
                section_name="Detection Results",
                score=score,
                feedback=feedback,
                iteration=iteration,
                detection_type=detection_type,
                prompt_variation=prompt_name,
            )

            return AIScore(
                score=score,
                feedback=feedback,
                iteration=iteration,
                detection_type=detection_type,
            )

        except Exception as e:
            error_msg = str(e)
            logger.error(f"Detection failed for {detection_type}: {error_msg}")

            # Check if this is a token limit issue
            if "MAX_TOKEN" in error_msg or "truncated" in error_msg.lower():
                logger.warning(
                    f"Detection failed due to token limits, using fallback score for {detection_type}"
                )
                # Provide a reasonable fallback score instead of failing
                fallback_score = 50  # Neutral score when detection can't complete
                fallback_feedback = f"Detection unavailable due to content length. Using fallback score of {fallback_score}%."

                # Still display fancy terminal output for fallback
                self._display_detection_results(
                    section_name=section_name,
                    score=fallback_score,
                    feedback=fallback_feedback,
                    iteration=iteration,
                    detection_type=detection_type,
                    prompt_variation=f"{prompt_name} (fallback)",
                )

                return AIScore(
                    score=fallback_score,
                    feedback=fallback_feedback,
                    iteration=iteration,
                    detection_type=detection_type,
                )

            # For other errors, still raise the exception
            raise DetectionError(
                f"Failed to run {detection_type} detection: {error_msg}",
                detection_type=detection_type,
                content_length=len(content),
            ) from e

    def _parse_detection_response(
        self, response: str, detection_type: str
    ) -> tuple[int, str]:
        """Parse the detection response to extract score and feedback."""
        try:
            lines = response.strip().split("\n")
            score = None
            feedback = ""

            for line in lines:
                line = line.strip()
                if line.lower().startswith("percentage:"):
                    # Extract percentage
                    score_text = line.split(":", 1)[1].strip()
                    # Remove % sign and convert to int
                    score_text = score_text.replace("%", "").strip()
                    score = int(score_text)
                elif line.lower().startswith("summary:"):
                    # Extract feedback
                    feedback = line.split(":", 1)[1].strip()

            if score is None:
                # Fallback: try to find any number in the response
                import re

                numbers = re.findall(r"\b(\d{1,3})%?\b", response)
                if numbers:
                    score = int(numbers[0])
                else:
                    logger.warning(
                        f"Could not parse score from {detection_type} response: {response}"
                    )
                    score = 50  # Default score

            if not feedback:
                feedback = (
                    f"No specific feedback provided for {detection_type} detection."
                )

            # Ensure score is in valid range
            score = max(0, min(100, score))

            return score, feedback

        except Exception as e:
            logger.error(
                f"Failed to parse {detection_type} detection response: {str(e)}"
            )
            return 50, f"Failed to parse {detection_type} detection response."

    def _truncate_content_for_detection(
        self, content: str, max_chars: int = 3000
    ) -> str:
        """Truncate content for detection to keep prompts within token limits."""
        if len(content) <= max_chars:
            return content

        # Truncate content but try to keep complete sentences
        truncated = content[:max_chars]

        # Find the last complete sentence
        last_period = truncated.rfind(".")
        last_exclamation = truncated.rfind("!")
        last_question = truncated.rfind("?")

        last_sentence_end = max(last_period, last_exclamation, last_question)

        if last_sentence_end > max_chars * 0.7:  # If we can keep most content
            truncated = truncated[: last_sentence_end + 1]

        # Removed verbose warning
        return truncated + "..."

    def _display_detection_results(
        self,
        section_name: str,
        score: int,
        feedback: str,
        iteration: int,
        detection_type: str,
        prompt_variation: str = None,
    ) -> None:
        """Display fancy terminal output for detection results."""
        # Color codes for terminal
        GREEN = "\033[92m"
        YELLOW = "\033[93m"
        RED = "\033[91m"
        RESET = "\033[0m"

        # Determine color based on score
        if score <= 25:
            score_color = GREEN
        elif score <= 50:
            score_color = YELLOW
        else:
            score_color = RED

        # Create shorter progress bar
        progress_filled = "■" * (score // 10)
        progress_empty = "□" * (10 - (score // 10))
        progress_bar = f"{progress_filled}{progress_empty}"

        # Print minimal output
        print(
            f"{detection_type.upper()}: {score_color}{score}% [{progress_bar}]{RESET}"
        )

    def get_optimal_prompt(self, detection_type: str, iteration: int = 1) -> str:
        """
        Select the optimal prompt variation based on iteration and past performance.

        Strategy:
        - Iteration 1: Start with a baseline prompt (minimal)
        - Iteration 2: Use a different style (comprehensive if minimal failed)
        - Iteration 3+: Rotate through remaining variations or use performance data

        Args:
            detection_type: 'ai' or 'human'
            iteration: Current iteration number (1, 2, 3...)

        Returns:
            Prompt filename to use for detection
        """
        variations = (
            self._ai_prompt_variations
            if detection_type == "ai"
            else self._human_prompt_variations
        )

        if not variations:
            return (
                "ai_detection_prompt_minimal.txt"
                if detection_type == "ai"
                else "human_detection_prompt_minimal.txt"
            )

        # Strategic variation selection
        if iteration == 1:
            # Start with minimal/direct approach
            preferred = f"{detection_type}_detection_prompt_minimal.txt"
            return preferred if preferred in variations else variations[0]

        elif iteration == 2:
            # Switch to comprehensive approach if minimal didn't work
            preferred = f"{detection_type}_detection_prompt.txt"
            return (
                preferred
                if preferred in variations
                else variations[1 % len(variations)]
            )

        elif iteration == 3:
            # Try focused/short variation
            preferred = f"{detection_type}_detection_prompt_short.txt"
            return (
                preferred
                if preferred in variations
                else variations[2 % len(variations)]
            )

        else:
            # Later iterations: cycle through remaining variations
            # Avoid repeating the same pattern
            variation_index = (iteration - 1) % len(variations)
            return variations[variation_index]

    def get_prompt_variation_info(self) -> dict:
        """Get information about available prompt variations."""
        return {
            "ai_variations": len(self._ai_prompt_variations),
            "human_variations": len(self._human_prompt_variations),
            "ai_prompts": self._ai_prompt_variations,
            "human_prompts": self._human_prompt_variations,
            "performance_data": self._prompt_performance,
        }

    def track_prompt_performance(
        self,
        prompt_name: str,
        detection_type: str,
        score: int,
        iteration: int,
        success: bool,
    ) -> None:
        """
        Track performance of prompt variations for future optimization.

        Args:
            prompt_name: Name of the prompt used
            detection_type: 'ai' or 'human'
            score: Detection score returned
            iteration: Iteration number
            success: Whether the score met the threshold
        """
        key = f"{prompt_name}_{detection_type}"
        if key not in self._prompt_performance:
            self._prompt_performance[key] = {
                "uses": 0,
                "total_score": 0,
                "successes": 0,
                "avg_score": 0,
                "success_rate": 0,
            }

        perf = self._prompt_performance[key]
        perf["uses"] += 1
        perf["total_score"] += score
        perf["successes"] += 1 if success else 0
        perf["avg_score"] = perf["total_score"] / perf["uses"]
        perf["success_rate"] = perf["successes"] / perf["uses"]

        logger.debug(f"Prompt performance updated: {key} - {perf}")

    def generate_optimized_prompt(self, detection_type: str) -> tuple[str, str]:
        """
        Generate an optimized prompt based on performance data.

        Args:
            detection_type: 'ai' or 'human'

        Returns:
            Tuple of (prompt_content, suggested_filename)
        """
        return self._optimizer.generate_optimized_prompt(detection_type)

    def get_performance_report(self) -> str:
        """Get a comprehensive performance report for all prompts."""
        return self._optimizer.get_performance_report()

    def get_optimization_analysis(self, detection_type: str = None) -> dict:
        """Get detailed analysis of prompt performance patterns."""
        return self._optimizer.analyze_prompt_patterns(detection_type)

    def save_optimized_prompt(self, detection_type: str) -> str:
        """
        Generate and save an optimized prompt to the prompts directory.

        Returns:
            Path to the saved prompt file
        """
        content, filename = self.generate_optimized_prompt(detection_type)

        # Save to prompts directory
        prompt_path = f"generator/prompts/detection/{filename}"
        try:
            with open(prompt_path, "w") as f:
                f.write(content)
            logger.info(f"Saved optimized prompt: {prompt_path}")

            # Add to available variations
            prompt_name = filename.replace(".txt", "")
            if detection_type == "ai":
                if prompt_name not in self._ai_prompt_variations:
                    self._ai_prompt_variations.append(prompt_name)
            else:
                if prompt_name not in self._human_prompt_variations:
                    self._human_prompt_variations.append(prompt_name)

            return prompt_path
        except Exception as e:
            logger.error(f"Failed to save optimized prompt: {e}")
            raise DetectionError(f"Failed to save optimized prompt: {e}")
