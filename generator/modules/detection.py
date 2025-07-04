from typing import Dict
from .prompt_manager import PromptManager


class Detector:
    def __init__(self, prompt_manager: PromptManager):
        self.prompt_manager = prompt_manager

    def detect(
        self, content: str, detection_type: str, context: Dict[str, str]
    ) -> Dict[str, str]:
        """
        detection_type: 'ai' or 'human'
        context: dict with keys like content_type, audience_level
        Returns: dict with 'percentage', 'summary', and optionally 'examples'
        """
        if detection_type == "ai":
            prompt_template = self.prompt_manager.load_prompt(
                "ai_detection_prompt.txt", "detection"
            )
        elif detection_type == "human":
            prompt_template = self.prompt_manager.load_prompt(
                "human_detection_prompt.txt", "detection"
            )
        else:
            raise ValueError(f"Unknown detection type: {detection_type}")
        prompt = prompt_template.format(content=content, **context)
        # Here you would call the model API, e.g.:
        # response = call_model_api(prompt)
        # For now, return a dummy result for structure
        return {"percentage": "0%", "summary": "Dummy summary"}
