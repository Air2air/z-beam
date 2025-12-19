// Example: Integrating Domain Linkages into Material/Contaminant/Settings Pages
// This file demonstrates how to add domain linkages to your existing page components

// ============================================================================
// EXAMPLE 1: Material Detail Page
// ============================================================================

// File: app/materials/[category]/[subcategory]/[slug]/page.tsx

import { DomainLinkagesContainer } from '@/app/components/DomainLinkages';
// ... other imports

export default async function MaterialPage({ 
  params 
}: { 
  params: { category: string; subcategory: string; slug: string } 
}) {
  // Load frontmatter (existing code)
  const frontmatter = await getMaterialFrontmatter(params.slug);
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Existing sections */}
      <Hero {...frontmatter} />
      <MaterialCharacteristics {...frontmatter} />
      <MachineSettings {...frontmatter} />
      
      {/* NEW: Add domain linkages - shows all related entities */}
      {frontmatter.domain_linkages && (
        <DomainLinkagesContainer 
          linkages={frontmatter.domain_linkages}
          className="mt-12"
        />
      )}
      
      {/* Rest of existing content */}
      <FAQ items={frontmatter.faq} />
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Contaminant Detail Page
// ============================================================================

// File: app/contaminants/[category]/[subcategory]/[slug]/page.tsx

import { DomainLinkagesContainer } from '@/app/components/DomainLinkages';
// ... other imports

export default async function ContaminantPage({ 
  params 
}: { 
  params: { category: string; subcategory: string; slug: string } 
}) {
  const frontmatter = await getContaminantFrontmatter(params.slug);
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Existing sections */}
      <Hero {...frontmatter} />
      <ContaminationDescription {...frontmatter} />
      
      {/* NEW: Domain linkages */}
      {frontmatter.domain_linkages && (
        <DomainLinkagesContainer 
          linkages={frontmatter.domain_linkages}
          className="mt-12"
        />
      )}
      
      {/* Shows sections like:
          - "Compatible Materials" (49 materials for adhesive residue)
          - "Hazardous Compounds Generated" (6 compounds)
          - "Regulatory Standards" (2 standards)
          - "Required Personal Protective Equipment" (3 PPE items)
      */}
    </div>
  );
}

// ============================================================================
// EXAMPLE 3: Settings Detail Page
// ============================================================================

// File: app/settings/[slug]/page.tsx

import { DomainLinkagesContainer } from '@/app/components/DomainLinkages';
// ... other imports

export default async function SettingsPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const frontmatter = await getSettingsFrontmatter(params.slug);
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Existing sections */}
      <Hero {...frontmatter} />
      <SettingsDescription {...frontmatter} />
      
      {/* NEW: Domain linkages */}
      {frontmatter.domain_linkages && (
        <DomainLinkagesContainer 
          linkages={frontmatter.domain_linkages}
          className="mt-12"
        />
      )}
      
      {/* Shows "Related Contaminants" section with all contaminants
          that can be cleaned with this settings configuration */}
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: Compound Detail Page
// ============================================================================

// File: app/compounds/[slug]/page.tsx

import { DomainLinkagesContainer } from '@/app/components/DomainLinkages';
// ... other imports

export default async function CompoundPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const frontmatter = await getCompoundFrontmatter(params.slug);
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Existing sections */}
      <Hero {...frontmatter} />
      <CompoundDetails {...frontmatter} />
      
      {/* NEW: Domain linkages */}
      {frontmatter.domain_linkages && (
        <DomainLinkagesContainer 
          linkages={frontmatter.domain_linkages}
          className="mt-12"
        />
      )}
      
      {/* Shows "Produced By These Contaminants" section */}
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Individual Section (More Control)
// ============================================================================

import { DomainLinkageSection } from '@/app/components/DomainLinkages';

export default async function CustomPage({ params }: any) {
  const frontmatter = await getFrontmatter(params.slug);
  
  return (
    <div>
      {/* Custom section ordering and titles */}
      
      {/* Materials section with custom title */}
      {frontmatter.domain_linkages?.related_materials && (
        <DomainLinkageSection
          title="Materials That Can Be Cleaned"
          items={frontmatter.domain_linkages.related_materials}
          domain="materials"
          className="mb-8"
        />
      )}
      
      {/* Compounds section with custom title */}
      {frontmatter.domain_linkages?.related_compounds && (
        <DomainLinkageSection
          title="Safety Alert: Hazardous Fumes"
          items={frontmatter.domain_linkages.related_compounds}
          domain="compounds"
          className="mb-8 bg-yellow-50 p-6 rounded-md"
        />
      )}
      
      {/* PPE section (always show if exists) */}
      {frontmatter.domain_linkages?.ppe_requirements && (
        <DomainLinkageSection
          title="Required Safety Equipment"
          items={frontmatter.domain_linkages.ppe_requirements}
          domain="ppe"
          className="mb-8 border-2 border-red-500 p-6"
        />
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: Conditional Rendering Based on Count
// ============================================================================

export default async function SmartPage({ params }: any) {
  const frontmatter = await getFrontmatter(params.slug);
  const materials = frontmatter.domain_linkages?.related_materials || [];
  
  return (
    <div>
      {/* Show materials section with different titles based on count */}
      {materials.length > 0 && (
        <DomainLinkageSection
          title={
            materials.length === 1 
              ? "Compatible Material"
              : materials.length < 10 
                ? `${materials.length} Compatible Materials`
                : "Compatible Materials (Large Selection)"
          }
          items={materials}
          domain="materials"
        />
      )}
      
      {/* Show warning if many hazardous compounds */}
      {(frontmatter.domain_linkages?.related_compounds || []).length > 5 && (
        <div className="bg-red-50 border-2 border-red-500 p-4 rounded mb-8">
          <p className="text-red-900 font-bold">
            ⚠️ This process generates multiple hazardous compounds. 
            Review all PPE requirements below.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MIGRATION CHECKLIST
// ============================================================================

/*
To add domain linkages to your existing pages:

✅ Step 1: Import the component
   import { DomainLinkagesContainer } from '@/app/components/DomainLinkages';

✅ Step 2: Add to page template (after main content, before footer)
   {frontmatter.domain_linkages && (
     <DomainLinkagesContainer linkages={frontmatter.domain_linkages} />
   )}

✅ Step 3: Verify frontmatter has domain_linkages data
   - Check frontmatter/materials/*.yaml
   - Check frontmatter/contaminants/*.yaml
   - Check frontmatter/settings/*.yaml
   - Check frontmatter/compounds/*.yaml

✅ Step 4: Test with different result counts
   - 1-4 items (should show list layout)
   - 5-12 items (should show simple grid)
   - 13-24 items (should show filtered grid)
   - 25+ items (should show category-grouped grid)

✅ Step 5: Verify badges display correctly
   - Materials: frequency + severity
   - Contaminants: severity + category
   - Compounds: hazard_level + phase
   - Settings: applicability + laser_type
   - Regulatory: "Required" badge
   - PPE: "Required" or "Recommended"

✅ Step 6: Check responsive behavior
   - Mobile: 2 columns
   - Tablet: 3 columns
   - Desktop: 4 columns
   - Large: 5 columns (for 51+ items)
*/
