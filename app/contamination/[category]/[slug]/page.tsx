import { Metadata } from 'next';
import Image from 'next/image';
import { SITE_CONFIG } from '@/app/config/site';

// ✅ REUSING MATERIALS PAGE COMPONENTS
import { Layout } from '@/app/components/Layout/Layout';
import { Micro } from '@/app/components/Micro/Micro';
import { MaterialFAQ } from '@/app/components/FAQ/MaterialFAQ';
import { RegulatoryStandards } from '@/app/components/RegulatoryStandards';
import { ScheduleCards } from '@/app/components/Schedule/ScheduleCards';

// ✅ CONTAMINATION-SPECIFIC COMPONENTS (extend shared components)
import { QuickFactsCard } from '@/app/components/Contamination/QuickFactsCard';
import { SafetyWarningsGrid } from '@/app/components/Contamination/SafetyWarningsGrid';
import { IndustriesGrid } from '@/app/components/Contamination/IndustriesGrid';
import { TechnicalSpecsTable } from '@/app/components/Contamination/TechnicalSpecsTable';

// This is a prototype - in production, this would load from frontmatter YAML
const PROTOTYPE_DATA = {
  name: 'Adhesive Residue',
  slug: 'adhesive-residue',
  pattern_id: 'adhesive_residue',
  category: 'contamination',
  title: 'Adhesive Residue Laser Cleaning',
  meta_description: 'Professional laser cleaning removes adhesive residue 3x faster than solvents with zero chemicals. Complete guide to safe tape mark removal on 100+ materials.',
  
  // Category and URL structure
  category: 'surface',
  subcategory: 'organic',
  
  // Phase 1 Enhancement: Quick Facts
  quick_facts: {
    removal_efficiency: '70% single pass, 95%+ in 3 passes',
    process_speed: '240 cm²/min coverage rate',
    substrate_safety: 'Low damage risk',
    key_benefit: 'Zero chemicals, no substrate damage',
    typical_applications: [
      'Label removal from products',
      'Tape residue on glass/metal',
      'Adhesive cleanup pre-coating'
    ]
  },
  
  contamination_description: 'Sticky residue from labels, tapes, or adhesives',
  context_notes: 'Common on manufactured items, shipped goods, or items with labels/tape',
  
  // Phase 1 Enhancement: Enhanced Micro with Technical Details
  images: {
    hero: {
      before: {
        url: '/images/contamination/adhesive-residue-before.jpg',
        alt: 'Surface shows contamination from adhesive residue affecting material appearance',
        technical: 'Adhesive layer thickness: 50-200μm, Absorption at 1064nm: 850 cm⁻¹'
      },
      after: {
        url: '/images/contamination/adhesive-residue-after.jpg',
        alt: 'Post-cleaning reveals restored surface with adhesive residue successfully removed',
        technical: '3 passes @ 0.8 J/cm², 70% first-pass efficiency, minimal roughness increase'
      }
    }
  },
  
  micro: {
    before: 'Surface shows contamination from adhesive residue / tape marks affecting material appearance and properties.',
    after: 'Post-cleaning reveals restored surface with adhesive residue / tape marks successfully removed through precise laser ablation.'
  },
  
  // Phase 1 Enhancement: Industries Served (4 industries)
  industries_served: [
    {
      name: 'Manufacturing',
      use_cases: [
        'Label removal from products',
        'QC reject sticker removal',
        'Tape residue after assembly'
      ],
      materials: ['metal', 'plastic', 'glass'],
      frequency: 'very_high'
    },
    {
      name: 'Automotive',
      use_cases: [
        'VIN sticker residue',
        'Masking tape after painting',
        'Label removal from parts'
      ],
      materials: ['metal', 'glass', 'plastic'],
      frequency: 'high'
    },
    {
      name: 'Shipping & Logistics',
      use_cases: [
        'Pallet label removal',
        'Shipping tape residue',
        'Barcode sticker cleanup'
      ],
      materials: ['wood', 'plastic', 'metal'],
      frequency: 'high'
    },
    {
      name: 'Electronics',
      use_cases: [
        'Component label removal',
        'Tape residue on PCBs',
        'Clean room applications'
      ],
      materials: ['metal', 'plastic', 'composite'],
      frequency: 'moderate'
    }
  ],
  
  // Phase 1 Enhancement: Enhanced Safety with Severity Levels
  safety_data: {
    overall_hazard_level: 'moderate',
    critical_warnings: [
      {
        severity: 'critical',
        icon: '☠️',
        message: 'Adhesive pyrolysis releases acrolein and formaldehyde vapors',
        ppe_required: 'NIOSH-approved organic vapor respirator mandatory'
      }
    ],
    high_priority_warnings: [
      {
        severity: 'high',
        icon: '🫁',
        message: 'Styrene exposure risk from rubber-based adhesives',
        mitigation: 'Ensure 15+ air changes/hour exhaust ventilation'
      }
    ],
    moderate_warnings: [
      {
        severity: 'moderate',
        icon: '💨',
        message: 'Visible smoke generation during removal process',
        best_practice: 'Position exhaust capture within 12 inches of cleaning point'
      }
    ],
    hazardous_fumes: [
      {
        compound: 'Acrolein',
        concentration: '2-8 ppm',
        exposure_limit: 'PEL: 0.1 ppm (OSHA)',
        hazard_class: 'Severe respiratory irritant',
        exceeds_limit: true
      },
      {
        compound: 'Formaldehyde',
        concentration: '0.5-2 ppm',
        exposure_limit: 'PEL: 0.75 ppm (OSHA)',
        hazard_class: 'Carcinogen (Group 1)',
        exceeds_limit: true
      },
      {
        compound: 'Styrene',
        concentration: '10-40 ppm',
        exposure_limit: 'PEL: 100 ppm (OSHA)',
        hazard_class: 'CNS depressant',
        exceeds_limit: false
      }
    ]
  },
  
  // Technical specifications
  machine_settings: {
    wavelength: { min: 1064, max: 1064, recommended: 1064, unit: 'nm' },
    power: { min: 30, max: 100, recommended: 50, unit: 'W' },
    pulse_frequency: { min: 10, max: 100, recommended: 50, unit: 'kHz' },
    scan_speed: { min: 500, max: 3000, recommended: 1500, unit: 'mm/s' },
    fluence: { min: 0.3, max: 1.5, recommended: 0.8, unit: 'J/cm²' }
  },
  
  // Author data (for Author component)
  author: {
    name: 'Dr. Michael Thompson',
    title: 'Senior Laser Systems Engineer',
    image: '/images/authors/michael-thompson.jpg',
    country: 'USA',
    expertise: ['Surface Contamination', 'Adhesive Removal']
  },
  
  datePublished: '2024-11-15',
  
  // FAQ data (reusing MaterialFAQ component)
  faq: [
    {
      question: 'What types of adhesives can laser cleaning remove?',
      answer: 'Laser cleaning effectively removes pressure-sensitive adhesives (PSA), hot melt adhesives, epoxy residues, and rubber-based adhesives. The process works on both acrylic and rubber-based formulations, with 70% first-pass efficiency on most substrates.'
    },
    {
      question: 'Is laser cleaning safe for delicate substrates?',
      answer: 'Yes. Unlike chemical solvents that can damage coatings or plastics, laser cleaning provides controlled energy delivery that removes only the adhesive layer. Testing shows minimal roughness increase (<0.5μm Ra) on glass, metals, and most plastics.'
    },
    {
      question: 'How does laser removal compare to solvent-based methods?',
      answer: 'Laser cleaning is 3x faster than solvent methods (240 cm²/min vs 80 cm²/min), produces zero chemical waste, and eliminates drying time. Cost per square meter is comparable for high-volume applications, with lower environmental compliance costs.'
    },
    {
      question: 'What safety precautions are required for adhesive removal?',
      answer: 'Critical: NIOSH-approved organic vapor respirator mandatory due to acrolein and formaldehyde generation. Minimum 15 air changes/hour ventilation required. Position exhaust capture within 12 inches of cleaning point. Full PPE and monitoring essential.'
    }
  ],
  
  // Regulatory standards
  regulatoryStandards: [
    {
      name: 'OSHA 1910.134',
      description: 'Respiratory Protection Standard - mandatory for adhesive fume exposure',
      category: 'Safety'
    },
    {
      name: 'ACGIH TLV Guidelines',
      description: 'Threshold Limit Values for acrolein (0.1 ppm) and formaldehyde (0.3 ppm)',
      category: 'Exposure Limits'
    },
    {
      name: 'EPA 40 CFR Part 63',
      description: 'National Emission Standards for Hazardous Air Pollutants',
      category: 'Environmental'
    }
  ]
};

