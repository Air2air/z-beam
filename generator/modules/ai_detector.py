"""
AI Detector: Evaluates content for AI-generated traits using Grok API.

Loads prompt from ai_detection_prompt.txt, uses MODEL from constants.py, retries with simplified prompts if needed. Parses plain/triple-backtick JSON.

Usage: AIDetector(content_type, audience_level).evaluate(content)
Dependencies: requests, python-dotenv, constants
"""

import os
import json
import requests
import time
import random
from dotenv import load_dotenv
from generator.constants import MODEL

# Load environment variables
script_dir = os.path.dirname(__file__)
project_root = os.path.join(script_dir, "../../")
load_dotenv(os.path.join(project_root, ".env.local"))
GROK_API_URL = "https://api.x.ai/v1/chat/completions"
GROK_API_KEY = (
    os.getenv("XAI_API_KEY")
    or (lambda: (_ for _ in ()).throw(ValueError("XAI_API_KEY not set"))())()
)


def load_file(file_path):
    """Read text file with error handling."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read().strip()
    except (FileNotFoundError, Exception) as e:
        print(f"Warning: Failed to read {file_path}: {e}")
        return ""


def parse_json_response(response, default, log_prefix="API response"):
    """Parse plain or triple-backtick JSON, return default on failure."""
    if not response.strip():
        print(f"Warning: Empty {log_prefix} received")
        return default
    try:
        print(f"Raw {log_prefix}: {response[:500]}...")
        return json.loads(response.strip())
    except json.JSONDecodeError as e:
        print(f"Warning: JSON parsing failed for {log_prefix}: {e}")
        if "```json" not in response or "\n```" not in response:
            print(f"Warning: {log_prefix} lacks JSON markers: {response[:500]}...")
            return default
        try:
            json_str = response.split("```json\n")[1].split("\n```")[0].strip()
            return json.loads(json_str)
        except (IndexError, json.JSONDecodeError) as e:
            print(f"Failed to parse {log_prefix} JSON: {e}")
            return default


class AIDetector:
    def __init__(self, content_type="blog post", audience_level="general readership"):
        self.content_type = content_type
        self.audience_level = audience_level
        self.prompt = self._load_prompt()

    def _load_prompt(self):
        """Load AI detection prompt with fallback."""
        prompt_path = os.path.join(script_dir, "ai_detection_prompt.txt")
        default_prompt = "Evaluate this {content_type} text for {audience_level} for AI-generated traits. Return JSON with 'percentage' (0-100) and 'summary' (1-2 sentences): {content}"
        prompt = load_file(prompt_path) or default_prompt
        if (
            "{content_type}" not in prompt
            or "{audience_level}" not in prompt
            or "{content}" not in prompt
        ):
            print(f"Warning: Prompt {prompt_path} missing placeholders. Using default.")
            return default_prompt
        return prompt

    def evaluate(self, content):
        """Evaluate content for AI likelihood."""
        headers = {
            "Authorization": f"Bearer {GROK_API_KEY}",
            "Content-Type": "application/json",
        }
        formatted_prompt = self.prompt.replace("{content}", content)
        print(f"AI detection prompt: {formatted_prompt[:500]}...")
        payloads = [
            {"model": MODEL, "content": formatted_prompt},
            {
                "model": MODEL,
                "content": f"Evaluate text for AI traits. Return JSON with 'percentage' (0-100), 'summary' (1-2 sentences): {content}",
            },
            {
                "model": MODEL,
                "content": f"Analyze text for AI-generated style. Return JSON {{'percentage': 0-100, 'summary': string}}: {content}",
            },
        ]
        for attempt, payload_data in enumerate(payloads, 1):
            payload = {
                "model": payload_data["model"],
                "messages": [{"role": "user", "content": payload_data["content"]}],
                "max_tokens": 300,
                "temperature": 0.5,
                "stream": False,
            }
            try:
                print(
                    f"Attempting AI detection with model: {payload['model']} (attempt {attempt})"
                )
                response = requests.post(GROK_API_URL, json=payload, headers=headers)
                response.raise_for_status()
                result = response.json()["choices"][0]["message"]["content"]
                print(
                    f"Token usage (AI detection, attempt {attempt}): {response.json().get('usage', {})}"
                )
                return parse_json_response(
                    result,
                    {"percentage": 0, "summary": "Invalid response format"},
                    f"AI detection, attempt {attempt}",
                )
            except requests.RequestException as e:
                print(
                    f"AI detection failed, attempt {attempt}: {e}, status: {response.status_code if 'response' in locals() else 'N/A'}, response: {response.text if 'response' in locals() else 'N/A'}"
                )
                if attempt < len(payloads):
                    delay = (1 * 2 ** (attempt - 1)) + random.uniform(0, 0.1)
                    print(
                        f"Retrying with simplified prompt after {delay:.2f}s (attempt {attempt + 1})"
                    )
                    time.sleep(delay)
                    continue
                return {"percentage": 0, "summary": f"Detection failed: {e}"}
        return {"percentage": 0, "summary": "Detection failed after retries"}
