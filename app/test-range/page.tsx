// Quick test page for property search functionality
import Link from 'next/link';

export default function TestRangePage() {
  // Test data for display
  const testValues = [
    '2.7g/cm³',
    '2.6-2.7g/cm³', 
    '2.4-2.8…',
    '150°C',
    '670-750°C',
    'High',
    'Crystalline'
  ];
  
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Property Search Test Page</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Sample Property Values</h2>
        <div className="space-y-2">
          {testValues.map((value, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded">
              <div className="font-mono text-sm">
                <strong>Property Value:</strong> &quot;{value}&quot;
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Test Property Search Links</h2>
        <div className="space-y-2">
          <div>
            <Link href="/search?property=Density&value=2.4-2.8" className="text-blue-600 hover:underline">
              Test Search: Density 2.4-2.8
            </Link>
          </div>
          <div>
            <Link href="/search?property=Density&value=2.7g/cm³" className="text-blue-600 hover:underline">
              Test Search: Density 2.7g/cm³
            </Link>
          </div>
          <div>
            <Link href="/search?property=Tensile&value=276MPa" className="text-blue-600 hover:underline">
              Test Search: Tensile 276MPa
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}