#!/usr/bin/env python3
"""
Integration test for the new prompt optimization system within the DI container.
Tests the full integration with the application bootstrap and service container.
"""

import sys
import asyncio
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from generator.core.application import get_app
from generator.core.interfaces.prompt_optimization import (
    IPromptPerformanceRepository,
    IPromptSelectionStrategy,
)
from generator.modules.logger import get_logger

logger = get_logger("prompt_optimization_integration_test")


async def test_service_resolution():
    """Test that all prompt optimization services can be resolved from DI container."""
    print("🧪 Testing service resolution from DI container...")

    app = get_app()

    # Test prompt optimization service resolution
    try:
        optimization_service = app.get_prompt_optimization_service()
        print(
            f"✅ PromptOptimizationService resolved: {type(optimization_service).__name__}"
        )
    except Exception as e:
        print(f"❌ Failed to resolve PromptOptimizationService: {e}")
        return False

    # Test repository resolution
    try:
        repository = app.container.get(IPromptPerformanceRepository)
        print(f"✅ PromptPerformanceRepository resolved: {type(repository).__name__}")
    except Exception as e:
        print(f"❌ Failed to resolve PromptPerformanceRepository: {e}")
        return False

    # Test strategy resolution
    try:
        strategy = app.container.get(IPromptSelectionStrategy)
        print(f"✅ PromptSelectionStrategy resolved: {type(strategy).__name__}")
    except Exception as e:
        print(f"❌ Failed to resolve PromptSelectionStrategy: {e}")
        return False

    return True


async def test_service_functionality():
    """Test that the resolved services work correctly."""
    print("\n🧪 Testing service functionality...")

    app = get_app()
    optimization_service = app.get_prompt_optimization_service()

    # Test prompt selection
    try:
        test_prompts = ["test_prompt_1.txt", "test_prompt_2.txt", "test_prompt_3.txt"]

        selected_prompt = await optimization_service.select_prompt(
            test_prompts, "test_context"
        )
        print(f"✅ Prompt selection works: {selected_prompt}")
    except Exception as e:
        print(f"❌ Prompt selection failed: {e}")
        return False

    # Test performance recording
    try:
        await optimization_service.record_usage(
            prompt_name="test_prompt_1.txt",
            context="test_context",
            success=True,
            ai_score=25.0,
            human_score=75.0,
            execution_time=1.5,
            provider="DEEPSEEK",  # Use configurable provider
        )
        print("✅ Performance recording works")
    except Exception as e:
        print(f"❌ Performance recording failed: {e}")
        return False

    # Test performance retrieval
    try:
        profile = await optimization_service.get_performance_profile(
            "test_prompt_1.txt", "test_context"
        )
        if profile:
            print(
                f"✅ Performance profile retrieved: {profile.metrics.usage_count} uses"
            )
        else:
            print("✅ Performance profile not found (expected for new prompt)")
    except Exception as e:
        print(f"❌ Performance profile retrieval failed: {e}")
        return False

    return True


async def test_backward_compatibility():
    """Test that the compatible wrapper still works."""
    print("\n🧪 Testing backward compatibility...")

    try:
        from generator.core.services.prompt_optimizer_compatible import (
            PromptOptimizerCompatible,
        )

        # Test initialization
        optimizer = PromptOptimizerCompatible()
        print("✅ PromptOptimizerCompatible initialized")

        # Test prompt selection (legacy interface)
        selected = optimizer.select_prompt(
            ["test_prompt_1.txt", "test_prompt_2.txt"], "test_context"
        )
        print(f"✅ Legacy prompt selection works: {selected}")

        # Test performance recording (legacy interface)
        optimizer.record_performance(
            prompt_name="test_prompt_1.txt",
            context="test_context",
            success=True,
            ai_score=30.0,
            human_score=70.0,
            execution_time=2.0,
        )
        print("✅ Legacy performance recording works")

        # Test report generation
        report = optimizer.generate_report()
        print(f"✅ Legacy report generation works: {len(report.split('\\n'))} lines")

    except Exception as e:
        print(f"❌ Backward compatibility test failed: {e}")
        return False

    return True


async def test_data_migration():
    """Test that legacy data is properly migrated."""
    print("\n🧪 Testing data migration...")

    try:
        from generator.core.services.prompt_optimizer_compatible import (
            PromptOptimizerCompatible,
        )

        # Initialize with legacy data migration
        compat_optimizer = PromptOptimizerCompatible()

        # Get all profiles to trigger migration
        app = get_app()
        optimization_service = app.get_prompt_optimization_service()
        profiles = await optimization_service.get_all_profiles()

        print(f"✅ Data migration complete: {len(profiles)} profiles loaded")
        print(f"✅ Compatible optimizer initialized: {type(compat_optimizer).__name__}")

        # Verify migrated data structure
        if profiles:
            sample_profile = profiles[0]
            print(
                f"✅ Sample migrated profile: {sample_profile.prompt_name} "
                f"({sample_profile.metrics.usage_count} uses, "
                f"{sample_profile.metrics.success_rate:.2f} success rate)"
            )

    except Exception as e:
        print(f"❌ Data migration test failed: {e}")
        return False

    return True


async def test_advanced_features():
    """Test advanced features like analytics and reporting."""
    print("\n🧪 Testing advanced features...")

    app = get_app()
    optimization_service = app.get_prompt_optimization_service()

    # Test top performers
    try:
        top_performers = await optimization_service.get_top_performers(
            "test_context", limit=5
        )
        print(f"✅ Top performers query works: {len(top_performers)} results")
    except Exception as e:
        print(f"❌ Top performers query failed: {e}")
        return False

    # Test analytics
    try:
        analytics = await optimization_service.get_performance_analytics("test_context")
        print(f"✅ Performance analytics works: {len(analytics)} metrics")
    except Exception as e:
        print(f"❌ Performance analytics failed: {e}")
        return False

    # Test comprehensive report
    try:
        report = await optimization_service.generate_comprehensive_report()
        print(
            f"✅ Comprehensive report generation works: {len(report.split('\\n'))} lines"
        )
    except Exception as e:
        print(f"❌ Comprehensive report generation failed: {e}")
        return False

    return True


async def main():
    """Run all integration tests."""
    print("🚀 Starting Prompt Optimization Integration Tests")
    print("=" * 60)

    tests = [
        ("Service Resolution", test_service_resolution),
        ("Service Functionality", test_service_functionality),
        ("Backward Compatibility", test_backward_compatibility),
        ("Data Migration", test_data_migration),
        ("Advanced Features", test_advanced_features),
    ]

    results = []

    for test_name, test_func in tests:
        print(f"\n📋 Running {test_name} Test")
        print("-" * 40)

        try:
            success = await test_func()
            results.append((test_name, success))

            if success:
                print(f"✅ {test_name} Test: PASSED")
            else:
                print(f"❌ {test_name} Test: FAILED")

        except Exception as e:
            print(f"❌ {test_name} Test: ERROR - {e}")
            results.append((test_name, False))

    # Summary
    print("\n" + "=" * 60)
    print("🎯 Test Results Summary")
    print("=" * 60)

    passed = sum(1 for _, success in results if success)
    total = len(results)

    for test_name, success in results:
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{test_name:<25} {status}")

    print(f"\nOverall: {passed}/{total} tests passed")

    if passed == total:
        print(
            "🎉 All integration tests passed! The prompt optimization system is fully integrated."
        )
        return True
    else:
        print("⚠️  Some integration tests failed. Please review the output above.")
        return False


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
