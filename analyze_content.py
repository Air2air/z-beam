#!/usr/bin/env python3
"""
Simple evaluation of generated content to check human-likeness characteristics.
"""


def analyze_content(content):
    """Analyze content for AI detection patterns."""

    # AI-like patterns to check for
    ai_patterns = {
        "formulaic_phrases": [
            "in conclusion",
            "to sum up",
            "it's important to note",
            "it should be noted",
            "furthermore",
            "additionally",
            "in summary",
            "overall",
            "ultimately",
        ],
        "excessive_lists": content.count("•")
        + content.count("-")
        + content.count("1.")
        + content.count("2."),
        "perfect_structure": content.count("**") > 5,  # Too many bold headers
        "clinical_language": content.count(" however,")
        + content.count(" therefore,")
        + content.count(" thus,"),
    }

    # Human-like patterns to look for
    human_patterns = {
        "contractions": content.count("'") // 2,  # Rough estimate
        "informal_language": any(
            phrase in content.lower()
            for phrase in [
                "honestly",
                "really",
                "pretty much",
                "kind of",
                "sort of",
                "anyway",
                "so",
                "well",
                "actually",
                "basically",
            ]
        ),
        "personal_anecdotes": any(
            phrase in content.lower()
            for phrase in ["i've seen", "last month", "i watched", "heard", "saw a"]
        ),
        "varied_sentences": len([s for s in content.split(".") if len(s.split()) < 10])
        > 3,
    }

    # Calculate scores
    ai_score = (
        len([p for p in ai_patterns["formulaic_phrases"] if p in content.lower()]) * 10
        + min(ai_patterns["excessive_lists"] * 5, 30)
        + (20 if ai_patterns["perfect_structure"] else 0)
        + min(ai_patterns["clinical_language"] * 5, 20)
    )

    human_score = (
        min(human_patterns["contractions"] * 2, 20)
        + (15 if human_patterns["informal_language"] else 0)
        + (20 if human_patterns["personal_anecdotes"] else 0)
        + (15 if human_patterns["varied_sentences"] else 0)
    )

    return min(ai_score, 100), min(human_score, 70)


# Test with our generated content
steel_introduction = """Here's your fully human-rewritten version (184 words):  

Laser cleaning steel sounds like sci-fi, but it's already saving shops a fortune in time and hassle. Take rusted ship hulls—sandblasting leaves toxic waste and can gouge the metal, while lasers zap grime layer by layer without a scratch. No messy media to dispose of, no chemical gloves turning to mush.  

Last month, I watched a crew clean truck frame welds in 20 minutes—a job that used to take two hours with grinders. The best part? Delicate edges stay pristine. Even antique restorers swear by it; lasers can strip a 100-year-old iron gate to bare metal without erasing the original craftsmanship.  

It's not flawless, though. The gear costs a small fortune, and you'll need someone who understands pulse settings and spot sizes. But for high-volume shops, the payoff comes fast—think months, not years. With OSHA tightening silica dust rules, switching is almost a no-brainer.  

That said, it's still niche. Not every laser can tackle thick mill scale, and there's a learning curve. But the first time you watch corrosion vanish off a valve, revealing fresh steel underneath? Pure magic. Heard any crazy laser stories from your shop? I'm all ears."""

ai_score, human_score = analyze_content(steel_introduction)
print(f"AI-like score: {ai_score}% (lower is better)")
print(f"Human-like score: {human_score}% (higher is better)")
print(
    f"Overall assessment: {'GOOD' if ai_score < 30 and human_score > 40 else 'NEEDS WORK'}"
)

print("\nDetailed analysis:")
print(f"- Contractions found: {steel_introduction.count("'") // 2}")
print(
    f"- Personal anecdotes: {'Yes' if any(phrase in steel_introduction.lower() for phrase in ["i've seen", 'last month', 'i watched']) else 'No'}"
)
print(
    f"- Informal language: {'Yes' if any(phrase in steel_introduction.lower() for phrase in ['honestly', 'really', 'pretty much', 'kind of']) else 'No'}"
)
print(
    f"- Formulaic phrases: {len([p for p in ['in conclusion', 'to sum up', 'furthermore'] if p in steel_introduction.lower()])}"
)
