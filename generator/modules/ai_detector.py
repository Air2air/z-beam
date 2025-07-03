# generator/modules/content_generator.py

import json
import re
from typing import Dict, Any, Tuple
from datetime import datetime

from generator.modules.logger import get_logger
from generator.modules import api_client
from generator.modules.prompt_formatter import format_prompt
from generator.config.settings import AppConfig

logger = get_logger("content_generator")
config = AppConfig()


def research_material_config(
    material: str,
    provider: str,
    model: str,
    api_keys: Dict[str, str],
    prompt_templates_dict: Dict[str, str],
) -> Dict[str, Any] | None:
    logger.info(
        f"Researching material config for: {material} (provider: {provider}, model: {model})"
    )
    prompt_file_name = "material_research.txt"
    prompt_template = prompt_templates_dict.get(prompt_file_name)
    if not prompt_template:
        logger.error(
            f"Material research prompt template '{prompt_file_name}' not found in loaded templates."
        )
        return None

    filled_prompt = format_prompt(
        prompt_template,
        {"material": material},
        prompt_file_name,
        "material_config_research",
    )

    api_config = {
        "temperature": 0.2,
        "max_output_tokens": 500,
    }

    try:
        response_text = api_client.call_ai_api(
            prompt=filled_prompt,
            provider=provider,
            model=model,
            api_keys=api_keys,
            temperature=api_config["temperature"],
            max_tokens=api_config["max_output_tokens"],
        )
        if response_text:
            material_data = {}
            lines = response_text.strip().split("\n")
            for line in lines:
                if ":" in line:
                    key, value = line.split(":", 1)
                    material_data[key.strip()] = value.strip()
            return material_data
        else:
            logger.warning(
                f"No response text received for material research on '{material}'."
            )
            return None
    except Exception as e:
        logger.error(f"API request failed for material research ({provider}): {e}")
        raise


