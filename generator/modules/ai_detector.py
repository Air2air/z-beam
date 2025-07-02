"""
Evaluates AI-generated content likelihood.
"""

import os
import time
import random
import requests
import re
from generator.modules.file_handler import load_file
from generator.modules.api_client import call_ai_api
from generator.modules.prompt_formatter import format_prompt
from generator.modules.logger import get_logger
from generator.constants import PROVIDER, AI_DETECTION_FALLBACK_PROMPTS


class AIDetector:
    """Detects AI-generated content likelihood."""

    def __init__(self, content_type="blog post", audience_level="general readership"):
        """Initialize AIDetector with content type and audience level.

        Args:
            content_type (str): Type of content (e.g., blog post).
            audience_level (str): Target audience (e.g., general readership).
        """
        self.content_type = content_type
        self.audience_level = audience_level
        self.logger = get_logger("ai_detector")
        self.prompt = self._load_prompt()

    def _load_prompt(self):
        """Load AI detection prompt with fallback.

        Returns:
            str: Prompt text or default prompt.
        """
        prompt_path = os.path.join(os.path.dirname(__file__), "ai_detection_prompt.txt")
        default_prompt = "Evaluate text for AI traits. Return percentage (0-100) and summary (1-2 sentences): {content}"
        prompt = load_file(prompt_path) or default_prompt
        required_placeholders = ["content_type", "audience_level", "content"]
        missing = [ph for ph in required_placeholders if f"{{{ph}}}" not in prompt]
        if missing:
            self.logger.warning(
                f"Prompt {prompt_path} missing placeholders {missing}. Using default."
            )
            return default_prompt
        return prompt

    def evaluate(self, content, api_keys):
        """Evaluate content for AI likelihood.

        Args:
            content (str): Content to evaluate.
            api_keys (dict): API keys for Grok and Gemini.

        Returns:
            dict: AI score with 'percentage' (0-100) and 'summary'.
        """
        format_vars = {
            "content_type": self.content_type,
            "audience_level": self.audience_level,
            "content": content,
        }
        formatted_prompt = format_prompt(
            self.prompt, format_vars, "ai_detection_prompt.txt", "AI Detection"
        )

        self.logger.info(f"AI detection prompt: {formatted_prompt[:500]}...")

        AI_DETECTOR_MAX_TOKENS = 300
        AI_DETECTOR_TEMPERATURE = 0.5

        payload_contents = [formatted_prompt] + [
            prompt.format(content=content) for prompt in AI_DETECTION_FALLBACK_PROMPTS
        ]
        for attempt, prompt_text in enumerate(payload_contents, 1):
            try:
                self.logger.info(
                    f"Attempting AI detection with provider: {PROVIDER} (attempt {attempt})"
                )
                result_content = call_ai_api(
                    prompt_text,
                    max_tokens=AI_DETECTOR_MAX_TOKENS,
                    temperature=AI_DETECTOR_TEMPERATURE,
                    retries=3,
                    grok_api_key=api_keys["grok"],
                    gemini_api_key=api_keys["gemini"],
                )
                self.logger.info(
                    f"AI detection response (attempt {attempt}): {result_content[:500]}..."
                )
                # Parse plain text response
                match = re.match(
                    r"Percentage: (\d+)\nSummary: (.*?)(?:\n|$)",
                    result_content,
                    re.DOTALL,
                )
                if match:
                    percentage = int(match.group(1))
                    summary = match.group(2).strip()
                    if 0 <= percentage <= 100:
                        return {"percentage": percentage, "summary": summary}
                self.logger.warning(
                    f"Invalid AI detection response format: {result_content[:500]}..."
                )
                return {"percentage": 0, "summary": "Invalid response format"}
            except requests.RequestException as e:
                status_code = e.response.status_code if e.response else "N/A"
                response_text = e.response.text if e.response else "N/A"
                self.logger.error(
                    f"AI detection failed, attempt {attempt}: {e}, status: {status_code}, response: {response_text}"
                )
                if attempt < len(payload_contents):
                    delay = (1 * 2 ** (attempt - 1)) + random.uniform(0, 0.1)
                    self.logger.info(
                        f"Retrying with simplified prompt after {delay:.2f}s (attempt {attempt + 1})"
                    )
                    time.sleep(delay)
                    continue
                return {"percentage": 0, "summary": f"Detection failed: {e}"}
            except Exception as e:
                self.logger.error(
                    f"Unexpected error during AI detection, attempt {attempt}: {e}"
                )
                if attempt < len(payload_contents):
                    delay = (1 * 2 ** (attempt - 1)) + random.uniform(0, 0.1)
                    self.logger.info(
                        f"Retrying with simplified prompt after {delay:.2f}s (attempt {attempt + 1})"
                    )
                    time.sleep(delay)
                    continue
                return {
                    "percentage": 0,
                    "summary": f"Detection failed after retries: {e}",
                }

        return {"percentage": 0, "summary": "Detection failed after all retries"}
