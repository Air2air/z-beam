/**
 * Test page for new frontmatter display components
 * URL: /test-frontmatter-components
 */
// app/test-frontmatter-components/page.tsx
import { RegulatoryStandards } from '../components/RegulatoryStandards';
import { ApplicationsList } from '../components/ApplicationsList';
import { EnvironmentalImpact } from '../components/EnvironmentalImpact';

// Sample data from aluminum-laser-cleaning.yaml
const sampleStandards = [
  {
    name: "ANSI",
    description: "ANSI Z136.1 - Safe Use of Lasers standard for industrial laser operations and safety protocols",
    url: "https://webstore.ansi.org/standards/lia/ansiz1362014",
    image: "/images/logo/logo-org-ansi.png"
  },
  {
    name: "IEC",
    description: "IEC 60825-1 - Safety of laser products standard for classification and requirements",
    url: "https://webstore.iec.ch/publication/3587",
    image: "/images/logo/logo-org-iec.png"
  }
];

const sampleApplications = [
  "Aerospace",
  "Architecture",
  "Automotive",
  "Construction",
  "Electrical",
  "Electronics",
  "Marine",
  "Medical",
  "Packaging",
  "Transportation"
];

const sampleEnvironmentalImpact = {
  emission_metrics: {
    label: "Emission Metrics",
    description: "Particulate and volatile organic compound emissions during laser cleaning",
    particulateEmission: {
      value: 0.5,
      min: 0.1,
      max: 2.0,
      unit: "mg/m³",
      research_basis: "environmental_monitoring_studies"
    },
    volatileOrganicCompounds: {
      value: 0.2,
      min: 0.05,
      max: 1.0,
      unit: "ppm",
      research_basis: "environmental_monitoring_studies"
    }
  },
  energy_consumption: {
    label: "Energy Consumption",
    description: "Power usage and efficiency metrics for laser cleaning operations",
    energyConsumption: {
      value: 1.5,
      min: 0.5,
      max: 5.0,
      unit: "kWh/m²",
      research_basis: "industrial_processing_standards"
    },
    energyEfficiency: {
      value: 85.0,
      min: 70,
      max: 95,
      unit: "%",
      research_basis: "industrial_processing_standards"
    }
  },
  safety_metrics: {
    label: "Safety Metrics",
    description: "Operator safety and workplace exposure limits",
    noiseLevel: {
      value: 75.0,
      min: 60,
      max: 90,
      unit: "dB",
      research_basis: "occupational_safety_standards"
    }
  }
};

export default function TestFrontmatterComponents() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Frontmatter Display Components Test</h1>
      
      <div className="space-y-12">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Applications List Component</h2>
          <ApplicationsList 
            applications={sampleApplications}
            materialName="Aluminum"
          />
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Regulatory Standards Component</h2>
          <RegulatoryStandards standards={sampleStandards} />
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Environmental Impact Component</h2>
          <EnvironmentalImpact environmentalImpact={sampleEnvironmentalImpact} />
        </div>
      </div>
    </div>
  );
}
