#!/usr/bin/env python3
"""
Z-Beam YAML Processor - Refactored for Efficiency
================================================

This is the master YAML processor for the Z-Beam project, refactored for
comprehensive single-pass processing with better YAML structure awareness.

IMPORTANT: This processor ALWAYS fixes original files directly.
It NEVER creates backups, copies, or -fixed versions.

Features:
- Comprehensive single-pass YAML structure analysis
- Efficient processing with complete fixes in one run
- Advanced YAML-aware parsing and reconstruction
- Detailed diagnostics and statistics
- Fixes original files in-place (NO BACKUPS)
- Optimized for Next.js frontmatter requirements

Version: 2.0.0
Last Updated: August 20, 2025
"""

import re
import json
import signal
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Set, Tuple, Optional, Any


class ZBeamYAMLProcessor:
    """Refactored YAML processor with comprehensive single-pass analysis."""

    def __init__(self, verbose: bool = False, timeout: int = 30):
        self.verbose = verbose
        self.base_path = None
        self.timeout = timeout  # Timeout in seconds for processing a single file

        # Statistics
        self.stats = {
            "files_processed": 0,
            "files_fixed": 0,
            "issues_found": 0,
            "skipped_no_frontmatter": 0,
            "timed_out_files": 0,
            "start_time": datetime.now(),
        }

        # Error tracking
        self.fixed_files: List[str] = []
        self.errors_found: Dict[str, List[str]] = {}
        self.issue_types: Dict[str, int] = {}

        # Before and after comparison tracking
        self.file_changes: Dict[str, Dict] = {}

        # Previous run data for comparison
        self.previous_run = None
        self.load_previous_run()

        # Track if we've already shown the Format Issues Dictionary
        self.dictionary_already_shown = False

        # Comprehensive Format Issues Dictionary
        # Maintains patterns and fixes for all known YAML formatting issues
        self.format_issues = {
            "encoding_issues": {
                "patterns": [
                    r"\\xB7",  # Escaped middle dot
                    r"\\xB2",  # Escaped superscript 2
                    r"\\xB3",  # Escaped superscript 3
                    r"\\x[0-9A-Fa-f]{2}",  # General escaped hex characters
                    r"·",  # Middle dot
                    r"²",  # Superscript 2
                    r"³",  # Superscript 3
                    r"°",  # Degree symbol
                    r"µ",  # Micro symbol
                    r"[^\x20-\x7E\t\n\r]",  # Non-printable characters (ASCII range only)
                ],
                "fixes": {
                    "\\xB7": "·",
                    "\\xB2": "²",
                    "\\xB3": "³",
                    "\\xB0": "°",
                    "\\xB5": "µ",
                },
                "description": "Special character encoding issues in chemical formulas and measurements",
            },
            "indentation_issues": {
                "patterns": [
                    r"^(\s*)- \w+:.*\n(\s+)\w+:",  # List item with incorrectly indented nested properties
                    r"^(\s*)\w+:\s*\n(\s*)\w+:",  # Property followed by incorrectly indented content
                    r"^\s{4,}[a-zA-Z][a-zA-Z_]*:\s*$",  # Any root-level key improperly indented (4+ spaces)
                    r"^\s{1,3}[a-zA-Z][a-zA-Z_]*:\s*[^-]",  # Properties that should be under parent but aren't indented enough
                    r"^\s{2,3}(detail|scope|content|value|description|metric|benefit|limitation):",  # Common nested properties with wrong indentation
                    r"^(\s*)- ",  # List items that need proper indentation under parent section
                    r"^\s{0,2}(\w+):\s",  # Property with insufficient indent
                    r"^(\s*)- [a-zA-Z]+:.*\n\s*[a-zA-Z]+:",  # Properties after list items without proper indentation
                    r"^environmentalImpact:\s*\n\s*- benefit:",  # EnvironmentalImpact section with improperly indented list items
                ],
                "description": "Bad indentation in list items, nested properties, and root-level keys",
            },
            "incomplete_entries": {
                "patterns": [
                    r"- \w+:\s*$",  # Empty list item values (name:, property:, etc.)
                    r"^\s*\w+:\s*$",  # Any key without value at end of line
                    r"^\s*\w+:\s*\n\s*$",  # Key followed by empty line
                    r"^\s*\w+:\s*\n\s*[a-zA-Z]",  # Key followed by unindented content
                    r"\w+:\s*\".*\"$",  # String literal that may need escaped characters
                    r"^(\s*)- name:\s*$",  # Empty meta tag name
                    r"^(\s*)- property:\s*$",  # Empty opengraph property
                    r"^(\s*)content:\s*$",  # Empty content field
                ],
                "description": "Missing values for keys, properties, and content fields",
            },
            "malformed_structures": {
                "patterns": [
                    r'.*"[^"]*"[^"]*"[^"]*".*',  # Lines with multiple unescaped quotes
                    r'\w+:"".*""',  # Any key with malformed double quotes
                    r".*percentage.*component.*",  # Corrupted composition lines
                    r".*'}].*",  # Truncated JSON-like structures
                    r".*'].*",  # Truncated array structures
                    r'^\s*"[^"]*[:-][^"]*"\s*$',  # Orphaned quoted values with colons or hyphens
                    r'^\s*"[^"]*"\s*$',  # General orphaned quoted values
                    r"^\s*[^:\s-]+\s+[^:\s-]+\s+[^:\s-]+.*$",  # Lines with multiple words but no structure
                    r"^\s+\w+\s+\w+:\s.*$",  # Property names with spaces
                    r".*:.*:.*[^-]",  # Multiple colons in a line (not part of timestamp)
                    r"^(\s*)\w+:\s+.*\n\1\w+:\s+",  # Consecutive properties with same indentation
                    r'formula:\s*"\\".*\\""',  # Formula with nested quotes
                ],
                "description": "Corrupted or truncated content lines, orphaned values, malformed quotes",
            },
            "property_declaration_issues": {
                "patterns": [
                    r"^(\s*)properties:\s*$",  # Properties without nested content
                    r"^(\s*)chemicalProperties:\s*$",  # Chemical properties without nested content
                    r"^(\s*)compatibility:\s*$",  # Compatibility without nested content
                    r"^(\s*)(\w+):.*\n.*^\s*\1:",  # Duplicate keys
                    r"description:\s+.*\n\s*description:",  # Duplicate description keys
                    r"^\s*applications:\s*\n\s*applications:",  # Duplicate applications sections
                    r"\w+:\s*\n\s*(?!-)(?!\s)",  # Empty key followed by non-indented content
                ],
                "description": "Property declarations without proper nested content or duplicated keys",
            },
            "list_structure_issues": {
                "patterns": [
                    r"^(\s*)- \w+:\s*\n(\s{4,})\w+:",  # List items with 4+ space indented nested items
                    r"compatibility:\s*\[\]",  # Empty array formatting
                    r"^(\s*)[a-zA-Z]+:.*\n\s*-\s",  # List items without proper indentation under parent key
                    r"^(\s*)- [a-zA-Z]+:.*\n\s*[a-zA-Z]+:",  # Properties following list items without proper indentation
                    r"^(\s*)- [a-zA-Z]+:.*\n\s*[a-zA-Z]+:\s",  # Common pattern in environmentalImpact section
                    r"^(\s*)- [a-zA-Z]+:.*\n\s*-\s",  # Consecutive list items needing proper indentation
                    r"\s*-[^ ]",  # List item with no space after dash
                    r"meta_tags:\s*\"- ",  # Meta tags array converted to string
                    r"opengraph:\s*\"- ",  # Opengraph array converted to string
                ],
                "description": "Improperly structured lists and arrays",
            },
            "quote_issues": {
                "patterns": [
                    r':[^"]*Nd:YAG',  # Colon within text that should be quoted
                    r':[^"]*\d+:\d+',  # Time format with colons that should be quoted
                    r'"[^"]*\n[^"]*"',  # Multi-line quoted string without proper line breaks
                    r"'[^']*\n[^']*'",  # Multi-line single-quoted string without proper line breaks
                    r':\s*"[^"]*:[^"]*"',  # Quoted string containing a colon
                    r':\s*"[^"]*#[^"]*"',  # Quoted string containing a hash
                    r'\\"\\""',  # Escaped nested quotes
                    r"\"[^\"]*'[^\"]*\"",  # Mixed quotes (single quote within double quotes)
                ],
                "description": "Issues with quoted strings and text requiring quotes",
            },
            "block_scalar_issues": {
                "patterns": [
                    r">\s*\n\s*[^-\s]",  # Folded scalar with improper indentation
                    r"\|\s*\n\s*[^-\s]",  # Literal scalar with improper indentation
                    r">\-\s*\n\s*[^-\s]",  # Folded scalar with strip chomping and improper indentation
                    r"\|\-\s*\n\s*[^-\s]",  # Literal scalar with strip chomping and improper indentation
                    r">\s*\n\s*-",  # Folded scalar followed by a list item (common mistake)
                    r"\|\s*\n\s*-",  # Literal scalar followed by a list item (common mistake)
                ],
                "description": "Issues with block scalar formatting (literal | or folded >)",
            },
            "document_structure_issues": {
                "patterns": [
                    r"^---\s*\n\s*---",  # Empty document
                    r"^---\s*\n.*\n---\s*\n[^\n]",  # Document missing separator
                    r"^[^-#\s].*\n---",  # Content before document start
                    r"\.\.\.\s*\n[^-#\s]",  # Content after document end
                    r"^---\s*[^\n]",  # Content on same line as document start marker
                    r"[^\n]---\s*$",  # Content on same line as document end marker
                ],
                "description": "Issues with YAML document structure and separators",
            },
        }

        # Runtime issue tracking - patterns actually encountered
        self.encountered_issues = {
            "encoding_issues": [],
            "indentation_issues": [],
            "incomplete_entries": [],
            "malformed_structures": [],
            "property_declaration_issues": [],
            "list_structure_issues": [],
            "quote_issues": [],
            "block_scalar_issues": [],
            "document_structure_issues": [],
        }

        # New patterns discovered from error logs - auto-updated
        self.discovered_patterns = {
            "encoding_issues": [],
            "indentation_issues": [],
            "incomplete_entries": [],
            "malformed_structures": [],
            "property_declaration_issues": [],
            "list_structure_issues": [],
            "quote_issues": [],
            "block_scalar_issues": [],
            "document_structure_issues": [],
        }

        # Common YAML patterns and structures
        self.yaml_patterns = {
            "top_level_keys": {
                "headline",
                "description",
                "keywords",
                "articleBody",
                "image",
                "datePublished",
                "dateModified",
                "author",
                "materialType",
                "chemicalFormula",
                "materialSymbol",
                "subjectSlug",
                "name",
                "applications",
                "technicalSpecifications",
                "category",
                "chemicalProperties",
                "properties",
                "composition",
                "compatibility",
            },
            "indented_properties": {
                "name",
                "url",
                "@type",
                "temperature",
                "pressure",
                "wavelength",
                "duration",
                "power",
                "benefits",
                "limitations",
                "requirements",
            },
        }

        # Auto-analyze common error patterns from logs on initialization
        self.analyze_common_error_patterns()

    def _validate_no_copies(self, file_path: Path) -> None:
        """Ensure we never create backup or copy files."""
        if any(
            suffix in str(file_path)
            for suffix in ["-fixed", "-backup", ".bak", "_copy"]
        ):
            raise ValueError(
                f"❌ CRITICAL ERROR: Attempted to create a copy/backup file: {file_path}"
            )

        # Check for existing copies
        parent_dir = file_path.parent
        base_name = file_path.stem
        existing_copies = (
            list(parent_dir.glob(f"{base_name}-fixed.*"))
            + list(parent_dir.glob(f"{base_name}-backup.*"))
            + list(parent_dir.glob(f"{base_name}.bak"))
            + list(parent_dir.glob(f"{base_name}_copy.*"))
        )

        if existing_copies:
            print("⚠️  WARNING: Found existing copy files that should be removed:")
            for copy_file in existing_copies:
                print(f"    - {copy_file}")
            print("    Please remove these manually to avoid confusion.")

    def _analyze_line_changes(
        self, before_lines: List[str], after_lines: List[str]
    ) -> Dict:
        """Analyze the differences between before and after lines."""
        from difflib import SequenceMatcher

        # Initialize change analysis
        changes = {
            "added": [],
            "removed": [],
            "modified": [],
            "total_changes": 0,
            "percent_changed": 0.0,
        }

        # Create a sequence matcher
        matcher = SequenceMatcher(None, before_lines, after_lines)

        # Track line numbers in before and after
        before_line_num = 0
        after_line_num = 0

        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == "equal":
                # Lines match exactly - just update line numbers
                before_line_num += i2 - i1
                after_line_num += j2 - j1
            elif tag == "replace":
                # Lines were modified
                for line_idx in range(min(i2 - i1, j2 - j1)):
                    changes["modified"].append(
                        {
                            "before_line": before_line_num + line_idx + 1,
                            "after_line": after_line_num + line_idx + 1,
                            "before": before_lines[i1 + line_idx],
                            "after": after_lines[j1 + line_idx],
                        }
                    )
                # If uneven replacement, add remaining as added/removed
                if (i2 - i1) > (j2 - j1):
                    # More lines in before than after - some were removed
                    for line_idx in range(j2 - j1, i2 - i1):
                        changes["removed"].append(
                            {
                                "line": before_line_num + (j2 - j1) + line_idx + 1,
                                "content": before_lines[i1 + (j2 - j1) + line_idx],
                            }
                        )
                elif (j2 - j1) > (i2 - i1):
                    # More lines in after than before - some were added
                    for line_idx in range(i2 - i1, j2 - j1):
                        changes["added"].append(
                            {
                                "line": after_line_num + (i2 - i1) + line_idx + 1,
                                "content": after_lines[j1 + (i2 - i1) + line_idx],
                            }
                        )

                before_line_num += i2 - i1
                after_line_num += j2 - j1
            elif tag == "delete":
                # Lines were deleted
                for line_idx in range(i2 - i1):
                    changes["removed"].append(
                        {
                            "line": before_line_num + line_idx + 1,
                            "content": before_lines[i1 + line_idx],
                        }
                    )
                before_line_num += i2 - i1
            elif tag == "insert":
                # Lines were inserted
                for line_idx in range(j2 - j1):
                    changes["added"].append(
                        {
                            "line": after_line_num + line_idx + 1,
                            "content": after_lines[j1 + line_idx],
                        }
                    )
                after_line_num += j2 - j1

        # Calculate total changes and percentage
        total_modified = len(changes["modified"])
        total_added = len(changes["added"])
        total_removed = len(changes["removed"])

        changes["total_changes"] = total_modified + total_added + total_removed

        # Calculate percentage of lines changed
        total_before_lines = len(before_lines) or 1  # Avoid division by zero
        changes["percent_changed"] = (
            changes["total_changes"] / total_before_lines
        ) * 100

        return changes

    def _validate_no_copies(self, file_path: Path) -> None:
        """Ensure we never create backup or copy files."""
        if any(
            suffix in str(file_path)
            for suffix in ["-fixed", "-backup", ".bak", "_copy"]
        ):
            raise ValueError(
                f"❌ CRITICAL ERROR: Attempted to create a copy/backup file: {file_path}"
            )

        # Also check the parent directory for any existing copies
        parent_dir = file_path.parent
        base_name = file_path.stem

        existing_copies = (
            list(parent_dir.glob(f"{base_name}-fixed.*"))
            + list(parent_dir.glob(f"{base_name}-backup.*"))
            + list(parent_dir.glob(f"{base_name}.bak"))
            + list(parent_dir.glob(f"{base_name}_copy.*"))
        )

        if existing_copies:
            print("⚠️  WARNING: Found existing copy files that should be removed:")
            for copy_file in existing_copies:
                print(f"    - {copy_file}")
            print("    Please remove these manually to avoid confusion.")

    def load_previous_run(self):
        """Load data from previous run for comparison."""
        state_file = Path(".yaml_processor_history")
        if state_file.exists():
            try:
                with open(state_file, "r") as f:
                    data = json.load(f)
                    self.previous_run = data
                    if self.verbose:
                        print("📝 Loaded previous run data")
                        print(
                            f"   Last run timestamp: {data.get('timestamp', 'unknown')}"
                        )
                        print(
                            f"   Previous files fixed: {data.get('stats', {}).get('files_fixed', 0)}"
                        )
            except Exception as e:
                if self.verbose:
                    print(f"⚠️ Failed to load previous run data: {e}")
                self.previous_run = None
        else:
            if self.verbose:
                print("ℹ️ No previous run data found")
            self.previous_run = None

    def save_current_run(self):
        """Save current run data for future comparisons."""
        state_file = Path(".yaml_processor_history")
        current_data = {
            "timestamp": datetime.now().isoformat(),
            "stats": {
                "files_processed": self.stats["files_processed"],
                "files_fixed": self.stats["files_fixed"],
                "issues_found": self.stats["issues_found"],
                "skipped_no_frontmatter": self.stats["skipped_no_frontmatter"],
                "skipped_empty": self.stats.get("skipped_empty", 0),
            },
            "fixed_files": self.fixed_files,
            "issue_types": self.issue_types,
            "file_changes_summary": {
                path: {
                    "total_changes": data["line_changes"]["total_changes"],
                    "percent_changed": data["line_changes"]["percent_changed"],
                    "modified_count": len(data["line_changes"]["modified"]),
                    "added_count": len(data["line_changes"]["added"]),
                    "removed_count": len(data["line_changes"]["removed"]),
                }
                for path, data in self.file_changes.items()
            },
        }

        try:
            with open(state_file, "w") as f:
                json.dump(current_data, f, indent=2)
                if self.verbose:
                    print("💾 Saved run data for future comparison")
        except Exception as e:
            if self.verbose:
                print(f"⚠️ Failed to save run data: {e}")

    def process_directory(self, directory_path: str, reset: bool = False) -> bool:
        """Process all markdown files in a directory."""
        directory_path = Path(directory_path)
        self.base_path = directory_path  # Set base path for relative display

        # Reset previous data if requested
        if reset:
            self.previous_run = None
            # Delete the history file if it exists
            history_file = Path(".yaml_processor_history")
            if history_file.exists():
                history_file.unlink()
                if self.verbose:
                    print("🔄 Reset processor history")

        # Reset discovered patterns for this session (avoid duplicate reporting)
        # but don't reset dictionary_already_shown flag
        self.discovered_patterns = {
            "encoding_issues": [],
            "indentation_issues": [],
            "incomplete_entries": [],
            "malformed_structures": [],
            "property_declaration_issues": [],
            "list_structure_issues": [],
            "quote_issues": [],
            "block_scalar_issues": [],
            "document_structure_issues": [],
        }

        # Initialize encountered issues if not already set
        if not hasattr(self, "encountered_issues"):
            self.encountered_issues = {
                "encoding_issues": [],
                "indentation_issues": [],
                "incomplete_entries": [],
                "malformed_structures": [],
                "property_declaration_issues": [],
                "list_structure_issues": [],
                "quote_issues": [],
                "block_scalar_issues": [],
                "document_structure_issues": [],
            }

        if not directory_path.exists():
            print(f"❌ Directory not found: {directory_path}")
            return False

        print("🎯 Z-Beam YAML Processor")
        print("=" * 50)
        print(f"⏰ Started: {self.stats['start_time'].strftime('%Y-%m-%d %H:%M:%S')}")
        print()

        md_files = list(directory_path.rglob("*.md"))

        # Filter out examples directory (unless specifically processing examples)
        md_files = [
            f
            for f in md_files
            if "examples" not in str(f.relative_to(directory_path)).split("/")
        ]

        # Note: Examples can contain YAML issues but are excluded from regular processing
        # If examples need cleaning, temporarily disable the filter above

        # Filter out empty files
        non_empty_files = []
        empty_count = 0

        for file_path in md_files:
            try:
                if file_path.stat().st_size == 0:
                    if self.verbose:
                        print(f"  ⏭️  Skipping empty file: {file_path.name}")
                    empty_count += 1
                    continue

                # Check if file contains only whitespace
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    if not content.strip():
                        if self.verbose:
                            print(
                                f"  ⏭️  Skipping whitespace-only file: {file_path.name}"
                            )
                        empty_count += 1
                        continue

                non_empty_files.append(file_path)

            except Exception as e:
                if self.verbose:
                    print(f"  ⚠️  Cannot read {file_path.name}: {e}")
                continue

        self.stats["skipped_empty"] = empty_count
        md_files = non_empty_files

        if not md_files:
            print("❌ No markdown files found.")
            return False

        print(
            f"🔍 Found {len(md_files)} markdown files to process (excluding examples and empty files)..."
        )

        for file_path in md_files:
            # Always print the current file being processed
            print(f"📄 Processing: {file_path.name}")

            # Process ALL markdown files, not just those with frontmatter
            self._process_file(file_path)
            self.stats["files_processed"] += 1

        # Print summary
        self._print_summary(directory_path)

        # Save any dictionary updates discovered
        self.save_dictionary_updates()

        return True

    def _print_header(self) -> None:
        """Print processing header."""
        print("🎯 Z-Beam YAML Processor")
        print("=" * 50)
        print(f"⏰ Started: {self.stats['start_time'].strftime('%Y-%m-%d %H:%M:%S')}")
        print()

    def _has_frontmatter(self, file_path: Path) -> bool:
        """Check if file has YAML frontmatter."""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read(100)
                return content.strip().startswith("---")
        except Exception as e:
            if self.verbose:
                print(f"  ⚠️  Cannot read {file_path.name}: {e}")
            return False

    def _timeout_handler(self, signum, frame):
        """Handle timeout when processing a file takes too long."""
        raise TimeoutError(f"Processing took more than {self.timeout} seconds")

    def _process_file(self, file_path: Path) -> None:
        """Process a single markdown file with timeout protection."""
        # Set up timeout handler
        original_handler = signal.signal(signal.SIGALRM, self._timeout_handler)
        signal.alarm(self.timeout)

        start_time = time.time()

        try:
            # Ensure we never create backup or copy files
            self._validate_no_copies(file_path)

            original_content = file_path.read_text(encoding="utf-8")

            # Process existing frontmatter
            parts = original_content.split("---", 2)
            if len(parts) < 3:
                print(f"  ⚠️ No frontmatter found in {file_path.name}")
                return

            frontmatter = parts[1]
            body = parts[2]

            # Store the original frontmatter for comparison
            original_frontmatter = frontmatter

            # Apply structural fixes first for severely broken files
            had_structural_issues = False
            if self._has_severe_structural_issues(frontmatter):
                frontmatter = self._fix_severe_structural_issues(frontmatter)
                had_structural_issues = True
                if self.verbose:
                    print(f"  🔧 Applied structural fixes to {file_path.name}")

            # Process YAML
            fixed_frontmatter, issues_found = self._fix_yaml_content(
                frontmatter, str(file_path)
            )

            if issues_found:
                # Write fixed content
                fixed_content = f"---{fixed_frontmatter}---{body}"
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(fixed_content)

                self.fixed_files.append(str(file_path))
                self.stats["files_fixed"] += 1

                # Store before and after comparison data
                self.file_changes[str(file_path)] = {
                    "issues": issues_found,
                    "had_structural_issues": had_structural_issues,
                    "before_lines": original_frontmatter.strip().split("\n"),
                    "after_lines": fixed_frontmatter.strip().split("\n"),
                    "line_changes": self._analyze_line_changes(
                        original_frontmatter.strip().split("\n"),
                        fixed_frontmatter.strip().split("\n"),
                    ),
                }

                print(f"  🔧 Fixed: {file_path.name} ({len(issues_found)} issues)")

                # Print detailed changes when in verbose mode
                if self.verbose:
                    for issue in issues_found:
                        print(f"     - {issue}")
            else:
                print(f"  ✅ No issues found in {file_path.name}")

        except TimeoutError as e:
            print(f"  ⏱️ Timeout processing {file_path.name}: {e}")
            self.stats["timed_out_files"] += 1
        except Exception as e:
            print(f"  ❌ Error processing {file_path.name}: {e}")
        finally:
            # Cancel the alarm and restore the original signal handler
            signal.alarm(0)
            signal.signal(signal.SIGALRM, signal.SIG_DFL)

    def _fix_yaml_content(
        self, yaml_content: str, file_path: str
    ) -> Tuple[str, List[str]]:
        """Comprehensive YAML content analysis and fixing using format issues dictionary."""
        if not yaml_content.strip():
            return yaml_content, []

        lines = yaml_content.strip().split("\n")
        all_issues = []

        # Phase 0: Detect format issues using the comprehensive dictionary
        detected_format_issues = self._detect_format_issues(lines)
        format_issues_count = sum(
            len(issues) for issues in detected_format_issues.values()
        )

        if format_issues_count > 0:
            all_issues.append(
                f"Detected {format_issues_count} format issue patterns from dictionary"
            )
            if self.verbose:
                print(f"  📋 Format issues detected: {detected_format_issues}")

        # Phase 1: Structural Analysis
        yaml_structure = self._analyze_yaml_structure(lines)

        # Phase 2: Comprehensive Fixes
        fixed_lines = self._apply_comprehensive_fixes(lines, yaml_structure, all_issues)

        # Phase 3: Final Validation and Cleanup
        final_content = self._finalize_yaml_content(fixed_lines, all_issues)

        # Store issues for reporting
        if all_issues:
            self.errors_found[file_path] = all_issues
            self.stats["issues_found"] += len(all_issues)

        return final_content, all_issues

    def _analyze_yaml_structure(self, lines: List[str]) -> Dict[str, any]:
        """Analyze the YAML structure to understand hierarchy and relationships."""
        structure = {
            "top_level_keys": set(),
            "nested_sections": {},
            "key_positions": {},
            "indentation_levels": {},
            "duplicate_keys": [],
            "malformed_lines": [],
        }

        current_section = None
        seen_keys = set()

        for i, line in enumerate(lines):
            if not line.strip() or line.strip().startswith("#"):
                continue

            # Analyze indentation
            indent_level = len(line) - len(line.lstrip())
            structure["indentation_levels"][i] = indent_level

            # Check for key-value pairs
            if ":" in line and not line.strip().startswith("-"):
                key_match = re.match(r"^(\s*)([\w\s\-\.]+):\s*(.*)$", line)
                if key_match:
                    indent, key, value = key_match.groups()
                    clean_key = key.strip()

                    # Track top-level vs nested keys
                    if indent_level == 0:
                        structure["top_level_keys"].add(clean_key)
                        current_section = clean_key
                    else:
                        if current_section:
                            if current_section not in structure["nested_sections"]:
                                structure["nested_sections"][current_section] = []
                            structure["nested_sections"][current_section].append(
                                clean_key
                            )

                    # Check for duplicates
                    full_key = (
                        f"{current_section}.{clean_key}"
                        if current_section and indent_level > 0
                        else clean_key
                    )
                    if full_key in seen_keys:
                        structure["duplicate_keys"].append((i, full_key))
                    else:
                        seen_keys.add(full_key)

                    structure["key_positions"][i] = (
                        clean_key,
                        indent_level,
                        current_section,
                    )
                else:
                    structure["malformed_lines"].append(i)

        return structure

    def _apply_comprehensive_fixes(
        self, lines: List[str], structure: Dict, issues: List[str]
    ) -> List[str]:
        """Apply all fixes comprehensively in optimal order."""
        fixed_lines = lines.copy()

        # Fix 0: Fix encoding issues first
        fixed_lines = self._fix_encoding_issues(fixed_lines, issues)

        # Fix 1: Handle incomplete list items and missing values
        fixed_lines = self._fix_incomplete_entries(fixed_lines, issues)

        # Fix 2: Handle malformed multi-colon lines first
        fixed_lines = self._fix_malformed_structures(fixed_lines, issues)

        # Fix 3: Fix quote issues
        fixed_lines = self._fix_quote_issues(fixed_lines, issues)

        # Fix 4: Fix bad list item indentation
        fixed_lines = self._fix_list_indentation(fixed_lines, issues)

        # Fix 5: Fix multiline key issues and improper line breaks
        fixed_lines = self._fix_multiline_key_issues(fixed_lines, issues)

        # Fix 6: Fix block scalar issues
        fixed_lines = self._fix_block_scalar_issues(fixed_lines, issues)

        # Fix 7: Remove duplicate keys
        # Re-analyze structure after structural fixes
        structure = self._analyze_yaml_structure(fixed_lines)
        fixed_lines = self._fix_duplicates(fixed_lines, structure, issues)

        # Fix 8: Correct indentation comprehensively
        fixed_lines = self._fix_indentation_comprehensive(
            fixed_lines, structure, issues
        )

        # Fix 9: Fix spacing and formatting
        fixed_lines = self._fix_spacing_comprehensive(fixed_lines, issues)

        # Fix 10: Handle multi-line values and reconstructions
        fixed_lines = self._fix_multiline_values(fixed_lines, issues)

        # Fix 11: Fix document structure issues
        fixed_lines = self._fix_document_structure_issues(fixed_lines, issues)

        return fixed_lines

    def _detect_format_issues(self, lines: List[str]) -> Dict[str, List[str]]:
        """Analyze content against the comprehensive format issues dictionary."""
        detected_issues = {
            "encoding_issues": [],
            "indentation_issues": [],
            "incomplete_entries": [],
            "malformed_structures": [],
            "property_declaration_issues": [],
            "list_structure_issues": [],
            "quote_issues": [],
            "block_scalar_issues": [],
            "document_structure_issues": [],
        }

        content = "\n".join(lines)

        for issue_category, issue_data in self.format_issues.items():
            for pattern in issue_data["patterns"]:
                if re.search(pattern, content, re.MULTILINE):
                    detected_issues[issue_category].append(pattern)
                    # Track in runtime encountered issues
                    if pattern not in self.encountered_issues[issue_category]:
                        self.encountered_issues[issue_category].append(pattern)

        return detected_issues

    def add_error_pattern_to_dictionary(
        self, error_message: str, error_context: str = ""
    ) -> None:
        """Analyze error log entries and automatically add new patterns to the format issues dictionary."""
        if not error_message:
            return

        import re

        # Pattern analysis for different error types
        new_patterns = []
        actually_new_patterns = []  # Track only patterns that are truly new
        category = None

        # Encoding issues - look for character encoding problems
        if (
            any(char in error_message for char in ["\\x", "·", "²", "³", "°", "µ"])
            or "UTF-8" in error_message
        ):
            category = "encoding_issues"
            # Extract specific character patterns
            if "\\x" in error_message:
                import re

                hex_chars = re.findall(r"\\x[0-9A-Fa-f]{2}", error_message)
                for char in hex_chars:
                    pattern = char.replace("\\", "\\\\")  # Escape for regex
                    if pattern not in self.format_issues["encoding_issues"]["patterns"]:
                        new_patterns.append(pattern)

            # Add UTF-8 encoding issue pattern
            if "UTF-8" in error_message:
                pattern = (
                    r"[^\x20-\x7E]"  # Simplified pattern for non-printable characters
                )
                if pattern not in self.format_issues["encoding_issues"]["patterns"]:
                    new_patterns.append(pattern)

        # Indentation issues (enhanced pattern detection)
        elif (
            "bad indentation" in error_message.lower()
            or "ambiguous indent" in error_message.lower()
        ):
            category = "indentation_issues"

            # Extract specific indentation context from error message
            if "mapping entry" in error_message:
                # Look for column information to determine indentation level
                if "column" in error_message:
                    import re

                    col_match = re.search(r"column (\d+)", error_message)
                    if col_match:
                        col_num = int(col_match.group(1))
                        # Generate adaptive pattern based on column position
                        if col_num <= 3:
                            # Special case for column 3 - usually a nested property that should be indented
                            pattern = (
                                r"^\s{0,2}(\w+):\s"  # Property with insufficient indent
                            )
                            if (
                                pattern
                                not in self.format_issues["indentation_issues"][
                                    "patterns"
                                ]
                            ):
                                new_patterns.append(pattern)
                        elif col_num > 4:
                            pattern = rf"^\s{{{col_num - 2},{col_num + 2}}}\w+:\s*$"  # Root key with wrong indent
                        else:
                            pattern = rf"^\s{{{1},{3}}}\w+:\s*[^-]"  # Property with insufficient indent

                        if (
                            pattern
                            not in self.format_issues["indentation_issues"]["patterns"]
                        ):
                            new_patterns.append(pattern)

            # Extract property name for specific patterns
            property_match = re.search(r":\s*(\w+):", error_message)
            if property_match:
                property_name = property_match.group(1)
                if property_name in [
                    "detail",
                    "metric",
                    "benefit",
                    "description",
                    "limitation",
                ]:
                    pattern = rf"^\s{{2,3}}({property_name}):"
                    if (
                        pattern
                        not in self.format_issues["indentation_issues"]["patterns"]
                    ):
                        new_patterns.append(pattern)

            # Check for environmentalImpact section with indentation issues
            if "environmentalImpact" in error_message or "benefit:" in error_message:
                pattern = r"^environmentalImpact:\s*\n\s*- benefit:"
                if pattern not in self.format_issues["indentation_issues"]["patterns"]:
                    new_patterns.append(pattern)

            # Generic indentation patterns based on context
            line_context_patterns = [
                r"^\s{4,}[a-zA-Z][a-zA-Z_]*:\s*$",  # Over-indented root keys
                r"^\s{1,3}[a-zA-Z][a-zA-Z_]*:\s*[^-]",  # Under-indented properties
                r"^(\s*)- [a-zA-Z]+:.*\n\s*[a-zA-Z]+:",  # Properties after list items without proper indentation
            ]
            for pattern in line_context_patterns:
                if pattern not in self.format_issues["indentation_issues"]["patterns"]:
                    new_patterns.append(pattern)

        # Missing colon issues (enhanced detection)
        elif (
            "colon is missed" in error_message.lower()
            or "expected ':'" in error_message
        ):
            category = "malformed_structures"

            # Extract context from error message to create adaptive patterns
            import re

            # Look for quoted content that might contain problematic characters
            quoted_content = re.findall(r'"([^"]*)"', error_message)
            for content in quoted_content:
                # Create patterns for common problematic content
                if ":" in content:
                    # Pattern for colon inside quotes
                    escaped_content = re.escape(
                        content[:20]
                    )  # First 20 chars for pattern
                    pattern = rf'^\s*"[^"]*{escaped_content}.*"\s*$'
                    if (
                        pattern
                        not in self.format_issues["malformed_structures"]["patterns"]
                    ):
                        new_patterns.append(pattern)

                if "-" in content and any(char.isupper() for char in content):
                    # Pattern for hyphenated terms that might cause issues
                    pattern = r'^\s*"[^"]*[A-Z][a-z]*-[A-Z][a-z]*[^"]*"\s*$'
                    if (
                        pattern
                        not in self.format_issues["malformed_structures"]["patterns"]
                    ):
                        new_patterns.append(pattern)

            # Generic patterns for orphaned values
            generic_patterns = [
                r'^\s*"[^"]*[:-][^"]*"\s*$',  # Quoted values with colons or hyphens
                r"^\s*[^:\s-]+\s+[^:\s-]+\s+[^:\s-]+.*$",  # Multiple words without structure
                r".*:.*:.*[^-]",  # Multiple colons in a line (not part of timestamp)
            ]
            for pattern in generic_patterns:
                if (
                    pattern
                    not in self.format_issues["malformed_structures"]["patterns"]
                ):
                    new_patterns.append(pattern)

        # Handle other malformed structures
        elif "formula:" in error_message and '""' in error_message:
            category = "malformed_structures"
            pattern = r'formula:"".*""'
            if pattern not in self.format_issues["malformed_structures"]["patterns"]:
                new_patterns.append(pattern)

            # Also add a pattern for formula with nested quotes
            pattern = r'formula:\s*"\\".*\\""'
            if pattern not in self.format_issues["malformed_structures"]["patterns"]:
                new_patterns.append(pattern)

        # Implicit mapping pair issues
        elif "implicit mapping pair" in error_message.lower():
            category = "malformed_structures"
            pattern = r'.*"[^"]*"[^"]*"[^"]*".*'  # Multiple quotes pattern
            if pattern not in self.format_issues["malformed_structures"]["patterns"]:
                new_patterns.append(pattern)

        # Multiline key issues
        elif "multiline key" in error_message.lower():
            category = "incomplete_entries"
            pattern = (
                r'^\s*\w+:\s*".*"$'  # Keys with quoted values that should be arrays
            )
            if pattern not in self.format_issues["incomplete_entries"]["patterns"]:
                new_patterns.append(pattern)

        # Duplicated mapping key
        elif (
            "duplicated mapping key" in error_message.lower()
            or "duplicate key" in error_message.lower()
        ):
            category = "property_declaration_issues"
            pattern = r"^(\s*)(\w+):.*\n.*^\s*\1\2:"  # Same key appearing twice
            if (
                pattern
                not in self.format_issues["property_declaration_issues"]["patterns"]
            ):
                new_patterns.append(pattern)

            # Add specific patterns for common duplicated keys
            if "description:" in error_message:
                pattern = r"description:\s+.*\n\s*description:"
                if (
                    pattern
                    not in self.format_issues["property_declaration_issues"]["patterns"]
                ):
                    new_patterns.append(pattern)

        # Quote issues and escaping problems
        elif "quoted scalar" in error_message or "escape character" in error_message:
            category = "quote_issues"

            if "unexpected end of stream" in error_message:
                # Unclosed quote
                pattern = r'"[^"]*$'
                if pattern not in self.format_issues["quote_issues"]["patterns"]:
                    new_patterns.append(pattern)

            if "escape character" in error_message:
                # Improper escape sequence
                pattern = r'\\[^\\nrt"]'
                if pattern not in self.format_issues["quote_issues"]["patterns"]:
                    new_patterns.append(pattern)

            # Nd:YAG specific pattern
            if "Nd:" in error_message:
                pattern = r':[^"]*Nd:YAG'
                if pattern not in self.format_issues["quote_issues"]["patterns"]:
                    new_patterns.append(pattern)

        # Block scalar issues
        elif (
            "found character '|'" in error_message
            or "found character '>'" in error_message
        ):
            category = "block_scalar_issues"

            if "|" in error_message:
                pattern = r"\|\s*\n\s*[^-\s]"
                if pattern not in self.format_issues["block_scalar_issues"]["patterns"]:
                    new_patterns.append(pattern)

            if ">" in error_message:
                pattern = r">\s*\n\s*[^-\s]"
                if pattern not in self.format_issues["block_scalar_issues"]["patterns"]:
                    new_patterns.append(pattern)

        # Document structure issues
        elif (
            "document separator" in error_message
            or "end of the stream" in error_message
        ):
            category = "document_structure_issues"

            if "expected" in error_message:
                # Missing document end
                pattern = r"^---\s*\n.*\n---\s*\n[^\n]"
                if (
                    pattern
                    not in self.format_issues["document_structure_issues"]["patterns"]
                ):
                    new_patterns.append(pattern)

            if "invalid document separator" in error_message:
                # Invalid document separator
                pattern = r"[^\n]---"
                if (
                    pattern
                    not in self.format_issues["document_structure_issues"]["patterns"]
                ):
                    new_patterns.append(pattern)

        # List structure issues
        elif ("meta_tags:" in error_message and '"- ' in error_message) or (
            "opengraph:" in error_message and '"- ' in error_message
        ):
            category = "list_structure_issues"

            if "meta_tags:" in error_message:
                pattern = r"meta_tags:\s*\"- "
                if (
                    pattern
                    not in self.format_issues["list_structure_issues"]["patterns"]
                ):
                    new_patterns.append(pattern)

            if "opengraph:" in error_message:
                pattern = r"opengraph:\s*\"- "
                if (
                    pattern
                    not in self.format_issues["list_structure_issues"]["patterns"]
                ):
                    new_patterns.append(pattern)

        # Add discovered patterns to the dictionary (avoid duplicates)
        if category and new_patterns:
            for pattern in new_patterns:
                # Check if pattern already exists in main dictionary
                if pattern not in self.format_issues[category]["patterns"]:
                    # Add to the main format issues dictionary
                    self.format_issues[category]["patterns"].append(pattern)
                    actually_new_patterns.append(pattern)

                    # Only track truly new patterns as discovered
                    if pattern not in self.discovered_patterns[category]:
                        self.discovered_patterns[category].append(pattern)

            if actually_new_patterns and self.verbose:
                print(
                    f"  📚 Added {len(actually_new_patterns)} new patterns to {category}: {actually_new_patterns}"
                )

    def analyze_common_error_patterns(self) -> None:
        """Analyze the most common YAML error patterns from recent logs and add them to dictionary."""
        # Reset discovered patterns to avoid duplicate reporting
        self.discovered_patterns = {
            "encoding_issues": [],
            "indentation_issues": [],
            "incomplete_entries": [],
            "malformed_structures": [],
            "property_declaration_issues": [],
            "list_structure_issues": [],
            "quote_issues": [],
            "block_scalar_issues": [],
            "document_structure_issues": [],
        }

        # Common patterns observed from the terminal output
        common_errors = [
            # Original patterns
            {
                "error": 'can not read an implicit mapping pair; a colon is missed at line 4, column 51: ... : "formula:""Al₂O₃·2SiO₂·2H₂O\\""',
                "context": "Chemical formula with double quotes",
            },
            {
                "error": 'bad indentation of a mapping entry at line 12, column 5: fluenceRange: "2-10 J/cm²"',
                "context": "Property indentation under properties block",
            },
            {
                "error": "bad indentation of a mapping entry at line 4, column 5: flexuralStrength: 70–150 MPa",
                "context": "Property not properly nested",
            },
            {
                "error": "bad indentation of a mapping entry at line 4, column 3: detail: Non-contact removal...",
                "context": "List item detail not properly indented",
            },
            {
                "error": 'bad indentation of a mapping entry at line 3, column 14: meta_tags: "- name: description"',
                "context": "Meta tags converted to string instead of array",
            },
            {
                "error": 'can not read an implicit mapping pair; a colon is missed at line 40, column 40: ... switched Nd: YAG or fiber laser"',
                "context": "Colon within quoted string causing parsing issues",
            },
            {
                "error": 'can not read a block mapping entry; a multiline key may not be an implicit key at line 13, column 15: opengraph: "- property: og:title"',
                "context": "OpenGraph tags converted to string instead of array",
            },
            {
                "error": "duplicated mapping key at line 51, column 1: description: Eliminates 95% of s...",
                "context": "Duplicate description keys",
            },
            {
                "error": "bad indentation of a mapping entry at line 5, column 1: - name: Rapid Paint Removal",
                "context": "List items need two spaces indentation under parent section",
            },
            {
                "error": 'bad indentation of a mapping entry at line 4, column 3: useCase: "Removal of biological',
                "context": "Nested properties need consistent indentation under parent list item",
            },
            {
                "error": "end of the stream or a document separator is expected at line 48, column 1: - benefit: Energy efficiency",
                "context": "List items in environmentalImpact section need proper indentation",
            },
            # New patterns from research
            {
                "error": "found character '\\t' that cannot start any token at line 7, column 1",
                "context": "Tab character used for indentation instead of spaces",
            },
            {
                "error": "found undefined alias at line 15, column 5: *ref1",
                "context": "Using an alias without defining the anchor",
            },
            {
                "error": "did not find expected key at line 22, column 3",
                "context": "Improper nesting or missing key in mapping",
            },
            {
                "error": "while parsing a block mapping, did not find expected value at line 10, column 1",
                "context": "Block mapping missing expected value",
            },
            {
                "error": "while scanning a quoted scalar, found unexpected end of stream at line 25, column 10",
                "context": "Unclosed quoted string",
            },
            {
                "error": "mapping values are not allowed in this context at line 8, column 7",
                "context": "Using mapping values in wrong context (like inside a sequence)",
            },
            {
                "error": "could not find expected ':' at line 12, column 5",
                "context": "Missing colon in mapping entry",
            },
            {
                "error": "found character '|' that cannot start any token at line 30, column 10",
                "context": "Improper use of block scalar indicator",
            },
            {
                "error": "while parsing a block collection, found undefined tag handle at line 14, column 5",
                "context": "Using undefined tag handle",
            },
            {
                "error": "found duplicate anchor 'id001' at line 22, column 5",
                "context": "Duplicate anchor defined",
            },
            {
                "error": "found unacceptable character '\\x00' while scanning a quoted scalar at line 15, column 10",
                "context": "Null character in quoted scalar",
            },
            {
                "error": 'found unknown escape character "\\" at line 18, column 15',
                "context": "Improper escape sequence in quoted string",
            },
            {
                "error": "while parsing a flow node, found unexpected ']' at line 9, column 15",
                "context": "Unbalanced brackets in flow collection",
            },
            {
                "error": "while scanning a flow sequence, expected ',' or ']' but found",
                "context": "Missing comma or closing bracket in flow sequence",
            },
            {
                "error": "found ambiguous indent for block collection at line 13, column 7",
                "context": "Ambiguous indentation for block collection",
            },
            {
                "error": "while scanning for the next token found character ',' that cannot start any token at line 8, column 12",
                "context": "Comma used outside of flow collection context",
            },
            {
                "error": "environmentalImpact section improperly indented list items",
                "context": "List items in environmentalImpact section need two-space indentation",
            },
            {
                "error": "found invalid \\r\\n at line 10, column 2",
                "context": "Windows line endings causing parsing issues",
            },
            {
                "error": "found invalid UTF-8 byte at line 6, column 1",
                "context": "Invalid UTF-8 encoding in file",
            },
            {
                "error": 'bad indentation of a mapping entry at line 4, column 3: metric: "98% reduction in processing time"',
                "context": "Metric field with incorrect indentation under parent list item",
            },
            {
                "error": 'bad indentation of a mapping entry at line 15, column 3: benefit: "Reduced environmental impact"',
                "context": "Benefit field with incorrect indentation under environmentalImpact section",
            },
            {
                "error": 'bad indentation of a mapping entry at line 18, column 3: description: "Precision removal of contaminants"',
                "context": "Description field incorrectly indented under parent section",
            },
            {
                "error": "found duplicate key with null value at line 12, column 5",
                "context": "Duplicate key with null value",
            },
            {
                "error": "found invalid document separator at line 3, column 1",
                "context": "Invalid document separator (--- not at start of line)",
            },
            {
                "error": "could not determine a constructor for the tag at line 15, column 5",
                "context": "Using undefined custom tag constructor",
            },
        ]

        for error_info in common_errors:
            self.add_error_pattern_to_dictionary(
                error_info["error"], error_info["context"]
            )

    def save_dictionary_updates(self) -> None:
        """Save any new patterns discovered to maintain an updated dictionary."""
        import json
        from pathlib import Path

        # Check if any new patterns were discovered
        has_updates = any(self.discovered_patterns.values())

        if has_updates:
            dictionary_file = Path("yaml-processor/format_issues_dictionary.json")

            # Create a comprehensive dictionary snapshot
            dictionary_snapshot = {
                "version": "2.1.0",
                "last_updated": datetime.now().isoformat(),
                "format_issues": self.format_issues,
                "discovered_patterns": self.discovered_patterns,
                "total_patterns": sum(
                    len(patterns)
                    for patterns in self.format_issues.values()
                    if isinstance(patterns, dict) and "patterns" in patterns
                ),
                "statistics": {
                    "patterns_by_category": {
                        category: len(data.get("patterns", []))
                        for category, data in self.format_issues.items()
                    },
                    "newly_discovered": {
                        category: len(patterns)
                        for category, patterns in self.discovered_patterns.items()
                    },
                },
            }

            try:
                with open(dictionary_file, "w", encoding="utf-8") as f:
                    json.dump(dictionary_snapshot, f, indent=2, ensure_ascii=False)

                if self.verbose:
                    print(f"\n💾 Dictionary snapshot saved to {dictionary_file}")
                    print(f"   Total patterns: {dictionary_snapshot['total_patterns']}")

            except Exception as e:
                if self.verbose:
                    print(f"⚠️ Could not save dictionary: {e}")

    def _fix_encoding_issues(self, lines: List[str], issues: List[str]) -> List[str]:
        """Fix encoding issues using the format issues dictionary."""
        fixed_lines = []
        encoding_fixes = self.format_issues["encoding_issues"]["fixes"]

        for line in lines:
            if not line.strip():
                fixed_lines.append(line)
                continue

            original_line = line
            # Apply all encoding fixes from the dictionary
            for escaped_char, replacement in encoding_fixes.items():
                line = line.replace(escaped_char, replacement)

            if line != original_line:
                issues.append("Fixed encoding characters using format dictionary")
                self.issue_types["encoding_issues"] = (
                    self.issue_types.get("encoding_issues", 0) + 1
                )

            fixed_lines.append(line)

        return fixed_lines

    def _fix_list_indentation(self, lines: List[str], issues: List[str]) -> List[str]:
        """Fix bad indentation in list items where nested properties have wrong indentation."""
        fixed_lines = []
        i = 0
        current_section = None

        while i < len(lines):
            line = lines[i]

            # Track the current section for context
            if line.strip() and not line.startswith(" ") and ":" in line:
                current_section = line.split(":")[0].strip()

            # Don't add the line yet - we'll decide after analyzing

            # Fix list items that aren't properly indented under their parent section
            if line.strip().startswith("- ") and current_section in [
                "applications",
                "compatibility",
                "composition",
                "environmentalImpact",
                "outcomes",
            ]:
                current_indent = len(line) - len(line.lstrip())
                # List items should have at least 2 spaces indentation under their parent section
                if current_indent < 2:
                    content = line.strip()
                    fixed_line = "  " + content  # Add 2-space indentation
                    fixed_lines.append(fixed_line)
                    issues.append(
                        f"Fixed list item indentation under {current_section}"
                    )
                    i += 1
                    continue

            # Check if this is a list item start
            if line.strip().startswith("- ") and ":" in line:
                list_indent = len(line) - len(line.lstrip())
                expected_nested_indent = (
                    list_indent + 2
                )  # Standard 2-space indent for nested items

                # Add the list item line itself
                fixed_lines.append(line)

                # Look ahead for improperly indented nested items
                j = i + 1
                fixed_list_section = False

                while j < len(lines):
                    next_line = lines[j]
                    if not next_line.strip():
                        fixed_lines.append(next_line)
                        j += 1
                        continue

                    # If we hit another list item or unindented content, stop
                    next_indent = len(next_line) - len(next_line.lstrip())
                    if next_line.strip().startswith("- ") or next_indent <= list_indent:
                        break

                    # Check if this line is a nested property with wrong indentation
                    if ":" in next_line and not next_line.strip().startswith("#"):
                        current_indent = len(next_line) - len(next_line.lstrip())
                        # Always standardize indentation for nested properties in list items
                        # This helps avoid "bad indentation of a mapping entry" errors
                        if current_indent != expected_nested_indent:
                            fixed_list_section = True

                            # Fix the indentation to be consistent
                            content = next_line.lstrip()
                            fixed_line = " " * expected_nested_indent + content
                            fixed_lines.append(fixed_line)
                            issues.append(
                                f"Fixed indentation for nested list property: {content.split(':')[0]}"
                            )
                        else:
                            fixed_lines.append(next_line)
                    else:
                        # Handle nested content that doesn't have a colon (could be multi-line content)
                        if next_indent > list_indent:
                            # Ensure consistent indentation for any nested content
                            if next_indent != expected_nested_indent:
                                content = next_line.lstrip()
                                fixed_line = " " * expected_nested_indent + content
                                fixed_lines.append(fixed_line)
                                issues.append(
                                    "Fixed indentation for nested list content"
                                )
                                fixed_list_section = True
                            else:
                                fixed_lines.append(next_line)
                        else:
                            fixed_lines.append(next_line)

                    j += 1

                if fixed_list_section:
                    issues.append(f"Fixed list section starting with: {line.strip()}")

                i = j
                continue
            # Handle non-list mapping entries that might have indentation issues
            elif (
                ":" in line
                and not line.strip().startswith("#")
                and not line.strip().startswith("- ")
            ):
                current_line = line
                next_line_idx = i + 1

                # Add the current line
                fixed_lines.append(current_line)

                # Check if there are nested properties with wrong indentation
                if next_line_idx < len(lines):
                    current_indent = len(current_line) - len(current_line.lstrip())
                    expected_indent = current_indent + 2  # Standard nested indentation

                    # Look ahead for nested properties
                    j = next_line_idx
                    while j < len(lines):
                        next_line = lines[j]
                        if not next_line.strip():
                            fixed_lines.append(next_line)
                            j += 1
                            continue

                        next_indent = len(next_line) - len(next_line.lstrip())

                        # If indentation level is lower or equal, we're out of the nested block
                        if next_indent <= current_indent:
                            break

                        # If this is a nested property with wrong indentation
                        if ":" in next_line and not next_line.strip().startswith("#"):
                            if next_indent != expected_indent:
                                # Fix the indentation to be consistent
                                content = next_line.lstrip()
                                fixed_line = " " * expected_indent + content
                                fixed_lines.append(fixed_line)
                                issues.append(
                                    f"Fixed indentation for mapping entry: {content.split(':')[0]}"
                                )
                            else:
                                fixed_lines.append(next_line)
                        else:
                            fixed_lines.append(next_line)

                        j += 1

                    i = j
                    continue

                i += 1
                continue
            else:
                # For other lines, just add them
                fixed_lines.append(line)
                i += 1

        return fixed_lines

    def _fix_incomplete_entries(self, lines: List[str], issues: List[str]) -> List[str]:
        """Fix incomplete YAML entries like missing list values or empty keys."""
        fixed_lines = []
        i = 0

        while i < len(lines):
            line = lines[i]

            if not line.strip() or line.strip().startswith("#"):
                fixed_lines.append(line)
                i += 1
                continue

            # Check for incomplete list items (lines that end with colon but no value)
            if line.strip().endswith(":") and ":" in line:
                # Check if this is followed by properly indented content
                next_line = lines[i + 1] if i + 1 < len(lines) else ""
                current_indent = len(line) - len(line.lstrip())

                if (
                    next_line.strip()
                    and len(next_line) - len(next_line.lstrip()) <= current_indent
                ):
                    # Next line is not properly indented under this key, add placeholder
                    key_name = line.split(":", 1)[0].strip()
                    if line.strip().startswith("-"):
                        # This is a list item missing content
                        fixed_lines.append(line.rstrip() + ' "TBD"')
                        issues.append(
                            f"Added placeholder for incomplete list item: {key_name}"
                        )
                    else:
                        # This is a key without value
                        fixed_lines.append(line)  # Keep as-is for now
                else:
                    fixed_lines.append(line)

            # Check for incomplete meta tag or opengraph entries
            elif (
                line.strip().startswith("- name:") and not line.split(":", 1)[1].strip()
            ):
                # Incomplete meta tag name
                fixed_lines.append(line.rstrip() + ' "TBD"')
                issues.append("Added placeholder for incomplete meta tag name")

            elif (
                line.strip().startswith("- property:")
                and not line.split(":", 1)[1].strip()
            ):
                # Incomplete opengraph property
                fixed_lines.append(line.rstrip() + ' "TBD"')
                issues.append("Added placeholder for incomplete opengraph property")

            # Check for content: lines without values
            elif "content:" in line and line.split("content:", 1)[1].strip() == "":
                key_part = line.split("content:", 1)[0] + "content:"
                fixed_lines.append(key_part + ' "TBD"')
                issues.append("Added placeholder for missing content value")

            # Check for properties without values that are followed by incorrectly indented content
            elif line.strip().endswith(":") and line.strip() in [
                "properties:",
                "chemicalProperties:",
                "compatibility:",
            ]:
                # This is a property declaration that should have nested content
                next_line_idx = i + 1
                current_indent = len(line) - len(line.lstrip())
                expected_indent = current_indent + 2

                # Look ahead and fix ALL content that should be nested under this property
                j = next_line_idx
                fixed_any_content = False

                while j < len(lines):
                    next_line = lines[j]
                    if not next_line.strip():
                        j += 1
                        continue

                    next_indent = len(next_line) - len(next_line.lstrip())

                    # If we hit content at same level or less, stop processing this property
                    if next_indent <= current_indent:
                        break

                    # If we find content that should be nested but isn't properly indented
                    if ":" in next_line and next_indent > current_indent:
                        if next_indent != expected_indent:
                            # Fix the indentation
                            content = next_line.lstrip()
                            lines[j] = " " * expected_indent + content
                            issues.append(
                                f"Fixed indentation for property under {line.strip()}: {content.split(':')[0]}"
                            )
                            fixed_any_content = True
                        else:
                            fixed_any_content = True

                    j += 1

                if not fixed_any_content:
                    # No proper nested content found, add empty object
                    fixed_lines.append(line.rstrip() + " {}")
                    issues.append(
                        f"Added empty object for property without content: {line.strip()}"
                    )
                else:
                    fixed_lines.append(line)

            # Check for array-to-string conversion issues (meta_tags, opengraph)
            elif re.search(r'(meta_tags|opengraph):\s*"- ', line):
                # Fix: meta_tags: "- name: description" -> proper array format
                key_match = re.search(r'(\w+):\s*"(- .+)"', line)
                if key_match:
                    key_name = key_match.group(1)
                    array_content = key_match.group(2)
                    base_indent = len(line) - len(line.lstrip())

                    # Convert string back to proper YAML array
                    fixed_lines.append(" " * base_indent + f"{key_name}:")
                    # Add the array item with proper indentation
                    fixed_lines.append(
                        " " * (base_indent + 2) + array_content.replace('"', "")
                    )
                    issues.append(f"Fixed {key_name} array converted to string")
                    i += 1
                    continue

            # Check for improperly indented root-level keys (generalized)
            elif re.search(r"^\s{4,}[a-zA-Z][a-zA-Z_]*:\s*$", line):
                # Fix: "    anyKey:" -> "anyKey:" (remove excessive indentation)
                key_match = re.search(r"^\s{4,}([a-zA-Z][a-zA-Z_]*):\s*$", line)
                if key_match:
                    key_name = key_match.group(1)
                    fixed_lines.append(f"{key_name}:")
                    issues.append(
                        f"Fixed improper indentation for root-level key: {key_name}"
                    )
                    continue

            # Check for incorrectly indented nested properties (generalized)
            elif re.search(
                r"^\s{2,3}(detail|scope|content|value|metric|result|benefit):", line
            ):
                # Should be indented 4 spaces under a parent
                line_content = line.strip()
                fixed_lines.append(f"    {line_content}")
                issues.append(
                    f"Fixed nested property indentation: {line_content.split(':')[0]}"
                )
                continue

            # Enhanced list item checking (generalized)
            elif re.search(r"^\s*- \w+:\s*$", line):
                # Empty list item field - add placeholder
                field_name = line.strip().replace("- ", "").replace(":", "")
                fixed_lines.append(line.rstrip() + ' "TBD"')
                issues.append(
                    f"Added placeholder for empty list item field: {field_name}"
                )
                continue

            else:
                fixed_lines.append(line)

            i += 1

        return fixed_lines

    def _fix_malformed_structures(
        self, lines: List[str], issues: List[str]
    ) -> List[str]:
        """Fix malformed YAML structures like multiple colons on one line."""
        fixed_lines = []

        for line in lines:
            if not line.strip() or line.strip().startswith("#"):
                fixed_lines.append(line)
                continue

            # Check for orphaned quoted values (values without keys)
            if re.search(r'^\s*"[^"]*"\s*$', line.strip()):
                # This is a quoted value without a key - likely orphaned
                # Remove it or convert to comment
                base_indent = len(line) - len(line.lstrip())
                quoted_content = line.strip().strip('"')
                # Convert to comment to preserve information
                comment_line = " " * base_indent + f"# REMOVED: {quoted_content}"
                fixed_lines.append(comment_line)
                issues.append("Removed orphaned quoted value (converted to comment)")
                continue

            # Check for malformed double quotes (generalized)
            if re.search(r'\w+:"".*""', line):
                # Fix any key with malformed double quotes: key:""value"" -> key: "value"
                quote_match = re.search(r'(\w+):""([^"]+)""', line)
                if quote_match:
                    key_name = quote_match.group(1)
                    content = quote_match.group(2)
                    base_indent = len(line) - len(line.lstrip())
                    clean_line = " " * base_indent + f'{key_name}: "{content}"'
                    fixed_lines.append(clean_line)
                    issues.append(f"Fixed malformed double quotes for {key_name}")
                    continue

            # Check for problematic nested quotes in useCase fields
            if "useCase:" in line and (
                '"\\"' in line or '\\"\\""' in line or '"""' in line
            ):
                # Convert various malformed quote patterns:
                # useCase: "\""text\"" to useCase: "text"
                # useCase: "\"text\"" to useCase: "text"
                original_line = line
                line = re.sub(r'(useCase:\s*)"\\\\"(.*)\\\\""\s*$', r'\1"\2"', line)
                line = re.sub(r'(useCase:\s*)"\\"(.*)\\""\s*$', r'\1"\2"', line)
                line = re.sub(r'(useCase:\s*)"\\"\\""(.*)\\"\\"""\s*$', r'\1"\2"', line)
                line = re.sub(r'(useCase:\s*)"\\"([^"]*)\\""\s*$', r'\1"\2"', line)
                if line != original_line:
                    fixed_lines.append(line)
                    issues.append("Fixed problematic nested quotes in useCase field")
                    continue

            # Check for problematic colons in quoted strings (generalized)
            if (
                '"' in line
                and ":" in line
                and re.search(r'"[^"]*\w+:\s*\w+[^"]*"', line)
            ):
                # Replace internal colons with safer notation for any quoted content
                original_line = line
                # Replace patterns like "word: word" with "word-word" inside quotes
                line = re.sub(r'("[^"]*?)(\w+):\s*(\w+)([^"]*?")', r"\1\2-\3\4", line)
                if line != original_line:
                    fixed_lines.append(line)
                    issues.append("Fixed colon in quoted string causing parsing issues")
                    continue

            # Check for corrupted content lines (generalized)
            if (line.count('"') >= 3 and len(line) > 100) or (
                "'}]" in line or "']" in line
            ):
                # This looks like corrupted content - simplify or remove
                base_indent = len(line) - len(line.lstrip())

                # If it has a key, preserve it with empty array
                if ":" in line:
                    key_part = line.split(":", 1)[0].strip()
                    if key_part and len(key_part) < 50:  # Reasonable key length
                        clean_line = " " * base_indent + key_part + ": []"
                        fixed_lines.append(clean_line)
                        issues.append(f"Fixed corrupted content for: {key_part}")
                        continue

                # Otherwise, replace with empty array or comment
                clean_line = " " * base_indent + "# REMOVED: corrupted content"
                fixed_lines.append(clean_line)
                issues.append("Removed corrupted/truncated content line")
                continue

            # Check for multiple colons in key-value structure
            if line.count(":") > 1 and not line.strip().startswith("-"):
                # Pattern: key1: key2: value  -> convert to nested structure
                parts = line.split(":")
                if len(parts) >= 3:
                    # Get the base indentation
                    base_indent = len(line) - len(line.lstrip())

                    # First part is the parent key
                    parent_key = parts[0].strip()

                    # Remaining parts form child key-value
                    child_parts = ":".join(parts[1:]).strip()
                    if child_parts:
                        child_key_value = child_parts.split(":", 1)
                        if len(child_key_value) == 2:
                            child_key = child_key_value[0].strip()
                            child_value = child_key_value[1].strip()

                            # Create proper nested structure
                            parent_line = " " * base_indent + parent_key + ":"
                            child_line = (
                                " " * (base_indent + 4) + child_key + ": " + child_value
                            )

                            fixed_lines.append(parent_line)
                            fixed_lines.append(child_line)
                            issues.append(
                                f"Fixed malformed multi-colon line: {parent_key}"
                            )
                            continue

            # Check for incomplete lines with truncated content
            if line.strip().endswith('"') and '"' in line[:-1]:
                # This might be a truncated line, but don't modify if it looks complete
                quote_count = line.count('"')
                if quote_count % 2 == 0:  # Even number of quotes, probably complete
                    fixed_lines.append(line)
                    continue

            fixed_lines.append(line)

        return fixed_lines

    def _fix_duplicates(
        self, lines: List[str], structure: Dict, issues: List[str]
    ) -> List[str]:
        """Remove duplicate keys efficiently."""
        if not structure["duplicate_keys"]:
            return lines

        # Mark lines for removal (process in reverse to maintain indices)
        lines_to_remove = set()
        for line_idx, key_name in sorted(structure["duplicate_keys"], reverse=True):
            lines_to_remove.add(line_idx)
            issues.append(f"Removed duplicate key: {key_name}")

        return [line for i, line in enumerate(lines) if i not in lines_to_remove]

    def _fix_indentation_comprehensive(
        self, lines: List[str], structure: Dict, issues: List[str]
    ) -> List[str]:
        """Fix all indentation issues comprehensively."""
        fixed_lines = []
        expecting_indented = False
        last_parent_key = None

        for i, line in enumerate(lines):
            if not line.strip() or line.strip().startswith("#"):
                fixed_lines.append(line)
                continue

            current_indent = len(line) - len(line.lstrip())

            # Check if this line contains a key-value pair
            if ":" in line and not line.strip().startswith("-"):
                key_part = line.split(":", 1)[0].strip()
                value_part = line.split(":", 1)[1].strip() if ":" in line else ""

                # Check if this is a top-level key
                if key_part in self.yaml_patterns["top_level_keys"]:
                    # Top-level keys should be at column 0
                    if current_indent > 0:
                        new_line = (
                            f"{key_part}:{' ' + value_part if value_part else ''}"
                        )
                        fixed_lines.append(new_line)
                        issues.append(f"Fixed top-level key indentation: {key_part}")
                        # If value is empty, expect indented properties next
                        if not value_part:
                            expecting_indented = True
                            last_parent_key = key_part
                        continue
                    else:
                        # If value is empty, expect indented properties next
                        if not value_part:
                            expecting_indented = True
                            last_parent_key = key_part

                # Check if we're expecting an indented property
                elif expecting_indented and current_indent == 0:
                    # This should be indented under the parent
                    new_line = (
                        f"    {key_part}:{' ' + value_part if value_part else ''}"
                    )
                    fixed_lines.append(new_line)
                    issues.append(
                        f"Fixed missing indentation under {last_parent_key}: {key_part}"
                    )
                    continue

                # Special case: Properties under properties: section with wrong indentation
                elif last_parent_key == "properties" and current_indent != 4:
                    # Properties should be indented exactly 4 spaces under properties:
                    new_line = (
                        f"    {key_part}:{' ' + value_part if value_part else ''}"
                    )
                    fixed_lines.append(new_line)
                    issues.append(
                        f"Fixed property indentation under properties: {key_part}"
                    )
                    continue

                # If this is properly indented, we can stop expecting indentation
                elif current_indent >= 2:
                    expecting_indented = False
                    last_parent_key = None

            # Reset expectation if we encounter a new top-level key
            if current_indent == 0 and ":" in line:
                expecting_indented = False
                last_parent_key = None

            fixed_lines.append(line)

        return fixed_lines

    def _fix_multiline_key_issues(
        self, lines: List[str], issues: List[str]
    ) -> List[str]:
        """Fix issues with multiline keys or improper line breaks in YAML."""
        fixed_lines = []
        i = 0

        while i < len(lines):
            line = lines[i]

            # If the line is empty and surrounded by indented content, it may be causing a multiline key error
            if not line.strip() and i > 0 and i < len(lines) - 1:
                prev_line = lines[i - 1]
                next_line = lines[i + 1]

                prev_indent = (
                    len(prev_line) - len(prev_line.lstrip()) if prev_line.strip() else 0
                )
                next_indent = (
                    len(next_line) - len(next_line.lstrip()) if next_line.strip() else 0
                )

                # If previous line ends with a colon and next line is indented, this empty line is breaking the structure
                if prev_line.strip().endswith(":") and next_indent > prev_indent:
                    # Skip this empty line
                    issues.append(
                        "Fixed multiline key issue by removing improper line break"
                    )
                    i += 1
                    continue

                # If both surrounding lines are indented properties, this empty line could cause parsing errors
                if (
                    prev_indent > 0
                    and next_indent > 0
                    and ":" in prev_line
                    and ":" in next_line
                ):
                    # Skip this empty line
                    issues.append(
                        "Fixed multiline key issue by removing disruptive empty line"
                    )
                    i += 1
                    continue

            # Handle potential improper line breaks in the middle of a key or value
            if (
                line.strip()
                and not line.strip().endswith(":")
                and ":" not in line
                and i > 0
            ):
                prev_line = lines[i - 1]
                # If previous line ends with a property but no value, this might be part of it
                if prev_line.strip().endswith(":"):
                    # This is likely a value continuation after improper line break
                    content = line.strip()
                    fixed_lines[-1] = fixed_lines[-1] + f' "{content}"'
                    issues.append("Fixed improper line break in property value")
                    i += 1
                    continue

            fixed_lines.append(line)
            i += 1

        return fixed_lines

    def _fix_spacing_comprehensive(
        self, lines: List[str], issues: List[str]
    ) -> List[str]:
        """Fix all spacing issues comprehensively."""
        fixed_lines = []
        in_properties_section = False

        for line in lines:
            if not line.strip() or line.strip().startswith("#"):
                fixed_lines.append(line)
                continue

            original_line = line

            # Check if we're entering or leaving a properties section
            if re.match(r"^\s*properties:\s*$", line):
                in_properties_section = True
            elif line.strip() and not line.startswith(" "):
                in_properties_section = False

            # Fix double colons
            if "::" in line:
                line = line.replace("::", ":")
                issues.append("Fixed double colons")

            # Fix property names with spaces (convert to camelCase) when in properties section
            if in_properties_section and ":" in line and " " in line.split(":", 1)[0]:
                indent = len(original_line) - len(original_line.lstrip())
                key_part, value_part = line.split(":", 1)
                key_part = key_part.strip()

                # Convert property name with spaces to camelCase
                if " " in key_part:
                    words = key_part.split()
                    camel_case_key = words[0].lower()
                    for word in words[1:]:
                        camel_case_key += word.capitalize()

                    line = " " * indent + camel_case_key + ":" + value_part
                    issues.append(
                        f"Fixed property name with spaces: '{key_part}' to '{camel_case_key}'"
                    )

            # Fix colon spacing for key-value pairs
            if ":" in line and not line.strip().startswith("-"):
                parts = line.split(":", 1)
                if len(parts) == 2:
                    key_part, value_part = parts
                    indent = len(original_line) - len(original_line.lstrip())

                    if value_part and not value_part.startswith(" "):
                        # Missing space after colon
                        line = (
                            " " * indent + key_part.strip() + ": " + value_part.strip()
                        )
                        issues.append("Fixed colon spacing")
                    elif value_part.startswith("  "):
                        # Multiple spaces after colon
                        line = (
                            " " * indent + key_part.strip() + ": " + value_part.lstrip()
                        )
                        issues.append("Fixed colon spacing")

            # Fix Nd:YAG and similar patterns inside non-quoted values
            if ":" in line and "Nd:" in line and '"' not in line:
                # If Nd:YAG appears in an unquoted value, wrap it in quotes
                pattern = r'(:\s*)([^"]*?Nd:[^"]*?)(\s*$)'
                if re.search(pattern, line):
                    line = re.sub(pattern, r'\1"\2"\3', line)
                    issues.append("Fixed unquoted Nd:YAG value")

            # Fix time formats (like 10:30) in non-quoted values
            time_pattern = r'(:\s*)([^"]*?\d+:\d+[^"]*?)(\s*$)'
            if (
                ":" in line
                and re.search(r"\d+:\d+", line)
                and '"' not in line
                and re.search(time_pattern, line)
            ):
                line = re.sub(time_pattern, r'\1"\2"\3', line)
                issues.append("Fixed unquoted time format")

            # Fix nested quotes (escaped quotes inside quoted strings)
            if '\\"' in line:
                # Replace unnecessary escaped quotes with single quotes where possible
                line = line.replace('\\"', "'")
                issues.append("Fixed escaped nested quotes")

            fixed_lines.append(line)

        return fixed_lines

    def _fix_multiline_values(self, lines: List[str], issues: List[str]) -> List[str]:
        """Handle multi-line value reconstructions."""
        fixed_lines = []
        i = 0

        while i < len(lines):
            line = lines[i]
            next_line = lines[i + 1] if i + 1 < len(lines) else ""

            # Check for broken multi-line values
            if self._needs_line_reconstruction(line, next_line):
                reconstructed, consumed = self._reconstruct_broken_line(lines, i)
                fixed_lines.append(reconstructed)
                issues.append("Reconstructed multi-line value")
                i += consumed
            else:
                fixed_lines.append(line)
                i += 1

        return fixed_lines

    def _finalize_yaml_content(self, lines: List[str], issues: List[str]) -> str:
        """Finalize the YAML content with proper formatting."""
        # Ensure proper start and end newlines for frontmatter
        content = "\n".join(lines)
        if content and not content.startswith("\n"):
            content = "\n" + content
        if content and not content.endswith("\n"):
            content = content + "\n"

        return content

    def _has_severe_structural_issues(self, frontmatter: str) -> bool:
        """Check if frontmatter has severe structural issues requiring special handling."""
        lines = frontmatter.split("\n")

        # Count various structural problems
        issues = 0

        for line in lines:
            # Check for obvious structural problems
            if "(composition data)" in line and line.count("(composition data)") > 1:
                issues += 1
            if "primary constituent" in line and line.count("primary constituent") > 3:
                issues += 1
            if line.strip() and not line.strip().endswith(":") and line.count(":") > 3:
                issues += 1

        return issues > 2

    def _fix_indentation(
        self, line: str, seen_keys: Set[str], current_section: str, in_list: bool
    ) -> Tuple[str, List[str]]:
        """Fix indentation issues."""
        issues = []

        # Fix technical specifications indentation
        if "technicalSpecifications:" in line:
            indent = len(line) - len(line.lstrip())
            if line.strip() == "technicalSpecifications:":
                line = " " * indent + "technicalSpecifications:"
                issues.append("Fixed technicalSpecifications indentation")

        # Fix nested property indentation - more comprehensive
        if (
            current_section
            in [
                "properties",
                "chemicalProperties",
                "mechanicalProperties",
                "technicalSpecifications",
            ]
            and ":" in line
            and not line.strip().startswith("-")
        ):
            # Ensure properties are properly nested under their parent section
            current_indent = len(line) - len(line.lstrip())

            # Properties should typically be indented 2-4 spaces under their parent
            if current_indent < 2:
                parts = line.split(":", 1)
                if len(parts) == 2:
                    key = parts[0].strip()
                    value = parts[1].strip()
                    # Use 4-space indentation for consistency
                    line = f"    {key}: {value}" if value else f"    {key}:"
                    issues.append(f"Fixed indentation for property: {key}")

        # Fix application indentation
        if current_section == "applications" and not line.strip().startswith("-"):
            if "useCase:" in line or "detail:" in line or "industry:" in line:
                current_indent = len(line) - len(line.lstrip())
                if current_indent < 4:  # Should be indented under the list item
                    parts = line.split(":", 1)
                    if len(parts) == 2:
                        key = parts[0].strip()
                        value = parts[1].strip()
                        line = f"    {key}: {value}" if value else f"    {key}:"
                        issues.append(f"Fixed application property indentation: {key}")

        # Fix metatags section indentation
        if "opengraph:" in line or "twitter:" in line:
            current_indent = len(line) - len(line.lstrip())
            if current_indent < 2:
                parts = line.split(":", 1)
                if len(parts) == 2:
                    key = parts[0].strip()
                    value = parts[1].strip()
                    line = f"  {key}: {value}" if value else f"  {key}:"
                    issues.append(f"Fixed metatags indentation: {key}")

        return line, issues

    def _fix_missing_colons(
        self, line: str, seen_keys: Set[str], current_section: str, in_list: bool
    ) -> Tuple[str, List[str]]:
        """Fix missing colons in mappings."""
        issues = []

        # Look for lines that should be mappings but missing colons
        if (
            re.match(r"^\s+\w+\s+[^:\-]", line)
            and not line.strip().startswith("-")
            and not in_list
        ):
            parts = line.split(None, 1)
            if len(parts) == 2:
                indent = len(line) - len(line.lstrip())
                key, value = parts
                # Don't fix if it looks like it might be a continuation
                if not value.startswith('"') or value.endswith('"'):
                    line = " " * indent + f"{key}: {value}"
                    issues.append(f"Added missing colon to mapping: {key}")

        return line, issues

    def _fix_malformed_lists(
        self, line: str, seen_keys: Set[str], current_section: str, in_list: bool
    ) -> Tuple[str, List[str]]:
        """Fix malformed list structures."""
        issues = []

        # Fix list items that lost their dashes
        if (
            current_section in ["composition", "compatibility", "applications"]
            and line.strip()
            and not line.strip().startswith("-")
            and ":" not in line
        ):
            indent = len(line) - len(line.lstrip())
            content = line.strip()
            line = " " * indent + f"- {content}"
            issues.append(f"Fixed malformed list item: {content[:30]}...")

        # Fix list indentation
        if line.strip().startswith("-"):
            # Ensure consistent list indentation
            base_indent = len(line) - len(line.lstrip())
            content = line.strip()[1:].strip()
            if content:
                line = " " * base_indent + f"- {content}"
                if base_indent % 2 != 0:  # Prefer even indentation
                    line = " " * (base_indent + 1) + f"- {content}"
                    issues.append("Fixed list indentation")

        return line, issues

    def _fix_quote_issues(self, lines: List[str], issues: List[str]) -> List[str]:
        """Fix issues with quoted strings and text requiring quotes."""
        fixed_lines = []

        for line in lines:
            if not line.strip() or line.strip().startswith("#"):
                fixed_lines.append(line)
                continue

            original_line = line

            # Fix unquoted values containing colons like Nd:YAG
            if (
                ":" in line
                and ("Nd:YAG" in line or "Nd: YAG" in line)
                and '"' not in line
            ):
                pattern = r'(:\s*)([^"]*)((Nd:YAG|Nd: YAG)[^"]*)(\s*$)'
                if re.search(pattern, line):
                    line = re.sub(pattern, r'\1"\2\3"\5', line)
                    issues.append("Fixed unquoted laser type with colons")

            # Fix unbalanced quotes (odd number of quotes)
            quote_count = line.count('"')
            if quote_count % 2 != 0:
                # Check for unclosed quotes at end of line
                if line.strip().endswith(":") and quote_count == 1:
                    # This is likely a key with a single quote, remove it
                    line = line.replace('"', "")
                    issues.append("Fixed misplaced quote in key")
                elif line.strip().startswith('"') and not line.strip().endswith('"'):
                    # Unclosed quote at start, add closing quote
                    line = line.rstrip() + '"'
                    issues.append("Fixed unclosed quoted string")

            # Fix nested quotes with backslashes
            if '\\"' in line:
                # Try to use single quotes inside double quotes
                if line.count('"') >= 2:
                    # Make sure we're inside a quoted string
                    in_quotes = False
                    chars = []
                    for c in line:
                        if c == '"':
                            in_quotes = not in_quotes
                        elif c == "\\" and in_quotes and chars and chars[-1] == "\\":
                            # Skip this backslash as it's escaping the next character
                            continue
                        elif c == "\\" and in_quotes:
                            # Check if next char is a quote
                            continue
                        else:
                            chars.append(c)

                    # If we can safely replace with single quotes
                    if "'" not in line:
                        line = line.replace('\\"', "'")
                        issues.append("Fixed nested quotes using single quotes")
                    else:
                        # If there are already single quotes, use a different approach
                        line = line.replace('\\"', '"')
                        line = line.replace('""', '"')
                        issues.append(
                            "Fixed nested quotes by removing unnecessary escaping"
                        )

            # Fix mixed quotes (single quotes inside unescaped double quotes)
            if '"' in line and "'" in line:
                # Check for the dangerous pattern where a single quote is inside double quotes
                parts = line.split('"')
                if len(parts) >= 3:  # At least one quoted section
                    for i in range(
                        1, len(parts), 2
                    ):  # Odd indices contain quoted content
                        if "'" in parts[i]:
                            # We have a single quote inside double quotes - escape it
                            parts[i] = parts[i].replace("'", "\\'")
                            issues.append(
                                "Fixed unescaped single quote in double-quoted string"
                            )

                    # Rebuild the line
                    line = '"'.join(parts)

            # Fix colon-containing values that should be quoted
            colon_patterns = [
                (r'(:\s*)([^"]*?\d+:\d+\s*$)', "time format"),
                (r'(:\s*)([^"]*?https?://[^"]*?\s*$)', "URL"),
                (
                    r'(:\s*)([^"]*?[A-Z][a-z]*:[A-Z][a-z]*[^"]*?\s*$)',
                    "capitalized terms with colons",
                ),
            ]

            for pattern, desc in colon_patterns:
                if ":" in line and '"' not in line and re.search(pattern, line):
                    line = re.sub(pattern, r'\1"\2"', line)
                    issues.append(f"Fixed unquoted {desc}")

            # Fix double-quote issues in formula fields
            if "formula:" in line and '""' in line:
                line = line.replace('formula:""', 'formula: "')
                line = line.replace('""', '"')
                issues.append("Fixed malformed quotes in formula field")

            if original_line != line:
                fixed_lines.append(line)
            else:
                fixed_lines.append(original_line)

        return fixed_lines

    def _fix_empty_values(
        self, line: str, seen_keys: Set[str], current_section: str, in_list: bool
    ) -> Tuple[str, List[str]]:
        """Fix empty or incomplete values."""
        issues = []

        # Fix incomplete application entries
        if (
            current_section == "applications"
            and line.strip().endswith(":")
            and "industry:" in line
        ):
            # This is an incomplete application entry
            line = ""  # Remove incomplete entry
            issues.append("Removed incomplete application entry")

        # Fix empty image entries
        if (
            current_section == "images"
            and line.strip().endswith(":")
            and any(img_type in line for img_type in ["hero:", "closeup:", "detail:"])
        ):
            # Remove empty image entry
            line = ""
            issues.append("Removed empty image entry")

        return line, issues

    def _fix_colon_spacing(
        self, line: str, seen_keys: Set[str], current_section: str, in_list: bool
    ) -> Tuple[str, List[str]]:
        """Fix improper spacing around colons in YAML."""
        issues = []

        if ":" in line and not line.strip().startswith("#"):
            # Fix double colons
            if "::" in line:
                line = line.replace("::", ":")
                issues.append("Fixed double colons")

            # Fix spacing around colons for key-value pairs
            if ":" in line and not line.strip().startswith("-"):
                parts = line.split(":", 1)
                if len(parts) == 2:
                    key_part, value_part = parts

                    # Check if there are actual spacing issues
                    # Problems: no space after colon when there's a value, or multiple spaces
                    if value_part and not value_part.startswith(" "):
                        # Missing space after colon
                        indent = len(line) - len(line.lstrip())
                        key_cleaned = key_part.strip()
                        value_cleaned = value_part.strip()
                        new_line = " " * indent + key_cleaned + ": " + value_cleaned
                        line = new_line
                        issues.append("Fixed colon spacing")
                    elif value_part.startswith("  "):  # Multiple spaces after colon
                        # Too many spaces after colon
                        indent = len(line) - len(line.lstrip())
                        key_cleaned = key_part.strip()
                        value_cleaned = value_part.lstrip()
                        new_line = " " * indent + key_cleaned + ": " + value_cleaned
                        line = new_line
                        issues.append("Fixed colon spacing")

        return line, issues

    def _fix_structural_issues(
        self, line: str, seen_keys: Set[str], current_section: str, in_list: bool
    ) -> Tuple[str, List[str]]:
        """Fix general structural issues."""
        issues = []

        # Fix spacing around colons
        if ":" in line and not line.strip().startswith("-"):
            parts = line.split(":", 1)
            if len(parts) == 2:
                indent = len(line) - len(line.lstrip())
                key = parts[0].strip()
                value = parts[1].strip()

                if value:
                    new_line = " " * indent + f"{key}: {value}"
                else:
                    new_line = " " * indent + f"{key}:"

                if new_line != line:
                    line = new_line
                    issues.append("Fixed colon spacing")

        return line, issues

    def _fix_block_scalar_issues(
        self, lines: List[str], issues: List[str]
    ) -> List[str]:
        """Fix issues with block scalar formatting (literal | or folded >)."""
        fixed_lines = []
        i = 0

        while i < len(lines):
            line = lines[i]

            if not line.strip() or line.strip().startswith("#"):
                fixed_lines.append(line)
                i += 1
                continue

            # Check for block scalar indicators
            if (
                line.strip().endswith(">")
                or line.strip().endswith("|")
                or line.strip().endswith(">-")
                or line.strip().endswith("|-")
            ):
                # This is a block scalar header
                block_type = "folded" if ">" in line else "literal"
                indent_level = len(line) - len(line.lstrip())
                expected_content_indent = (
                    indent_level + 2
                )  # Standard is 2 spaces more than header

                # Look ahead to check content indentation
                j = i + 1
                if j < len(lines):
                    next_line = lines[j]
                    if next_line.strip():  # Only check non-empty lines
                        next_indent = len(next_line) - len(next_line.lstrip())

                        # Check if indentation is incorrect
                        if next_indent < expected_content_indent:
                            # Reindent the content properly
                            content = next_line.lstrip()
                            fixed_lines.append(line)  # Add the scalar header
                            fixed_lines.append(
                                " " * expected_content_indent + content
                            )  # Add properly indented content
                            issues.append(
                                f"Fixed {block_type} scalar content indentation"
                            )
                            i += 2
                            continue
                        # Check if the next line is a list item (common mistake)
                        elif next_line.lstrip().startswith("-"):
                            # This is likely a mistake - convert to regular string
                            key_part = line.split(":", 1)[0]
                            fixed_lines.append(key_part + ": |")  # Use literal block
                            issues.append(
                                f"Fixed {block_type} scalar followed by list item"
                            )
                            i += 1
                            continue

            # Check for multiline strings that should be block scalars
            if (
                ":" in line
                and line.strip().endswith(":")
                and not line.strip().endswith("]:")
            ):
                key_part = line.split(":", 1)[0]
                if key_part.strip() in [
                    "description",
                    "longDescription",
                    "detailedContent",
                    "articleBody",
                ]:
                    # These keys typically contain long text that would benefit from block scalar
                    next_line_idx = i + 1
                    if next_line_idx < len(lines) and lines[next_line_idx].strip():
                        next_line = lines[next_line_idx]
                        next_indent = len(next_line) - len(next_line.lstrip())

                        # If next line is indented and has multiple words, it's a candidate for block scalar
                        if next_indent > 0 and len(next_line.strip().split()) > 5:
                            # Convert to block scalar
                            indent_level = len(line) - len(line.lstrip())
                            fixed_lines.append(
                                line.rstrip() + " |"
                            )  # Add block scalar indicator
                            issues.append(
                                f"Converted {key_part.strip()} to block scalar for better readability"
                            )
                            i += 1
                            continue

            fixed_lines.append(line)
            i += 1

        return fixed_lines

    def _fix_document_structure_issues(
        self, lines: List[str], issues: List[str]
    ) -> List[str]:
        """Fix issues with YAML document structure and separators."""
        fixed_lines = []
        has_doc_start = False
        i = 0

        # Check if document has proper structure
        if lines and lines[0].strip() == "---":
            has_doc_start = True

        while i < len(lines):
            line = lines[i]

            # Fix document start/end markers
            if "---" in line and not line.strip() == "---" and i > 0:
                # Document separator not at start of line
                if line.strip().startswith("---"):
                    # Separator is at start of text but has indentation
                    fixed_lines.append("---")
                    issues.append("Fixed indented document start marker")
                    i += 1
                    continue
                elif "---" in line and not line.startswith("---"):
                    # Separator is mixed with other content
                    parts = line.split("---")
                    if parts[0].strip():
                        fixed_lines.append(parts[0].rstrip())
                    fixed_lines.append("---")
                    if parts[1].strip():
                        fixed_lines.append(parts[1].lstrip())
                    issues.append("Fixed document separator mixed with content")
                    i += 1
                    continue

            # Fix empty document (back-to-back separators)
            if (
                line.strip() == "---"
                and i < len(lines) - 1
                and lines[i + 1].strip() == "---"
            ):
                # Skip the first separator if we already added content
                if fixed_lines:
                    i += 1
                    continue
                else:
                    # Keep only one separator
                    fixed_lines.append(line)
                    i += 2
                    continue

            # Fix document end markers
            if line.strip() == "..." and i < len(lines) - 1:
                # If there's content after document end, ensure proper separation
                next_line = lines[i + 1]
                if next_line.strip() and not next_line.strip() == "---":
                    # Content after document end without a new document start
                    fixed_lines.append(line)
                    fixed_lines.append("---")  # Add missing document start
                    issues.append("Added missing document start after document end")
                    i += 1
                    continue

            # Fix missing document start marker if the first line isn't a separator
            if (
                i == 0
                and line.strip()
                and not line.strip() == "---"
                and not has_doc_start
            ):
                fixed_lines.append("---")  # Add document start marker
                fixed_lines.append(line)  # Add the current line
                issues.append("Added missing document start marker")
                i += 1
                continue

            fixed_lines.append(line)
            i += 1

        return fixed_lines

    def _needs_line_reconstruction(self, current_line: str, next_line: str) -> bool:
        """Check if current line needs to be reconstructed with next line."""
        if not next_line.strip():
            return False

        # Be more selective about when to reconstruct
        # Only reconstruct when we're clearly dealing with a broken value, not structure

        # Check for description values that clearly continue
        if "description:" in current_line and not current_line.strip().endswith('"'):
            if current_line.strip().endswith("and") or current_line.strip().endswith(
                "with"
            ):
                return True

        # Check for obvious line breaks in the middle of quoted strings
        if '"' in current_line and not current_line.strip().endswith('"'):
            # Only if next line looks like a continuation, not a new property
            if ":" not in next_line or next_line.strip().startswith('"'):
                return True

        return False

    def _reconstruct_broken_line(
        self, lines: List[str], start_index: int
    ) -> Tuple[str, int]:
        """Reconstruct a broken line by combining with following lines."""
        current_line = lines[start_index].rstrip()
        consumed = 1

        # Look ahead for continuation
        next_index = start_index + 1
        if next_index < len(lines):
            next_line = lines[next_index].strip()

            # For description values ending with connecting words
            if any(current_line.strip().endswith(word) for word in ["and", "with"]):
                # Special case for "thermal resistance" pattern
                if "thermal:" in next_line:
                    # Replace "thermal:" with "thermal"
                    continuation = next_line.replace("thermal:", "thermal")
                    current_line = current_line + " " + continuation
                else:
                    current_line = current_line + " " + next_line
                consumed = 2

            # For broken quoted strings
            elif '"' in current_line and not current_line.strip().endswith('"'):
                current_line = current_line + " " + next_line
                consumed = 2

        return current_line, consumed

    def _fix_hard_breaks(
        self, line: str, seen_keys: Set[str], current_section: str, in_list: bool
    ) -> Tuple[str, List[str]]:
        """Fix hard line breaks in YAML values."""
        issues = []

        # Fix obvious structural issues first
        # Fix "thermal: resistance" pattern - should be "thermal resistance"
        if "thermal:" in line and "resistance" in line:
            line = line.replace("thermal:", "thermal")
            issues.append("Fixed thermal property naming")

        # Fix indentation issues that create parsing errors
        if line.strip() and current_section == "properties":
            # Check if line should be indented but isn't
            if ":" in line and not line.startswith("  "):
                # Look for properties that should be nested under properties
                property_keys = [
                    "chemicalFormula",
                    "density",
                    "fluenceRange",
                    "laserType",
                    "meltingPoint",
                    "thermalConductivity",
                    "wavelength",
                    "regulatoryStandards",
                ]
                if any(prop in line for prop in property_keys):
                    line = "  " + line.strip()
                    issues.append("Fixed property indentation")

        # Fix misplaced content (like "images:" getting merged)
        if "images:" in line and line.strip() != "images:":
            # Split if images: is mixed with other content
            if not line.strip().startswith("images:"):
                line = line.replace("images:", "\nimages:")
                issues.append("Separated images section")

        return line, issues

    def _print_summary(self, directory_path: Path) -> None:
        """Print processing summary."""
        end_time = datetime.now()
        duration = end_time - self.stats["start_time"]

        print("\n📊 Processing Summary:")
        print(f"   Files processed: {self.stats['files_processed']}")
        print(f"   Files fixed: {self.stats['files_fixed']}")
        print(f"   Skipped (no frontmatter): {self.stats['skipped_no_frontmatter']}")
        if self.stats.get("skipped_empty", 0) > 0:
            print(f"   Skipped (empty files): {self.stats['skipped_empty']}")
        print(f"   Issues found: {self.stats['issues_found']}")
        print(f"   Duration: {duration.total_seconds():.2f} seconds")

        # Compare with previous run if available
        if self.previous_run:
            prev_stats = self.previous_run.get("stats", {})
            prev_fixed = prev_stats.get("files_fixed", 0)
            prev_issues = prev_stats.get("issues_found", 0)
            prev_timestamp = self.previous_run.get("timestamp", "Unknown")
            try:
                prev_time = datetime.fromisoformat(prev_timestamp)
                time_diff = end_time - prev_time
                time_diff_str = f"{time_diff.days}d {time_diff.seconds // 3600}h {(time_diff.seconds // 60) % 60}m ago"
            except Exception:
                time_diff_str = "unknown time ago"

            print("\n📈 Comparison with Previous Run:")
            print(f"   Last run: {time_diff_str}")

            # Files fixed comparison
            if self.stats["files_fixed"] > prev_fixed:
                diff = self.stats["files_fixed"] - prev_fixed
                print(f"   Files fixed: +{diff} (Previous: {prev_fixed})")
            elif self.stats["files_fixed"] < prev_fixed:
                diff = prev_fixed - self.stats["files_fixed"]
                print(f"   Files fixed: -{diff} (Previous: {prev_fixed})")
            else:
                print(f"   Files fixed: No change (Same as previous: {prev_fixed})")

            # Issues found comparison
            if self.stats["issues_found"] > prev_issues:
                diff = self.stats["issues_found"] - prev_issues
                print(f"   Issues found: +{diff} (Previous: {prev_issues})")
            elif self.stats["issues_found"] < prev_issues:
                diff = prev_issues - self.stats["issues_found"]
                print(f"   Issues found: -{diff} (Previous: {prev_issues})")
            else:
                print(f"   Issues found: No change (Same as previous: {prev_issues})")

            # New files fixed
            prev_fixed_files = set(self.previous_run.get("fixed_files", []))
            current_fixed_files = set(self.fixed_files)

            newly_fixed = current_fixed_files - prev_fixed_files
            if newly_fixed:
                print("\n🆕 Newly Fixed Files (not fixed in previous run):")
                for file_path in sorted(newly_fixed):
                    rel_path = Path(file_path).relative_to(directory_path)
                    print(f"   - {rel_path}")

        if self.stats["files_fixed"] > 0:
            print("\n📋 Files fixed:")
            for file_path in self.fixed_files:
                rel_path = Path(file_path).relative_to(directory_path)
                print(f"   - {rel_path}")

            if self.issue_types:
                print("\n🔍 Issue types found:")
                for issue_type, count in sorted(self.issue_types.items()):
                    print(f"   - {issue_type.replace('_', ' ').title()}: {count}")

            # Show format issues dictionary status - but only once per run
            encountered_any = any(self.encountered_issues.values())
            discovered_any = any(self.discovered_patterns.values())

            # Only show patterns encountered if:
            # 1. We have encountered issues AND
            # 2. We haven't shown the dictionary already in this session
            if encountered_any and not self.dictionary_already_shown:
                print("\n📋 Format Issues Dictionary - Patterns Encountered:")
                for category, patterns in self.encountered_issues.items():
                    if patterns:
                        print(
                            f"   {category.replace('_', ' ').title()}: {len(patterns)} patterns"
                        )
                        if self.verbose:
                            for pattern in patterns[:3]:  # Show first 3 patterns
                                print(f"     - {pattern}")
                            if len(patterns) > 3:
                                print(f"     ... and {len(patterns) - 3} more")
                # Mark that we've shown the dictionary
                self.dictionary_already_shown = True

            if discovered_any:
                # Check if we actually have any new patterns
                has_new_patterns = False
                for category, patterns in self.discovered_patterns.items():
                    if patterns:
                        has_new_patterns = True
                        break

                # Only show this section if we have new patterns
                if has_new_patterns:
                    print("\n📚 New Patterns Auto-Discovered from Error Logs:")
                    total_new = 0
                    for category, patterns in self.discovered_patterns.items():
                        if patterns:
                            print(
                                f"   {category.replace('_', ' ').title()}: {len(patterns)} new patterns"
                            )
                            total_new += len(patterns)
                            if self.verbose:
                                for pattern in patterns:
                                    print(f"     + {pattern}")

                    if total_new > 0:
                        print(
                            f"\n📈 Dictionary Enhanced: Added {total_new} new patterns automatically!"
                        )

            if not encountered_any and not discovered_any:
                print("\n📋 Format Issues Dictionary: No patterns detected this run")

            if self.verbose and self.errors_found:
                print("\n📝 Detailed Error Report:")
                for file_path, errors in self.errors_found.items():
                    rel_path = Path(file_path).name
                    print(f"\n  {rel_path}:")
                    for error in errors[:10]:  # Limit to first 10 errors per file
                        print(f"    - {error}")
                    if len(errors) > 10:
                        print(f"    ... and {len(errors) - 10} more issues")

            # Display before/after comparison data for files with changes
            if self.file_changes:
                print("\n🔄 Before and After Comparison Data:")

                # Determine how many detailed comparisons to show
                max_detailed_files = 3 if not self.verbose else 10
                detailed_files = sorted(
                    [(path, data) for path, data in self.file_changes.items()],
                    key=lambda x: x[1]["line_changes"]["total_changes"],
                    reverse=True,
                )[:max_detailed_files]

                # Print summary table of changes
                print("\n  Change Summary (most significant changes):")
                print("  ----------------------------------------")
                print(
                    "  | File                         | Lines Modified | Lines Added | Lines Removed | % Changed |"
                )
                print("  ----------------------------------------")

                for file_path, data in detailed_files:
                    rel_path = Path(file_path).name
                    changes = data["line_changes"]
                    print(
                        f"  | {rel_path[:28]:<28} | {len(changes['modified']):<14} | {len(changes['added']):<12} | {len(changes['removed']):<14} | {changes['percent_changed']:.1f}% |"
                    )

                print("  ----------------------------------------")

                # Print detailed line changes for files with significant changes
                print("\n  Detailed Line Changes:")
                for file_path, data in detailed_files:
                    rel_path = Path(file_path).name
                    changes = data["line_changes"]

                    if changes["total_changes"] == 0:
                        continue

                    print(
                        f"\n  📄 {rel_path} ({changes['total_changes']} changes, {changes['percent_changed']:.1f}% of file):"
                    )

                    # Print modified lines (limited number based on verbosity)
                    if changes["modified"]:
                        print("    Modified Lines:")
                        max_to_show = 5 if not self.verbose else 20
                        for i, change in enumerate(changes["modified"][:max_to_show]):
                            print(
                                f"      Line {change['before_line']} → {change['after_line']}:"
                            )
                            print(f"        BEFORE: {change['before']}")
                            print(f"        AFTER:  {change['after']}")
                        if len(changes["modified"]) > max_to_show:
                            print(
                                f"        ... and {len(changes['modified']) - max_to_show} more modified lines"
                            )

                    # Print added lines
                    if changes["added"]:
                        print("    Added Lines:")
                        max_to_show = 3 if not self.verbose else 10
                        for i, change in enumerate(changes["added"][:max_to_show]):
                            print(f"      Line {change['line']}: {change['content']}")
                        if len(changes["added"]) > max_to_show:
                            print(
                                f"        ... and {len(changes['added']) - max_to_show} more added lines"
                            )

                    # Print removed lines
                    if changes["removed"]:
                        print("    Removed Lines:")
                        max_to_show = 3 if not self.verbose else 10
                        for i, change in enumerate(changes["removed"][:max_to_show]):
                            print(f"      Line {change['line']}: {change['content']}")
                        if len(changes["removed"]) > max_to_show:
                            print(
                                f"        ... and {len(changes['removed']) - max_to_show} more removed lines"
                            )

        # Final status
        if self.stats["files_fixed"] > 0:
            print(f"\n✅ Processing complete! Fixed {self.stats['files_fixed']} files.")
        else:
            print("\n✅ No issues found - content is ready!")

    def _has_severe_structural_issues(self, frontmatter: str) -> bool:
        """Check if frontmatter has severe structural issues requiring special handling."""
        lines = frontmatter.split("\n")

        # Check for excessive repetitions (even a single line with multiple repetitions)
        for line in lines:
            composition_count = line.count("(composition data)")
            if composition_count > 3:  # Lowered threshold
                return True

        # Check for broken indentation (4+ spaces when should be 2)
        bad_indent_count = sum(
            1 for line in lines if line.startswith("    ") and ":" in line
        )
        if bad_indent_count > 3:
            return True

        # Check for malformed array items
        bad_array_count = sum(
            1
            for line in lines
            if line.strip().startswith("-") and not line.lstrip().startswith("- ")
        )
        if bad_array_count > 2:
            return True

        # Check for broken YAML structure (properties without proper parent sections)
        broken_structure = 0
        for i, line in enumerate(lines):
            if (
                ":" in line
                and not line.startswith(" ")
                and not line.strip().endswith(":")
            ):
                # This might be a property that should be under a section
                if any(
                    prop in line
                    for prop in [
                        "powerRange",
                        "wavelength",
                        "spotSize",
                        "density",
                        "thermalConductivity",
                    ]
                ):
                    broken_structure += 1

        if broken_structure > 2:
            return True

        return False

    def _fix_severe_structural_issues(self, frontmatter: str) -> str:
        """Fix severe structural YAML issues using reference patterns."""
        lines = frontmatter.split("\n")
        fixed_lines = []
        current_section = None

        for line in lines:
            # Track current section
            if line.strip() and not line.startswith(" ") and ":" in line:
                current_section = line.split(":")[0].strip()

            # Handle excessive "(composition data)" repetitions - remove completely
            if "(composition data)" in line:
                # Count how many times it appears in this line
                count = line.count("(composition data)")
                if count > 1:
                    # Remove all repetitive data and keep only meaningful content
                    if "component:" in line:
                        # Extract just the component name
                        component_part = line.split("(composition data)")[0].strip()
                        if component_part.endswith("component:"):
                            component_part += " Material component"
                        line = component_part
                    else:
                        # Skip lines that are just repetitive data
                        continue
                elif count == 1:
                    # Replace single occurrence with meaningful content
                    if "component:" in line:
                        line = line.replace("(composition data)", "primary constituent")
                    else:
                        line = line.replace("(composition data)", "detailed analysis")

                # If line still has composition data after processing, check if it's excessive
                if line.count("(composition data)") > 0:
                    continue

            # Fix completely broken indentation patterns
            if line.startswith("    ") or line.startswith("   "):
                content = line.lstrip()
                if ":" in content and not content.startswith("-"):
                    # This is a property that should be indented 2 spaces
                    line = "  " + content
                elif content.startswith("-"):
                    # This is an array item
                    line = "- " + content[1:].lstrip()

            # Fix properties that lost their parent structure
            if (
                current_section
                in ["technicalSpecifications", "chemicalProperties", "properties"]
                and ":" in line
                and not line.startswith(" ")
            ):
                if line.strip() != f"{current_section}:":
                    line = "  " + line.strip()

            # Fix broken array formatting
            if line.strip().startswith("-") and not line.lstrip().startswith("- "):
                content = line.lstrip()[1:].lstrip()
                line = "- " + content

            # Skip obviously broken placeholder values
            if any(
                placeholder in line
                for placeholder in [
                    "materialType materialType",
                    "density density",
                    "wavelength wavelength",
                    "formula formula",
                    "symbol symbol",
                ]
            ):
                continue

            # Fix empty section headers
            if line.strip().endswith(":") and line.strip() not in [
                "applications:",
                "technicalSpecifications:",
                "chemicalProperties:",
                "properties:",
                "composition:",
                "compatibility:",
                "images:",
                "environmentalImpact:",
                "outcomes:",
            ]:
                # This might be a broken section, check if it should be a property
                if line.strip().replace(":", "") in ["hero", "closeup"]:
                    line = "  " + line.strip()

            # Fix property formatting inconsistencies
            if (
                ":" in line
                and not line.strip().startswith("#")
                and not line.strip().startswith("-")
            ):
                parts = line.split(":", 1)
                if len(parts) == 2:
                    key = parts[0].rstrip()
                    value = parts[1].lstrip()
                    indent = len(line) - len(line.lstrip())
                    # Ensure proper spacing
                    line = " " * indent + key + ": " + value

            # Remove completely empty lines or lines with just colons
            if line.strip() and line.strip() != ":":
                fixed_lines.append(line)

        return "\n".join(fixed_lines)


