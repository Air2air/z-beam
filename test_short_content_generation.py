#!/usr/bin/env python3
"""
Test content generation with shorter content and better iteration process.
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


def test_short_content_generation():
    """Test content generation with shorter content limits."""

    logger = get_logger(__name__)

    print("📝 Testing Short Content Generation with Iteration")
    print("=" * 60)

    try:
        # Initialize the container and configure services
        container = get_container()
        configure_services(container)

        # Get content generator service
        content_generator = container.get(IContentGenerator)

        # Create a test context and section config
        context = GenerationContext(
            material="aluminum",
            content_type="introduction",
            variables={
                "material": "aluminum",
                "section_name": "introduction",
                "audience_level": "professional",
                "technique": "laser_cleaning",
                "word_limit": 200,  # Short content
            },
        )

        section_config = SectionConfig(
            name="introduction",
            ai_detect=True,
            prompt_file="introduction.txt",
            section_type=SectionType.TEXT,
            generate=True,
            order=1,
        )

        # Create a test generation request for a short section
        request = GenerationRequest(
            material="aluminum",
            sections=["introduction"],
            provider=ProviderType.GEMINI,
            model="gemini-2.5-flash",
            ai_detection_threshold=25,
            human_detection_threshold=25,
            iterations_per_section=3,  # Allow more iterations
            temperature=1.0,
            max_tokens=3000,  # Lower max_tokens to generate shorter content
            force_regenerate=True,
        )

        print("🎯 Generation Parameters:")
        print(f"   Material: {request.material}")
        print(f"   Section: {request.sections[0]}")
        print(f"   AI Threshold: {request.ai_detection_threshold}%")
        print(f"   Human Threshold: {request.human_detection_threshold}%")
        print(f"   Max Iterations: {request.iterations_per_section}")
        print(f"   Max Tokens: {request.max_tokens}")
        print()

        print("🚀 Starting content generation...")
        print("=" * 60)

        # Generate content with AI detection enabled
        result = content_generator.generate_section(request, section_config, context)

        # Display results
        print()
        print("📊 Final Results:")
        print("   Section: introduction")
        print(f"   Iterations Completed: {result.iterations_completed}")
        print(f"   Final AI Score: {result.ai_score.score}%")
        print(f"   Final Human Score: {result.human_score.score}%")
        print(f"   Threshold Met: {result.threshold_met}")
        print(f"   Content Length: {len(result.content)} characters")
        print()

        # Show generated content
        print("📝 Generated Content (introduction):")
        print("-" * 40)
        print(result.content)
        print("-" * 40)

        print("\n✅ Short content generation test completed!")

    except Exception as e:
        logger.error(f"Test failed: {str(e)}")
        print(f"\n❌ Test failed: {str(e)}")


if __name__ == "__main__":
    test_short_content_generation()