// Metadata generation
export async function generateMetadata(): Promise<Metadata> {
  const data = PROTOTYPE_DATA;
  
  return {
    title: `${data.title} | ${SITE_CONFIG.name}`,
    description: data.meta_description,
    openGraph: {
      title: data.title,
      description: data.meta_description,
      type: 'article',
      images: [
        {
          url: data.images.hero.before.url,
          width: 1200,
          height: 630,
          alt: data.images.hero.before.alt
        },
        {
          url: data.images.hero.after.url,
          width: 1200,
          height: 630,
          alt: data.images.hero.after.alt
        }
      ]
    }
  };
}

export default function ContaminationPatternPage() {
  const data = PROTOTYPE_DATA;
  
  return (
    <Layout
      title={data.title}
      metadata={data as any}
      slug={`contamination/${data.category}/${data.slug}`}
    >
      {/* ✅ REUSING: Micro Component (from materials pages) */}
      <Micro 
        frontmatter={data as any}
        config={{}}
      />

      {/* ✅ EXTENDING: QuickFactsCard (extends SectionContainer) */}
      <QuickFactsCard facts={data.quick_facts} />

      {/* ✅ EXTENDING: SafetyWarningsGrid (extends SectionContainer, SectionTitle, SafetyWarning, Badge) */}
      <SafetyWarningsGrid 
        safetyData={data.safety_data}
        materialName="adhesive-contaminated surfaces"
        warningText="Laser cleaning of adhesive residue generates hazardous fumes including acrolein and formaldehyde. Professional safety assessment and proper ventilation systems are mandatory. Contact our safety specialists for proper protocols."
      />

      {/* ✅ EXTENDING: IndustriesGrid (extends SectionContainer, SectionTitle, Badge) */}
      <IndustriesGrid industries={data.industries_served} />

      {/* ✅ EXTENDING: TechnicalSpecsTable (extends SectionContainer, SectionTitle) */}
      <TechnicalSpecsTable settings={data.machine_settings} />

      {/* ✅ REUSING: MaterialFAQ Component (from materials pages) */}
      <MaterialFAQ 
        frontmatter={data as any}
        materialName={data.name}
        heroImage={data.images.hero.after.url}
        materialLink={`/contamination/${data.category}/${data.slug}`}
      />

      {/* ✅ REUSING: RegulatoryStandards Component (from materials pages) */}
      <RegulatoryStandards 
        regulatoryStandards={data.regulatoryStandards}
        materialName={data.name}
      />

      {/* ✅ REUSING: ScheduleCards Component (from materials pages) */}
      <ScheduleCards />

      {/* OLD CODE BELOW - TO BE REMOVED */}
      <SectionContainer variant="default" className="py-12" style={{display: 'none'}}>
        <div className="container-custom px-4">
          <SectionTitle 
            title="Visual Comparison"
            subtitle="Adhesive Residue Removal Results"
            alignment="center"
            className="mb-8"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Before Image */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="relative aspect-[4/3]">
                <Image
                  src={data.images.hero.before.url}
                  alt={data.images.hero.before.alt}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="inline-block bg-red-900/30 text-red-300 px-3 py-1 rounded-full text-sm font-medium mb-2">
                  Before
                </div>
                <p className="text-gray-300 mb-2">{data.micro.before}</p>
                <p className="text-xs font-mono text-gray-500 bg-gray-900 px-2 py-1 rounded">
                  {data.images.hero.before.technical}
                </p>
              </div>
            </div>
            
            {/* After Image */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="relative aspect-[4/3]">
                <Image
                  src={data.images.hero.after.url}
                  alt={data.images.hero.after.alt}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="inline-block bg-green-900/30 text-green-300 px-3 py-1 rounded-full text-sm font-medium mb-2">
                  After
                </div>
                <p className="text-gray-300 mb-2">{data.micro.after}</p>
                <p className="text-xs font-mono text-gray-500 bg-gray-900 px-2 py-1 rounded">
                  {data.images.hero.after.technical}
                </p>
              </div>
            </div>
          </div>
        </div>
      </SectionContainer>

      {/* ✅ REUSING: SafetyWarning Component */}
      <SectionContainer variant="default" className="py-12">
        <div className="container-custom px-4">
          <SectionTitle 
            title="Safety Information"
            subtitle="Critical Warnings & Hazardous Fumes"
            alignment="left"
            className="mb-8"
          />
          
          {/* Critical Warnings using color-coded cards */}
          <div className="space-y-4 mb-8">
            {data.safety_data.critical_warnings.map((warning, i) => (
              <div key={i} className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{warning.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="danger" size="sm">CRITICAL</Badge>
                      <h3 className="text-lg font-semibold text-red-300">{warning.message}</h3>
                    </div>
                    <p className="text-red-200 text-sm">
                      <strong>Required PPE:</strong> {warning.ppe_required}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {data.safety_data.high_priority_warnings.map((warning, i) => (
              <div key={i} className="bg-orange-900/20 border border-orange-500 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{warning.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="warning" size="sm">HIGH</Badge>
                      <h3 className="text-lg font-semibold text-orange-300">{warning.message}</h3>
                    </div>
                    <p className="text-orange-200 text-sm">
                      <strong>Mitigation:</strong> {warning.mitigation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {data.safety_data.moderate_warnings.map((warning, i) => (
              <div key={i} className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{warning.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="warning" size="sm">MODERATE</Badge>
                      <h3 className="text-lg font-semibold text-yellow-300">{warning.message}</h3>
                    </div>
                    <p className="text-yellow-200 text-sm">
                      <strong>Best Practice:</strong> {warning.best_practice}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Hazardous Fumes Table */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="px-6 py-4 bg-gray-700 border-b border-gray-600">
              <h3 className="text-lg font-semibold text-white">Hazardous Fumes Generated</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Compound</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Concentration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Exposure Limit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Hazard Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {data.safety_data.hazardous_fumes.map((fume, i) => (
                    <tr key={i} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 text-sm font-medium text-white">{fume.compound}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{fume.concentration}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{fume.exposure_limit}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">{fume.hazard_class}</td>
                      <td className="px-6 py-4 text-sm">
                        {fume.exceeds_limit ? (
                          <Badge variant="danger" size="sm">Exceeds Limit</Badge>
                        ) : (
                          <Badge variant="success" size="sm">Within Limit</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Custom SafetyWarning component */}
          <div className="mt-8">
            <SafetyWarning 
              materialName="adhesive-contaminated surfaces"
              warningText="Laser cleaning of adhesive residue generates hazardous fumes including acrolein and formaldehyde. Professional safety assessment and proper ventilation systems are mandatory. Contact our safety specialists for proper protocols."
            />
          </div>
        </div>
      </SectionContainer>

      {/* Phase 1: Industries Served Section */}
      <SectionContainer variant="dark" className="py-12">
        <div className="container-custom px-4">
          <SectionTitle 
            title="Industries Served"
            subtitle="Primary applications for adhesive residue removal"
            alignment="left"
            className="mb-8"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.industries_served.map((industry, i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">{industry.name}</h3>
                  <Badge 
                    variant={
                      industry.frequency === 'very_high' ? 'success' :
                      industry.frequency === 'high' ? 'info' : 'secondary'
                    }
                    size="sm"
                  >
                    {industry.frequency.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Common Use Cases:</h4>
                  <ul className="space-y-1">
                    {industry.use_cases.map((useCase, j) => (
                      <li key={j} className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">•</span>
                        <span>{useCase}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Materials Processed:</h4>
                  <div className="flex flex-wrap gap-2">
                    {industry.materials.map((material, j) => (
                      <Badge key={j} variant="secondary" size="sm">
                        {material}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionContainer>

      {/* Technical Specifications Section */}
      <SectionContainer variant="default" className="py-12">
        <div className="container-custom px-4">
          <SectionTitle 
            title="Technical Specifications"
            subtitle="Recommended machine settings for adhesive residue removal"
            alignment="left"
            className="mb-8"
          />
          
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Parameter</th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-300">Minimum</th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-300">Maximum</th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-300">Recommended</th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-300">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {Object.entries(data.machine_settings).map(([key, value]) => (
                  <tr key={key} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm font-medium text-white capitalize">
                      {key.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 text-center">{value.min}</td>
                    <td className="px-6 py-4 text-sm text-gray-300 text-center">{value.max}</td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span className="bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full font-semibold">
                        {value.recommended}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 text-center">{value.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SectionContainer>

      {/* ✅ REUSING: CallToAction Component */}
      <CallToAction />

      {/* ✅ REUSING: Author Component */}
      <SectionContainer variant="default" className="py-8">
        <div className="container-custom px-4">
          <Author 
            frontmatter={data}
            showAvatar={true}
            showCredentials={true}
            showCountry={true}
            showSpecialties={true}
          />
        </div>
      </SectionContainer>
    </Layout>
  );
}
