#!/usr/bin/env python3
"""
Demo script showing how the detector iterator SHOULD work.
This demonstrates the correct logic for iterative improvement.
"""

import os
import sys

# Add the project root to the path first
project_root = os.path.dirname(os.path.abspath(__file__))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from generator.modules.logger import get_logger


def simulate_improved_detector_iterator():
    """Simulate how the detector iterator should work correctly."""

    logger = get_logger("detector_demo")

    # Configuration
    ai_detection_threshold = 30  # Target: AI score should be ≤ 30%
    human_detection_threshold = 25  # Target: Human score should be ≤ 25%
    max_iterations = 3

    # Simulate section content iterations
    section_name = "comparison"

    logger.info(f"=== DETECTOR ITERATOR DEMO for '{section_name}' ===")
    logger.info(
        f"Target thresholds: AI ≤ {ai_detection_threshold}%, Human ≤ {human_detection_threshold}%"
    )

    # Simulate realistic iteration results
    iterations = [
        # Iteration 1: Initial generation (usually high scores)
        {
            "ai_score": 75,
            "human_score": 60,
            "ai_feedback": "Overly formulaic phrasing and repetitive structure suggest AI generation",
            "human_feedback": "Lacks natural variation and has mechanical flow patterns",
            "content_preview": "When examining silver cleaning methods, there are several approaches that can be utilized...",
        },
        # Iteration 2: Improved after feedback
        {
            "ai_score": 45,
            "human_score": 40,
            "ai_feedback": "Minor improvements but still slightly predictable in sentence structure",
            "human_feedback": "Better variation but some phrases still feel templated",
            "content_preview": "Two fundamentally different approaches dominate silver cleaning: abrasive polishing versus electrochemical restoration...",
        },
        # Iteration 3: Further improved
        {
            "ai_score": 25,
            "human_score": 20,
            "ai_feedback": "Natural variation and authentic tone with good specificity",
            "human_feedback": "Exhibits human-like quirks and natural flow patterns",
            "content_preview": "Silver cleaning presents an interesting choice. You've got your traditional polish-and-elbow-grease approach, then there's the almost magical chemistry...",
        },
    ]

    best_ai_score = 100
    best_human_score = 100
    best_content = ""
    threshold_met = False

    for i, iteration in enumerate(iterations, 1):
        ai_score = iteration["ai_score"]
        human_score = iteration["human_score"]
        ai_feedback = iteration["ai_feedback"]
        human_feedback = iteration["human_feedback"]
        content_preview = iteration["content_preview"]

        # Log the iteration clearly
        logger.info(f"\n--- ITERATION {i} ---")
        logger.info(f"[SCORES] AI: {ai_score}%, Human: {human_score}%")
        logger.info(f"[AI FEEDBACK] {ai_feedback}")
        logger.info(f"[HUMAN FEEDBACK] {human_feedback}")
        logger.info(f"[CONTENT PREVIEW] {content_preview[:80]}...")

        # Track best (lowest scores are better)
        if ai_score < best_ai_score or (
            ai_score == best_ai_score and human_score < best_human_score
        ):
            best_content = content_preview
            best_ai_score = ai_score
            best_human_score = human_score
            logger.info(
                f"[BEST] New best scores: AI={best_ai_score}%, Human={best_human_score}%"
            )

        # Check if both thresholds are met (both scores should be LOW)
        if (
            ai_score <= ai_detection_threshold
            and human_score <= human_detection_threshold
        ):
            threshold_met = True
            logger.info(f"✅ SUCCESS! Both thresholds met on iteration {i}")
            logger.info(f"   AI: {ai_score}% ≤ {ai_detection_threshold}%")
            logger.info(f"   Human: {human_score}% ≤ {human_detection_threshold}%")
            break
        else:
            reasons = []
            if ai_score > ai_detection_threshold:
                reasons.append(f"AI: {ai_score}% > {ai_detection_threshold}%")
            if human_score > human_detection_threshold:
                reasons.append(f"Human: {human_score}% > {human_detection_threshold}%")
            logger.info(f"❌ Failed: {' AND '.join(reasons)}")

    # Final results
    logger.info(f"\n=== FINAL RESULTS ===")
    logger.info(f"Threshold met: {threshold_met}")
    logger.info(f"Best AI score: {best_ai_score}%")
    logger.info(f"Best Human score: {best_human_score}%")
    logger.info(f"Iterations completed: {len(iterations)}")

    # Show the improvement trend
    logger.info(f"\n=== IMPROVEMENT TREND ===")
    for i, iteration in enumerate(iterations, 1):
        ai_score = iteration["ai_score"]
        human_score = iteration["human_score"]
        logger.info(f"Iteration {i}: AI={ai_score}%, Human={human_score}%")

    if len(iterations) > 1:
        ai_improvement = iterations[0]["ai_score"] - iterations[-1]["ai_score"]
        human_improvement = iterations[0]["human_score"] - iterations[-1]["human_score"]
        logger.info(
            f"Total improvement: AI=-{ai_improvement}%, Human=-{human_improvement}%"
        )


def show_current_vs_correct_logic():
    """Show the difference between current (wrong) and correct logic."""

    logger = get_logger("logic_comparison")

    logger.info("\n" + "=" * 60)
    logger.info("CURRENT (WRONG) vs CORRECT (FIXED) LOGIC")
    logger.info("=" * 60)

    # Example scores from an iteration
    ai_score = 25  # AI detection score

    logger.info(f"\nGiven AI detection score: {ai_score}%")

    logger.info("\n🚨 CURRENT (WRONG) LOGIC:")
    current_human_score = 100 - ai_score
    logger.info(
        f"   human_score = 100 - ai_score = 100 - {ai_score} = {current_human_score}%"
    )
    logger.info(
        f"   Problem: When AI score DECREASES (good!), human score INCREASES (bad!)"
    )
    logger.info(f"   This makes no sense - both should improve (decrease) together!")

    logger.info(f"\n   Current threshold check:")
    logger.info(f"   ai_score <= 30 AND human_score >= 50")
    logger.info(f"   {ai_score} <= 30 AND {current_human_score} >= 50")
    logger.info(f"   True AND True = Success ✅")
    logger.info(f"   But this is backwards! High human score should be BAD!")

    logger.info(f"\n✅ CORRECT (FIXED) LOGIC:")
    logger.info(f"   AI Detection: {ai_score}% (lower is better)")
    logger.info(
        f"   Human Detection: Call separate detector -> e.g., 20% (lower is better)"
    )
    logger.info(f"   Both scores decrease as content becomes more human-like")

    logger.info(f"\n   Correct threshold check:")
    logger.info(f"   ai_score <= 30 AND human_score <= 25")
    logger.info(f"   {ai_score} <= 30 AND 20 <= 25")
    logger.info(f"   True AND True = Success ✅")
    logger.info(f"   Both low scores mean human-like content!")


if __name__ == "__main__":
    simulate_improved_detector_iterator()
    show_current_vs_correct_logic()