def generate_content(
    section_name: str,
    prompt_template: str,
    section_variables: Dict[str, Any],
    article_data: Dict[str, Any],
    cache_data: Dict[str, Any],
    provider: str,
    model: str,
    force_regenerate: bool,
    api_keys: Dict[str, str],
    prompt_templates_dict: Dict[str, str],
    prompt_file_name: str,
) -> str:
    cache_key = f"{section_name}_{json.dumps(section_variables, sort_keys=True)}"

    if not force_regenerate and cache_key in cache_data.get("sections", {}):
        cached_content = cache_data["sections"][cache_key].get("content")
        if cached_content:
            logger.info(f"Returning cached content for section: {section_name}")
            return cached_content
        else:
            logger.warning(
                f"Cached content for section '{section_name}' was empty. Regenerating."
            )

    filled_prompt = format_prompt(
        prompt_template, section_variables, prompt_file_name, section_name
    )

    api_config = {
        "temperature": 0.7,
        "max_output_tokens": 1000,
    }

    content_length_hint = section_variables.get(
        "content_length", config.content.default_content_lengths
    )
    section_length_str = content_length_hint.get(
        section_name
    ) or content_length_hint.get("paragraph")
    if section_length_str:
        match = re.search(r"(\d+)-(\d+)", section_length_str)
        if match:
            max_words = int(match.group(2))
            api_config["max_output_tokens"] = max(500, max_words * 2)

    try:
        response_text = api_client.call_ai_api(
            prompt=filled_prompt,
            provider=provider,
            model=model,
            api_keys=api_keys,
            temperature=api_config["temperature"],
            max_tokens=api_config["max_output_tokens"],
        )
        logger.debug(
            f"AI Response for section '{section_name}': {response_text[:500] if response_text else 'EMPTY'}..."
        )

        if not response_text:
            logger.warning(f"AI returned empty response for section: {section_name}")
            return ""

        content_type = section_name.replace("_", " ")
        # Remove legacy audience_level/authority usage
        ai_likelihood = _evaluate_human_likeness(
            response_text,
            provider,
            model,
            content_type,
            None,  # No audience_level/authority
            api_keys,
            prompt_templates_dict,
        )
        logger.info(f"AI Likelihood for '{section_name}': {ai_likelihood}%")

        if ai_likelihood > config.content.ai_detection_threshold:
            logger.warning(
                f"Content for '{section_name}' is too AI-like ({ai_likelihood}%). Attempting to regenerate..."
            )
            response_text_retry = api_client.call_ai_api(
                prompt=filled_prompt,
                provider=provider,
                model=model,
                api_keys=api_keys,
                temperature=api_config["temperature"],
                max_tokens=api_config["max_output_tokens"],
            )
            if response_text_retry:
                ai_likelihood_retry = _evaluate_human_likeness(
                    response_text_retry,
                    provider,
                    model,
                    content_type,
                    None,  # No audience_level/authority
                    api_keys,
                    prompt_templates_dict,
                )
                logger.info(
                    f"Retry AI Likelihood for '{section_name}': {ai_likelihood_retry}%"
                )
                if ai_likelihood_retry <= config.content.ai_detection_threshold:
                    response_text = response_text_retry
                    ai_likelihood = ai_likelihood_retry
                    logger.info(f"Regeneration successful for '{section_name}'.")
                else:
                    logger.warning(
                        f"Regenerated content for '{section_name}' is still too AI-like. Using first attempt."
                    )
            else:
                logger.warning(
                    f"Regeneration attempt for '{section_name}' failed to get a response. Using first attempt."
                )

        improved_content, final_score = evaluate_human_likeness_incremental(
            response_text,
            provider,
            model,
            content_type,
            None,  # No audience_level/authority
            api_keys,
            prompt_templates_dict,
            max_attempts=5,
            threshold=config.content.ai_detection_threshold,
        )

        if final_score <= config.content.ai_detection_threshold:
            logger.info(
                f"Content for '{section_name}' improved to acceptable AI-likeness level ({final_score}%)."
            )
            response_text = improved_content
        else:
            logger.warning(
                f"Content for '{section_name}' still too AI-like after regeneration ({final_score}%)."
            )

        if "sections" not in cache_data:
            cache_data["sections"] = {}
        cache_data["sections"][cache_key] = {
            "content": response_text,
            "ai_likelihood": ai_likelihood,
            "timestamp": datetime.now().isoformat(),
        }

        return response_text

    except Exception as e:
        logger.error(f"Error calling AI for section '{section_name}': {e}")
        return ""


def _evaluate_human_likeness(
    content: str,
    provider: str,
    model: str,
    content_type: str,
    audience_level: str,
    api_keys: Dict[str, str],
    prompt_templates_dict: Dict[str, str],
) -> int:
    prompt_file_name = "ai_detection_prompt.txt"
    prompt_template = prompt_templates_dict.get(prompt_file_name)

    if not prompt_template:
        logger.error(
            f"AI detection prompt template '{prompt_file_name}' not found in loaded templates."
        )
        return 0

    filled_prompt = format_prompt(
        prompt_template,
        {
            "content": content,
            "content_type": content_type,
            "audience_level": audience_level,
        },
        prompt_file_name,
        "ai_likeness_evaluation",
    )

    api_config = {
        "temperature": 0.0,
        "max_output_tokens": 50,
    }

    try:
        response = api_client.call_ai_api(
            prompt=filled_prompt,
            provider=provider,
            model=model,
            api_keys=api_keys,
            temperature=api_config["temperature"],
            max_tokens=api_config["max_output_tokens"],
        )
        logger.debug(
            f"AI Detection Response: {response[:100] if response else 'EMPTY'}..."
        )
        if response:
            match = re.search(r"Percentage:\s*(\d+)%", response)
            if match:
                return int(match.group(1))
            else:
                logger.warning(
                    f"Could not parse AI likelihood percentage from response: '{response[:100]}...'"
                )
                return 100
        else:
            logger.warning("AI detection model returned empty response.")
            return 100
    except Exception as e:
        logger.error(f"Error calling AI for human-likeness evaluation: {e}")
        return 100


