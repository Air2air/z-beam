#!/usr/bin/env python3
"""
YAML Error Tracker

This script maintains a dictionary of YAML errors and their solutions.
It can parse terminal output to extract new YAML errors and add them to the dictionary.
"""

import json
import os
import re
import sys
from pathlib import Path
from datetime import datetime

# Dictionary to store YAML errors and their solutions
ERROR_DICT_FILE = Path(__file__).parent.parent / "format_issues_dictionary.json"


def load_error_dictionary():
    """Load the existing error dictionary from file."""
    if ERROR_DICT_FILE.exists():
        try:
            with open(ERROR_DICT_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                # Ensure the dictionary has the expected structure
                if "errors" not in data:
                    print(
                        f"Error: Dictionary is missing 'errors' key. Creating a new dictionary."
                    )
                    return create_new_dictionary()
                return data
        except json.JSONDecodeError:
            print(
                f"Error: Could not parse {ERROR_DICT_FILE}. Creating a new dictionary."
            )
            return create_new_dictionary()
    else:
        dict_data = create_new_dictionary()
        # Save the newly created dictionary
        with open(ERROR_DICT_FILE, "w", encoding="utf-8") as f:
            json.dump(dict_data, f, indent=2)
        return dict_data


def create_new_dictionary():
    """Create a new error dictionary with metadata."""
    return {
        "metadata": {
            "created": datetime.now().isoformat(),
            "lastUpdated": datetime.now().isoformat(),
            "totalErrors": 0,
        },
        "errors": {},
    }


def save_error_dictionary(error_dict):
    """Save the error dictionary to file."""
    error_dict["metadata"]["lastUpdated"] = datetime.now().isoformat()
    error_dict["metadata"]["totalErrors"] = len(error_dict["errors"])

    with open(ERROR_DICT_FILE, "w", encoding="utf-8") as f:
        json.dump(error_dict, f, indent=2)


def extract_yaml_errors_from_log(log_content):
    """Extract YAML errors from terminal log output."""
    # Pattern to match YAML error messages
    yaml_error_patterns = [
        # Common YAML error pattern
        r"(?:YAML|YAMLException):\s*(.*?)(?=\s+at|\n|$)",
        # Gray-matter specific error patterns
        r"Invalid YAML front matter in.*?:\s*(.*?)(?=\n|$)",
        # Error with line and column information
        r"(?:bad|unexpected|invalid)\s+(\w+).*?\s+at\s+line\s+(\d+),\s+column\s+(\d+)",
        # js-yaml error pattern
        r"JS-YAML:\s*(.*?)(?=\n|$)",
    ]

    errors_found = []

    for pattern in yaml_error_patterns:
        matches = re.findall(pattern, log_content, re.IGNORECASE | re.MULTILINE)
        if matches:
            for match in matches:
                if isinstance(match, tuple):
                    # Format for patterns that capture line and column
                    error_msg = f"{match[0]} at line {match[1]}, column {match[2]}"
                else:
                    error_msg = match

                errors_found.append(error_msg.strip())

    return errors_found


def add_error_to_dictionary(error_dict, error_message, solution=""):
    """Add a new error to the dictionary if it doesn't exist."""
    # Create a normalized key for the error message
    error_key = re.sub(r"\s+", " ", error_message.lower().strip())

    # Check if this error is already in the dictionary
    if error_key not in error_dict["errors"]:
        error_dict["errors"][error_key] = {
            "message": error_message,
            "solution": solution,
            "firstSeen": datetime.now().isoformat(),
            "occurrences": 1,
            "files": [],
        }
        print(f"Added new error: {error_message}")
        return True
    else:
        # Increment occurrence count for existing error
        error_dict["errors"][error_key]["occurrences"] += 1
        print(
            f"Updated existing error: {error_message} (now seen {error_dict['errors'][error_key]['occurrences']} times)"
        )
        return False


def process_log_file(log_file_path):
    """Process a log file to extract and record YAML errors."""
    try:
        with open(log_file_path, "r", encoding="utf-8") as f:
            log_content = f.read()

        error_dict = load_error_dictionary()
        errors = extract_yaml_errors_from_log(log_content)

        new_errors = 0
        for error in errors:
            if add_error_to_dictionary(error_dict, error):
                new_errors += 1

        save_error_dictionary(error_dict)
        print(
            f"Processed {len(errors)} errors from log file. Added {new_errors} new errors."
        )

    except Exception as e:
        print(f"Error processing log file: {e}")


def process_terminal_output(terminal_output):
    """Process terminal output text to extract and record YAML errors."""
    error_dict = load_error_dictionary()
    errors = extract_yaml_errors_from_log(terminal_output)

    new_errors = 0
    for error in errors:
        if add_error_to_dictionary(error_dict, error):
            new_errors += 1

    save_error_dictionary(error_dict)
    print(
        f"Processed {len(errors)} errors from terminal output. Added {new_errors} new errors."
    )


def list_errors(show_solutions=False):
    """List all errors in the dictionary."""
    error_dict = load_error_dictionary()

    if not error_dict["errors"]:
        print("No errors have been recorded yet.")
        return

    print(f"Total unique YAML errors: {len(error_dict['errors'])}")
    print("=" * 60)

    # Sort errors by occurrence count (most frequent first)
    sorted_errors = sorted(
        error_dict["errors"].items(), key=lambda x: x[1]["occurrences"], reverse=True
    )

    for i, (_, error_data) in enumerate(sorted_errors, 1):
        print(f"{i}. {error_data['message']} (seen {error_data['occurrences']} times)")
        if show_solutions and error_data["solution"]:
            print(f"   Solution: {error_data['solution']}")
        print()


def add_solution(error_key, solution):
    """Add a solution for a specific error."""
    error_dict = load_error_dictionary()

    # Normalize the error key
    error_key = re.sub(r"\s+", " ", error_key.lower().strip())

    if error_key in error_dict["errors"]:
        error_dict["errors"][error_key]["solution"] = solution
        save_error_dictionary(error_dict)
        print(f"Added solution for: {error_dict['errors'][error_key]['message']}")
    else:
        print(f"Error not found: {error_key}")


def main():
    """Main function to process command line arguments."""
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python yaml_error_tracker.py process <log_file>")
        print("  python yaml_error_tracker.py list [--with-solutions]")
        print("  python yaml_error_tracker.py add-solution <error_key> <solution>")
        print("  python yaml_error_tracker.py add-error <error_message>")
        sys.exit(1)

    command = sys.argv[1]

    if command == "process" and len(sys.argv) >= 3:
        process_log_file(sys.argv[2])

    elif command == "list":
        show_solutions = "--with-solutions" in sys.argv
        list_errors(show_solutions)

    elif command == "add-solution" and len(sys.argv) >= 4:
        error_key = sys.argv[2]
        solution = sys.argv[3]
        add_solution(error_key, solution)

    elif command == "add-error" and len(sys.argv) >= 3:
        error_message = sys.argv[2]
        error_dict = load_error_dictionary()
        add_error_to_dictionary(error_dict, error_message)
        save_error_dictionary(error_dict)
        print(f"Added new error: {error_message}")

    else:
        print("Invalid command. Run with no arguments for usage information.")
        sys.exit(1)


if __name__ == "__main__":
    main()
