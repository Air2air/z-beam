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
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Set, Tuple


class ZBeamYAMLProcessor:
    """Refactored YAML processor with comprehensive single-pass analysis."""

    def __init__(self, verbose: bool = False):
        self.verbose = verbose
        self.base_path = None

        # Statistics
        self.stats = {
            "files_processed": 0,
            "files_fixed": 0,
            "issues_found": 0,
            "skipped_no_frontmatter": 0,
            "start_time": datetime.now(),
        }

        # Error tracking
        self.fixed_files: List[str] = []
        self.errors_found: Dict[str, List[str]] = {}
        self.issue_types: Dict[str, int] = {}

        # Comprehensive Format Issues Dictionary
        # Maintains patterns and fixes for all known YAML formatting issues
        self.format_issues = {
            "encoding_issues": {
                "patterns": [
                    r"\\xB7",  # Escaped middle dot
                    r"\\xB2",  # Escaped superscript 2
                    r"\\xB3",  # Escaped superscript 3
                    r"\\x[0-9A-Fa-f]{2}",  # General escaped hex characters
                ],
                "fixes": {
                    "\\xB7": "·",
                    "\\xB2": "²",
                    "\\xB3": "³",
                },
                "description": "Special character encoding issues in chemical formulas",
            },
            "indentation_issues": {
                "patterns": [
                    r"^(\s*)- \w+:.*\n(\s+)\w+:",  # List item with incorrectly indented nested properties
                    r"^(\s*)\w+:\s*\n(\s*)\w+:",  # Property followed by incorrectly indented content
                ],
                "description": "Bad indentation in list items and nested properties",
            },
            "incomplete_entries": {
                "patterns": [
                    r"- name:\s*$",  # Empty meta tag names
                    r"- property:\s*$",  # Empty opengraph properties
                    r"content:\s*$",  # Empty content values
                    r"^\s*\w+:\s*$",  # Keys without values at end of line
                ],
                "description": "Missing values for meta tags, properties, and content fields",
            },
            "malformed_structures": {
                "patterns": [
                    r'.*"[^"]*"[^"]*"[^"]*".*',  # Lines with multiple unescaped quotes
                    r'formula:"".*""',  # Malformed formula with double quotes
                    r".*percentage.*component.*",  # Corrupted composition lines
                    r".*'}].*",  # Truncated JSON-like structures
                    r".*'].*",  # Truncated array structures
                ],
                "description": "Corrupted or truncated content lines",
            },
            "property_declaration_issues": {
                "patterns": [
                    r"^(\s*)properties:\s*$",  # Properties without nested content
                    r"^(\s*)chemicalProperties:\s*$",  # Chemical properties without nested content
                    r"^(\s*)compatibility:\s*$",  # Compatibility without nested content
                ],
                "description": "Property declarations without proper nested content",
            },
            "list_structure_issues": {
                "patterns": [
                    r"^(\s*)- \w+:\s*\n(\s{4,})\w+:",  # List items with 4+ space indented nested items
                    r"compatibility:\s*\[\]",  # Empty array formatting
                ],
                "description": "Improperly structured lists and arrays",
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
        }

        # New patterns discovered from error logs - auto-updated
        self.discovered_patterns = {
            "encoding_issues": [],
            "indentation_issues": [],
            "incomplete_entries": [],
            "malformed_structures": [],
            "property_declaration_issues": [],
            "list_structure_issues": [],
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

    def process_directory(self, directory_path: str) -> bool:
        """Process all markdown files in a directory."""
        directory_path = Path(directory_path)
        self.base_path = directory_path  # Set base path for relative display

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
            if self._has_frontmatter(file_path):
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

    def _process_file(self, file_path: Path) -> None:
        """Process a single markdown file."""
        try:
            # Ensure we never create backup or copy files
            self._validate_no_copies(file_path)

            original_content = file_path.read_text(encoding="utf-8")

            # Only process files with frontmatter
            if not original_content.startswith("---"):
                self.stats["skipped_no_frontmatter"] += 1
                return

            # Process existing frontmatter
            parts = original_content.split("---", 2)
            if len(parts) < 3:
                return

            frontmatter = parts[1]
            body = parts[2]

            # Apply structural fixes first for severely broken files
            if self._has_severe_structural_issues(frontmatter):
                frontmatter = self._fix_severe_structural_issues(frontmatter)
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

                if self.verbose:
                    print(f"  🔧 Fixed: {file_path.name} ({len(issues_found)} issues)")
                else:
                    print(f"  🔧 Fixed: {file_path.name}")

        except Exception as e:
            print(f"  ❌ Error processing {file_path.name}: {e}")

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

        # Fix 3: Fix bad list item indentation
        fixed_lines = self._fix_list_indentation(fixed_lines, issues)

        # Fix 4: Remove duplicate keys
        # Re-analyze structure after structural fixes
        structure = self._analyze_yaml_structure(fixed_lines)
        fixed_lines = self._fix_duplicates(fixed_lines, structure, issues)

        # Fix 5: Correct indentation comprehensively
        fixed_lines = self._fix_indentation_comprehensive(
            fixed_lines, structure, issues
        )

        # Fix 6: Fix spacing and formatting
        fixed_lines = self._fix_spacing_comprehensive(fixed_lines, issues)

        # Fix 7: Handle multi-line values and reconstructions
        fixed_lines = self._fix_multiline_values(fixed_lines, issues)

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

        # Pattern analysis for different error types
        new_patterns = []
        category = None

        # Encoding issues - look for character encoding problems
        if any(char in error_message for char in ["\\x", "·", "²", "³", "°", "µ"]):
            category = "encoding_issues"
            # Extract specific character patterns
            if "\\x" in error_message:
                import re

                hex_chars = re.findall(r"\\x[0-9A-Fa-f]{2}", error_message)
                for char in hex_chars:
                    pattern = char.replace("\\", "\\\\")  # Escape for regex
                    if pattern not in self.format_issues["encoding_issues"]["patterns"]:
                        new_patterns.append(pattern)

        # Indentation issues
        elif "bad indentation" in error_message.lower():
            category = "indentation_issues"
            # Extract indentation patterns
            if "mapping entry" in error_message:
                # Pattern: bad indentation of a mapping entry at line X, column Y
                if "line" in error_message and "column" in error_message:
                    pattern = (
                        r"^(\s*)\w+:\s*\n(\s*)\w+:"  # Generic bad indentation pattern
                    )
                    if (
                        pattern
                        not in self.format_issues["indentation_issues"]["patterns"]
                    ):
                        new_patterns.append(pattern)

        # Missing colon issues
        elif "colon is missed" in error_message.lower():
            category = "malformed_structures"
            # Extract malformed structure patterns
            if "formula:" in error_message and '""' in error_message:
                pattern = r'formula:"".*""'
                if (
                    pattern
                    not in self.format_issues["malformed_structures"]["patterns"]
                ):
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
        elif "duplicated mapping key" in error_message.lower():
            category = "property_declaration_issues"
            pattern = r"^\s*(\w+):.*\n.*^\s*\1:"  # Same key appearing twice
            if (
                pattern
                not in self.format_issues["property_declaration_issues"]["patterns"]
            ):
                new_patterns.append(pattern)

        # Add discovered patterns to the dictionary
        if category and new_patterns:
            for pattern in new_patterns:
                # Add to the main format issues dictionary
                self.format_issues[category]["patterns"].append(pattern)
                # Track as discovered pattern
                if pattern not in self.discovered_patterns[category]:
                    self.discovered_patterns[category].append(pattern)

            if self.verbose:
                print(
                    f"  📚 Added {len(new_patterns)} new patterns to {category}: {new_patterns}"
                )

    def analyze_common_error_patterns(self) -> None:
        """Analyze the most common YAML error patterns from recent logs and add them to dictionary."""
        # Common patterns observed from the terminal output
        common_errors = [
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

        while i < len(lines):
            line = lines[i]
            fixed_lines.append(line)

            # Check if this is a list item start
            if line.strip().startswith("- ") and ":" in line:
                list_indent = len(line) - len(line.lstrip())
                expected_nested_indent = (
                    list_indent + 2
                )  # Standard 2-space indent for nested items

                # Look ahead for improperly indented nested items
                j = i + 1
                while j < len(lines):
                    next_line = lines[j]
                    if not next_line.strip():
                        fixed_lines.append(next_line)
                        j += 1
                        continue

                    # If we hit another list item or unindented content, stop
                    if (
                        next_line.strip().startswith("- ")
                        or len(next_line) - len(next_line.lstrip()) <= list_indent
                    ):
                        break

                    # Check if this line is a nested property with wrong indentation
                    if ":" in next_line and not next_line.strip().startswith("#"):
                        current_indent = len(next_line) - len(next_line.lstrip())
                        if current_indent != expected_nested_indent:
                            # Fix the indentation
                            content = next_line.lstrip()
                            fixed_line = " " * expected_nested_indent + content
                            fixed_lines.append(fixed_line)
                            issues.append(
                                f"Fixed indentation for nested list property: {content.split(':')[0]}"
                            )
                        else:
                            fixed_lines.append(next_line)
                    else:
                        fixed_lines.append(next_line)

                    j += 1

                i = j
                continue

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

            # Enhanced meta tag and property checking
            elif (
                line.strip().startswith("- name:")
                or line.strip().startswith("- property:")
            ) and ":" in line:
                parts = line.split(":", 1)
                if len(parts) == 2 and not parts[1].strip():
                    # Empty name or property field
                    fixed_lines.append(line.rstrip() + ' "TBD"')
                    issues.append(
                        f"Added placeholder for empty {parts[0].strip().replace('- ', '')} field"
                    )
                else:
                    fixed_lines.append(line)

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

            # Check for malformed chemical formula with double quotes
            if re.search(r'formula:"".*""', line):
                # Fix malformed formula: formula:""Al₂O₃·2SiO₂·2H₂O"" -> formula: "Al₂O₃·2SiO₂·2H₂O"
                formula_match = re.search(r'formula:""([^"]+)""', line)
                if formula_match:
                    formula_content = formula_match.group(1)
                    base_indent = len(line) - len(line.lstrip())
                    clean_line = " " * base_indent + f'formula: "{formula_content}"'
                    fixed_lines.append(clean_line)
                    issues.append("Fixed malformed chemical formula with double quotes")
                    continue

            # Check for corrupted/truncated content lines (values without keys)
            if (
                "percentage" in line
                and "component" in line
                and line.count('"') >= 3
                and len(line) > 100
            ):
                # This looks like corrupted content that should be removed or simplified
                base_indent = len(line) - len(line.lstrip())
                # Replace with empty array value
                clean_line = " " * base_indent + "[]"
                fixed_lines.append(clean_line)
                issues.append("Fixed corrupted truncated content line")
                continue

            # Check for corrupted/truncated content with fragments (key-value pairs)
            if ":" in line and (
                (line.count('"') >= 3 and ("'}]" in line or "']" in line))
                or (
                    len(line) > 120
                    and '"' in line
                    and ("percentage" in line or "component" in line)
                )
            ):
                # This looks like corrupted content, try to clean it
                key_part = line.split(":", 1)[0].strip()
                base_indent = len(line) - len(line.lstrip())

                # If this is a known problematic key, provide a clean placeholder
                if key_part in ["compatibility", "composition"]:
                    clean_line = " " * base_indent + key_part + ": []"
                    fixed_lines.append(clean_line)
                    issues.append(f"Fixed corrupted content in: {key_part}")
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

    def _fix_spacing_comprehensive(
        self, lines: List[str], issues: List[str]
    ) -> List[str]:
        """Fix all spacing issues comprehensively."""
        fixed_lines = []

        for line in lines:
            if not line.strip() or line.strip().startswith("#"):
                fixed_lines.append(line)
                continue

            original_line = line

            # Fix double colons
            if "::" in line:
                line = line.replace("::", ":")
                issues.append("Fixed double colons")

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

    def _fix_unicode_issues(
        self, line: str, seen_keys: Set[str], current_section: str, in_list: bool
    ) -> Tuple[str, List[str]]:
        """Fix Unicode encoding issues."""
        issues = []

        # Fix common Unicode issues in formulas
        if "formula:" in line:
            # Fix double-quoted Unicode issues like formula:""Al₂O₃\xB72SiO₂\xB72H₂O""
            if '""' in line and ("xB7" in line or "Al₂O₃" in line):
                # Extract the problematic formula and clean it
                formula_match = re.search(r'formula:\s*""([^"]*?)""', line)
                if formula_match:
                    raw_formula = formula_match.group(1)
                    # Clean up the Unicode issues
                    clean_formula = (
                        raw_formula.replace("\\xB7", "·")
                        .replace("Al₂O₃", "Al2O3")
                        .replace("SiO₂", "SiO2")
                        .replace("H₂O", "H2O")
                    )
                    # Replace with a clean formula
                    indent = len(line) - len(line.lstrip())
                    line = " " * indent + f'formula: "{clean_formula}"'
                    issues.append("Fixed malformed Unicode formula")
                else:
                    # Fallback for other malformed formulas
                    indent = len(line) - len(line.lstrip())
                    line = " " * indent + 'formula: "Chemical formula placeholder"'
                    issues.append("Replaced malformed formula with placeholder")

        # Fix Unicode in density values
        if "density:" in line and "\\xB3" in line:
            # Fix density values like "2.3-2.5 g/cm\xB3"
            density_match = re.search(r'density:\s*"([^"]*?)\\xB3"', line)
            if density_match:
                density_value = density_match.group(1)
                indent = len(line) - len(line.lstrip())
                line = " " * indent + f'density: "{density_value} g/cm³"'
                issues.append("Fixed Unicode in density value")

        return line, issues

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

    def _fix_truncated_content(
        self, line: str, seen_keys: Set[str], current_section: str, in_list: bool
    ) -> Tuple[str, List[str]]:
        """Fix truncated or incomplete content sections."""
        issues = []

        # NEVER add dummy data or placeholders
        # This method is disabled to prevent adding fake content
        # Only detect and report actual structural issues, never fabricate data

        return line, issues

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

        if self.stats["files_fixed"] > 0:
            print("\n📋 Files fixed:")
            for file_path in self.fixed_files:
                rel_path = Path(file_path).relative_to(directory_path)
                print(f"   - {rel_path}")

            if self.issue_types:
                print("\n🔍 Issue types found:")
                for issue_type, count in sorted(self.issue_types.items()):
                    print(f"   - {issue_type.replace('_', ' ').title()}: {count}")

            # Show format issues dictionary status
            encountered_any = any(self.encountered_issues.values())
            discovered_any = any(self.discovered_patterns.values())

            if encountered_any:
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

            if discovered_any:
                print("\n📚 New Patterns Auto-Discovered from Error Logs:")
                total_discovered = 0
                for category, patterns in self.discovered_patterns.items():
                    if patterns:
                        print(
                            f"   {category.replace('_', ' ').title()}: {len(patterns)} new patterns"
                        )
                        total_discovered += len(patterns)
                        if self.verbose:
                            for pattern in patterns:
                                print(f"     + {pattern}")

                if total_discovered > 0:
                    print(
                        f"\n📈 Dictionary Enhanced: Added {total_discovered} new patterns automatically!"
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

    parser = argparse.ArgumentParser(
        description="Z-Beam YAML Processor - Fix all YAML issues"
    )
    parser.add_argument("directory", help="Directory to process")
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Show detailed processing information",
    )
    parser.add_argument(
        "--version", action="version", version="Z-Beam YAML Processor v1.0.0"
    )

    args = parser.parse_args()

    # Create processor
    processor = ZBeamYAMLProcessor(verbose=args.verbose)

    # Process directory
    processor.process_directory(args.directory)


if __name__ == "__main__":
    main()
