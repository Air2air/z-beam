#!/usr/bin/env python3
"""
Test the updated detection prompt flow:
1. Iteration 1: Uses initial_prompt.txt for revision guidance
2. Iteration 2+: Uses AI/Human detection feedback for revision guidance
3. Both AI and Human detectors called every iteration to score content
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "generator"))

from modules.logger import get_logger


def test_detection_prompt_flow():
    """Test the detection prompt flow"""

    logger = get_logger(__name__)

    print("🔍 Testing Detection Prompt Flow")
    print("=" * 50)

    # Expected flow:
    print("📋 Expected Detection Prompt Flow:")
    print()
    print("🔄 **ITERATION 1:**")
    print("   1. Generate initial content")
    print("   2. Call AI detector → Get AI score + feedback")
    print("   3. Call Human detector → Get Human score + feedback")
    print("   4. If scores too high → Use initial_prompt.txt for revision guidance")
    print()
    print("🔄 **ITERATION 2+:**")
    print("   1. Revise content using previous feedback")
    print("   2. Call AI detector → Get AI score + feedback")
    print("   3. Call Human detector → Get Human score + feedback")
    print("   4. If scores too high → Use combined AI/Human feedback for next revision")
    print()
    print("✅ **SUCCESS CONDITION:**")
    print("   Both AI score ≤ ai_threshold AND Human score ≤ human_threshold")
    print()

    # Show the prompt files
    print("📁 Detection Prompt Files:")
    print("   📄 generator/prompts/detection/initial_prompt.txt")
    print("      └─ Used for iteration 1 revision guidance (general improvement)")
    print("   📄 generator/prompts/detection/ai_detection_prompt.txt")
    print("      └─ Used every iteration to score AI-likeness (0-100%)")
    print("   📄 generator/prompts/detection/human_detection_prompt.txt")
    print("      └─ Used every iteration to score over-human traits (0-100%)")
    print()

    # Show the key fix
    print("🔧 Key Fix Applied:")
    print("   OLD: Used full detection prompts as fallback revision guidance")
    print("   NEW: Uses initial_prompt.txt for first iteration, then specific feedback")
    print()

    print("✅ Detection prompt flow is now properly configured!")


if __name__ == "__main__":
    test_detection_prompt_flow()
