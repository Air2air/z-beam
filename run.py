# run.py

import os
import sys
import json
from dotenv import load_dotenv

# Reordered imports for RuffE402 compliance
# Import main from page_generator as it is needed at module level
from generator.modules.page_generator import main


# Add the project root to the sys.path
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = script_dir
sys.path.insert(0, project_root)

# Load environment variables from .env file
load_dotenv()

# --- DEBUGGING PRINTS ---
# print(f"DEBUG: Current Working Directory: {os.getcwd()}")
# print(f"DEBUG: .env file exists in CWD: {os.path.exists('.env')}")
# print(f"DEBUG: Value of GEMINI_API_KEY: {os.getenv('GEMINI_API_KEY')}")
# print(
#     f"DEBUG: Value of XAI_API_KEY: {os.getenv('XAI_API_KEY')}"
# )


if __name__ == "__main__":
    # --- Hardcoded Values Instead of Command-Line Arguments ---
    material = "Bronze"
    category = "Material"
    filename = "laser_cleaning_bronze.mdx"
    provider = "XAI"  # Set your desired provider here (e.g., "GEMINI" or "XAI")
    model = "grok-3-mini"  # "gemini-1.5-flash" "grok-3-mini"

    authors = ["Todd Dunning"]
    voice = "informative"
    authority = "medium"

    content_length_dict = {
        "paragraph": "150-200",
        "list": "70-100",
        "table": "60-90",
        "chart": "60-90",
    }

    variety = "standard overview"
    force_regenerate = True
    # --- End Hardcoded Values ---

    # Optional: You might still want a check for valid provider/model combinations
    # if provider == "GEMINI" and model not in ["gemini-1.0-pro", "gemini-1.5-flash"]:
    #     print(f"Error: Invalid model '{model}' for provider '{provider}'.")
    #     sys.exit(1)
    # elif provider == "XAI" and model not in ["grok-1", "grok-3-mini"]: # Add valid Grok models
    #     print(f"Error: Invalid model '{model}' for provider '{provider}'.")
    #     sys.exit(1)
    # elif provider not in ["GEMINI", "XAI"]:
    #     print(f"Error: Unknown provider '{provider}'.")
    #     sys.exit(1)

    # Get API keys from environment variables
    api_keys = {
        "gemini": os.getenv("GEMINI_API_KEY"),
        "XAI_API_KEY": os.getenv("XAI_API_KEY"),
    }

    # Optional: Basic check to warn if API key is missing for the selected provider
    if api_keys.get(f"{provider.upper()}_API_KEY") is None:
        print(
            f"WARNING: No API key found for provider '{provider}'. "
            f"Please ensure {provider.upper()}_API_KEY is set in your .env file located at the project root ({project_root})."
        )
        # You might want to uncomment the line below to stop execution if API key is missing
        # sys.exit(1)

    main(
        material=material,
        article_category=category,
        file_name=filename,
        provider=provider,
        authors=authors,
        voice=voice,
        authority=authority,
        content_length=content_length_dict,
        variety=variety,
        force_regenerate=force_regenerate,
        model=model,  # <--- PASS THE DIRECTLY SET MODEL
        api_keys=api_keys,
    )
