# generator/modules/content_generator.py

import json
import re
from typing import Dict, Any
from datetime import datetime
import os

from tqdm import tqdm, trange

from generator.modules.logger import get_logger
from generator.modules import api_client
from generator.modules.prompt_formatter import format_prompt
from generator.config.settings import AppConfig
from generator.modules.prompt_manager import PromptManager

logger = get_logger("content_generator")
config = AppConfig()

prompt_manager = PromptManager(os.path.join(os.path.dirname(__file__), "../prompts"))


def load_rewrite_prompt():
    try:
        prompt = prompt_manager.load_prompt("rewrite_humanize_prompt.txt", "detection")
        if not prompt:
            logger.warning(
                "rewrite_humanize_prompt.txt not found or empty in detection prompts."
            )
        return prompt
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
    if not prompt_template.strip():
        logger.error(
            f"Material research prompt template '{prompt_file_name}' is empty."
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
        logger.debug(
            f"Raw AI response for material research on '{material}': {response_text}"
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
            if not material_data:
                logger.warning(
                    f"Parsed material_data is empty for '{material}'. Raw response: {response_text}"
                )
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
    human_detection_threshold: int,  # Add human threshold as parameter
    ai_detect: bool = True,  # New flag
    iterations_per_section: int = 3,  # Number of retries per section
) -> tuple[str, int, bool]:
    print(f"\n[PROGRESS] Starting generation for section: {section_name}")
    # Only log section metadata once per run, not per iteration
    if section_name not in section_metadata_logged:
        logger.info(
            f"[DEBUG] Attempting to generate section: {section_name} using prompt file: {prompt_file_name}"
        )
        logger.info(
            f"[DEBUG] section_variables: {json.dumps(section_variables, indent=2)}"
        )
        logger.info(
            f"[DEBUG] article_data: {json.dumps(article_data, indent=2) if article_data else '{}'}"
        )
        logger.info(
            f"[DEBUG] cache_data keys: {list(cache_data.keys()) if cache_data else 'None'}"
        )
        section_metadata_logged.add(section_name)

    if not prompt_template:
        logger.warning(
            f"[DEBUG] Prompt template for section '{section_name}' (file: {prompt_file_name}) is missing or empty."
        )
        print(
            f"[ERROR] Prompt template for section '{section_name}' (file: {prompt_file_name}) is missing or empty. Skipping section generation."
        )
        return "", 100, False

    from generator.modules.ai_detector import _evaluate_human_likeness

    best_content = ""
    best_ai_score = 100
    best_human_score = 0
    threshold_met = False

    for i in range(iterations_per_section):
        if i == 0:
            log_metadata = True
        else:
            log_metadata = False
        # 1. Generate content
        filled_prompt = format_prompt(
            prompt_template,
            section_variables,
            prompt_file_name,
            section_name,
        )
        try:
            response_text = api_client.call_ai_api(
                prompt=filled_prompt,
                provider=provider,
                model=model,
                api_keys=api_keys,
                temperature=section_variables.get("temperature", 0.7),
                max_tokens=1500,
            )
        except Exception as e:
            logger.error(
                f"API request failed for section '{section_name}' (iteration {i + 1}): {e}"
            )
            continue
        if not response_text or not response_text.strip():
            logger.warning(
                f"Empty response for section '{section_name}' (iteration {i + 1})"
            )
            continue
        # 2. Run AI likelihood detection
        ai_score = (
            _evaluate_human_likeness(
                response_text,
                provider,
                model,
                section_name,
                section_variables.get("audience_level", "general"),
                api_keys,
                prompt_templates_dict,
            )
            if ai_detect
            else 0
        )
        # 3. Run Human likelihood detection (invert AI score for now, or implement real logic if available)
        # Placeholder: human_score = 100 - ai_score
        human_score = 100 - ai_score
        # 4. Check thresholds
        if (
            ai_score <= ai_detection_threshold
            and human_score >= human_detection_threshold
        ):
            best_content = response_text
            best_ai_score = ai_score
            best_human_score = human_score
            threshold_met = True
            logger.info(
                f"Section '{section_name}' passed on iteration {i + 1} (AI: {ai_score}%, Human: {human_score}%)"
            )
            break
        # Track best attempt
        if ai_score < best_ai_score or (
            ai_score == best_ai_score and human_score > best_human_score
        ):
            best_content = response_text
            best_ai_score = ai_score
            best_human_score = human_score
        logger.info(
            f"Section '{section_name}' failed iteration {i + 1} (AI: {ai_score}%, Human: {human_score}%)"
        )
    if not threshold_met:
        logger.warning(
            f"Section '{section_name}' did not meet thresholds after {iterations_per_section} iterations. Best AI: {best_ai_score}%, Human: {best_human_score}%."
        )
    return best_content, best_ai_score, threshold_met


# Track which sections have had their metadata logged
section_metadata_logged = set()
