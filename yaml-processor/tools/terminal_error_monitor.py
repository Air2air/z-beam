#!/usr/bin/env python3
"""
Z-Beam Terminal Error Monitor
=============================

Continuously monitors terminal output for YAML errors and adds them
to the error tracking system.

Features:
- Watches terminal output in real-time for YAML errors
- Extracts error patterns and descriptions
- Automatically adds new errors to the tracking dictionary
- Can run in the background during development
- Works with any terminal command that outputs YAML errors

Usage:
  python3 terminal_error_monitor.py [options]

Options:
  --command=CMD     Command to execute and monitor (default: none, just monitor)
  --logfile=FILE    Path to log file to monitor (default: yaml-errors.log)
  --interval=SEC    Check interval in seconds (default: 5)
  --quiet           Suppress informational output
  --help            Show this help message

Examples:
  # Monitor a log file for new errors
  python3 terminal_error_monitor.py --logfile=../yaml-errors.log

  # Execute a command and monitor its output
  python3 terminal_error_monitor.py --command="npm run yaml"

  # Run in background with low verbosity
  python3 terminal_error_monitor.py --quiet --interval=10
"""

import os
import re
import sys
import json
import time
import signal
import argparse
import subprocess
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Set, Optional, Any, Tuple

# Add parent directory to path to import yaml_error_tracker
sys.path.append(str(Path(__file__).parent.absolute()))
try:
    from yaml_error_tracker import ErrorTracker
except ImportError:
    # If module not found, create a minimal implementation
    class ErrorTracker:
        def __init__(self, dictionary_path: str = None):
            self.dictionary_path = dictionary_path or str(
                Path(__file__).parent.parent / "format_issues_dictionary.json"
            )
            self.error_dict = self._load_dictionary()

        def _load_dictionary(self) -> Dict:
            """Load the existing error dictionary."""
            try:
                with open(self.dictionary_path, "r") as f:
                    return json.load(f)
            except (FileNotFoundError, json.JSONDecodeError):
                # Create a new dictionary if file doesn't exist or is invalid
                return {
                    "metadata": {
                        "created": datetime.now().isoformat(),
                        "lastUpdated": datetime.now().isoformat(),
                        "totalErrors": 0,
                    },
                    "errors": {},
                }

        def save_dictionary(self):
            """Save the error dictionary to the file."""
            self.error_dict["metadata"]["lastUpdated"] = datetime.now().isoformat()
            self.error_dict["metadata"]["totalErrors"] = len(self.error_dict["errors"])

            try:
                with open(self.dictionary_path, "w") as f:
                    json.dump(self.error_dict, f, indent=2)
                return True
            except Exception as e:
                print(f"Error saving dictionary: {e}")
                return False

        def add_error(
            self,
            error_key: str,
            error_message: str,
            solution: str = "",
            file_path: str = "",
        ):
            """Add or update an error in the dictionary."""
            if error_key not in self.error_dict["errors"]:
                self.error_dict["errors"][error_key] = {
                    "message": error_message,
                    "solution": solution,
                    "firstSeen": datetime.now().isoformat(),
                    "occurrences": 1,
                    "files": [file_path] if file_path else [],
                }
            else:
                self.error_dict["errors"][error_key]["occurrences"] += 1
                if (
                    file_path
                    and file_path not in self.error_dict["errors"][error_key]["files"]
                ):
                    self.error_dict["errors"][error_key]["files"].append(file_path)

            return self.save_dictionary()


