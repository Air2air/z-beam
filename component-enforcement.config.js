// component-enforcement.config.js
// Configuration for component reusability enforcement system
// Modify this file to adjust rules and safety mechanisms

module.exports = {
  // SAFETY MECHANISMS
  safety: {
    // Enable safety mode (provides helpful guidance when violations are found)
    enabled: true,
    
    // Auto-detect potential shared components (files with "Component", "Button", etc. in name)
    autoDetectSharedComponents: true,
    
    // Suggest safe component creation when violations are found
    suggestSafeCreation: true,
    
    // Allow emergency bypass with detailed logging
    allowEmergencyBypass: true
  },

  // ENFORCEMENT THRESHOLDS
  thresholds: {
    // CRITICAL - Build fails if exceeded (set to -1 to disable)
    badge: {
      hardcodedMax: 0,        // No hardcoded badges allowed
      description: 'Badge/tag hardcoded implementations'
    },
    button: {
      hardcodedMax: 1,        // Max 1 hardcoded button (for emergency cases)
      description: 'Button hardcoded implementations'
    },
    card: {
      hardcodedMax: 1,        // Max 1 hardcoded card (for emergency cases)  
      description: 'Card hardcoded implementations'
    },
    
    // WARNING - Generates warnings only (set to -1 to disable)
    patterns: {
      bgTextWarning: 10,      // Warn if >10 bg/text patterns
      paddingWarning: 15,     // Warn if >15 padding patterns
      description: 'Style pattern warnings'
    }
  },

  // EXCLUDED FILES - These files are allowed to have "violation" patterns
  excludedFiles: [
    // Shared components (these SHOULD have the patterns)
    'app/components/SmartTagList.tsx', 
    'app/components/Button.tsx',
    'app/components/Card.tsx',
    'app/components/Input.tsx',
    'app/components/Badge.tsx',
    'app/components/ActionButton.tsx',
    'app/components/Container.tsx',
    
    // Design system components
    'app/components/ui/',
    'app/components/primitives/',
    
    // Temporary exclusions (remove these after refactoring)
    // 'app/components/LegacyComponent.tsx'  // Example - document why excluded
  ],

  // VIOLATION PATTERNS - Patterns that indicate component duplication
  patterns: {
    badge: [
      'px-.*py-.*rounded-full.*bg-blue-100',
      'bg-blue-100.*px-.*py-.*rounded-full',
      'inline-block.*px-.*py-.*rounded-full.*bg-'
    ],
    button: [
      'px-.*py-.*bg-blue-600.*hover:',
      'bg-blue-600.*px-.*py-.*hover:'
    ],
    card: [
      'bg-white.*rounded-lg.*shadow-',
      'rounded-lg.*shadow-.*bg-white'
    ]
  },

  // ALLOWED SHARED COMPONENT PATTERNS - These are GOOD
  allowedPatterns: {
    sharedComponents: [
      'app/components/SmartTagList.tsx',
      'app/components/Badge.tsx',
      'app/components/Button.tsx',
      'app/components/ActionButton.tsx',
      'app/components/Container.tsx'
    ],
    
    // File patterns that are automatically considered safe
    autoSafePatterns: [
      'Component.tsx',    // Any file ending in Component.tsx
      'Button.tsx',       // Any file ending in Button.tsx
      'Card.tsx',         // Any file ending in Card.tsx
      'Badge.tsx',        // Any file ending in Badge.tsx
      '/ui/',             // Any file in ui/ directory
      '/primitives/'      // Any file in primitives/ directory
    ]
  },

  // MESSAGES
  messages: {
    safetyGuidance: {
      newComponent: 'If creating a NEW shared component, use: node safe-component-creation.js <Name>',
      temporaryBypass: 'To temporarily bypass (NOT RECOMMENDED): npm run build:skip-check',
      addExclusion: 'To add legitimate exclusion: Edit excludedFiles in component-enforcement.config.js',
      documentation: 'Review REQUIREMENTS.md section 2 for detailed guidance'
    },
    
    violations: {
      badge: 'Replace hardcoded badge implementations with SmartTagList or create shared Badge component',
      button: 'Replace hardcoded button implementations with shared Button component',
      card: 'Replace hardcoded card implementations with shared Container component'
    }
  },

  // DEVELOPMENT AIDS
  development: {
    // Show helpful suggestions when violations are found
    showSuggestions: true,
    
    // Provide links to documentation
    showDocumentationLinks: true,
    
    // Show examples of correct implementations
    showExamples: true,
    
    // Enable verbose logging for debugging
    verbose: false
  }
};
