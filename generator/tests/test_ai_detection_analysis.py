#!/usr/bin/env python3
"""
Test AI detection on a specific piece of content to understand why scores are so high.
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "generator"))

from generator.core.container import get_container
from generator.core.application import configure_services
from generator.core.interfaces.services import IDetectionService
from generator.core.domain.models import GenerationContext
from generator.modules.logger import get_logger


def test_ai_detection_analysis():
    """Test AI detection on specific content to understand high scores."""

    logger = get_logger(__name__)

    print("🔍 AI Detection Analysis - Understanding High Scores")
    print("=" * 60)

    try:
        # Initialize the container and configure services
        container = get_container()
        configure_services(container)

        # Get detection service
        detection_service = container.get(IDetectionService)

        # Test with shorter, simpler content to avoid token issues
        test_content = """
Silver has timeless elegance and radiant luster. This noble metal is challenged by tarnish.
"""

        # Create a test context
        context = GenerationContext(
            material="silver",
            content_type="introduction",
            variables={
                "material": "silver",
                "section_name": "introduction",
                "audience_level": "professional",
                "technique": "laser_cleaning",
            },
        )

        print("📝 Test Content:")
        print("-" * 40)
        print(test_content.strip())
        print("-" * 40)
        print(f"Length: {len(test_content)} characters")

        print("\n🤖 Running AI Detection Analysis...")

        # Run AI detection
        ai_result = detection_service.detect_ai_likelihood(
            test_content, context, iteration=1
        )

        print(f"\n📊 AI Detection Results:")
        print(f"   Score: {ai_result.score}%")
        print(f"   Type: {ai_result.detection_type}")
        print(f"   Iteration: {ai_result.iteration}")

        print(f"\n💬 Detailed Feedback:")
        print("-" * 40)
        print(ai_result.feedback)
        print("-" * 40)

        # Also test human detection for comparison
        print(f"\n👤 Running Human Detection Analysis...")
        human_result = detection_service.detect_human_likelihood(
            test_content, context, iteration=1
        )

        print(f"\n📊 Human Detection Results:")
        print(f"   Score: {human_result.score}%")
        print(f"   Feedback: {human_result.feedback}")

        print(f"\n🔍 Analysis Summary:")
        print(
            f"   AI Likelihood: {ai_result.score}% ({'HIGH' if ai_result.score > 60 else 'MODERATE' if ai_result.score > 30 else 'LOW'})"
        )
        print(
            f"   Human Likelihood: {human_result.score}% ({'HIGH' if human_result.score > 60 else 'MODERATE' if human_result.score > 30 else 'LOW'})"
        )

        if ai_result.score > 60:
            print(f"\n⚠️  HIGH AI SCORE DETECTED!")
            print(f"   This content is being flagged as highly AI-generated.")
            print(f"   Review the feedback above for specific issues to address.")

    except Exception as e:
        print(f"\n❌ Error during test: {e}")
        logger.error(f"Test failed: {e}", exc_info=True)
        return False

    return True


if __name__ == "__main__":
    success = test_ai_detection_analysis()
    sys.exit(0 if success else 1)
