# generator/modules/prompt_formatter.py
"""
Formats prompts with variables, handling missing placeholders.
"""

import re


def format_prompt(prompt, format_vars, prompt_file, section_name):
    """Format prompt, handle missing variables with strict placeholder validation.

    Args:
        prompt (str): Raw prompt text.
        format_vars (dict): Variables to insert into the prompt.
        prompt_file (str): Path to the prompt file.
        section_name (str): Name of the section.

    Returns:
        str: Formatted prompt.
    """
    # Match placeholders outside JSON example blocks
    placeholders = re.findall(r"\{(\w+)\}(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", prompt)
    missing_vars = [var for var in placeholders if var not in format_vars]
    try:
        if missing_vars:
            print(
                f"Warning: Prompt {prompt_file} has undefined variables {missing_vars}. Using manual replacement."
            )
            formatted = prompt
            for key, value in format_vars.items():
                formatted = formatted.replace(f"{{{key}}}", str(value))
        else:
            print(f"Raw prompt for {section_name}: {prompt[:500]}...")
            formatted = prompt.format(**format_vars)
            print(f"Formatted prompt for {section_name}: {formatted[:500]}...")
        return formatted
    except KeyError as e:
        print(
            f"Warning: Prompt {prompt_file} has undefined variable {e}. Using manual replacement."
        )
        formatted = prompt
        for key, value in format_vars.items():
            formatted = formatted.replace(f"{{{key}}}", str(value))
        print(f"Manually formatted prompt for {section_name}: {formatted[:500]}...")
        return formatted
