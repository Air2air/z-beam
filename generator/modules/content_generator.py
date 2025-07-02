# generator/modules/content_generator.py

import json
import re
from typing import Dict, Any, Tuple
from datetime import datetime

from generator.modules.logger import get_logger
from generator.modules import api_client
from generator.modules.prompt_formatter import format_prompt
from generator.constants import BASE_ARTICLE_CONFIG

logger = get_logger("content_generator")


def research_material_config(
    material: str,
    provider: str,
    model: str,
    api_keys: Dict[str, str],
    prompt_templates_dict: Dict[str, str],
) -> Dict[str, Any] | None:
    """
    Researches and generates a material configuration using the AI.
    """
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

    api_config = {  # This dictionary is now used to extract arguments
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
    """
    Generates content for a given section using the AI.
    Handles caching and human-likeness evaluation.
    """
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

    api_config = {  # This dictionary is now used to extract arguments
        "temperature": 0.7,
        "max_output_tokens": 1000,
    }

    content_length_hint = section_variables.get(
        "content_length", BASE_ARTICLE_CONFIG["content_length"]
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
        # --- START OF ADDED DEBUG LINE ---
        logger.debug(
            f"AI Response for section '{section_name}': {response_text[:500] if response_text else 'EMPTY'}..."
        )
        # --- END OF ADDED DEBUG LINE ---

        if not response_text:
            logger.warning(f"AI returned empty response for section: {section_name}")
            return ""

        content_type = section_name.replace("_", " ")
        audience_level = section_variables.get("authority", "medium")

        ai_likelihood = _evaluate_human_likeness(
            response_text,
            provider,
            model,
            content_type,
            audience_level,
            api_keys,
            prompt_templates_dict,
        )
        logger.info(f"AI Likelihood for '{section_name}': {ai_likelihood}%")

        if ai_likelihood > 60:
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
                    audience_level,
                    api_keys,
                    prompt_templates_dict,
                )
                logger.info(
                    f"Retry AI Likelihood for '{section_name}': {ai_likelihood_retry}%"
                )
                if ai_likelihood_retry <= 60:
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
    """
    Evaluates the human-likeness of the generated content using an AI model.
    Returns a percentage (0-100).
    """
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

    api_config = {  # This dictionary is now used to extract arguments
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
        # --- START OF ADDED DEBUG LINE ---
        logger.debug(
            f"AI Detection Response: {response[:100] if response else 'EMPTY'}..."
        )
        # --- END OF ADDED DEBUG LINE ---
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