class TerminalErrorMonitor:
    """Monitors terminal output for YAML errors and updates the error tracking system."""

    def __init__(
        self,
        command: str = None,
        logfile: str = None,
        interval: int = 5,
        quiet: bool = False,
        dictionary_path: str = None,
    ):
        """Initialize the monitor."""
        self.command = command
        self.logfile = logfile or str(Path(__file__).parent.parent / "yaml-errors.log")
        self.interval = interval
        self.quiet = quiet
        self.running = True
        self.error_tracker = ErrorTracker(dictionary_path)

        # Keep track of what we've seen
        self.seen_errors: Set[str] = set()
        self.last_file_position: int = 0
        self.start_time = datetime.now()

        # Initialize the error patterns to look for
        self.error_patterns = [
            (
                r"bad indentation of a\s+(.*?)(?:at|on) line (\d+)",
                "Bad indentation issue",
            ),
            (
                r"duplicated mapping key\s+(.*?)(?:at|on) line (\d+)",
                "Duplicate key issue",
            ),
            (
                r"can not read an implicit mapping pair; a colon is missed\s+(.*?)(?:at|on) line (\d+)",
                "Missing colon",
            ),
            (
                r"can not read a block mapping entry.*multiline key\s+(.*?)(?:at|on) line (\d+)",
                "Multiline key issue",
            ),
            (
                r"end of the stream or a document separator is expected\s+(.*?)(?:at|on) line (\d+)",
                "Document structure issue",
            ),
            (
                r"expected <block end>, but found\s+(.*?)(?:at|on) line (\d+)",
                "Block structure issue",
            ),
            (
                r"found character ('[^']*') that cannot start any token\s+(.*?)(?:at|on) line (\d+)",
                "Character issue",
            ),
            (
                r"mapping values are not allowed in this context\s+(.*?)(?:at|on) line (\d+)",
                "Mapping context issue",
            ),
            (
                r"could not find expected ':'\s+(.*?)(?:at|on) line (\d+)",
                "Missing colon",
            ),
            (
                r"while scanning a quoted scalar.*unexpected\s+(.*?)(?:at|on) line (\d+)",
                "Quote issue",
            ),
            (
                r"found unknown escape character\s+(.*?)(?:at|on) line (\d+)",
                "Escape sequence issue",
            ),
            (
                r"found ambiguous indent for block collection\s+(.*?)(?:at|on) line (\d+)",
                "Ambiguous indent",
            ),
            (
                r"found invalid document separator\s+(.*?)(?:at|on) line (\d+)",
                "Invalid document separator",
            ),
        ]

        # Solutions for common error types
        self.error_solutions = {
            "Bad indentation issue": "Fix the indentation in YAML structure - ensure consistent indentation with 2 spaces per level for nested items.",
            "Duplicate key issue": "Remove or rename duplicate keys in the YAML document. Most commonly seen with 'description' appearing twice in the same section.",
            "Missing colon": "Add missing colon after property name to create a proper key-value pair.",
            "Multiline key issue": "Check for improper line breaks in keys or convert string literals to proper arrays for meta_tags and opengraph.",
            "Document structure issue": "Ensure proper document structure with correct --- delimiters and no content before the first delimiter.",
            "Block structure issue": "Fix nested block structure with proper indentation and ensure block scalars (> or |) are properly formatted.",
            "Character issue": "Remove or escape special characters that are causing parsing issues.",
            "Mapping context issue": "Ensure mapping values are used in the correct context with proper structure.",
            "Quote issue": "Fix quoted strings by ensuring quotes are properly closed and escaped.",
            "Escape sequence issue": "Correct improper escape sequences in strings with valid escape patterns.",
            "Ambiguous indent": "Fix ambiguous indentation by ensuring consistent spacing and alignment.",
            "Invalid document separator": "Ensure document separators (---) are at the beginning of lines with no preceding content.",
        }

        # Set up signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._handle_signal)
        signal.signal(signal.SIGTERM, self._handle_signal)

    def _handle_signal(self, signum, frame):
        """Handle termination signals."""
        self.running = False
        if not self.quiet:
            print(f"\n🛑 Received signal {signum}, shutting down...")

    def _extract_error_info(
        self, line: str
    ) -> Tuple[Optional[str], Optional[str], Optional[str]]:
        """Extract error information from a log line."""
        for pattern, description in self.error_patterns:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                # Extract the error key (use a normalized version of the regex pattern)
                error_key = pattern.split(r"\s")[0]

                # Extract full error message
                error_message = line.strip()

                # Get default solution based on error type
                solution = self.error_solutions.get(description, "")

                return error_key, error_message, solution

        # No matching pattern found
        return None, None, None

    def _extract_file_info(self, line: str) -> Optional[str]:
        """Extract file path information from a log line."""
        file_match = re.search(
            r'(?:in|at|from|file) [\'"]?([^\'"]+\.(?:md|yaml|yml))[\'"]?', line
        )
        if file_match:
            return file_match.group(1)
        return None

    def _check_logfile(self) -> int:
        """Check the log file for new errors."""
        new_errors = 0

        try:
            if not os.path.exists(self.logfile):
                if not self.quiet:
                    print(f"⚠️ Log file not found: {self.logfile}")
                return 0

            file_size = os.path.getsize(self.logfile)

            # If the file was truncated, reset our position
            if file_size < self.last_file_position:
                self.last_file_position = 0

            # If no new content, return
            if file_size <= self.last_file_position:
                return 0

            with open(self.logfile, "r") as f:
                # Skip to where we left off
                f.seek(self.last_file_position)

                # Read new lines
                current_error = ""
                current_file = None

                for line in f:
                    # Collect multi-line error messages
                    if line.strip().startswith(("Error:", "WARNING:", "❌", "⚠️")):
                        # Process the previous error if there was one
                        if current_error:
                            error_key, error_message, solution = (
                                self._extract_error_info(current_error)
                            )
                            if error_key and error_key not in self.seen_errors:
                                if self.error_tracker.add_error(
                                    error_key, error_message, solution, current_file
                                ):
                                    self.seen_errors.add(error_key)
                                    new_errors += 1
                                    if not self.quiet:
                                        print(f"📝 Added new error: {error_key}")

                        # Start a new error
                        current_error = line
                        current_file = self._extract_file_info(line)
                    elif current_error:
                        # Continue the current error
                        current_error += line
                        if not current_file:
                            current_file = self._extract_file_info(line)

                # Process the last error if there was one
                if current_error:
                    error_key, error_message, solution = self._extract_error_info(
                        current_error
                    )
                    if error_key and error_key not in self.seen_errors:
                        if self.error_tracker.add_error(
                            error_key, error_message, solution, current_file
                        ):
                            self.seen_errors.add(error_key)
                            new_errors += 1
                            if not self.quiet:
                                print(f"📝 Added new error: {error_key}")

                # Update our position
                self.last_file_position = f.tell()

        except Exception as e:
            if not self.quiet:
                print(f"❌ Error checking log file: {e}")

        return new_errors

    def _execute_command(self) -> bool:
        """Execute the specified command and capture its output to the log file."""
        if not self.command:
            return False

        try:
            if not self.quiet:
                print(f"🚀 Executing: {self.command}")

            # Execute the command and redirect output to log file
            with open(self.logfile, "a") as logfile:
                logfile.write(
                    f"\n\n=== Command Execution: {self.command} at {datetime.now().isoformat()} ===\n"
                )

                process = subprocess.Popen(
                    self.command,
                    shell=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    universal_newlines=True,
                )

                # Process output in real-time
                for line in process.stdout:
                    logfile.write(line)
                    logfile.flush()

                    # Check for errors in real-time
                    if "error" in line.lower() or "warning" in line.lower():
                        error_key, error_message, solution = self._extract_error_info(
                            line
                        )
                        if error_key and error_key not in self.seen_errors:
                            file_path = self._extract_file_info(line)
                            if self.error_tracker.add_error(
                                error_key, error_message, solution, file_path
                            ):
                                self.seen_errors.add(error_key)
                                if not self.quiet:
                                    print(f"📝 Added new error: {error_key}")

                # Get the command exit code
                exit_code = process.wait()
                logfile.write(
                    f"\n=== Command completed with exit code: {exit_code} ===\n"
                )

                return exit_code == 0

        except Exception as e:
            if not self.quiet:
                print(f"❌ Error executing command: {e}")
            return False

    def start(self):
        """Start monitoring for errors."""
        if not self.quiet:
            print(
                f"🔍 Terminal Error Monitor started at {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}"
            )
            print(f"   Monitoring: {self.logfile}")
            if self.command:
                print(f"   Command: {self.command}")
            print(f"   Check interval: {self.interval} seconds")
            print(f"   Dictionary: {self.error_tracker.dictionary_path}")
            print("=" * 60)

        # If a command is specified, execute it once
        if self.command:
            self._execute_command()

        # Main monitoring loop
        try:
            while self.running:
                new_errors = self._check_logfile()

                if not self.quiet and new_errors > 0:
                    print(f"✅ Found {new_errors} new errors")

                # Sleep for the specified interval
                time.sleep(self.interval)

        except KeyboardInterrupt:
            if not self.quiet:
                print("\n🛑 Monitoring stopped by user")

        # Show summary
        if not self.quiet:
            total_errors = len(self.seen_errors)
            elapsed = datetime.now() - self.start_time
            print("\n" + "=" * 60)
            print(f"📊 Summary:")
            print(f"   Ran for: {elapsed}")
            print(f"   Total errors found: {total_errors}")
            print(f"   Dictionary updated: {self.error_tracker.dictionary_path}")
            print("=" * 60)


def main():
    """Parse arguments and start the monitor."""
    parser = argparse.ArgumentParser(
        description="Z-Beam Terminal Error Monitor",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )

    parser.add_argument("--command", help="Command to execute and monitor")
    parser.add_argument("--logfile", help="Path to log file to monitor")
    parser.add_argument(
        "--interval", type=int, default=5, help="Check interval in seconds"
    )
    parser.add_argument(
        "--quiet", action="store_true", help="Suppress informational output"
    )

    args = parser.parse_args()

    # Start the monitor
    monitor = TerminalErrorMonitor(
        command=args.command,
        logfile=args.logfile,
        interval=args.interval,
        quiet=args.quiet,
    )

    monitor.start()


if __name__ == "__main__":
    main()