def evaluate_human_likeness_incremental(
    content: str,
    provider: str,
    model: str,
    content_type: str,
    audience_level: str,
    api_keys: Dict[str, str],
    prompt_templates_dict: Dict[str, str],
    max_attempts: int = 5,
    threshold: int = 50,
) -> Tuple[str, int]:
    """
    Iteratively improve content to lower AI-likeness using feedback and prompt variation.
    Returns (final_content, ai_likeness_score)
    """
    prompt_file_name = "ai_detection_prompt.txt"  # Use the correct prompt file
    # Try both new and legacy locations for backward compatibility
    prompt_template = prompt_templates_dict.get(
        f"detection/{prompt_file_name}"
    ) or prompt_templates_dict.get(prompt_file_name)
    logger.info(
        f"[AI DETECTOR] Using prompt template: {prompt_file_name} (found: {'Yes' if prompt_template else 'No'})"
    )
    if not prompt_template:
        logger.error(
            f"AI detector prompt template '{prompt_file_name}' not found in loaded templates."
        )
        return content, 100

    filled_prompt = format_prompt(
        prompt_template,
        {
            "content": content,
            "content_type": content_type,
            "audience_level": audience_level,
        },
        prompt_file_name,
        "ai_likeness_evaluation",
    )

    api_config = {
        "temperature": 0.0,
        "max_output_tokens": 50,
    }

    last_content = content
    last_score = 100
    for attempt in range(max_attempts):
        # Add feedback for each attempt, but do NOT add extra instructions—let the prompt template handle all guidance
        feedback = ""
        if attempt > 0:
            feedback = (
                f"\n\nPrevious output (AI-likeness: {last_score}%):\n{last_content}\n"
                "Please revise the above to reduce the AI-likeness score, using the criteria and guidance in this prompt."
            )
        filled_prompt = format_prompt(
            prompt_template,
            {
                "content": last_content,
                "content_type": content_type,
                "audience_level": audience_level,
                "feedback": feedback,
            },
            prompt_file_name,
            "ai_likeness_evaluation",
        )
        try:
            response = api_client.call_ai_api(
                prompt=filled_prompt,
                provider=provider,
                model=model,
                api_keys=api_keys,
                temperature=api_config["temperature"],
                max_tokens=api_config["max_output_tokens"],
            )
            logger.debug(
                f"AI Detection Response (Attempt {attempt}): {response[:100] if response else 'EMPTY'}..."
            )
            if response:
                match = re.search(r"Percentage:\s*(\d+)%", response)
                if match:
                    score = int(match.group(1))
                    logger.info(f"AI Likelihood Score (Attempt {attempt}): {score}%")
                    if score <= threshold:
                        logger.info(f"Content accepted as human-like (score: {score}%)")
                        return content, score
                    else:
                        logger.warning(
                            f"Content still too AI-like (score: {score}%). Regenerating..."
                        )
                else:
                    logger.warning(
                        f"Could not parse AI likelihood percentage from response: '{response[:100]}...'"
                    )
            else:
                logger.warning("AI detection model returned empty response.")

        except Exception as e:
            logger.error(
                f"Error calling AI for human-likeness evaluation (Attempt {attempt}): {e}"
            )

        # If we reach here, it means we need to regenerate the content
        content = api_client.regenerate_content(
            content,
            provider,
            model,
            api_keys,
            prompt_templates_dict,
            section_name="ai_likeness_evaluation",
        )

        filled_prompt = format_prompt(
            prompt_template,
            {
                "content": content,
                "content_type": content_type,
                "audience_level": audience_level,
            },
            prompt_file_name,
            "ai_likeness_evaluation",
        )

    logger.error(
        "Max attempts reached. Content could not be improved to acceptable level."
    )
    return content, 100
