#!/usr/bin/env python3

"""
Script to modify yaml_processor.py to add file completeness checking.

This will add a check for file completeness before processing each file.
"""

import os
import signal
import tempfile
import subprocess
from pathlib import Path

# Path to the YAML processor
processor_path = Path(
    "/Users/todddunning/Desktop/Z-Beam/z-beam-test-push/yaml-processor/yaml_processor.py"
)

# Read the original file
original_content = processor_path.read_text(encoding="utf-8")

# Add the completeness checking method
completeness_method = """
    def _is_file_complete(self, file_path: Path) -> bool:
        \"\"\"
        Check if a file is complete and ready for processing.
        A complete file has:
        1. Valid frontmatter delimiters
        2. All required fields
        3. Minimum content length
        \"\"\"
        try:
            # Read the file content
            content = file_path.read_text(encoding="utf-8")
            
            # Check if file is empty
            if not content.strip():
                if self.verbose:
                    print(f"  ⚠️ Empty file: {file_path.name}")
                return False
                
            # Check for frontmatter delimiters
            parts = content.split("---", 2)
            if len(parts) < 3:
                if self.verbose:
                    print(f"  ⚠️ Missing frontmatter delimiters: {file_path.name}")
                return False
                
            frontmatter = parts[1]
            body = parts[2]
            
            # Check for minimum content after frontmatter
            if not body.strip():
                if self.verbose:
                    print(f"  ⚠️ No content after frontmatter: {file_path.name}")
                return False
                
            # Try to parse YAML to check for basic validity
            try:
                import yaml
                yaml_content = yaml.safe_load(frontmatter)
                if not isinstance(yaml_content, dict):
                    if self.verbose:
                        print(f"  ⚠️ Frontmatter not a valid YAML dictionary: {file_path.name}")
                    return False
            except Exception:
                if self.verbose:
                    print(f"  ⚠️ Invalid YAML in frontmatter: {file_path.name}")
                return False
                
            # Check for required fields
            required_fields = getattr(self, 'required_fields', ['name', 'description'])
            if yaml_content:
                for field in required_fields:
                    if field not in yaml_content or not yaml_content[field]:
                        if self.verbose:
                            print(f"  ⚠️ Missing required field '{field}': {file_path.name}")
                        return False
            
            return True
        except Exception as e:
            if self.verbose:
                print(f"  ⚠️ Error checking file completeness {file_path.name}: {e}")
            return False
"""

# Add required_fields to __init__
init_replacement = """    def __init__(self, verbose: bool = False, timeout: int = 30, required_fields=None):
        self.verbose = verbose
        self.base_path = None
        self.timeout = timeout  # Timeout in seconds for processing a single file
        self.required_fields = required_fields or ["name", "description"]

        # Statistics
        self.stats = {
            "files_processed": 0,
            "files_fixed": 0,
            "files_incomplete": 0,
            "issues_found": 0,
            "skipped_no_frontmatter": 0,
            "timed_out_files": 0,
            "start_time": datetime.now(),
        }

        # Error tracking
        self.fixed_files: List[str] = []
        self.incomplete_files: List[str] = []
        self.errors_found: Dict[str, List[str]] = {}
        self.issue_types: Dict[str, int] = {}

        # Before and after comparison tracking
        self.file_changes: Dict[str, Dict] = {}

        # Previous run data for comparison
        self.previous_run = None
        self.load_previous_run()"""

# Add completeness check to _process_file
process_file_addition = """    def _process_file(self, file_path: Path) -> None:
        \"\"\"Process a single file to fix YAML frontmatter issues.\"\"\"
        if not self._is_file_complete(file_path):
            print(f"  ⚠️ Skipping incomplete file: {file_path.name}")
            self.incomplete_files.append(str(file_path))
            self.stats["files_incomplete"] += 1
            return

        signal.signal(signal.SIGALRM, self._timeout_handler)
        signal.alarm(self.timeout)
        
        try:"""

# Add print incomplete files to summary
summary_addition = """
        if self.incomplete_files:
            print("\\nIncomplete files skipped:")
            for file_path in self.incomplete_files:
                print(f"  - {file_path}")"""

