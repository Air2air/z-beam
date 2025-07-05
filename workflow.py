#!/usr/bin/env python3
"""
Quick Training Workflow

Simple commands to improve your content generation:
1. Generate content: python3 run.py
2. Train system: python3 workflow.py train
3. Test improvements: python3 run.py --test-detector
"""

import sys
import os

def show_usage():
    """Show usage information."""
    print("🔧 Z-Beam Quick Workflow")
    print("=" * 30)
    print()
    print("Commands:")
    print("  python3 workflow.py generate      # Generate content (same as: python3 run.py)")
    print("  python3 workflow.py train        # Train detection system")
    print("  python3 workflow.py test         # Test detection improvements")
    print("  python3 workflow.py check-config # Check for hardcoded values")
    print("  python3 workflow.py fix-config   # Auto-fix hardcoded values")
    print()
    print("Code Quality:")
    print("  python3 workflow.py detect       # Detect hardcoded config values")
    print("  python3 workflow.py autofix      # Auto-fix common hardcoding violations")
    print()
    print("Or use individual files:")
    print("  python3 run.py                   # Generate content")
    print("  python3 train.py                 # Train system")
    print("  python3 run.py --test-detector   # Test improvements")

def run_generator():
    """Run the main content generator."""
    print("🚀 Running Content Generator...")
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'generator'))
    from main import main
    main()

def run_training():
    """Run interactive training."""
    print("🎓 Starting Interactive Training...")
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'generator'))
    from interactive_training import main as train_main
    train_main()

def run_tests():
    """Run detection tests."""
    print("🧪 Running Detection Tests...")
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'generator'))
    from main import main
    # Override sys.argv to add test flag
    original_argv = sys.argv
    sys.argv = ['main.py', '--test-detector']
    try:
        main()
    finally:
        sys.argv = original_argv

def run_config_check():
    """Run hardcoding detection."""
    print("🔍 Checking for hardcoded configuration values...")
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'generator'))
    from scripts.detect_hardcoding import main as detect_main
    detect_main()

def run_config_fix():
    """Run automatic hardcoding fixes."""
    print("🔧 Auto-fixing hardcoded configuration values...")
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'generator'))
    from scripts.fix_hardcoding import main as fix_main
    fix_main()

def main():
    """Main workflow entry point."""
    if len(sys.argv) < 2:
        show_usage()
        return
    
    command = sys.argv[1].lower()
    
    try:
        if command == "generate":
            run_generator()
        elif command == "train":
            run_training()
        elif command == "test":
            run_tests()
        elif command in ["check-config", "detect"]:
            run_config_check()
        elif command in ["fix-config", "autofix"]:
            run_config_fix()
        else:
            print(f"❌ Unknown command: {command}")
            show_usage()
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n\n👋 Workflow interrupted. Goodbye!")
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
