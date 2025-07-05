#!/usr/bin/env python3
"""
Anti-Hardcoding Linter

Scans the codebase for hardcoded configuration values and suggests fixes.
Run this regularly to prevent Claude from hardcoding values!
"""

import os
import re
import sys
from typing import List, Tuple, Dict


class HardcodingDetector:
    """Detects hardcoded configuration values in Python files."""
    
    def __init__(self, generator_dir: str):
        self.generator_dir = generator_dir
        self.violations: List[Tuple[str, int, str, str]] = []
        
        # Patterns that indicate hardcoded values
        self.hardcoded_patterns = [
            # Temperature values
            (r'temperature.*=.*[0-9]\.[0-9]', 'hardcoded_temperature', 
             'Use get_config().get_*_temperature() instead'),
            
            # Threshold values
            (r'threshold.*=.*[0-9]+', 'hardcoded_threshold',
             'Use get_config().get_ai_detection_threshold() or get_natural_voice_threshold()'),
            
            # Iteration values
            (r'iterations.*=.*[0-9]+', 'hardcoded_iterations',
             'Use get_config().get_iterations_per_section()'),
            
            # Word limits
            (r'max.*words.*=.*[0-9]+', 'hardcoded_word_limit',
             'Use get_config().get_max_article_words()'),
             
            # API timeouts
            (r'timeout.*=.*[0-9]+', 'hardcoded_timeout',
             'Use get_config().get_api_timeout()'),
            
            # Common hardcoded values in function calls
            (r'temperature\s*=\s*0\.[0-9]+', 'hardcoded_temp_param',
             'Use temperature from get_config().get_temperature_config()'),
             
            (r'ai_threshold\s*=\s*[0-9]+', 'hardcoded_ai_threshold',
             'Use get_config().get_ai_detection_threshold()'),
             
            (r'human_threshold\s*=\s*[0-9]+', 'hardcoded_human_threshold', 
             'Use get_config().get_natural_voice_threshold()'),
             
            # API Providers (hardcoded strings)
            (r'["\']anthropic["\']', 'hardcoded_provider',
             'Use get_config().get_provider() instead'),
             
            (r'["\']openai["\']', 'hardcoded_provider',
             'Use get_config().get_provider() instead'),
             
            (r'["\']google["\']', 'hardcoded_provider',
             'Use get_config().get_provider() instead'),
             
            (r'["\']groq["\']', 'hardcoded_provider',
             'Use get_config().get_provider() instead'),
             
            # Model names (hardcoded strings)
            (r'["\']claude-3-5-sonnet["\']', 'hardcoded_model',
             'Use get_config().get_model() instead'),
             
            (r'["\']gpt-4["\']', 'hardcoded_model',
             'Use get_config().get_model() instead'),
             
            (r'["\']gemini["\']', 'hardcoded_model',
             'Use get_config().get_model() instead'),
             
            (r'["\']llama["\']', 'hardcoded_model',
             'Use get_config().get_model() instead'),
             
            # API URLs (hardcoded strings)
            (r'["\']https://api\.anthropic\.com["\']', 'hardcoded_api_url',
             'Use get_config().get_api_url() instead'),
             
            (r'["\']https://api\.openai\.com["\']', 'hardcoded_api_url',
             'Use get_config().get_api_url() instead'),
             
            (r'["\']https://api\.groq\.com["\']', 'hardcoded_api_url',
             'Use get_config().get_api_url() instead'),
             
            # Provider assignments
            (r'provider\s*=\s*["\'][^"\']+["\']', 'hardcoded_provider_assignment',
             'Use provider=get_config().get_provider() instead'),
             
            # Model assignments
            (r'model\s*=\s*["\'][^"\']+["\']', 'hardcoded_model_assignment',
             'Use model=get_config().get_model() instead'),
             
            # API key patterns (security risk)
            (r'api_key\s*=\s*["\'][^"\']+["\']', 'hardcoded_api_key',
             'SECURITY RISK: Use environment variables or get_config()'),
             
            # Base URL assignments
            (r'base_url\s*=\s*["\']https://[^"\']+["\']', 'hardcoded_base_url',
             'Use base_url=get_config().get_api_url() instead'),
        ]
        
        # Files to exclude from checking
        self.excluded_files = {
            'config/global_config.py',  # This file is allowed to have defaults
            'config/settings.py',       # Legacy settings file
            'tests/',                   # Test files can have hardcoded values
            'scripts/',                 # Utility scripts
        }
    
    def should_exclude_file(self, file_path: str) -> bool:
        """Check if file should be excluded from hardcoding detection."""
        rel_path = os.path.relpath(file_path, self.generator_dir)
        
        for excluded in self.excluded_files:
            if rel_path.startswith(excluded) or excluded in rel_path:
                return True
        
        return False
    
    def scan_file(self, file_path: str) -> List[Tuple[int, str, str]]:
        """Scan a single file for hardcoded values."""
        violations = []
        
        if self.should_exclude_file(file_path):
            return violations
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
        except Exception as e:
            print(f"Warning: Could not read {file_path}: {e}")
            return violations
        
        for line_num, line in enumerate(lines, 1):
            line = line.strip()
            
            # Skip comments and docstrings
            if line.startswith('#') or '"""' in line or "'''" in line:
                continue
            
            # Check each hardcoding pattern
            for pattern, violation_type, suggestion in self.hardcoded_patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    violations.append((line_num, line, suggestion))
        
        return violations
    
    def scan_directory(self) -> None:
        """Scan the entire generator directory for hardcoded values."""
        print("🔍 Scanning for hardcoded configuration values...")
        print("=" * 60)
        
        python_files = []
        for root, dirs, files in os.walk(self.generator_dir):
            for file in files:
                if file.endswith('.py'):
                    python_files.append(os.path.join(root, file))
        
        total_violations = 0
        
        for file_path in python_files:
            violations = self.scan_file(file_path)
            
            if violations:
                rel_path = os.path.relpath(file_path, self.generator_dir)
                print(f"\n❌ {rel_path}")
                print("-" * 40)
                
                for line_num, line, suggestion in violations:
                    print(f"  Line {line_num}: {line}")
                    print(f"    💡 {suggestion}")
                    print()
                    total_violations += 1
        
        if total_violations == 0:
            print("✅ No hardcoded configuration values found!")
        else:
            print(f"\n💥 Found {total_violations} hardcoded configuration values!")
            print("\n🔧 How to fix:")
            print("1. Import: from config.global_config import get_config")
            print("2. Replace hardcoded values with get_config().get_*() calls")
            print("3. Run this tool again to verify fixes")
    
    def generate_fix_suggestions(self) -> Dict[str, str]:
        """Generate specific fix suggestions for common patterns."""
        return {
            # Temperature fixes
            "temperature=0.3": "temperature=get_config().get_detection_temperature()",
            "temperature=0.6": "temperature=get_config().get_content_temperature()",
            "temperature=0.7": "temperature=get_config().get_improvement_temperature()",
            
            # Threshold fixes
            "ai_threshold=25": "ai_threshold=get_config().get_ai_detection_threshold()",
            "human_threshold=25": "human_threshold=get_config().get_natural_voice_threshold()",
            
            # Configuration fixes
            "iterations_per_section=3": "iterations_per_section=get_config().get_iterations_per_section()",
            "max_article_words=1200": "max_article_words=get_config().get_max_article_words()",
            "timeout=60": "timeout=get_config().get_api_timeout()",
            
            # Provider fixes
            'provider="anthropic"': "provider=get_config().get_provider()",
            'provider="openai"': "provider=get_config().get_provider()",
            'provider="google"': "provider=get_config().get_provider()",
            'provider="groq"': "provider=get_config().get_provider()",
            
            # Model fixes
            'model="claude-3-5-sonnet"': "model=get_config().get_model()",
            'model="gpt-4"': "model=get_config().get_model()",
            'model="gemini"': "model=get_config().get_model()",
            
            # API URL fixes
            'base_url="https://api.anthropic.com"': "base_url=get_config().get_api_url()",
            'base_url="https://api.openai.com"': "base_url=get_config().get_api_url()",
            'base_url="https://api.groq.com"': "base_url=get_config().get_api_url()",
        }


def main():
    """Main entry point for the hardcoding detector."""
    # Setup paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    generator_dir = os.path.dirname(script_dir)  # Parent of scripts directory
    
    if not os.path.exists(generator_dir):
        print(f"❌ Generator directory not found: {generator_dir}")
        sys.exit(1)
    
    detector = HardcodingDetector(generator_dir)
    detector.scan_directory()
    
    print("\n" + "=" * 60)
    print("🎯 PREVENTION TIPS:")
    print("• Always use get_config() for configuration values")
    print("• Never hardcode thresholds, temperatures, or limits")
    print("• Add @requires_config decorator to functions needing config")
    print("• Run this tool before committing code changes")
    
    fix_suggestions = detector.generate_fix_suggestions()
    if fix_suggestions:
        print("\n🔧 COMMON FIXES:")
        for wrong, right in fix_suggestions.items():
            print(f"  ❌ {wrong}")
            print(f"  ✅ {right}")
            print()


if __name__ == "__main__":
    main()
