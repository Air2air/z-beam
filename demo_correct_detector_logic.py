#!/usr/bin/env python3
"""
Demonstration of the correct detector iterator logic that was implemented.
This shows the expected behavior:
1. Both AI and human detectors are called separately each iteration
2. Both scores should decrease with each iteration
3. Both scores and feedback are logged for each iteration
4. Pass only when BOTH scores are below their respective thresholds
"""


def demonstrate_correct_detector_logic():
    """Demonstrate the correct detector iterator logic"""

    print("🔍 Correct Detector Iterator Logic Demo")
    print("=" * 50)

    # Simulate decreasing scores over iterations
    iterations = [
        {"ai_score": 85, "human_score": 75, "iteration": 1},
        {"ai_score": 70, "human_score": 60, "iteration": 2},
        {"ai_score": 55, "human_score": 45, "iteration": 3},
        {"ai_score": 40, "human_score": 30, "iteration": 4},
        {"ai_score": 25, "human_score": 15, "iteration": 5},
    ]

    # Thresholds
    ai_threshold = 30
    human_threshold = 20

    print(f"🎯 AI Threshold: {ai_threshold}%")
    print(f"🎯 Human Threshold: {human_threshold}%")
    print(f"✅ Pass Condition: BOTH scores must be <= their thresholds")
    print("-" * 50)

    for data in iterations:
        iteration = data["iteration"]
        ai_score = data["ai_score"]
        human_score = data["human_score"]

        # This is what the refactored code now does:
        print(f"📊 Iteration {iteration}:")
        print(f"   🤖 AI Detection Score: {ai_score}%")
        print(f"   👤 Human Detection Score: {human_score}%")

        # Check threshold condition (CORRECT: both must be below thresholds)
        ai_pass = ai_score <= ai_threshold
        human_pass = human_score <= human_threshold
        overall_pass = ai_pass and human_pass

        print(
            f"   🎯 AI Pass: {ai_pass} ({ai_score}% {'<=' if ai_pass else '>'} {ai_threshold}%)"
        )
        print(
            f"   🎯 Human Pass: {human_pass} ({human_score}% {'<=' if human_pass else '>'} {human_threshold}%)"
        )
        print(
            f"   {'✅' if overall_pass else '❌'} Overall: {'PASS' if overall_pass else 'CONTINUE'}"
        )

        if overall_pass:
            print(f"🎉 SUCCESS: Section passed on iteration {iteration}!")
            break

        print()

    print("\n" + "=" * 50)
    print("📝 Key Changes Made to content_generator.py:")
    print("1. ✅ Call BOTH AI and human detectors separately each iteration")
    print("2. ✅ Log BOTH scores and feedback separately")
    print("3. ✅ Fixed threshold logic: pass when BOTH <= thresholds")
    print("4. ✅ Removed incorrect 'human_score = 100 - ai_score' calculation")
    print("5. ✅ Combined feedback from both detectors for next iteration")
    print("6. ✅ Proper logging of scores and threshold comparisons")


if __name__ == "__main__":
    demonstrate_correct_detector_logic()
