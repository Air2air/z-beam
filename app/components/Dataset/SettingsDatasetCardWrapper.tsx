'use client';
// app/components/Dataset/SettingsDatasetCardWrapper.tsx

import { SectionContainer } from '@/app/components/SectionContainer/SectionContainer';
import { getSectionIcon } from '@/app/config/sectionIcons';
import DatasetSection from './DatasetSection';
import { trackDatasetDownload } from '@/app/utils/analytics';
import { triggerDownload } from '@/app/utils/downloadUtils';

interface SettingsDatasetCardWrapperProps {
  settings: {
    name: string;
    slug: string;
    category: string;
    subcategory: string;
    machineSettings?: any;
    research_library?: any;
    components?: any;
  };
  showFullDataset?: boolean;
}

export default function SettingsDatasetCardWrapper({
  settings,
  showFullDataset = false
}: SettingsDatasetCardWrapperProps) {
  const { 
    name, 
    slug, 
    category, 
    subcategory, 
    machineSettings = {},
    research_library = {},
    components = {}
  } = settings;

  // Count essential parameters
  const parametersCount = machineSettings?.essential_parameters 
    ? Object.keys(machineSettings.essential_parameters).length 
    : 0;

  // Count challenges
  const challengesCount = components?.diagnostic_center?.challenges 
    ? Object.values(components.diagnostic_center.challenges).reduce((total: number, cat: any) => 
        total + (Array.isArray(cat) ? cat.length : 0), 0)
    : 0;

  // Count troubleshooting issues
  const issuesCount = components?.diagnostic_center?.troubleshooting?.length || 0;

  // Count research citations
  const citationsCount = research_library?.citations?.length || 0;

  // Count expected outcomes
  const outcomesCount = machineSettings?.expected_outcomes 
    ? Object.keys(machineSettings.expected_outcomes).length 
    : 0;

  // Total data points
  const totalDataPoints = parametersCount + challengesCount + issuesCount + citationsCount + outcomesCount;

  return (
    <SectionContainer
      variant="dark"
      title={`${name} Settings Dataset Download`}
      icon={getSectionIcon('dataset')}
    >
      <DatasetSection
        title={`${name} Machine Settings Dataset`}
        description="Download validated laser cleaning parameters, troubleshooting guides, and research references in machine-readable formats"
        stats={[
          {
            value: parametersCount,
            label: 'Parameters'
          },
          {
            value: challengesCount,
            label: 'Challenges'
          },
          {
            value: issuesCount,
            label: 'Solutions'
          },
          {
            value: citationsCount,
            label: 'Citations'
          },
          {
            value: outcomesCount,
            label: 'Outcomes'
          },
          {
            value: 3,
            label: 'Formats'
          }
        ]}
        formats={['json', 'csv', 'txt']}
        onDownload={(format: 'json' | 'csv' | 'txt') => {
          // Unified dataset: use material naming convention (consolidated Nov 2025)
          const baseSlug = slug.replace('-settings', '');
          const fileName = `${baseSlug}-laser-cleaning.${format}`;
          const filePath = `/datasets/materials/${fileName}`;
          
          // Track download event
          trackDatasetDownload({
            format,
            category,
            subcategory,
            materialName: name,
            fileSize: undefined // File size not available for direct links
          });
          
          triggerDownload(filePath, fileName);
        }}
        getDirectLink={(format: 'json' | 'csv' | 'txt') => {
          const baseSlug = slug.replace('-settings', '');
          return `/datasets/materials/${baseSlug}-laser-cleaning.${format}`;
        }}
        includes={[
          'Essential laser parameters with optimal ranges',
          'Material-specific damage thresholds',
          'Troubleshooting guides and solutions',
          'Research citations and validation data',
          'Safety warnings and prevention strategies'
        ]}
        categoryLink={{
          href: `/materials/${category}`,
          label: `View all ${category.charAt(0).toUpperCase() + category.slice(1)} datasets`
        }}
      />
    </SectionContainer>
  );
}
