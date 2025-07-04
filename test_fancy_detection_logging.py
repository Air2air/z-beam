#!/usr/bin/env python3
"""
Test the fancy detection logging terminal output.
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "generator"))

from generator.core.container import get_container
from generator.core.application import configure_services
from generator.core.interfaces.services import IDetectionService
from generator.core.domain.models import GenerationContext
from generator.modules.logger import get_logger


def test_fancy_detection_logging():
    """Test the fancy detection logging output."""

    logger = get_logger(__name__)

    print("🎨 Testing Fancy Detection Logging")
    print("=" * 50)

    try:
        # Initialize the container and configure services
        container = get_container()
        configure_services(container)

        # Get detection service
        detection_service = container.get(IDetectionService)

        # Create test content that's shorter but still clearly AI-generated
        test_content = """
        Laser cleaning offers numerous advantages over traditional methods including precision and cost-effectiveness.
        """

        # Create a test context
        context = GenerationContext(
            material="aluminum",
            content_type="article",
            variables={
                "section_name": "introduction",
                "audience_level": "professional",
                "technique": "laser_cleaning",
            },
        )

        print("\n📝 Test Content:")
        print(f"Content length: {len(test_content)} characters")
        print(f"Content preview: {test_content[:100]}...")

        print("\n🔍 Running AI Detection (should show fancy output):")
        ai_result = detection_service.detect_ai_likelihood(
            test_content, context, iteration=1
        )

        print("\n🤖 AI Detection Result:")
        print(f"   Score: {ai_result.score}%")
        print(f"   Feedback: {ai_result.feedback}")

        print("\n🔍 Running Human Detection (should show fancy output):")
        human_result = detection_service.detect_human_likelihood(
            test_content, context, iteration=2
        )

        print("\n👤 Human Detection Result:")
        print(f"   Score: {human_result.score}%")
        print(f"   Feedback: {human_result.feedback}")

        print("\n✅ Fancy detection logging test completed!")

    except Exception as e:
        print(f"\n❌ Error during test: {e}")
        logger.error(f"Test failed: {e}", exc_info=True)
        return False

    return True


if __name__ == "__main__":
    success = test_fancy_detection_logging()
    sys.exit(0 if success else 1)
