#!/usr/bin/env python3
"""
Test the new prompt variation system for AI detection.
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "generator"))

from generator.core.container import get_container
from generator.core.application import configure_services
from generator.core.interfaces.services import IDetectionService
from generator.core.domain.models import GenerationContext
from generator.modules.logger import get_logger


def test_prompt_variations():
    """Test multiple prompt variations for AI detection."""

    logger = get_logger(__name__)

    print("🎭 Testing Prompt Variation System")
    print("=" * 50)

    try:
        # Initialize the container and configure services
        container = get_container()
        configure_services(container)

        # Get detection service
        detection_service = container.get(IDetectionService)

        # Show available variations
        variation_info = detection_service.get_prompt_variation_info()
        print("📋 Available Prompt Variations:")
        print(f"   🤖 AI Prompts: {variation_info['ai_variations']} variations")
        for i, prompt in enumerate(variation_info["ai_prompts"], 1):
            print(f"      {i}. {prompt}")
        print(f"   👤 Human Prompts: {variation_info['human_variations']} variations")
        for i, prompt in enumerate(variation_info["human_prompts"], 1):
            print(f"      {i}. {prompt}")
        print()

        # Test content
        test_content = """
        Aluminum stands as one of the most vital engineering materials of our time. 
        Renowned for its exceptional strength-to-weight ratio, inherent corrosion resistance, 
        and high thermal and electrical conductivity, it is indispensable across countless industries.
        """

        # Create a test context
        context = GenerationContext(
            material="aluminum",
            content_type="introduction",
            variables={
                "material": "aluminum",
                "section_name": "introduction",
                "audience_level": "professional",
                "technique": "laser_cleaning",
            },
        )

        print("🧪 Testing Multiple Iterations with Different Prompts:")
        print("-" * 50)

        # Test multiple iterations to see different prompts in action
        for iteration in range(1, 4):
            print(f"\n🔄 Iteration {iteration}:")

            # Test AI detection
            ai_score = detection_service.detect_ai_likelihood(
                test_content, context, iteration
            )
            print(f"   🤖 AI Detection Score: {ai_score.score}%")

            # Test Human detection
            human_score = detection_service.detect_human_likelihood(
                test_content, context, iteration
            )
            print(f"   👤 Human Detection Score: {human_score.score}%")

        # Show performance data
        print("\n📊 Prompt Performance Summary:")
        print("-" * 50)
        perf_data = detection_service.get_prompt_variation_info()["performance_data"]

        if perf_data:
            for prompt_key, stats in perf_data.items():
                print(f"   {prompt_key}:")
                print(f"      Uses: {stats['uses']}")
                print(f"      Avg Score: {stats['avg_score']:.1f}%")
                print(f"      Success Rate: {stats['success_rate']:.1%}")
        else:
            print("   No performance data collected yet.")

        print("\n✅ Prompt variation testing completed!")

    except Exception as e:
        logger.error(f"Test failed: {str(e)}")
        print(f"\n❌ Test failed: {str(e)}")


if __name__ == "__main__":
    test_prompt_variations()
