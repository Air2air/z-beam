"""
Provider/model registry for the article generation system.
Centralizes all provider/model settings and lookup logic.
"""

MODELS = {
    "GEMINI": {
        "model": "gemini-1.5-pro-latest",
        "url_template": "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent",
        "default_temperature": 1.0,
        "default_max_tokens": 2048,
    },
    "XAI": {
        "model": "xai.grok-3-mini-beta",
        "url_template": "https://api.x.ai/v1/chat/completions",
        "default_temperature": 1.0,
        "default_max_tokens": 2048,
    },
    "DEEPSEEK": {
        "model": "deepseek-chat",
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
