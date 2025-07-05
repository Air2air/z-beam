"""
Comprehensive scoring system for AI detection and Natural Voice assessment.
"""

from dataclasses import dataclass
from typing import Dict, Tuple, Optional
from enum import Enum


class ScoreCategory(Enum):
    """Categories for different score interpretations."""
    EXCELLENT = "excellent"
    GOOD = "good" 
    ACCEPTABLE = "acceptable"
    POOR = "poor"
    CRITICAL = "critical"


@dataclass
class ScoreInterpretation:
    """Interpretation of a detection score."""
    category: ScoreCategory
    description: str
    recommendation: str
    is_passing: bool
    color_code: str
    emoji: str


class DetectionScoringSystem:
    """
    Unified scoring system that clarifies the meaning of AI and Natural Voice scores.
    
    SCORING PHILOSOPHY:
    - AI Detection: Low scores (0-25%) = GOOD (minimal AI patterns)
    - Natural Voice: Mid-range scores (15-25%) = EXCELLENT (authentic professional voice)
    """

    def __init__(self):
        self.ai_thresholds = self._define_ai_thresholds()
        self.natural_voice_thresholds = self._define_natural_voice_thresholds()

    def _define_ai_thresholds(self) -> Dict[str, ScoreInterpretation]:
        """Define AI detection score thresholds and interpretations."""
        return {
            "0-10": ScoreInterpretation(
                category=ScoreCategory.EXCELLENT,
                description="Minimal AI patterns detected - excellent natural flow",
                recommendation="Content passes with flying colors",
                is_passing=True,
                color_code="🟢",
                emoji="✨"
            ),
            "11-25": ScoreInterpretation(
                category=ScoreCategory.GOOD,
                description="Low AI patterns - good natural writing",
                recommendation="Content passes target threshold",
                is_passing=True,
                color_code="🟡",
                emoji="✅"
            ),
            "26-40": ScoreInterpretation(
                category=ScoreCategory.ACCEPTABLE,
                description="Some AI patterns detected - needs refinement",
                recommendation="Improve with Natural Voice enhancement",
                is_passing=False,
                color_code="🟠",
                emoji="⚠️"
            ),
            "41-60": ScoreInterpretation(
                category=ScoreCategory.POOR,
                description="Clear AI patterns - robotic language detected",
                recommendation="Requires significant creative improvement",
                is_passing=False,
                color_code="🔴",
                emoji="🤖"
            ),
            "61-100": ScoreInterpretation(
                category=ScoreCategory.CRITICAL,
                description="Heavy AI patterns - extremely robotic",
                recommendation="Complete rewrite with high creativity temperature",
                is_passing=False,
                color_code="🔴",
                emoji="🚨"
            )
        }

    def _define_natural_voice_thresholds(self) -> Dict[str, ScoreInterpretation]:
        """
        Define Natural Voice score thresholds and interpretations.
        
        CRITICAL PHILOSOPHY:
        - Low scores (0-14%): Too artificial, lacks authentic professional voice
        - Optimal scores (15-25%): AUTHENTIC professional expertise with natural flow
        - High scores (40-100%): FORCED HUMANIZATION - excessive casual language, trying too hard
        
        Natural Voice is NOT about sounding casual or colloquial.
        It's about authentic professional expertise expressed naturally.
        """
        return {
            "0-9": ScoreInterpretation(
                category=ScoreCategory.POOR,
                description="Too artificial - lacks authentic professional voice and expertise markers",
                recommendation="Add natural expertise indicators, industry-specific insights, and professional flow",
                is_passing=False,
                color_code="🔵",
                emoji="🎭"
            ),
            "10-14": ScoreInterpretation(
                category=ScoreCategory.ACCEPTABLE,
                description="Some professional authenticity but needs more natural expertise flow",
                recommendation="Enhance with genuine industry knowledge and natural technical language",
                is_passing=False,
                color_code="🟡",
                emoji="📝"
            ),
            "15-25": ScoreInterpretation(
                category=ScoreCategory.EXCELLENT,
                description="EXCELLENT - Authentic professional voice with natural expertise and credible flow",
                recommendation="Perfect balance of technical knowledge and natural expression",
                is_passing=True,
                color_code="🟢",
                emoji="🎯"
            ),
            "26-39": ScoreInterpretation(
                category=ScoreCategory.GOOD,
                description="Good professional authenticity with minor over-casualness",
                recommendation="Reduce excessive casual language while maintaining natural flow",
                is_passing=True,
                color_code="🟢",
                emoji="✅"
            ),
            "40-59": ScoreInterpretation(
                category=ScoreCategory.POOR,
                description="FORCED HUMANIZATION detected - excessive casual language, trying too hard",
                recommendation="Reduce exaggerated casual tone, maintain professional credibility",
                is_passing=False,
                color_code="�",
                emoji="⚠️"
            ),
            "60-100": ScoreInterpretation(
                category=ScoreCategory.CRITICAL,
                description="SEVERE over-humanization - sounds fake, forced, and unprofessional",
                recommendation="Complete rewrite with authentic professional voice, avoid humanization tricks",
                is_passing=False,
                color_code="🔴",
                emoji="🚨"
            )
                description="Good authenticity but could be more natural",
                recommendation="Add more professional insights and natural rhythm",
                is_passing=False,
                color_code="🟡",
                emoji="📝"
            ),
            "15-25": ScoreInterpretation(
                category=ScoreCategory.EXCELLENT,
                description="Excellent authentic professional voice",
                recommendation="Perfect range - maintain this natural authenticity",
                is_passing=True,
                color_code="🟢",
                emoji="🎯"
            ),
            "26-35": ScoreInterpretation(
                category=ScoreCategory.ACCEPTABLE,
                description="Good but slightly over-emphasized",
                recommendation="Reduce dramatic elements while keeping authenticity",
                is_passing=False,
                color_code="🟠",
                emoji="⚖️"
            ),
            "36-100": ScoreInterpretation(
                category=ScoreCategory.POOR,
                description="Over-humanized with exaggerated characteristics",
                recommendation="Reduce temperature and remove dramatic humanization",
                is_passing=False,
                color_code="🔴",
                emoji="🎪"
            )
        }

    def interpret_ai_score(self, score: int) -> ScoreInterpretation:
        """Interpret an AI detection score."""
        for range_key, interpretation in self.ai_thresholds.items():
            min_score, max_score = map(int, range_key.split('-'))
            if min_score <= score <= max_score:
                return interpretation
        
        # Fallback for edge cases
        return self.ai_thresholds["61-100"]

    def interpret_natural_voice_score(self, score: int) -> ScoreInterpretation:
        """Interpret a Natural Voice score."""
        for range_key, interpretation in self.natural_voice_thresholds.items():
            min_score, max_score = map(int, range_key.split('-'))
            if min_score <= score <= max_score:
                return interpretation
        
        # Fallback for edge cases
        return self.natural_voice_thresholds["36-100"]

    def get_combined_assessment(
        self, 
        ai_score: int, 
        natural_voice_score: int
    ) -> Tuple[bool, str, str]:
        """
        Get combined assessment of both AI and Natural Voice scores.
        
        Returns:
            Tuple of (is_passing, summary, detailed_feedback)
        """
        ai_interp = self.interpret_ai_score(ai_score)
        nv_interp = self.interpret_natural_voice_score(natural_voice_score)
        
        # Both must pass for overall success
        is_passing = ai_interp.is_passing and nv_interp.is_passing
        
        # Create summary
        if is_passing:
            summary = f"✅ EXCELLENT - Both scores in target ranges"
            emoji = "🎉"
        elif ai_interp.is_passing and not nv_interp.is_passing:
            summary = f"⚠️ AI GOOD, Natural Voice needs work"
            emoji = "👤"
        elif not ai_interp.is_passing and nv_interp.is_passing:
            summary = f"⚠️ Natural Voice GOOD, AI patterns need reduction"
            emoji = "🤖"
        else:
            summary = f"❌ Both scores need improvement"
            emoji = "🔧"
        
        # Create detailed feedback
        detailed_feedback = (
            f"{emoji} Combined Assessment:\n"
            f"🤖 AI Detection: {ai_score}% - {ai_interp.description}\n"
            f"👤 Natural Voice: {natural_voice_score}% - {nv_interp.description}\n"
            f"📋 AI Recommendation: {ai_interp.recommendation}\n"
            f"📋 Natural Voice Recommendation: {nv_interp.recommendation}"
        )
        
        return is_passing, summary, detailed_feedback

    def display_score_breakdown(self, ai_score: int, natural_voice_score: int):
        """Display a visual breakdown of both scores."""
        ai_interp = self.interpret_ai_score(ai_score)
        nv_interp = self.interpret_natural_voice_score(natural_voice_score)
        
        print("\n📊 SCORE BREAKDOWN:")
        print("=" * 50)
        
        # AI Detection display
        ai_bar = "■" * (ai_score // 10) + "□" * (10 - ai_score // 10)
        print(f"🤖 AI Detection: {ai_score}% [{ai_bar}] {ai_interp.color_code} {ai_interp.emoji}")
        print(f"   {ai_interp.description}")
        print(f"   💡 {ai_interp.recommendation}")
        
        print()
        
        # Natural Voice display
        nv_bar = "■" * (natural_voice_score // 10) + "□" * (10 - natural_voice_score // 10)
        print(f"👤 Natural Voice: {natural_voice_score}% [{nv_bar}] {nv_interp.color_code} {nv_interp.emoji}")
        print(f"   {nv_interp.description}")
        print(f"   💡 {nv_interp.recommendation}")
        
        print()
        
        # Combined result
        is_passing, summary, _ = self.get_combined_assessment(ai_score, natural_voice_score)
        print(f"🎯 OVERALL: {summary}")
        print("=" * 50)

    def get_improvement_strategy(
        self, 
        ai_score: int, 
        natural_voice_score: int
    ) -> Dict[str, str]:
        """Get specific improvement strategy based on current scores."""
        ai_interp = self.interpret_ai_score(ai_score)
        nv_interp = self.interpret_natural_voice_score(natural_voice_score)
        
        strategy = {}
        
        # AI-specific strategies
        if ai_score > 40:
            strategy["ai_focus"] = "high_creativity"
            strategy["ai_temp"] = "0.8-1.0"
            strategy["ai_prompts"] = "Use breakthrough prompts with varied structure"
        elif ai_score > 25:
            strategy["ai_focus"] = "moderate_creativity"
            strategy["ai_temp"] = "0.6-0.8"
            strategy["ai_prompts"] = "Add natural variations and examples"
        else:
            strategy["ai_focus"] = "maintain"
            strategy["ai_temp"] = "current"
            strategy["ai_prompts"] = "Continue current approach"
        
        # Natural Voice specific strategies
        if natural_voice_score < 15:
            strategy["nv_focus"] = "increase_authenticity"
            strategy["nv_temp"] = "0.7-0.9"
            strategy["nv_prompts"] = "Add professional insights and natural expertise"
        elif natural_voice_score > 25:
            strategy["nv_focus"] = "reduce_dramatization"
            strategy["nv_temp"] = "0.4-0.6"
            strategy["nv_prompts"] = "Tone down dramatic elements, keep professional"
        else:
            strategy["nv_focus"] = "maintain"
            strategy["nv_temp"] = "current"
            strategy["nv_prompts"] = "Perfect range - maintain approach"
        
        return strategy

    def should_continue_iterations(
        self, 
        ai_score: int, 
        natural_voice_score: int, 
        iteration: int, 
        max_iterations: int
    ) -> Tuple[bool, str]:
        """Determine if iterations should continue based on scores."""
        is_passing, summary, _ = self.get_combined_assessment(ai_score, natural_voice_score)
        
        if is_passing:
            return False, f"✅ Target achieved - both scores in optimal ranges"
        
        if iteration >= max_iterations:
            return False, f"⏰ Max iterations reached ({max_iterations})"
        
        # Check if we're making progress or stuck
        if iteration > 3:
            # Would need score history to determine if stuck
            return True, f"🔄 Continue - iteration {iteration}/{max_iterations}"
        
        return True, f"🔄 Continue improving - iteration {iteration}/{max_iterations}"
