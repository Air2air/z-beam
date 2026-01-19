/**
 * @file BaseSection Usage Examples
 * @purpose Demonstrates the consolidated section component patterns
 * 
 * This file shows how BaseSection replaces and unifies patterns from:
 * - SectionContainer
 * - GridSection
 * - ContentSection
 * - LinkageSection
 */

import React from 'react';
import { BaseSection } from '@/app/components/BaseSection';
import { AlertTriangle, Download } from 'lucide-react';
import { Button } from '@/app/components/Button';

// ============================================================================
// EXAMPLE 1: Basic Section (replaces simple SectionContainer usage)
// ============================================================================
export function BasicSectionExample() {
  return (
    <BaseSection title="Related Materials">
      <p>This is a basic section with just a title and content.</p>
    </BaseSection>
  );
}

// ============================================================================
// EXAMPLE 2: Section with Description (replaces GridSection pattern)
// ============================================================================
export function SectionWithDescriptionExample() {
  return (
    <BaseSection
      title="Machine Settings"
      description="Optimal laser parameters for this material, verified by industry experts"
      spacing="loose"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>Setting 1</div>
        <div>Setting 2</div>
      </div>
    </BaseSection>
  );
}

// ============================================================================
// EXAMPLE 3: Dark Variant with Icon (replaces SectionContainer dark variant)
// ============================================================================
export function DarkVariantExample() {
  return (
    <BaseSection
      title="Safety Information"
      icon={<AlertTriangle className="w-5 h-5" />}
      variant="dark"
      description="Critical safety warnings for laser cleaning operations"
    >
      <ul className="space-y-2 text-gray-200">
        <li>Always wear protective eyewear</li>
        <li>Ensure proper ventilation</li>
        <li>Follow manufacturer guidelines</li>
      </ul>
    </BaseSection>
  );
}

// ============================================================================
// EXAMPLE 4: Card Variant (new capability)
// ============================================================================
export function CardVariantExample() {
  return (
    <BaseSection
      title="Key Highlights"
      variant="card"
      spacing="normal"
    >
      <div className="space-y-3">
        <p>✓ High precision cleaning</p>
        <p>✓ No chemical residue</p>
        <p>✓ Environmentally friendly</p>
      </div>
    </BaseSection>
  );
}

// ============================================================================
// EXAMPLE 5: Section with Action Button (enhanced pattern)
// ============================================================================
export function SectionWithActionExample() {
  return (
    <BaseSection
      title="Dataset Downloads"
      description="Machine learning ready datasets for material analysis"
      action={
        <Button variant="primary" size="md" href="/downloads">
          <Download className="w-4 h-4 mr-2" />
          Download CSV
        </Button>
      }
      spacing="normal"
    >
      <div className="bg-gray-50 rounded-md p-4">
        <p>Preview of dataset (1,234 samples)</p>
      </div>
    </BaseSection>
  );
}

// ============================================================================
// EXAMPLE 6: Minimal Variant (replaces ContentSection pattern)
// ============================================================================
export function MinimalVariantExample() {
  return (
    <BaseSection
      title="Our Process"
      variant="minimal"
      spacing="none"
    >
      <div className="space-y-8">
        {/* Custom styled content cards */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="font-bold">Step 1</h3>
          <p>Initial consultation and assessment</p>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h3 className="font-bold">Step 2</h3>
          <p>Laser parameter optimization</p>
        </div>
      </div>
    </BaseSection>
  );
}

// ============================================================================
// EXAMPLE 7: Complex Section with Multiple Features
// ============================================================================
export function ComplexSectionExample() {
  return (
    <BaseSection
      title="Comprehensive Material Analysis"
      description="Complete dataset including properties, settings, and regulatory information"
      icon={<Download className="w-5 h-5" />}
      action={
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" href="/preview">Preview</Button>
          <Button variant="primary" size="sm" href="/download">Download</Button>
        </div>
      }
      variant="card"
      spacing="loose"
      bgColor="gray-50"
      horizPadding={true}
      rounded={true}
    >
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center">
          <div className="text-2xl font-bold">1,234</div>
          <div className="text-sm text-gray-600">Data Points</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">42</div>
          <div className="text-sm text-gray-600">Properties</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">15</div>
          <div className="text-sm text-gray-600">Standards</div>
        </div>
      </div>
    </BaseSection>
  );
}

// ============================================================================
// EXAMPLE 8: Section with Custom ID and Alignment
// ============================================================================
export function CustomizedSectionExample() {
  return (
    <BaseSection
      id="custom-analysis-section"
      title="Analysis Results"
      alignment="center"
      spacing="tight"
    >
      <div className="text-center">
        <p>Centered content with custom section ID for deep linking</p>
      </div>
    </BaseSection>
  );
}

// ============================================================================
// MIGRATION COMPARISON
// ============================================================================

/**
 * BEFORE (using GridSection):
 * 
 * <GridSection title="Title" description="Description">
 *   <DataGrid items={items} />
 * </GridSection>
 * 
 * AFTER (using BaseSection):
 * 
 * <BaseSection title="Title" description="Description" spacing="loose">
 *   <DataGrid items={items} />
 * </BaseSection>
 */

/**
 * BEFORE (using SectionContainer):
 * 
 * <SectionContainer title="Title" variant="dark" horizPadding={true}>
 *   {children}
 * </SectionContainer>
 * 
 * AFTER (using BaseSection):
 * 
 * <BaseSection title="Title" variant="dark" horizPadding={true} spacing="tight">
 *   {children}
 * </BaseSection>
 */

/**
 * BEFORE (using ContentSection):
 * 
 * <section className="content-section">
 *   <h2 className="text-3xl font-bold">Title</h2>
 *   {children}
 * </section>
 * 
 * AFTER (using BaseSection):
 * 
 * <BaseSection title="Title" variant="minimal" spacing="normal">
 *   {children}
 * </BaseSection>
 */
