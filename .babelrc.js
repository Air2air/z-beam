// Babel configuration for Jest testing only
// Next.js uses SWC compiler by default (no Babel during build)
// This config is only used when NODE_ENV=test (Jest)

module.exports = {
  presets: [
    // Only use babel during test environment
    ...(process.env.NODE_ENV === 'test' 
      ? ['next/babel']
      : []
    )
  ]
};
