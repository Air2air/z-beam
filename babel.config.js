module.exports = function (api) {
  // Cache the config based on the environment
  api.cache.using(() => process.env.NODE_ENV);
  
  // Only use Babel when running tests
  // Next.js will use SWC for builds
  if (process.env.NODE_ENV === 'test') {
    return {
      presets: ['next/babel']
    };
  }
  
  // Return empty config for builds (Next.js will use SWC)
  return {};
};
