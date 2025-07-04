#!/usr/bin/env python3
"""
Test content generation with fancy detection logging during iterations.
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "generator"))

from generator.core.container import get_container
from generator.core.application import configure_services
from generator.core.interfaces.services import IContentGenerator
from generator.core.domain.models import (
    GenerationContext,
    GenerationRequest,
    SectionConfig,
    ProviderType,
    SectionType,
)
from generator.modules.logger import get_logger


def test_content_generation_with_detection():
    """Test content generation with detection iterations."""

    logger = get_logger(__name__)

    print("📝 Testing Content Generation with Fancy Detection Logging")
    print("=" * 60)

    try:
        # Initialize the container and configure services
        container = get_container()
        configure_services(container)

        # Get content generator service
        content_generator = container.get(IContentGenerator)

        # Create a test context for a simple introduction
        context = GenerationContext(
            material="aluminum",
            content_type="introduction",
            variables={
                "material": "aluminum",  # Add material to variables as well
                "section_name": "introduction",
                "audience_level": "professional",
                "technique": "laser_cleaning",
                "material_properties": "lightweight, corrosion-resistant",
                "word_limit": "100",  # Keep it very short to avoid token limits
            },
        )

        # Create generation request
        request = GenerationRequest(
            material="aluminum",
            sections=["introduction"],
            provider=ProviderType.GEMINI,
            model="gemini-2.5-flash",
            ai_detection_threshold=25,  # Low threshold to trigger iterations
            human_detection_threshold=25,  # Low threshold to trigger iterations
            iterations_per_section=2,  # Just 2 iterations to see the logging
            temperature=0.7,
            max_tokens=2048,
        )

        # Create section config
        section_config = SectionConfig(
            name="introduction",
            ai_detect=True,
            prompt_file="introduction.txt",
            section_type=SectionType.TEXT,
            generate=True,
            order=1,
        )

        print("🎯 Generation Parameters:")
        print(f"   Material: {context.material}")
        print(f"   Section: {section_config.name}")
        print(f"   AI Threshold: {request.ai_detection_threshold}%")
        print(f"   Human Threshold: {request.human_detection_threshold}%")
        print(f"   Max Iterations: {request.iterations_per_section}")
        print(f"   Word Limit: {context.get_variable('word_limit')}")

        print("\n🚀 Starting content generation...")
        print("=" * 60)

        # Generate content - this should trigger detection iterations with fancy logging
        result = content_generator.generate_section(
            request=request, section_config=section_config, context=context
        )

        print("=" * 60)
        print("📊 Final Results:")
        print(f"   Iterations Completed: {result.iterations_completed}")
        print(f"   Final AI Score: {result.final_ai_score}%")
        print(f"   Final Human Score: {result.final_human_score}%")
        print(f"   Threshold Met: {result.threshold_met}")
        print(f"   Content Length: {len(result.content)} characters")

        print("\n📝 Generated Content:")
        print("-" * 40)
        print(result.content)
        print("-" * 40)

        print("\n✅ Content generation test completed!")

    except Exception as e:
        print(f"\n❌ Error during test: {e}")
        logger.error(f"Test failed: {e}", exc_info=True)
        return False

    return True


if __name__ == "__main__":
    success = test_content_generation_with_detection()
    sys.exit(0 if success else 1)
