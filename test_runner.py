#!/usr/bin/env python3
"""
Content generation test functions for regular validation.
"""

import sys
import os
from typing import Dict, Any

# Add generator to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "generator"))

from generator.core.container import get_container
from generator.core.application import configure_services
from generator.core.interfaces.services import IContentGenerator
from generator.core.domain.models import (
    GenerationContext,
    GenerationRequest,
    SectionConfig,
    SectionType,
    ProviderType,
)
from generator.modules.logger import get_logger


def run_content_test(
    material: str = "aluminum",
    section: str = "introduction",
    word_limit: int = 300,
    ai_threshold: int = 25,
    human_threshold: int = 25,
    max_iterations: int = 3,
    max_tokens: int = 3000,
) -> Dict[str, Any]:
    """
    Run a content generation test with AI detection iteration.

    Returns:
        Dict containing test results including scores, iterations, and content.
    """
    logger = get_logger(__name__)

    print("🧪 Content Generation Test")
    print("=" * 50)
    print(f"   Material: {material}")
    print(f"   Section: {section}")
    print(f"   Word Limit: {word_limit}")
    print(f"   AI Threshold: ≤{ai_threshold}%")
    print(f"   Human Threshold: ≤{human_threshold}%")
    print(f"   Max Iterations: {max_iterations}")
    print(f"   Max Tokens: {max_tokens}")
    print()

    try:
        # Initialize the container and configure services
        container = get_container()
        configure_services(container)

        # Get content generator service
        content_generator = container.get(IContentGenerator)

        # Create test context and section config
        context = GenerationContext(
            material=material,
            content_type=section,
            variables={
                "material": material,
                "section_name": section,
                "audience_level": "professional",
                "technique": "laser_cleaning",
                "word_limit": word_limit,
            },
        )

        section_config = SectionConfig(
            name=section,
            ai_detect=True,
            prompt_file=f"{section}.txt",
            section_type=SectionType.TEXT,
            generate=True,
            order=0,
        )

        # Create generation request
        request = GenerationRequest(
            material=material,
            sections=[section],
            provider=ProviderType.GEMINI,
            model="gemini-2.5-flash",
            ai_detection_threshold=ai_threshold,
            human_detection_threshold=human_threshold,
            iterations_per_section=max_iterations,
            temperature=1.0,
            max_tokens=max_tokens,
            force_regenerate=True,
        )

        print("🚀 Starting content generation...")
        print("-" * 50)

        # Generate content with AI detection enabled
        result = content_generator.generate_section(request, section_config, context)

        # Display results
        print()
        print("📊 Test Results:")
        print(f"   ✨ Iterations Completed: {result.iterations_completed}")
        print(
            f"   🤖 Final AI Score: {result.ai_score.score}% (target: ≤{ai_threshold}%)"
        )
        print(
            f"   👤 Final Human Score: {result.human_score.score}% (target: ≤{human_threshold}%)"
        )

        # Check if thresholds were met
        ai_passed = result.ai_score.score <= ai_threshold
        human_passed = result.human_score.score <= human_threshold
        overall_passed = ai_passed and human_passed

        print(f"   🎯 AI Threshold: {'✅ PASS' if ai_passed else '❌ FAIL'}")
        print(f"   🎯 Human Threshold: {'✅ PASS' if human_passed else '❌ FAIL'}")
        print(f"   🏁 Overall: {'✅ SUCCESS' if overall_passed else '❌ NEEDS WORK'}")
        print(f"   📏 Content Length: {len(result.content)} characters")
        print()

        # Show a snippet of generated content
        content_preview = (
            result.content[:200] + "..."
            if len(result.content) > 200
            else result.content
        )
        print("📝 Content Preview:")
        print("-" * 30)
        print(content_preview)
        print("-" * 30)

        return {
            "success": True,
            "overall_passed": overall_passed,
            "ai_score": result.ai_score.score,
            "human_score": result.human_score.score,
            "ai_passed": ai_passed,
            "human_passed": human_passed,
            "iterations": result.iterations_completed,
            "content_length": len(result.content),
            "content": result.content,
            "ai_feedback": result.ai_score.feedback,
            "human_feedback": result.human_score.feedback,
        }

    except Exception as e:
        logger.error(f"Content generation test failed: {str(e)}")
        print(f"\n❌ Test failed: {str(e)}")
        return {
            "success": False,
            "error": str(e),
        }


def run_quick_test() -> bool:
    """Run a quick content generation test with default parameters."""
    result = run_content_test(
        material="aluminum",
        section="introduction",
        word_limit=200,
        ai_threshold=30,
        human_threshold=30,
        max_iterations=4,  # Increased from 2 to test more prompt variations
        max_tokens=4000,
    )
    return result.get("success", False) and result.get("overall_passed", False)


def run_comprehensive_test() -> bool:
    """Run a comprehensive test with stricter thresholds."""
    result = run_content_test(
        material="silver",
        section="introduction",
        word_limit=300,
        ai_threshold=25,
        human_threshold=25,
        max_iterations=5,  # Increased from 3 to test more prompt variations
        max_tokens=6000,
    )
    return result.get("success", False) and result.get("overall_passed", False)


if __name__ == "__main__":
    # If run directly, do a quick test
    print("Running quick content generation test...")
    success = run_quick_test()
    sys.exit(0 if success else 1)
