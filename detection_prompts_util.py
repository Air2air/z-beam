#!/usr/bin/env python3
"""
Utility script for managing detection and improvement prompts in JSON format.
This script provides functionality to view, validate, and work with detection
and improvement prompts stored in JSON files.
"""

import json
import os
from typing import Dict, List, Optional
import argparse


def load_detection_prompts(file_path: str = None) -> List[Dict]:
    """Load detection prompts from JSON file."""
    if file_path is None:
        file_path = os.path.join(
            os.path.dirname(__file__), "detection", "detection_prompts.json"
        )

    try:
        with open(file_path, "r") as f:
            data = json.load(f)
        return data.get("detection_prompts", [])
    except Exception as e:
        print(f"Error loading detection_prompts.json: {e}")
        return []


def load_improvement_prompts(file_path: str = None) -> List[Dict]:
    """Load improvement prompts from JSON file."""
    if file_path is None:
        file_path = os.path.join(
            os.path.dirname(__file__), "detection", "improvement_prompts.json"
        )

    try:
        with open(file_path, "r") as f:
            data = json.load(f)
        return data.get("improvement_prompts", [])
    except Exception as e:
        print(f"Error loading improvement_prompts.json: {e}")
        return []


def get_detection_prompt(prompts: List[Dict], name: str) -> Optional[Dict]:
    """Get a specific detection prompt by name."""
    for prompt in prompts:
        if prompt["name"] == name:
            return prompt
    return None


def get_improvement_prompt(prompts: List[Dict], name: str) -> Optional[Dict]:
    """Get a specific improvement prompt by name."""
    for prompt in prompts:
        if prompt["name"] == name:
            return prompt
    return None


def get_default_detection_prompt(
    prompts: List[Dict], prompt_type: str = "ai"
) -> Optional[Dict]:
    """Get the default detection prompt for a specific type."""
    for prompt in prompts:
        if prompt["type"] == prompt_type and prompt.get("is_default", False):
            return prompt

    # If no default found, return the first of the given type
    for prompt in prompts:
        if prompt["type"] == prompt_type:
            return prompt

    return None


def get_default_improvement_prompt(prompts: List[Dict]) -> Optional[Dict]:
    """Get the default improvement prompt."""
    for prompt in prompts:
        if prompt.get("is_default", False):
            return prompt

    # If no default found, return the first one
    if prompts:
        return prompts[0]

    return None


def get_improvement_prompt_by_strategy(
    prompts: List[Dict], strategy_type: str
) -> Optional[Dict]:
    """Get an improvement prompt based on strategy type."""
    for prompt in prompts:
        if prompt["strategy_type"] == strategy_type:
            return prompt
    return None


def print_detection_prompt_summary(prompts: List[Dict]) -> None:
    """Print a summary of available detection prompts."""
    ai_prompts = [p for p in prompts if p["type"] == "ai"]
    human_prompts = [p for p in prompts if p["type"] == "human"]

    print("\n===== DETECTION PROMPTS SUMMARY =====")
    print(f"Total detection prompts: {len(prompts)}")
    print(f"- AI detection prompts: {len(ai_prompts)}")
    print(f"- Human detection prompts: {len(human_prompts)}")

    print("\nAI DETECTION PROMPTS:")
    for prompt in ai_prompts:
        default_marker = " (DEFAULT)" if prompt.get("is_default", False) else ""
        print(f"- {prompt['name']}{default_marker}: {prompt['description']}")

    print("\nHUMAN DETECTION PROMPTS:")
    for prompt in human_prompts:
        default_marker = " (DEFAULT)" if prompt.get("is_default", False) else ""
        print(f"- {prompt['name']}{default_marker}: {prompt['description']}")