# Modified content with additions
modified_content = original_content

# Add required_fields to __init__
if "def __init__(self, verbose: bool = False, timeout: int = 30):" in modified_content:
    modified_content = modified_content.replace(
        "def __init__(self, verbose: bool = False, timeout: int = 30):",
        "def __init__(self, verbose: bool = False, timeout: int = 30, required_fields=None):",
    )

# Add required_fields initialization
if '"start_time": datetime.now(),' in modified_content:
    modified_content = modified_content.replace(
        '"start_time": datetime.now(),',
        '"start_time": datetime.now(),\n            "files_incomplete": 0,',
    )

# Add self.required_fields initialization
if "self.timeout = timeout" in modified_content:
    modified_content = modified_content.replace(
        "self.timeout = timeout",
        'self.timeout = timeout\n        self.required_fields = required_fields or ["name", "description"]',
    )

# Add incomplete_files list
if "self.fixed_files: List[str] = []" in modified_content:
    modified_content = modified_content.replace(
        "self.fixed_files: List[str] = []",
        "self.fixed_files: List[str] = []\n        self.incomplete_files: List[str] = []",
    )

# Add completeness checking method
if "def _has_frontmatter(self, file_path: Path) -> bool:" in modified_content:
    modified_content = modified_content.replace(
        "def _has_frontmatter(self, file_path: Path) -> bool:",
        f"{completeness_method}\n    def _has_frontmatter(self, file_path: Path) -> bool:",
    )

# Add completeness check to _process_file
if "def _process_file(self, file_path: Path) -> None:" in modified_content:
    modified_content = modified_content.replace(
        "def _process_file(self, file_path: Path) -> None:", process_file_addition
    )

    # Adjust indentation for the rest of the method
    modified_content = modified_content.replace(
        "signal.signal(signal.SIGALRM, self._timeout_handler)",
        "        signal.signal(signal.SIGALRM, self._timeout_handler)",
    )

# Add reporting of incomplete files to summary
if 'print(f"\\n{len(self.fixed_files)} files fixed:")' in modified_content:
    modified_content = modified_content.replace(
        'print(f"\\n{len(self.fixed_files)} files fixed:")',
        'print(f"\\n{len(self.fixed_files)} files fixed, {len(self.incomplete_files)} files incomplete:")',
    )

# Add incomplete files to summary report
if "for file_path in self.fixed_files:" in modified_content:
    modified_content = modified_content.replace(
        "for file_path in self.fixed_files:",
        f"for file_path in self.fixed_files:{summary_addition}",
    )

# Update argparse for required_fields
if 'parser.add_argument("-t", "--timeout",' in modified_content:
    modified_content = modified_content.replace(
        'parser.add_argument("-t", "--timeout",',
        'parser.add_argument("-r", "--required-fields", type=str, default="name,description", help="Comma-separated list of required fields")\n    parser.add_argument("-t", "--timeout",',
    )

# Update processor instantiation with required_fields
if (
    "processor = ZBeamYAMLProcessor(verbose=args.verbose, timeout=args.timeout)"
    in modified_content
):
    modified_content = modified_content.replace(
        "processor = ZBeamYAMLProcessor(verbose=args.verbose, timeout=args.timeout)",
        'required_fields = args.required_fields.split(",") if args.required_fields else ["name", "description"]\n    processor = ZBeamYAMLProcessor(verbose=args.verbose, timeout=args.timeout, required_fields=required_fields)',
    )

# Create a temporary file
with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".py") as temp_file:
    temp_file.write(modified_content)
    temp_file_path = temp_file.name

print(f"Modified processor has been created at: {temp_file_path}")
print("Review the changes and then apply them to the original file.")

# Command to diff the files
diff_cmd = f"diff -u {processor_path} {temp_file_path}"

try:
    diff_output = subprocess.check_output(diff_cmd, shell=True, text=True)
    print("\nDifferences between original and modified file:")
    print(diff_output)
except subprocess.CalledProcessError as e:
    print("\nDifferences between original and modified file:")
    print(e.output)

print("\nTo apply these changes, review them carefully and then run:")
print(f"cp {temp_file_path} {processor_path}")
