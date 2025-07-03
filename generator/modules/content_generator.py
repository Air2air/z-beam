# generator/modules/content_generator.py

import json
import re
from typing import Dict, Any
from datetime import datetime
import os

from generator.modules.logger import get_logger
from generator.modules import api_client
from generator.modules.prompt_formatter import format_prompt
from generator.config.settings import AppConfig

logger = get_logger("content_generator")
config = AppConfig()

REWRITE_PROMPT_PATH = os.path.join(
    os.path.dirname(__file__), "../detection/rewrite_humanize_prompt.txt"
)


def load_rewrite_prompt():
    try:
        with open(REWRITE_PROMPT_PATH, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        logger.error(f"Failed to load rewrite prompt: {e}")
        return None


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
                    key = key.strip()
                    value = value.strip()
                    # Parse comma-separated fields as lists
                    if key in ["keywords", "industries", "applications"]:
                        material_data[key] = [
                            v.strip() for v in value.split(",") if v.strip()
                        ]
                    else:
                        material_data[key] = value
            # Map legacy/alternate keys to expected ones for metadata
            if "material_type" in material_data:
                material_data["materialType"] = material_data.pop("material_type")
            if "metal_class" in material_data:
                material_data["metalClass"] = material_data.pop("metal_class")
            if "primary_application" in material_data:
                material_data["primaryApplication"] = material_data.pop(
                    "primary_application"
                )
            if "material_description" in material_data:
                if "material_details" not in material_data:
                    material_data["material_details"] = {}
                material_data["material_details"]["material_description"] = (
                    material_data.pop("material_description")
                )
            if "applications" in material_data:
                if "material_details" not in material_data:
                    material_data["material_details"] = {}
                material_data["material_details"]["applications"] = material_data[
                    "applications"
                ]
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
    ai_detection_threshold: int,  # Add threshold as parameter
    ai_detect: bool = True,  # New flag
) -> tuple[str, int, bool]:
    print(f"\n[PROGRESS] Starting generation for section: {section_name}")
    # Strict required fields check
    required_args = [
        section_name,
        prompt_template,
        section_variables,
        article_data,
        cache_data,
        provider,
        model,
        force_regenerate,
        api_keys,
        prompt_templates_dict,
        prompt_file_name,
        ai_detection_threshold,
    ]
    required_names = [
        "section_name",
        "prompt_template",
        "section_variables",
        "article_data",
        "cache_data",
        "provider",
        "model",
        "force_regenerate",
        "api_keys",
        "prompt_templates_dict",
        "prompt_file_name",
        "ai_detection_threshold",
    ]
    missing = [name for arg, name in zip(required_args, required_names) if arg is None]
    if missing:
        raise ValueError(
            f"Missing required arguments to generate_content: {', '.join(missing)}"
        )

    cache_key = f"{section_name}_{json.dumps(section_variables, sort_keys=True)}"

    if not force_regenerate and cache_key in cache_data.get("sections", {}):
        cached_content = cache_data["sections"][cache_key].get("content")
        if cached_content:
            logger.info(f"Returning cached content for section: {section_name}")
            return cached_content, 0, True
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

    attempt = 1
    likelihoods = []
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
            return "", 100, False

        content_type = section_name.replace("_", " ")
        audience_level = section_variables.get("audience_level", "medium")

        if not ai_detect:
            logger.info(f"Skipping AI-likeness detection for section: {section_name}")
            ai_likelihood = 0
            response_text_final = response_text
            threshold_met = True
            print(f"[PROGRESS] Finished generation for section: {section_name}")
            if "sections" not in cache_data:
                cache_data["sections"] = {}
            cache_data["sections"][cache_key] = {
                "content": response_text_final,
                "ai_likelihood": ai_likelihood,
                "likelihoods": likelihoods,
                "iterations": attempt,
                "timestamp": datetime.now().isoformat(),
            }
            return response_text_final, ai_likelihood, threshold_met

        logger.info(
            f"[AI DETECTOR] Evaluating human-likeness for section: {section_name}"
        )
        ai_likelihood = _evaluate_human_likeness(
            response_text,
            provider,
            model,
            content_type,
            audience_level,
            api_keys,
            prompt_templates_dict,
        )
        logger.info(
            f"[AI DETECTOR] AI Likelihood for '{section_name}': {ai_likelihood}%"
        )

        if ai_likelihood > ai_detection_threshold and section_name not in [
            "chart",
            "table",
        ]:
            logger.warning(
                f"Content for '{section_name}' is too AI-like ({ai_likelihood}%). Attempting to regenerate..."
            )
            max_attempts = section_variables.get("iterations_per_section", 3)
            attempt = 1
            response_text_final = None
            ai_likelihood = 100
            last_output = None
            likelihoods = []
            rewrite_prompt_template = load_rewrite_prompt()
            while attempt <= max_attempts:
                print(
                    f"[PROGRESS] AI rewrite iteration {attempt} for section: {section_name}"
                )
                logger.info(
                    f"[AI DETECTOR] Attempt {attempt} (rewrite) for section: {section_name}"
                )
                if rewrite_prompt_template:
                    if attempt == 1:
                        base_text = response_text
                    else:
                        base_text = last_output
                    rewrite_prompt = rewrite_prompt_template.replace(
                        "{previous_version}", base_text or ""
                    )
                else:
                    if attempt == 1:
                        base_text = response_text
                    else:
                        base_text = last_output
                    rewrite_prompt = f"Rewrite the following to sound more human, natural, and less like it was written by AI.\n\nPrevious version:\n{base_text}"
                print(
                    f"[PROGRESS] Running AI detection for section: {section_name}, iteration {attempt}"
                )
                response_text_current = api_client.call_ai_api(
                    prompt=rewrite_prompt,
                    provider=provider,
                    model=model,
                    api_keys=api_keys,
                    temperature=api_config["temperature"],
                    max_tokens=api_config["max_output_tokens"],
                )
                print(
                    f"[PROGRESS] Finished AI rewrite iteration {attempt} for section: {section_name}"
                )
                if not response_text_current:
                    logger.warning(
                        f"Regeneration attempt {attempt} for '{section_name}' failed to get a response. Using previous attempt."
                    )
                    break
                ai_likelihood = (
                    0
                    if section_name in ["chart", "table"]
                    else _evaluate_human_likeness(
                        response_text_current,
                        provider,
                        model,
                        content_type,
                        audience_level,
                        api_keys,
                        prompt_templates_dict,
                    )
                )
                likelihoods.append(ai_likelihood)
                logger.info(
                    f"[AI DETECTOR] Attempt {attempt} AI-likeness (likelihood of being AI-generated) for '{section_name}': {ai_likelihood}% (threshold: {ai_detection_threshold}%) | All attempts so far: {likelihoods}"
                )
                if ai_likelihood <= ai_detection_threshold or section_name in [
                    "chart",
                    "table",
                ]:
                    response_text_final = response_text_current
                    logger.info(
                        f"[AI DETECTOR] Content accepted for '{section_name}' on attempt {attempt} (AI-likeness: {ai_likelihood}%, threshold: {ai_detection_threshold}%). Total iterations: {attempt}"
                    )
                    break
                else:
                    logger.info(
                        f"[AI DETECTOR] Content rejected for '{section_name}' on attempt {attempt} (AI-likeness: {ai_likelihood}%, threshold: {ai_detection_threshold}%). Iterative rewrite..."
                    )
                last_output = response_text_current
                attempt += 1
            else:
                response_text_final = response_text_current
                logger.warning(
                    f"[AI DETECTOR] Max attempts reached for '{section_name}'. Using last generated content (AI Likelihood: {ai_likelihood}%, threshold: {ai_detection_threshold}%). Total iterations: {attempt - 1}"
                )

        else:
            response_text_final = response_text

        if "sections" not in cache_data:
            cache_data["sections"] = {}
        cache_data["sections"][cache_key] = {
            "content": response_text_final,
            "ai_likelihood": ai_likelihood,
            "likelihoods": likelihoods,
            "iterations": attempt
            if ai_likelihood <= ai_detection_threshold
            else attempt - 1,
            "timestamp": datetime.now().isoformat(),
        }

        threshold_met = (ai_likelihood <= ai_detection_threshold) or section_name in [
            "chart",
            "table",
        ]
        print(f"[PROGRESS] Finished generation for section: {section_name}")
        return response_text_final, ai_likelihood, threshold_met

    except Exception as e:
        logger.error(f"Error calling AI for section '{section_name}': {e}")
        return "", 100, False


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