def print_improvement_prompt_summary(prompts: List[Dict]) -> None:
    """Print a summary of available improvement prompts."""
    print("\n===== IMPROVEMENT PROMPTS SUMMARY =====")
    print(f"Total improvement prompts: {len(prompts)}")

    print("\nIMPROVEMENT STRATEGIES:")
    for prompt in prompts:
        default_marker = " (DEFAULT)" if prompt.get("is_default", False) else ""
        print(
            f"- {prompt['name']}{default_marker} ({prompt['strategy_type']}): {prompt['description']}"
        )


def print_prompt_content(prompt: Dict, max_lines: int = None) -> None:
    """Print the content of a prompt, optionally limiting to max_lines."""
    print(f"\n===== {prompt['name'].upper()} =====")
    print(f"Description: {prompt.get('description', 'No description')}")

    prompt_content = prompt["prompt"]
    if max_lines:
        prompt_lines = prompt_content.split("\n")
        if len(prompt_lines) > max_lines:
            prompt_content = "\n".join(prompt_lines[:max_lines]) + "\n[...truncated...]"

    print("\nPROMPT CONTENT:")
    print("----------------")
    print(prompt_content)
    print("----------------")


def validate_json_structure() -> None:
    """Validate the structure of JSON files."""
    issues = []

    # Check detection prompts
    detection_prompts = load_detection_prompts()
    for i, prompt in enumerate(detection_prompts):
        # Check required fields
        for field in ["name", "type", "prompt"]:
            if field not in prompt:
                issues.append(
                    f"Detection prompt #{i + 1} is missing required field: {field}"
                )

        # Check type values
        if prompt.get("type") not in ["ai", "human"]:
            issues.append(
                f"Detection prompt '{prompt.get('name', f'#{i + 1}')}' has invalid type: {prompt.get('type')}"
            )

    # Check improvement prompts
    improvement_prompts = load_improvement_prompts()
    for i, prompt in enumerate(improvement_prompts):
        # Check required fields
        for field in ["name", "prompt", "strategy_type"]:
            if field not in prompt:
                issues.append(
                    f"Improvement prompt #{i + 1} is missing required field: {field}"
                )

    # Print validation results
    if issues:
        print("\nJSON STRUCTURE VALIDATION ISSUES:")
        for issue in issues:
            print(f"- {issue}")
    else:
        print("\nJSON structure validation successful. No issues found.")


def main():
    parser = argparse.ArgumentParser(
        description="Detection and Improvement Prompts Utility"
    )

    # Create subparsers for different commands
    subparsers = parser.add_subparsers(dest="command", help="Command to run")

    # Summary command
    subparsers.add_parser("summary", help="Show summary of all prompts")

    # View command
    view_parser = subparsers.add_parser("view", help="View a specific prompt")
    view_parser.add_argument(
        "prompt_type",
        choices=["detection", "improvement"],
        help="Type of prompt to view",
    )
    view_parser.add_argument("name", help="Name of the prompt to view")
    view_parser.add_argument(
        "--full", action="store_true", help="Show the full prompt content"
    )

    # Validate command
    subparsers.add_parser("validate", help="Validate JSON structure")

    args = parser.parse_args()

    # Handle commands
    if args.command == "summary" or args.command is None:
        detection_prompts = load_detection_prompts()
        improvement_prompts = load_improvement_prompts()
        print_detection_prompt_summary(detection_prompts)
        print_improvement_prompt_summary(improvement_prompts)

    elif args.command == "view":
        if args.prompt_type == "detection":
            prompts = load_detection_prompts()
            prompt = get_detection_prompt(prompts, args.name)
            if prompt:
                print_prompt_content(prompt, None if args.full else 10)
            else:
                print(f"Detection prompt '{args.name}' not found.")

        elif args.prompt_type == "improvement":
            prompts = load_improvement_prompts()
            prompt = get_improvement_prompt(prompts, args.name)
            if prompt:
                print_prompt_content(prompt, None if args.full else 10)
            else:
                print(f"Improvement prompt '{args.name}' not found.")

    elif args.command == "validate":
        validate_json_structure()

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
