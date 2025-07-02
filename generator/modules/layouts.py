# generator/modules/layouts.py

"""
Defines the content section order for different article types.
"""

from generator.modules.logger import get_logger

logger = get_logger("layouts")

# Define section order for different article types
LAYOUTS = {
    "Material": [
        "paragraph",
        "list",
        "table",
        "chart",
    ],
    "Application": [
        "paragraph",
        "list",
        "chart",
    ],
    # Add other article types here
    # "Region": [
    #     "paragraph",
    #     "list",
    #     "chart",
    # ],
}


def get_layout(article_type: str) -> list[str]:
    """
    Returns the predefined section order for a given article type.

    Args:
        article_type (str): The type of article (e.g., "Material", "Application").

    Returns:
        list[str]: A list of section names in the desired order.
                   Returns an empty list if the article_type is not found.
    """
    layout = LAYOUTS.get(article_type)
    if layout is None:
        logger.warning(
            f"Unknown article type '{article_type}'. Returning empty layout."
        )
        return []
    return layout
