// app/components/Card/StatCard.alabaster.example.tsx
// Example using alabaster frontmatter data to create StatCards

import React from 'react';
import { StatCard, StatData } from './StatCard';
import { 
  extractPropertyStat, 
  extractMachineSettingStat, 
  commonPropertyStats, 
  commonMachineSettingStats,
  getPropertyColorScheme 
} from '../../utils/statCardHelpers';
import { ArticleMetadata } from '@/types';

// Simulated alabaster frontmatter data (based on the attachment)
const alabasterMetadata = {
  name: 'Alabaster',
  title: 'Laser Cleaning Alabaster',
  description: 'Technical overview of Alabaster laser cleaning applications and parameters',
  slug: 'alabaster-laser-cleaning',
  properties: {
    density: 2.5,
    densityUnit: 'g/cm³',
    densityMin: 1.5,
    densityMax: 3.4,
    thermalConductivity: 1.5,
    thermalConductivityUnit: 'W/m·K',
    thermalConductivityMin: 0.2,
    thermalConductivityMax: 5.0,
    hardness: 6,
    hardnessUnit: 'Mohs',
    hardnessMin: 1,
    hardnessMax: 7
  },
  machineSettings: {
    powerRange: 50.0,
    powerRangeUnit: 'W',
    powerRangeMin: 20.0,
    powerRangeMax: 500.0,
    wavelength: 1064.0,
    wavelengthUnit: 'nm',
    wavelengthMin: 355.0,
    wavelengthMax: 2940.0,
    pulseDuration: 20.0,
    pulseDurationUnit: 'ns',
    pulseDurationMin: 1.0,
    pulseDurationMax: 1000.0,
    spotSize: 2.0,
    spotSizeUnit: 'mm',
    spotSizeMin: 0.01,
    spotSizeMax: 10.0,
    repetitionRate: 20.0,
    repetitionRateUnit: 'kHz',
    repetitionRateMin: 1.0,
    repetitionRateMax: 1000.0,
    fluenceRange: 0.8,
    fluenceRangeUnit: 'J/cm²',
    fluenceRangeMin: 0.1,
    fluenceRangeMax: 50.0
  }
} as ArticleMetadata;

// Example StatCard using alabaster density data
export const AlabasterDensityCard = () => {
  const densityStat = extractPropertyStat(alabasterMetadata, {
    ...commonPropertyStats.density(),
    title: 'Alabaster Density',
    description: 'Current: 2.5 g/cm³ within optimal range for laser cleaning'
  });

  if (!densityStat) return null;

  return (
    <StatCard
      href="/materials/alabaster-laser-cleaning"
      title="Alabaster Properties"
      cardTitle="Material Density"
      cardDescription="Physical property analysis for laser cleaning optimization"
      primaryStat={densityStat}
      colorScheme={getPropertyColorScheme('density')}
    />
  );
};

// Example StatCard with multiple property stats
export const AlabasterPropertiesCard = () => {
  const densityStat = extractPropertyStat(alabasterMetadata, {
    ...commonPropertyStats.density(),
    title: 'Density'
  });
  
  const thermalStat = extractPropertyStat(alabasterMetadata, {
    ...commonPropertyStats.thermalConductivity(),
    title: 'Thermal Conductivity'
  });
  
  const hardnessStat = extractPropertyStat(alabasterMetadata, {
    ...commonPropertyStats.hardness(),
    title: 'Hardness'
  });

  const stats = [densityStat, thermalStat, hardnessStat].filter(Boolean);
  
  if (stats.length === 0) return null;

  return (
    <StatCard
      href="/materials/alabaster-laser-cleaning"
      title="Alabaster Properties"
      cardTitle="Physical Properties"
      cardDescription="Key material properties for laser cleaning assessment"
      primaryStat={stats[0]!}
      secondaryStats={stats.slice(1) as StatData[]}
      statLayout="grid"
      colorScheme="info"
    />
  );
};

// Example StatCard using machine settings
export const AlabasterLaserSettingsCard = () => {
  const powerStat = extractMachineSettingStat(alabasterMetadata, {
    ...commonMachineSettingStats.power(),
    title: 'Laser Power',
    description: 'Recommended power: 50W (optimal for alabaster cleaning)'
  });
  
  const wavelengthStat = extractMachineSettingStat(alabasterMetadata, {
    ...commonMachineSettingStats.wavelength(),
    title: 'Wavelength'
  });
  
  const pulseStat = extractMachineSettingStat(alabasterMetadata, {
    ...commonMachineSettingStats.pulseDuration(),
    title: 'Pulse Duration'
  });

  if (!powerStat) return null;

  return (
    <StatCard
      href="/materials/alabaster-laser-cleaning"
      title="Laser Settings"
      cardTitle="Optimal Laser Parameters"
      cardDescription="Recommended settings for alabaster laser cleaning"
      primaryStat={powerStat}
      secondaryStats={[wavelengthStat, pulseStat].filter((stat): stat is StatData => stat !== null)}
      statLayout="vertical"
      colorScheme="default"
    />
  );
};

// Complete alabaster dashboard example
export const AlabasterStatDashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      <AlabasterDensityCard />
      <AlabasterPropertiesCard />
      <AlabasterLaserSettingsCard />
    </div>
  );
};

// Utility function to create StatCard from any frontmatter property
export const createPropertyStatCard = (
  metadata: ArticleMetadata,
  propertyKey: string,
  cardConfig: {
    href: string;
    title?: string;
    cardTitle?: string;
    cardDescription?: string;
    label?: string;
    description?: string;
  }
) => {
  const stat = extractPropertyStat(metadata, {
    propertyKey,
    label: cardConfig.label,
    description: cardConfig.description,
    format: 'decimal',
    precision: 1
  });

  if (!stat) return null;

  return (
    <StatCard
      href={cardConfig.href}
      title={cardConfig.title || 'Property Analysis'}
      cardTitle={cardConfig.cardTitle}
      cardDescription={cardConfig.cardDescription}
      primaryStat={stat}
      colorScheme={getPropertyColorScheme(propertyKey)}
    />
  );
};

// Utility function to create StatCard from any frontmatter machine setting
export const createMachineSettingStatCard = (
  metadata: ArticleMetadata,
  settingKey: string,
  cardConfig: {
    href: string;
    title?: string;
    cardTitle?: string;
    cardDescription?: string;
    label?: string;
    description?: string;
  }
) => {
  const stat = extractMachineSettingStat(metadata, {
    propertyKey: settingKey,
    label: cardConfig.label,
    description: cardConfig.description,
    format: 'decimal',
    precision: 1
  });

  if (!stat) return null;

  return (
    <StatCard
      href={cardConfig.href}
      title={cardConfig.title || 'Machine Setting'}
      cardTitle={cardConfig.cardTitle}
      cardDescription={cardConfig.cardDescription}
      primaryStat={stat}
      colorScheme="default"
    />
  );
};