import requests
import os
import json
from dotenv import load_dotenv

# Load environment variables
script_dir = os.path.dirname(__file__)
project_root = os.path.join(script_dir, "../../")
load_dotenv(dotenv_path=os.path.join(project_root, ".env.local"))

GROK_API_URL = "https://api.x.ai/v1/chat/completions"
GROK_API_KEY = os.getenv("XAI_API_KEY")

if not GROK_API_KEY:
    raise ValueError("XAI_API_KEY environment variable not set or empty")


class AIDetector:
    def __init__(self, content_type="blog post", audience_level="general readership"):
        self.content_type = content_type
        self.audience_level = audience_level
        self.prompt = self._build_prompt()

    def _build_prompt(self):
        """Load the AI-detection prompt from a file in the modules folder."""
        prompt_path = os.path.join(script_dir, "ai_detection_prompt.txt")
        default_prompt = """Evaluate the provided writing sample for AI-generated traits based on style for {content_type} aimed at {audience_level}. Return JSON with 'percentage' (0-100) and 'summary' (1-2 sentences)."""
        try:
            with open(prompt_path, "r", encoding="utf-8") as f:
                prompt = f.read().strip()
            if (
                "{content_type}" not in prompt
                or "{audience_level}" not in prompt
                or "{content}" not in prompt
            ):
                print(
                    f"Warning: Prompt file {prompt_path} missing required placeholders"
                )
                return default_prompt.format(
                    content_type=self.content_type, audience_level=self.audience_level
                )
            return prompt.format(
                content_type=self.content_type, audience_level=self.audience_level
            )
        except (FileNotFoundError, Exception) as e:
            print(f"Warning: Failed to read prompt file {prompt_path}: {e}")
            return default_prompt.format(
                content_type=self.content_type, audience_level=self.audience_level
            )

    def evaluate(self, content):
        """Evaluate the content using the Grok API."""
        headers = {
            "Authorization": f"Bearer {GROK_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "grok-3-latest",
            "messages": [
                {
                    "role": "user",
                    "content": self.prompt.replace("{content}", content),
                }
            ],
            "max_tokens": 150,
            "temperature": 0.5,
            "stream": False,
        }
        try:
            response = requests.post(GROK_API_URL, json=payload, headers=headers)
            response.raise_for_status()
            result = response.json()["choices"][0]["message"]["content"]
            token_usage = response.json().get("usage", {})
            print(f"Token usage (AI detection): {token_usage}")
            if "```json" not in result or "\n```" not in result:
                print(f"Warning: AI detection response lacks JSON markers: {result}")
                return {"percentage": 0, "summary": "Invalid response format"}
            json_str = result.split("```json\n")[1].split("\n```")[0]
            return json.loads(json_str)
        except (requests.RequestException, IndexError, json.JSONDecodeError) as e:
            print(f"AI detection failed: {e}")
            return {"percentage": 0, "summary": f"Detection failed: {e}"}
