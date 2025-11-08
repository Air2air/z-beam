// MetricsCard Usage Examples
// ⚠️ DEPRECATED: These components have been replaced by PropertyBars
// See: app/components/PropertyBars/README.md
import React from 'react';
import { MetricsCard } from '../_deprecated/MetricsCard/MetricsCard';
import { MetricsGrid } from '../_deprecated/MetricsCard/MetricsGrid';
import { ArticleMetadata } from '@/types';

// Example metadata with machine settings
const exampleMetadata: ArticleMetadata = {
  title: "Aluminum 6061-T6 Laser Processing",
  description: "Precision laser processing parameters for aluminum 6061-T6",
  tags: ["aluminum", "aerospace", "precision"],
  slug: "aluminum-6061-laser-processing",
  machineSettings: {
    power: {
      numeric: 80,
      units: 'W',
      range: { min: 20, max: 500 }
    },
    wavelength: {
      numeric: 1064,
      units: 'nm',
      range: { min: 355, max: 2940 }
    },
    frequency: {
      numeric: 20,
      units: 'kHz',
      range: { min: 1, max: 1000 }
    },
    pulseWidth: {
      numeric: 10,
      units: 'ns',
      range: { min: 1, max: 1000 }
    },
    spotSize: {
      numeric: 2.0,
      units: 'mm',
      range: { min: 0.01, max: 10.0 }
    },
    speed: {
      numeric: 1500,
      units: 'mm/min',
      range: { min: 100, max: 5000 }
    }
  }
};

export function MetricsCardExamples() {
  const baseHref = "/materials/aluminum-6061";

  return (
    <div className="space-y-12 max-w-6xl mx-auto p-6">
      
      {/* Full MetricsCard with all options */}
      <section>
        <h2 className="mb-4">Full MetricsCard</h2>
        <MetricsGrid
          metadata={exampleMetadata}
          baseHref={baseHref}
          title="Machine Settings"
          description="Optimized laser parameters for aluminum 6061-T6 processing"
          layout="auto"
          maxCards={6}
          showTitle={true}
          className="bg-white dark:bg-gray-900 p-6 rounded-lg border"
        />
      </section>

      {/* Primary MetricsCard - Essential settings only */}
      <section>
        <h2 className="mb-4">Primary MetricsCard</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Shows only priority 1 settings (Power, Wavelength, Fluence)
        </p>
        <MetricsGrid
          metadata={exampleMetadata}
          baseHref={baseHref}
          title="Primary Settings"
          maxCards={3}
          className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg"
        />
      </section>

      {/* Compact MetricsCard - 2x2 grid */}
      <section>
        <h2 className="mb-4">Compact MetricsCard</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Space-efficient 2-column layout for key parameters
        </p>
        <MetricsGrid
          metadata={exampleMetadata}
          baseHref={baseHref}
          title="Primary Settings"
          maxCards={4}
          layout="grid-2"
          className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg"
        />
      </section>

      {/* Minimal MetricsCard - No title */}
      <section>
        <h2 className="mb-4">Minimal MetricsCard</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Clean display without section title, perfect for embedding
        </p>
        <MetricsGrid
          metadata={exampleMetadata}
          baseHref={baseHref}
          showTitle={false}
          maxCards={3}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 rounded-lg"
        />
      </section>

      {/* Custom configuration examples */}
      <section>
        <h2 className="mb-4">Custom Configurations</h2>
        
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Grid-2 layout */}
          <div>
            <h3 className="mb-2">Grid-2 Layout</h3>
            <MetricsGrid
              metadata={exampleMetadata}
              baseHref={baseHref}
              title="Key Parameters"
              layout="grid-2"
              maxCards={4}
              className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg"
            />
          </div>
          
          {/* Grid-3 layout */}
          <div>
            <h3 className="mb-2">Grid-3 Layout</h3>
            <MetricsGrid
              metadata={exampleMetadata}
              baseHref={baseHref}
              title="All Settings"
              layout="grid-3"
              maxCards={6}
              showTitle={false}
              className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Priority filtering examples */}
      <section>
        <h2 className="mb-4">Priority Filtering</h2>
        
        <div className="space-y-6">
          {/* Priority 1 only */}
          <div>
            <h3 className="mb-2">Priority 1 Only (Essential)</h3>
            <MetricsGrid
              metadata={exampleMetadata}
              baseHref={baseHref}
              title="Essential Settings"
              description="Critical parameters for successful processing"
              layout="grid-3"
              className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg"
            />
          </div>
          
          {/* Priority 2 only */}
          <div>
            <h3 className="mb-2">Priority 2 Only (Important)</h3>
            <MetricsGrid
              metadata={exampleMetadata}
              baseHref={baseHref}
              title="Advanced Settings"
              description="Fine-tuning parameters for optimal results"
              layout="grid-3"
              className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Error handling example */}
      <section>
        <h2 className="mb-4">Error Handling</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Shows fallback message when no machine settings are available
        </p>
        <MetricsGrid
          metadata={{ 
            ...exampleMetadata, 
            machineSettings: undefined 
          } as ArticleMetadata}
          baseHref={baseHref}
          className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg"
        />
      </section>

      {/* Empty settings example */}
      <section>
        <h2 className="mb-4">Empty Settings Handling</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Shows message when settings exist but no matching cards are found
        </p>
        <MetricsGrid
          metadata={{
            ...exampleMetadata,
            machineSettings: {
              someOtherSetting: 'value',
              anotherSetting: 123
            }
          } as ArticleMetadata}
          baseHref={baseHref}
          className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg"
        />
      </section>

    </div>
  );
}

// Usage in a Next.js page
export function ExamplePage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto py-12">
        <h1 className="text-center mb-12 text-gray-900 dark:text-gray-100">
          MetricsCard Component Examples
        </h1>
        <MetricsCardExamples />
      </div>
    </div>
  );
}

export default MetricsCardExamples;