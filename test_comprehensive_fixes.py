#!/usr/bin/env python3
"""
Test script to verify both logging improvements and ai_detect behavior.
This will:
1. Test that terminal output is clean (no verbose DEBUG logs)
2. Test that only ai_detect=true sections go through detection iterator
"""

import subprocess
import sys
import re


def run_generation_test():
    """Run a generation test with mixed ai_detect sections."""
    print("🧪 Testing generation with mixed ai_detect sections...")
    print("   - chart (ai_detect=false) - should NOT go through detection")
    print("   - table (ai_detect=false) - should NOT go through detection")
    print("   - introduction (ai_detect=true) - SHOULD go through detection")
    print("   - comparison (ai_detect=true) - SHOULD go through detection")
    print()

    # Run generation with a mix of ai_detect true/false sections
    cmd = [
        sys.executable,
        "run.py",
        "--material=copper",
        "--pages=1",
        "--sections=chart,table,introduction,comparison",
        "--ai-detection-threshold=25",
        "--human-detection-threshold=25",
    ]

    print(f"🚀 Running: {' '.join(cmd)}")
    print("=" * 60)

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300,  # 5 minute timeout
            cwd="/Users/todddunning/Desktop/Z-Beam/z-beam-test-push",
        )

        output_lines = result.stdout.split("\n")
        error_lines = result.stderr.split("\n") if result.stderr else []

        all_lines = output_lines + error_lines

        # Analysis
        print("\n📊 ANALYSIS:")
        print("=" * 40)

        # Check 1: No verbose DEBUG logs in terminal
        debug_logs = [
            line for line in all_lines if "[DEBUG]" in line and "INFO" in line
        ]
        print(f"✅ Verbose DEBUG logs in terminal: {len(debug_logs)} (should be 0)")
        if debug_logs:
            print("   ⚠️  Found verbose DEBUG logs:")
            for log in debug_logs[:3]:  # Show first 3
                print(f"     {log}")

        # Check 2: No article_data structure logs in terminal
        article_data_logs = [
            line
            for line in all_lines
            if "article_data structure:" in line and "INFO" in line
        ]
        print(
            f"✅ article_data structure logs in terminal: {len(article_data_logs)} (should be 0)"
        )
        if article_data_logs:
            print("   ⚠️  Found article_data logs in terminal:")
            for log in article_data_logs[:2]:
                print(f"     {log}")

        # Check 3: Detection iterator behavior
        ai_detection_lines = [
            line
            for line in all_lines
            if "AI DETECTION OUTPUT" in line or "AI FEEDBACK" in line
        ]
        human_detection_lines = [
            line
            for line in all_lines
            if "HUMAN DETECTION OUTPUT" in line or "HUMAN FEEDBACK" in line
        ]

        print(f"✅ AI detection iterations found: {len(ai_detection_lines)}")
        print(f"✅ Human detection iterations found: {len(human_detection_lines)}")

        # Check which sections went through detection
        sections_with_detection = set()
        for line in ai_detection_lines + human_detection_lines:
            # Extract section name from lines like "[AI FEEDBACK] Iteration 1 for 'introduction':"
            match = re.search(r"for '([^']+)':", line)
            if match:
                sections_with_detection.add(match.group(1))

        print(
            f"✅ Sections that went through detection: {sorted(sections_with_detection)}"
        )

        # Expected: introduction and comparison should go through detection
        # Expected: chart and table should NOT go through detection
        expected_detection = {"introduction", "comparison"}
        expected_no_detection = {"chart", "table"}

        correct_detection = expected_detection.issubset(sections_with_detection)
        incorrect_detection = bool(
            expected_no_detection.intersection(sections_with_detection)
        )

        print(f"✅ Correct sections detected: {correct_detection}")
        print(f"✅ No incorrect sections detected: {not incorrect_detection}")

        # Summary
        print("\n🎯 TEST RESULTS:")
        print("=" * 30)

        issues = []
        if debug_logs:
            issues.append("Verbose DEBUG logs still in terminal")
        if article_data_logs:
            issues.append("article_data logs still in terminal")
        if not correct_detection:
            issues.append(
                f"Expected sections {expected_detection} didn't go through detection"
            )
        if incorrect_detection:
            issues.append(
                f"Unexpected sections {expected_no_detection.intersection(sections_with_detection)} went through detection"
            )

        if not issues:
            print("🎉 ALL TESTS PASSED!")
            print("   ✅ Terminal output is clean (no verbose DEBUG logs)")
            print("   ✅ No article_data structure logging in terminal")
            print("   ✅ Only ai_detect=true sections go through detection iterator")
        else:
            print("❌ Issues found:")
            for issue in issues:
                print(f"   - {issue}")

        return len(issues) == 0, result.returncode

    except subprocess.TimeoutExpired:
        print("❌ Test timed out after 5 minutes")
        return False, -1
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return False, -1


if __name__ == "__main__":
    print("🔍 Testing logging improvements and ai_detect behavior")
    print("=" * 60)

    success, return_code = run_generation_test()

    if success:
        print("\n🎉 All tests completed successfully!")
        sys.exit(0)
    else:
        print(f"\n❌ Tests failed (return code: {return_code})")
        sys.exit(1)