def main():
    """Command-line interface."""
    import argparse
    import os
    import pickle

    parser = argparse.ArgumentParser(
        description="Z-Beam YAML Processor - Fix all YAML issues"
    )
    parser.add_argument("directories", nargs="+", help="Directories to process")
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Show detailed processing information",
    )
    parser.add_argument(
        "--reset",
        "-r",
        action="store_true",
        help="Reset the processor state (show dictionary again)",
    )
    parser.add_argument(
        "--version", action="version", version="Z-Beam YAML Processor v1.0.0"
    )
    parser.add_argument(
        "--timeout",
        "-t",
        type=int,
        default=30,
        help="Timeout in seconds for processing a single file (default: 30)",
    )

    args = parser.parse_args()

    # State file path for persistence
    state_file = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), ".processor_state"
    )

    # Create processor
    processor = ZBeamYAMLProcessor(verbose=args.verbose, timeout=args.timeout)

    # Load state if available and not resetting
    if os.path.exists(state_file) and not args.reset:
        try:
            with open(state_file, "rb") as f:
                state = pickle.load(f)
                processor.dictionary_already_shown = state.get(
                    "dictionary_already_shown", False
                )
                if args.verbose:
                    print("📝 Loaded previous processor state")
        except Exception as e:
            if args.verbose:
                print(f"⚠️ Could not load state: {e}")
    elif args.reset and os.path.exists(state_file):
        # If resetting, remove the state file
        try:
            os.remove(state_file)
            if args.verbose:
                print("🔄 Reset processor state")
        except Exception as e:
            if args.verbose:
                print(f"⚠️ Could not remove state file: {e}")

    # Process all directories
    for directory in args.directories:
        if processor.verbose:
            print(f"\n🔍 Processing directory: {directory}")
        processor.process_directory(directory, reset=args.reset)

    # Save current run data for comparison in future runs
    processor.save_current_run()

    # Save state for future runs
    try:
        with open(state_file, "wb") as f:
            state = {"dictionary_already_shown": processor.dictionary_already_shown}
            pickle.dump(state, f)
            if args.verbose:
                print("💾 Saved processor state")
    except Exception as e:
        if args.verbose:
            print(f"⚠️ Could not save state: {e}")


if __name__ == "__main__":
    main()
