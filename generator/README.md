# Generator Package

This package contains all logic, configuration, and prompts for the article/content generation system.

## Structure
- `config/` — All configuration and settings
- `modules/` — Core logic (generation, detection, prompt management, etc.)
- `prompts/` — All prompt templates (detection and section-specific)
- `authors/` — Author metadata
- `cache/` — Cache files

## Usage
- Use `run.py` as the entry point.
- All prompt loading should go through `PromptManager`.
- All detection should use the `Detector` class.

See subdirectory READMEs for more details.
