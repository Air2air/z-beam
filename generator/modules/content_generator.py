# generator/modules/content_generator.py

import json
import os
from typing import Dict, Any

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
    generator_provider: str,
    model: str,
    api_keys: Dict[str, str],
    prompt_templates_dict: Dict[str, str],
    generator_model_settings: dict = None,
) -> Dict[str, Any] | None:
    logger.info(
        f"Researching material config for: {material} (generator_provider: {generator_provider}, model: {model})"
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
        "temperature": generator_model_settings["default_temperature"]
        if generator_model_settings
        else 0.2,
        "max_output_tokens": generator_model_settings["default_max_tokens"]
        if generator_model_settings
        else 500,
        "url_template": generator_model_settings["url_template"]
        if generator_model_settings
        else None,
    }

    try:
        response_text = api_client.call_ai_api(
            prompt=filled_prompt,
            provider=generator_provider,
            model=model,
            api_keys=api_keys,
            temperature=api_config["temperature"],
            max_tokens=api_config["max_output_tokens"],
            url_template=api_config["url_template"],
            backoff_factor=2.0,
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
        logger.error(
            f"API request failed for material research ({generator_provider}): {e}"
        )
        raise


def _strip_revision_instruction(response_text: str) -> str:
    """
    Remove the prepended revision instruction and feedback from the model's response, if present.
    """
    import re

    # Remove up to and including the first blank line (\n\n) after the instruction/feedback
    pattern = r"^(Revise the following section based on this feedback to make it more human-like and less AI-detectable\.\nFeedback:.*?\n\n)"
    return re.sub(pattern, "", response_text, flags=re.DOTALL)


def generate_with_feedback_loop(
    section_name: str,
    prompt_template: str,
    section_variables: dict,
    generator_provider: str,
    model: str,
    api_keys: dict,
    prompt_templates_dict: dict,
    prompt_file_name: str,
    ai_detection_threshold: int,
    human_detection_threshold: int,
    iterations_per_section: int,
    generator_model_settings: dict = None,
    detection_provider: str = None,
    detection_model_settings: dict = None,
) -> tuple[str, int, bool]:
    """
    Adaptive feedback-driven revision loop for robust human-like content generation.
    Keeps a history of attempts, dynamically injects feedback, varies temperature, and selects the best output.
    """
    from generator.modules.ai_detector import parse_ai_detection_feedback

    attempts = []
    best_content = ""
    best_ai_score = 100
    best_human_score = 0
    threshold_met = False
    previous_output = None
    revision_feedback = ""
    detection_prompt_template = prompt_manager.load_prompt(
        "ai_detection_prompt.txt", "detection"
    )
    base_temperature = section_variables.get("temperature", 0.7)
    for i in range(iterations_per_section):
        # Dynamically vary temperature for diversity
        temperature = base_temperature + (0.1 * i if i > 0 else 0)
        # Always revise previous output after the first iteration
        if i > 0 and previous_output:
            section_variables_with_feedback = dict(section_variables)
            # Use feedback if available, otherwise use a generic revision instruction
            section_variables_with_feedback["revision_feedback"] = (
                revision_feedback
                or "Try to make the writing more human-like and less AI-detectable."
            )
            revision_instruction = (
                "Revise the following section based on this feedback to make it more human-like and less AI-detectable.\n"
                "Feedback: {revision_feedback}\n\n"
            )
            revision_instruction += (
                "Previous Output:\n" + previous_output.strip() + "\n\n"
            )
            filled_prompt = format_prompt(
                revision_instruction + prompt_template,
                section_variables_with_feedback,
                prompt_file_name,
                section_name,
            )
        else:
            filled_prompt = format_prompt(
                prompt_template,
                section_variables,
                prompt_file_name,
                section_name,
            )
        logger.debug(
            f"[FEEDBACK LOOP] Iteration {i + 1} for '{section_name}':\nFeedback: {revision_feedback}\nPrompt: {filled_prompt[:1000]}\n---END PROMPT---"
        )
        try:
            response_text = api_client.call_ai_api(
                prompt=filled_prompt,
                provider=generator_provider,
                model=model,
                api_keys=api_keys,
                temperature=temperature,
                max_tokens=1500,
                url_template=generator_model_settings["url_template"]
                if generator_model_settings
                else None,
                backoff_factor=2.0,
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
        cleaned_response = _strip_revision_instruction(response_text)
        previous_output = cleaned_response
        # --- AI DETECTION CALL ---
        detection_vars = {
            "content": cleaned_response,
            "content_type": section_name.replace("_", " "),
            "audience_level": section_variables.get("audience_level", "general"),
        }
        detection_prompt = format_prompt(
            detection_prompt_template,
            detection_vars,
            "ai_detection_prompt.txt",
            section_name,
        )
        try:
            detection_response = api_client.call_ai_api(
                prompt=detection_prompt,
                provider=detection_provider or generator_provider,
                model=detection_model_settings["model"]
                if detection_model_settings
                else model,
                api_keys=api_keys,
                temperature=0.2,
                max_tokens=500,
                url_template=detection_model_settings["url_template"]
                if detection_model_settings
                else (
                    generator_model_settings["url_template"]
                    if generator_model_settings
                    else None
                ),
                backoff_factor=2.0,
            )
        except Exception as e:
            logger.error(
                f"AI detection request failed for section '{section_name}' (iteration {i + 1}): {e}"
            )
            continue
        logger.info(
            f"[RAW DETECTION OUTPUT] Iteration {i + 1} for '{section_name}': {detection_response}"
        )
        ai_score, feedback = parse_ai_detection_feedback(
            detection_response or "",
            detection_provider or generator_provider,
            detection_model_settings["model"] if detection_model_settings else model,
            section_name,
            section_variables.get("audience_level", "general"),
            api_keys,
            prompt_templates_dict,
        )
        logger.info(f"[FEEDBACK] Iteration {i + 1} for '{section_name}': {feedback}")
        human_score = 100 - ai_score
        attempts.append(
            {
                "iteration": i + 1,
                "content": cleaned_response,
                "ai_score": ai_score,
                "human_score": human_score,
                "feedback": feedback,
            }
        )
        # Track best
        if ai_score < best_ai_score or (
            ai_score == best_ai_score and human_score > best_human_score
        ):
            best_content = cleaned_response
            best_ai_score = ai_score
            best_human_score = human_score
        if (
            ai_score <= ai_detection_threshold
            and human_score >= human_detection_threshold
        ):
            threshold_met = True
            logger.info(
                f"Section '{section_name}' passed on iteration {i + 1} (AI: {ai_score}%, Human: {human_score}%)"
            )
            break
        # If feedback is unchanged for 2+ attempts, escalate by increasing temperature
        if i > 0 and attempts[-1]["feedback"] == attempts[-2]["feedback"]:
            logger.info(
                "Escalating: feedback unchanged, increasing temperature for next attempt."
            )
        revision_feedback = feedback or ""
        logger.info(
            f"Section '{section_name}' failed iteration {i + 1} (AI: {ai_score}%, Human: {human_score}%)"
        )
    if not best_content:
        logger.error(
            f"No valid content generated for section '{section_name}' after {iterations_per_section} iterations. Returning default values."
        )
        return "", 100, False
    # Optionally, log all attempts for diagnostics
    logger.info(f"[ATTEMPTS SUMMARY] Section '{section_name}': {attempts}")
    return best_content, best_ai_score, threshold_met


def generate_content(
    section_name: str,
    prompt_template: str,
    section_variables: Dict[str, Any],
    article_data: Dict[str, Any],
    cache_data: Dict[str, Any],
    generator_provider: str,
    model: str,
    force_regenerate: bool,
    api_keys: Dict[str, str],
    prompt_templates_dict: Dict[str, str],
    prompt_file_name: str,
    ai_detection_threshold: int,  # Add threshold as parameter
    human_detection_threshold: int,  # Add human threshold as parameter
    ai_detect: bool = True,  # New flag
    iterations_per_section: int = 3,  # Number of retries per section
    generator_model_settings: dict = None,  # Pass model settings from run.py
    detection_provider: str = None,
    detection_model_settings: dict = None,
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

    if ai_detect:
        return generate_with_feedback_loop(
            section_name,
            prompt_template,
            section_variables,
            generator_provider,
            model,
            api_keys,
            prompt_templates_dict,
            prompt_file_name,
            ai_detection_threshold,
            human_detection_threshold,
            iterations_per_section,
            generator_model_settings,
            detection_provider,
            detection_model_settings,
        )
    else:
        # Only generate once, no detection/retry loop
        filled_prompt = format_prompt(
            prompt_template,
            section_variables,
            prompt_file_name,
            section_name,
        )
        try:
            response_text = api_client.call_ai_api(
                prompt=filled_prompt,
                provider=generator_provider,
                model=model,
                api_keys=api_keys,
                temperature=section_variables.get("temperature", 0.7),
                max_tokens=1500,
                url_template=generator_model_settings["url_template"]
                if generator_model_settings
                else None,
                backoff_factor=2.0,
            )
        except Exception as e:
            logger.error(f"API request failed for section '{section_name}': {e}")
            return "", 100, False
        if not response_text or not response_text.strip():
            logger.warning(f"Empty response for section '{section_name}'")
            return "", 100, False
        cleaned_response = _strip_revision_instruction(response_text)
        return cleaned_response, 0, True


# Track which sections have had their metadata logged
section_metadata_logged = set()
