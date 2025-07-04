#!/usr/bin/env python3
"""
Test and demonstration of the prompt optimization system.
"""

import os
import sys

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from generator.core.application import Application


def test_prompt_optimization():
    """Test the prompt optimization features."""
    print("🎯 Testing Prompt Optimization System")
    print("=" * 50)

    # Initialize the application
    app = Application()
    app.initialize()

    # Get services
    from generator.core.interfaces.services import IDetectionService

    detection_service = app.container.get(IDetectionService)

    print("\n📊 Current Performance Report:")
    print("-" * 30)
    report = detection_service.get_performance_report()
    print(report)

    print("\n🔍 Analyzing AI Detection Patterns:")
    print("-" * 35)
    ai_analysis = detection_service.get_optimization_analysis("ai")

    if ai_analysis["top_performers"]:
        print("🏆 Top AI Detection Prompts:")
        for i, perf in enumerate(ai_analysis["top_performers"], 1):
            print(f"  {i}. {perf['prompt']}")
            print(f"     Success Rate: {perf['success_rate']:.1%}")
            print(f"     Average Score: {perf['avg_score']:.1f}")
            print(f"     Uses: {perf['uses']}")
            print()
    else:
        print("   No sufficient performance data yet")

    print("\n🔍 Analyzing Human Detection Patterns:")
    print("-" * 37)
    human_analysis = detection_service.get_optimization_analysis("human")

    if human_analysis["top_performers"]:
        print("🏆 Top Human Detection Prompts:")
        for i, perf in enumerate(human_analysis["top_performers"], 1):
            print(f"  {i}. {perf['prompt']}")
            print(f"     Success Rate: {perf['success_rate']:.1%}")
            print(f"     Average Score: {perf['avg_score']:.1f}")
            print(f"     Uses: {perf['uses']}")
            print()
    else:
        print("   No sufficient performance data yet")

    print("\n💡 Recommendations:")
    print("-" * 17)
    all_recommendations = (
        ai_analysis["recommendations"] + human_analysis["recommendations"]
    )
    if all_recommendations:
        for rec in all_recommendations:
            print(f"  • {rec}")
    else:
        print("  • Run more detection tests to gather performance data")
        print("  • Current system will optimize based on usage patterns")

    print("\n🚀 Testing Optimized Prompt Generation:")
    print("-" * 40)

    # Generate optimized AI detection prompt
    print("Generating optimized AI detection prompt...")
    try:
        ai_content, ai_filename = detection_service.generate_optimized_prompt("ai")
        print(f"✅ Generated: {ai_filename}")
        print("Preview:")
        print("─" * 20)
        print(ai_content[:200] + "..." if len(ai_content) > 200 else ai_content)
        print("─" * 20)
    except Exception as e:
        print(f"❌ Failed to generate AI prompt: {e}")

    print()

    # Generate optimized human detection prompt
    print("Generating optimized human detection prompt...")
    try:
        human_content, human_filename = detection_service.generate_optimized_prompt(
            "human"
        )
        print(f"✅ Generated: {human_filename}")
        print("Preview:")
        print("─" * 20)
        print(
            human_content[:200] + "..." if len(human_content) > 200 else human_content
        )
        print("─" * 20)
    except Exception as e:
        print(f"❌ Failed to generate human prompt: {e}")

    print("\n💾 Auto-Save Feature Demo:")
    print("-" * 25)
    print(
        "The system can automatically save optimized prompts and add them to rotation."
    )
    print("To save and activate an optimized prompt:")
    print("  1. detection_service.save_optimized_prompt('ai')")
    print("  2. detection_service.save_optimized_prompt('human')")
    print("  3. New prompts will be automatically included in future selections")

    print("\n🔄 Adaptive Selection Demo:")
    print("-" * 26)
    print("The system now uses performance data to select optimal prompts:")
    print("  • Iteration 1: Uses best-performing prompt based on historical data")
    print("  • Later iterations: Avoids recently failed prompts, ensures diversity")
    print("  • Performance tracking: Automatically improves over time")

    print("\n✅ Prompt Optimization System Test Completed!")
    print("Run content generation with iterations to see adaptive selection in action.")


def run_optimization_demo():
    """Run a quick demo with actual content generation."""
    print("\n🎬 Running Live Optimization Demo")
    print("=" * 35)

    from generator.core.domain.models import GenerationContext

    # Initialize the application
    app = Application()
    app.initialize()

    # Get services
    from generator.core.interfaces.services import IDetectionService

    detection_service = app.container.get(IDetectionService)

    # Test content
    test_content = """
    Laser cleaning technology offers numerous advantages over traditional cleaning methods. 
    This advanced process utilizes precisely controlled laser beams to remove contaminants 
    without damaging the underlying material. The technology is environmentally friendly, 
    cost-effective, and provides superior precision compared to chemical or abrasive cleaning 
    methods. Industries worldwide are adopting laser cleaning for applications ranging from 
    heritage restoration to industrial maintenance.
    """

    # Create context
    context = GenerationContext(
        material="test_material",
        content_type="article_section",
        variables={"section_name": "demo_optimization"},
    )

    print(f"📝 Test Content: {len(test_content)} characters")
    print(f"Content preview: {test_content[:100]}...")

    print("\n🔍 Running Multiple Detection Iterations:")
    print("-" * 40)

    # Run multiple iterations to demonstrate adaptive selection
    for iteration in range(1, 4):
        print(f"\n--- Iteration {iteration} ---")

        # AI detection
        print("🤖 AI Detection:")
        ai_result = detection_service.detect_ai_likelihood(
            test_content, context, iteration
        )
        print(f"   Score: {ai_result.score}%")

        # Human detection
        print("👤 Human Detection:")
        human_result = detection_service.detect_human_likelihood(
            test_content, context, iteration
        )
        print(f"   Score: {human_result.score}%")

    print("\n📊 Updated Performance Report:")
    print("-" * 30)
    report = detection_service.get_performance_report()
    print(report)

    print("\n✅ Live demo completed! Performance data has been updated.")


if __name__ == "__main__":
    try:
        test_prompt_optimization()

        # Ask if user wants to run live demo
        print("\n" + "=" * 60)
        response = (
            input("Run live optimization demo with actual API calls? (y/N): ")
            .strip()
            .lower()
        )
        if response in ["y", "yes"]:
            run_optimization_demo()
        else:
            print(
                "Skipping live demo. Run with API calls to see adaptive selection in action."
            )

    except KeyboardInterrupt:
        print("\n\n⏹️  Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        import traceback

        traceback.print_exc()
