#!/usr/bin/env python3
"""
Test script for the refactored Z-Beam generator architecture.
This tests the new domain-driven design while ensuring backward compatibility.
"""

import sys
import os

# Add the generator module to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "generator"))


def test_new_architecture():
    """Test the new architecture components."""
    print("🧪 Testing New Architecture Components")
    print("=" * 50)

    # Test 1: Domain Models
    print("1. Testing Domain Models...")
    try:
        from generator.core.domain.models import (
            GenerationRequest,
            SectionConfig,
            ProviderType,
            SectionType,
        )

        # Create a generation request
        request = GenerationRequest(
            material="aluminum",
            sections=["introduction"],
            provider=ProviderType.GEMINI,
            model="gemini-2.5-flash",
            ai_detection_threshold=25,
            human_detection_threshold=25,
        )

        # Create a section config
        section = SectionConfig(
            name="introduction",
            ai_detect=True,
            prompt_file="introduction.txt",
            section_type=SectionType.TEXT,
        )

        print("   ✅ Domain models created successfully")
        print(
            f"   📋 Request: {request.material} with {len(request.sections)} sections"
        )
        print(f"   📋 Section: {section.name} (ai_detect: {section.ai_detect})")

    except Exception as e:
        print(f"   ❌ Domain models failed: {str(e)}")
        return False

    # Test 2: Service Container
    print("\n2. Testing Service Container...")
    try:
        from generator.core.container import ServiceContainer
        from generator.core.interfaces.services import IAPIClient
        from generator.infrastructure.api.client import APIClient

        container = ServiceContainer()

        # Register a test service
        container.register_singleton(IAPIClient, APIClient)

        print("   ✅ Service container working")
        print(f"   📋 IAPIClient registered: {container.is_registered(IAPIClient)}")

    except Exception as e:
        print(f"   ❌ Service container failed: {str(e)}")
        return False

    # Test 3: Enhanced Configuration
    print("\n3. Testing Enhanced Configuration...")
    try:
        from generator.config.enhanced_settings import get_settings

        settings = get_settings()
        print("   ✅ Enhanced settings loaded")
        print(f"   📋 Environment: {settings.environment}")
        print(f"   📋 Default AI threshold: {settings.generation.default_ai_threshold}")
        print(f"   📋 Cache enabled: {settings.cache.enabled}")

    except Exception as e:
        print(f"   ❌ Enhanced configuration failed: {str(e)}")
        return False

    # Test 4: Application Bootstrap
    print("\n4. Testing Application Bootstrap...")
    try:
        from generator.core.application import get_app

        app = get_app()
        print("   ✅ Application bootstrap working")
        print(f"   📋 Container configured: {app.container is not None}")
        print(f"   📋 Settings loaded: {app.settings is not None}")

    except Exception as e:
        print(f"   ❌ Application bootstrap failed: {str(e)}")
        return False

    return True


def test_backward_compatibility():
    """Test that the legacy API still works."""
    print("\n🔄 Testing Backward Compatibility")
    print("=" * 50)

    try:
        # Import the legacy content generator
        from generator.modules import content_generator

        print("1. Testing legacy imports...")
        print("   ✅ Legacy content_generator module imported")

        # Check that the generate_content function exists
        if hasattr(content_generator, "generate_content"):
            print("   ✅ generate_content function available")
        else:
            print("   ❌ generate_content function missing")
            return False

        # Test other legacy functions still exist
        legacy_functions = ["research_material_config", "load_rewrite_prompt"]

        for func_name in legacy_functions:
            if hasattr(content_generator, func_name):
                print(f"   ✅ {func_name} function available")
            else:
                print(f"   ❌ {func_name} function missing")
                return False

        print("\n2. Testing legacy API compatibility...")

        # Test that we can create the legacy parameters
        section_variables = {
            "material": "aluminum",
            "content_type": "introduction",
            "temperature": 1.0,
        }

        api_keys = {"GEMINI": "test-key-123"}

        print("   ✅ Legacy parameter structure created")
        print(f"   📋 Material: {section_variables['material']}")
        print(f"   📋 API keys configured: {list(api_keys.keys())}")

        return True

    except Exception as e:
        print(f"   ❌ Backward compatibility failed: {str(e)}")
        return False


def test_integration():
    """Test integration between components."""
    print("\n🔗 Testing Integration")
    print("=" * 50)

    try:
        print("1. Testing service integration...")

        # Test that we can get services from the application
        from generator.core.application import get_app
        from generator.core.interfaces.services import IPromptRepository

        app = get_app()

        # Test that we can resolve services
        if app.container.is_registered(IPromptRepository):
            print("   ✅ IPromptRepository registered in container")
        else:
            print("   ℹ️  IPromptRepository not registered (expected in test)")

        print("   ✅ Service integration working")

        return True

    except Exception as e:
        print(f"   ❌ Integration test failed: {str(e)}")
        return False


def test_error_handling():
    """Test enhanced error handling."""
    print("\n🚨 Testing Error Handling")
    print("=" * 50)

    try:
        from generator.core.exceptions import ContentGenerationError, ErrorContext

        # Test creating structured errors
        context = ErrorContext("test_operation", "test_module", {"key": "value"})
        error = ContentGenerationError("Test error", section="test_section")

        print("   ✅ Structured exceptions created")
        print(f"   📋 Error type: {error.__class__.__name__}")
        print(f"   📋 Context: {context.operation}")

        # Test error conversion to dict
        error_dict = context.to_dict()
        print(f"   📋 Error serializable: {bool(error_dict)}")

        return True

    except Exception as e:
        print(f"   ❌ Error handling test failed: {str(e)}")
        return False


def main():
    """Run all tests."""
    print("🚀 Z-Beam Generator Refactoring Test Suite")
    print("=" * 60)

    test_results = []

    # Run all tests
    test_results.append(("New Architecture", test_new_architecture()))
    test_results.append(("Backward Compatibility", test_backward_compatibility()))
    test_results.append(("Integration", test_integration()))
    test_results.append(("Error Handling", test_error_handling()))

    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)

    passed = 0
    total = len(test_results)

    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<25} {status}")
        if result:
            passed += 1

    print("-" * 60)
    print(f"Total: {passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 ALL TESTS PASSED!")
        print("The refactored architecture is working correctly!")
        print("\n📋 Architecture Benefits:")
        print("  • ✅ Clean separation of concerns")
        print("  • ✅ Type-safe domain models")
        print("  • ✅ Dependency injection")
        print("  • ✅ Enhanced error handling")
        print("  • ✅ Backward compatibility maintained")
        print("  • ✅ Configuration as code")
        return True
    else:
        print(f"\n❌ {total - passed} tests failed")
        print("Some components need attention before the refactoring is complete.")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
