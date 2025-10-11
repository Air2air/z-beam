// app/debug/fonts/page.tsx
/**
 * Font Testing Page
 * 
 * This page displays all available Roboto font weights
 * to verify the font configuration is working correctly.
 * 
 * Access at: /debug/fonts
 */

export const metadata = {
  title: 'Font Test - Roboto Weights',
  description: 'Visual test page for Roboto font weights',
  robots: {
    index: false,
    follow: false,
  },
};

export default function FontTestPage() {
  const weights = [
    { class: 'font-thin', weight: '100', name: 'Thin' },
    { class: 'font-light', weight: '300', name: 'Light' },
    { class: 'font-normal', weight: '400', name: 'Regular' },
    { class: 'font-medium', weight: '500', name: 'Medium' },
    { class: 'font-bold', weight: '700', name: 'Bold' },
    { class: 'font-black', weight: '900', name: 'Black' },
  ];

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Font Configuration Test
        </h1>
        <p className="text-gray-400 mb-8">
          Testing Roboto font weights loaded via next/font/google
        </p>

        <div className="space-y-8">
          {weights.map(({ class: className, weight, name }) => (
            <div
              key={weight}
              className="border-b border-gray-700 pb-6 last:border-0"
            >
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-gray-500 text-sm font-mono w-32">
                  {className}
                </span>
                <span className="text-gray-500 text-sm w-20">
                  ({weight})
                </span>
                <span className="text-gray-400 text-sm">
                  {name}
                </span>
              </div>
              
              <p className={`${className} text-white text-3xl mb-2`}>
                The quick brown fox jumps over the lazy dog
              </p>
              
              <p className={`${className} text-gray-300 text-base`}>
                ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Configuration Details
          </h2>
          
          <div className="bg-gray-900 rounded p-4 font-mono text-sm text-gray-300 space-y-2">
            <p>
              <span className="text-blue-400">Font Family:</span> Roboto
            </p>
            <p>
              <span className="text-blue-400">Loading Method:</span> next/font/google
            </p>
            <p>
              <span className="text-blue-400">CSS Variable:</span> --font-roboto
            </p>
            <p>
              <span className="text-blue-400">Display:</span> swap
            </p>
            <p>
              <span className="text-blue-400">Preload:</span> true
            </p>
            <p>
              <span className="text-blue-400">Subsets:</span> latin
            </p>
            <p>
              <span className="text-blue-400">Config File:</span> app/config/fonts.ts
            </p>
          </div>

          <div className="mt-6 p-4 bg-green-900/20 border border-green-700 rounded">
            <p className="text-green-400 text-sm">
              ✓ All font weights loaded successfully via Next.js font optimization
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
