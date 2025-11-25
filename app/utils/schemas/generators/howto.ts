/**
 * HowTo Schema Generator
 * Implements E-E-A-T: Experience with detailed process
 */

import { createAuthorReference } from './person';
import type { SchemaContext, AuthorData, ImageData } from './types';

export interface HowToStep {
  name: string;
  text: string;
  description?: string;
}

/**
 * Machine settings for HowTo steps (different from MachineSettings in centralized types)
 */
export interface HowToMachineSettings {
  powerRange?: { value: string | number; unit: string; description?: string };
  wavelength?: { value: string | number; unit: string; description?: string };
  spotSize?: { value: string | number; unit: string; description?: string };
  repetitionRate?: { value: string | number; unit: string; description?: string };
  energyDensity?: { value: string | number; unit: string; description?: string };
  pulseWidth?: { value: string | number; unit: string; description?: string };
  scanSpeed?: { value: string | number; unit: string; description?: string };
  passCount?: { value: string | number; unit: string; description?: string };
  overlapRatio?: { value: string | number; unit: string; description?: string };
  dwellTime?: { value: string | number; unit: string; description?: string };
}

export interface HowToSchemaOptions {
  context: SchemaContext;
  name: string;
  description?: string;
  author?: AuthorData;
  machineSettings?: HowToMachineSettings;
  customSteps?: HowToStep[];
  images?: {
    micro?: ImageData;
  };
  totalTime?: string;
}

/**
 * Generate HowTo schema for laser cleaning process
 */
export function generateHowToSchema(options: HowToSchemaOptions) {
  const {
    context,
    name,
    description,
    author = {},
    machineSettings,
    customSteps,
    images,
    totalTime = 'PT15M'
  } = options;
  
  const { baseUrl, pageUrl } = context;
  
  // Build steps from machine settings or use custom steps
  const steps: any[] = [];
  
  if (customSteps && customSteps.length > 0) {
    customSteps.forEach((step, index) => {
      steps.push({
        '@type': 'HowToStep',
        position: index + 1,
        name: step.name,
        text: step.text,
        ...(step.description && { description: step.description })
      });
    });
  } else if (machineSettings) {
    let stepNumber = 1;
    
    if (machineSettings.powerRange) {
      steps.push({
        '@type': 'HowToStep',
        position: stepNumber++,
        name: 'Set Laser Power',
        text: `Configure laser power to ${machineSettings.powerRange.value} ${machineSettings.powerRange.unit}`,
        ...(machineSettings.powerRange.description && { 
          description: machineSettings.powerRange.description 
        })
      });
    }
    
    if (machineSettings.wavelength) {
      steps.push({
        '@type': 'HowToStep',
        position: stepNumber++,
        name: 'Configure Wavelength',
        text: `Set wavelength to ${machineSettings.wavelength.value} ${machineSettings.wavelength.unit}`,
        ...(machineSettings.wavelength.description && { 
          description: machineSettings.wavelength.description 
        })
      });
    }
    
    if (machineSettings.spotSize) {
      steps.push({
        '@type': 'HowToStep',
        position: stepNumber++,
        name: 'Adjust Spot Size',
        text: `Set beam spot size to ${machineSettings.spotSize.value} ${machineSettings.spotSize.unit}`,
        ...(machineSettings.spotSize.description && { 
          description: machineSettings.spotSize.description 
        })
      });
    }
    
    if (machineSettings.repetitionRate) {
      steps.push({
        '@type': 'HowToStep',
        position: stepNumber++,
        name: 'Set Repetition Rate',
        text: `Configure repetition rate to ${machineSettings.repetitionRate.value} ${machineSettings.repetitionRate.unit}`,
        ...(machineSettings.repetitionRate.description && { 
          description: machineSettings.repetitionRate.description 
        })
      });
    }
    
    if (machineSettings.energyDensity) {
      steps.push({
        '@type': 'HowToStep',
        position: stepNumber++,
        name: 'Set Energy Density',
        text: `Configure energy density to ${machineSettings.energyDensity.value} ${machineSettings.energyDensity.unit}`,
        ...(machineSettings.energyDensity.description && { 
          description: machineSettings.energyDensity.description 
        })
      });
    }
    
    if (machineSettings.pulseWidth) {
      steps.push({
        '@type': 'HowToStep',
        position: stepNumber++,
        name: 'Set Pulse Width',
        text: `Configure pulse width to ${machineSettings.pulseWidth.value} ${machineSettings.pulseWidth.unit}`,
        ...(machineSettings.pulseWidth.description && { 
          description: machineSettings.pulseWidth.description 
        })
      });
    }
    
    if (machineSettings.scanSpeed) {
      steps.push({
        '@type': 'HowToStep',
        position: stepNumber++,
        name: 'Set Scanning Speed',
        text: `Configure scanning speed to ${machineSettings.scanSpeed.value} ${machineSettings.scanSpeed.unit}`,
        ...(machineSettings.scanSpeed.description && { 
          description: machineSettings.scanSpeed.description 
        })
      });
    }
    
    if (machineSettings.passCount) {
      steps.push({
        '@type': 'HowToStep',
        position: stepNumber++,
        name: 'Execute Cleaning Passes',
        text: `Perform ${machineSettings.passCount.value} cleaning ${machineSettings.passCount.value === 1 ? 'pass' : 'passes'}`,
        ...(machineSettings.passCount.description && { 
          description: machineSettings.passCount.description 
        })
      });
    }
    
    if (machineSettings.overlapRatio) {
      steps.push({
        '@type': 'HowToStep',
        position: stepNumber++,
        name: 'Set Overlap Ratio',
        text: `Configure beam overlap to ${machineSettings.overlapRatio.value}${machineSettings.overlapRatio.unit}`,
        ...(machineSettings.overlapRatio.description && { 
          description: machineSettings.overlapRatio.description 
        })
      });
    }
    
    if (machineSettings.dwellTime) {
      steps.push({
        '@type': 'HowToStep',
        position: stepNumber++,
        name: 'Set Dwell Time',
        text: `Configure dwell time to ${machineSettings.dwellTime.value} ${machineSettings.dwellTime.unit}`,
        ...(machineSettings.dwellTime.description && { 
          description: machineSettings.dwellTime.description 
        })
      });
    }
  }
  
  // Return null if no steps
  if (steps.length === 0) return null;
  
  const howToDescription = description || `Step-by-step process for laser cleaning ${name} surfaces`;
  
  return {
    '@type': 'HowTo',
    '@id': `${pageUrl}#howto`,
    name: `How to Clean ${name} with Laser`,
    description: howToDescription,
    inLanguage: 'en-US',
    
    // E-E-A-T: Author reference
    author: createAuthorReference(baseUrl, author.id || 'expert'),
    
    step: steps,
    
    // Result image with dimensions (P0 enhancement)
    ...(images?.micro?.url && {
      image: {
        '@type': 'ImageObject',
        url: `${baseUrl}${images.micro.url}`,
        width: images.micro.width || 1200,
        height: images.micro.height || 630,
        caption: images.micro.alt || `Result of laser cleaning ${name}`
      }
    }),
    
    // Time estimate
    totalTime,
    
    // Equipment needed
    supply: {
      '@type': 'HowToSupply',
      name: 'Laser Cleaning System'
    }
  };
}
