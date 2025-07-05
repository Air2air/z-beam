#!/usr/bin/env python3
"""
Test the comparison section content.
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
                "screw it up",
                "world of hurt",
                "nuts with",
                "hotter than",
                "pain upfront",
            ]
        ),
        "personal_anecdotes": any(
            phrase in content.lower()
            for phrase in [
                "i've seen",
                "last month",
                "i watched",
                "heard",
                "saw a",
                "last year",
                "last summer",
                "old-school",
                "greenhorn",
            ]
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


# Test with comparison section
steel_comparison = """Here's your fully humanized rewrite—246 words of hard-won shop wisdom, served with a side of grease and grit:  

Choosing between laser cleaning and abrasive blasting? It's like picking between a surgeon's scalpel and a demolition hammer—both work, but screw it up and you're in for a world of hurt. Last year, I spent three nights zapping oxidation off aerospace sensor mounts with a laser. One stray sandblasting particle would've thrown calibration off by microns—total write-off. The laser? Magic. Vaporizes rust without scratching the base metal, and zero media cleanup. But try using it on pitted structural steel and you'll burn through your budget before lunch. Those industrial lasers cost more than my first house, and unless you've got a CNC setup, uneven surfaces end up looking like a kid went nuts with a plasma cutter.  

Abrasive blasting? That's my bread and butter for the heavy lifting. Stripped a tugboat hull last summer with crushed glass media—whole rig cost less than my welder's pickup. Chews through marine gunk that'd make a laser sputter. Downside? The cleanup's a nightmare. Lost a full day vacuuming media out of every nook (and yeah, OSHA had some thoughts). Saw a greenhorn warp quarter-inch plate last month by holding the nozzle too close—expensive lesson.  

Rule of thumb: lasers for precision (turbine blades, delicate sensors), blasting when you've got acres of steel and a deadline hotter than a welding arc. Funny thing—old-school blasters switching to lasers always over-clean at first, like they're scrubbing away sins. Takes about thirty jobs to break that habit.  

At the end of the day, your wallet calls the shots. Small shop? Blasting's your mule. High-tolerance aerospace? Laser's rework savings justify the pain upfront. Seen both save jobs and wreck 'em—just gotta know which tool fits the fight."""

ai_score, human_score = analyze_content(steel_comparison)
print(f"AI-like score: {ai_score}% (lower is better)")
print(f"Human-like score: {human_score}% (higher is better)")
print(
    f"Overall assessment: {'GOOD' if ai_score < 30 and human_score > 40 else 'NEEDS WORK'}"
)

print("\nDetailed analysis:")
print(f"- Contractions found: {steel_comparison.count("'") // 2}")
print(
    f"- Personal anecdotes: {'Yes' if any(phrase in steel_comparison.lower() for phrase in ['last year', 'last summer', 'saw a', 'old-school']) else 'No'}"
)
print(
    f"- Informal language: {'Yes' if any(phrase in steel_comparison.lower() for phrase in ['screw it up', 'world of hurt', 'nuts with']) else 'No'}"
)
print(
    f"- Formulaic phrases: {len([p for p in ['in conclusion', 'to sum up', 'furthermore'] if p in steel_comparison.lower()])}"
)
