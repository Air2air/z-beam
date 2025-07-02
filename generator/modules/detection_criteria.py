"""
Defines AI detection criteria for stylistic analysis.
"""

AI_DETECTION_CRITERIA = [
    {
        "name": "Linguistic Predictability and Variation",
        "description": "Assess 'burstiness' (variation in sentence length, structure, complexity). Human writing shows natural variation; AI may exhibit predictable patterns or templated flow. Account for genre conventions (e.g., procedural writing may be formulaic).",
        "weight": 0.20,
    },
    {
        "name": "Repetitive Patterns",
        "description": "Identify mechanical repetition in phrasing or structure lacking purposeful intent. Distinguish from intentional repetition in instructional or persuasive writing.",
        "weight": 0.15,
    },
    {
        "name": "Specificity and Engagement",
        "description": "Check for vague, abstract, or cliché phrasing where specific details or engagement are expected. Look for a human-like imprint (e.g., anecdotes, context-specific examples).",
        "weight": 0.15,
    },
    {
        "name": "Tone and Voice",
        "description": "Evaluate for overly formal, clinical, monotonous, or exaggeratedly informal tones. Flag forced familiarity, performative humor, or overly chummy asides (e.g., excessive slang, unnecessary rhetorical questions).",
        "weight": 0.15,
    },
    {
        "name": "Vocabulary and Syntax",
        "description": "Analyze if vocabulary/syntax is unusually polished, generic, or incongruously casual. Flag mechanical flawlessness or exaggerated colloquialisms.",
        "weight": 0.10,
    },
    {
        "name": "Exaggerated Familiarity or Silliness",
        "description": "Identify over-familiar language, forced humor, or performative casualness (e.g., 'Your material is totally vibing!') that feels unnatural or disproportionate.",
        "weight": 0.10,
    },
    {
        "name": "Stylistic AI Indicators",
        "description": "Note anomalies like vague assertions, illogical connections, or invented details impacting style. Include unnatural tone shifts.",
        "weight": 0.10,
    },
    {
        "name": "Human Imperfections and Cues",
        "description": "Look for stylistic quirks, slight redundancies, informal phrasing, or natural imperfections. Their absence increases likelihood.",
        "weight": 0.10,
    },
    {
        "name": "Task-Specific Contextual Analysis",
        "description": "Calibrate expectations based on content type and audience. Avoid misinterpreting task-specific conventions as AI-generated, but ensure casual language is purposeful.",
        "weight": 0.05,
    },
    {
        "name": "Jargon Overuse",
        "description": "Detect excessive or inappropriate use of technical jargon that feels forced or misaligned with the context.",
        "weight": 0.05,
    },
]
