"""
Detects AI-generated content using a separate AI model.
"""

from generator.modules.api_client import call_ai_api
from generator.modules.file_handler import parse_json_response
from generator.modules.logger import get_logger
from generator.constants import (
    AI_DETECTION_FALLBACK_PROMPTS,
)  # Assuming this is still used

logger = get_logger("ai_detector")


class AIDetector:
    def __init__(self, content_type="text", audience_level="general"):
        """
        Initializes the AI detector.

        Args:
            content_type (str): Describes the type of content being evaluated (e.g., "technical article", "blog post").
            audience_level (str): Describes the target audience (e.g., "engineers", "general public").
        """
        self.content_type = content_type
        self.audience_level = audience_level
        self.detection_prompt_template = (
            "Analyze the following text for characteristics commonly associated with AI-generated content. "
            "Consider the naturalness, complexity, specific terminology, and overall flow expected for a "
            f"'{self.content_type}' aimed at '{self.audience_level}'. "
            "Provide a single JSON object with two keys: 'percentage' (an integer from 0 to 100 representing "
            "the likelihood of AI generation, where 0 is definitely human and 100 is definitely AI) "
            "and 'summary' (a concise 1-2 sentence explanation of your assessment, referencing specific traits). "
            "Strictly output only the JSON object. Do NOT include any other text or markdown formatting outside the JSON.\n\n"
            "TEXT TO ANALYZE:\n{content}"
        )

    def evaluate(self, content, api_keys, provider):
        """
        Evaluates the given content for AI likelihood using an AI model.

        Args:
            content (str): The text content to evaluate.
            api_keys (dict): Dictionary containing 'grok' and 'gemini' API keys.
            provider (str): The AI provider to use for detection (e.g., "GEMINI").

        Returns:
            dict: A dictionary with 'percentage' (int) and 'summary' (str) of AI likelihood.
                  Returns default if API call fails or response is invalid.
        """
        default_result = {
            "percentage": 0,
            "summary": "AI detection failed or could not be determined.",
        }

        if not content or not content.strip():
            logger.warning(
                "Attempted AI detection on empty content. Returning default."
            )
            return {
                "percentage": 0,
                "summary": "Empty content provided for AI detection.",
            }

        prompt = self.detection_prompt_template.format(content=content)

        try:
            # Use a slightly lower temperature for detection to get more deterministic results
            # and potentially a more powerful model like PRO for better accuracy.
            # However, sticking to the main provider's model for simplicity here unless specified otherwise.
            detection_response_raw = call_ai_api(
                prompt,
                max_tokens=200,  # Sufficient for a short JSON response
                retries=2,  # Fewer retries for detection, as main content generation has retries
                grok_api_key=api_keys.get("grok"),
                gemini_api_key=api_keys.get("gemini"),
                provider=provider,
                temperature=0.2,  # Lower temperature for less creativity, more factual response
                # model="gemini-1.5-pro" # Consider using a more powerful model for detection if needed
            )

            logger.debug(
                f"Raw AI detection response: {detection_response_raw[:200]}..."
            )

            # Use parse_json_response for robust parsing
            parsed_response = parse_json_response(
                detection_response_raw,
                default=default_result,
                context=f"AI detection for {self.content_type}",
            )

            # Validate the parsed response structure
            if (
                isinstance(parsed_response, dict)
                and "percentage" in parsed_response
                and "summary" in parsed_response
            ):
                percentage = parsed_response["percentage"]
                summary = parsed_response["summary"]

                if (
                    isinstance(percentage, (int, float))
                    and 0 <= percentage <= 100
                    and isinstance(summary, str)
                ):
                    return {"percentage": int(percentage), "summary": summary}
                else:
                    logger.warning(
                        f"AI detection response has invalid data types or range: {parsed_response}. Using default."
                    )
                    return default_result
            else:
                logger.warning(
                    f"AI detection response not in expected JSON format: {parsed_response}. Using default."
                )
                return default_result

        except Exception as e:
            logger.error(
                f"Error during AI detection API call for '{self.content_type}': {e}"
            )
            return default_result
