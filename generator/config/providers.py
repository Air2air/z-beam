"""
Provider/model registry for the article generation system.
Centralizes all provider/model settings and lookup logic.

Updated models as of July 2025:
- GEMINI: Using Gemini 2.5 Flash (latest stable, cost-effective)
- XAI: Using Grok 3 Mini Beta (latest available)
- DEEPSEEK: Using DeepSeek Chat (points to DeepSeek-V3)
"""

MODELS = {
    "GEMINI": {
        "model": "gemini-2.5-flash",  # Updated to latest stable model
        # Alternative options: "gemini-2.5-pro", "gemini-2.0-flash", "gemini-1.5-pro"
        "url_template": "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        "default_temperature": 1.0,
        "default_max_tokens": 2048,
    },
    "XAI": {
        "model": "grok-3-mini-beta",  # Removed "xai." prefix
        # Alternative options: "grok-3-beta", "grok-2-vision-1212"
        "url_template": "https://api.x.ai/v1/chat/completions",
        "default_temperature": 1.0,
        "default_max_tokens": 2048,
    },
    "DEEPSEEK": {
        "model": "deepseek-chat",  # Correct - points to DeepSeek-V3
        # Alternative options: "deepseek-reasoner" (points to DeepSeek-R1)
        "url_template": "https://api.deepseek.com/v1/chat/completions",
        "default_temperature": 1.0,
        "default_max_tokens": 2048,
    },
}


def get_model_settings(provider_name: str) -> dict:
    """Safely get model settings for a provider."""
    try:
        return MODELS[provider_name]
    except KeyError:
        raise ValueError(f"Unknown provider: {provider_name}")
