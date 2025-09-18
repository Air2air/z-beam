/**
 * @jest-environment jsdom
 */

// Mock application-specific data for laser cleaning use cases
const mockApplicationData = {
  'automotive-surface-preparation': {
    title: 'Automotive Surface Preparation',
    industry: 'Automotive',
    category: 'Surface Preparation',
    materials: ['Steel', 'Aluminum', 'Carbon Fiber'],
    processes: ['Paint Removal', 'Oxide Cleaning', 'Weld Preparation'],
    complexity: 'Medium',
    volume: 'High',
    precision: 'High',
    requirements: {
      surfaceFinish: 'Ra 1.6-3.2μm',
      contaminantRemoval: '99.5%',
      heatAffectedZone: '<50μm',
      processingSpeed: '5-15 m²/hr'
    }
  },
  'aerospace-component-cleaning': {
    title: 'Aerospace Component Cleaning',
    industry: 'Aerospace',
    category: 'Precision Cleaning',
    materials: ['Titanium', 'Inconel', 'Aluminum'],
    processes: ['Oxide Removal', 'Contamination Cleaning', 'Surface Activation'],
    complexity: 'High',
    volume: 'Low',
    precision: 'Very High',
    requirements: {
      surfaceFinish: 'Ra 0.8-1.6μm',
      contaminantRemoval: '99.9%',
      heatAffectedZone: '<25μm',
      processingSpeed: '1-5 m²/hr'
    }
  },
  'cultural-heritage-restoration': {
    title: 'Cultural Heritage Restoration',
    industry: 'Cultural Heritage',
    category: 'Restoration',
    materials: ['Stone', 'Bronze', 'Iron', 'Marble'],
    processes: ['Corrosion Removal', 'Cleaning', 'Paint Stripping'],
    complexity: 'Very High',
    volume: 'Very Low',
    precision: 'Extreme',
    requirements: {
      surfaceFinish: 'Preserve Original',
      contaminantRemoval: '95-99%',
      heatAffectedZone: '<10μm',
      processingSpeed: '0.1-1 m²/hr'
    }
  }
};

// Mock application processing functions
const validateApplicationRequirements = (application) => {
  const requiredFields = ['title', 'industry', 'category', 'materials', 'processes', 'requirements'];
  
  for (const field of requiredFields) {
    if (!application[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  if (!Array.isArray(application.materials) || application.materials.length === 0) {
    throw new Error('Materials must be a non-empty array');
  }
  
  if (!Array.isArray(application.processes) || application.processes.length === 0) {
    throw new Error('Processes must be a non-empty array');
  }
  
  return true;
};

const calculateApplicationComplexity = (application) => {
  const complexityMap = {
    'Low': 1,
    'Medium': 2,
    'High': 3,
    'Very High': 4,
    'Extreme': 5
  };
  
  const precisionMap = {
    'Low': 1,
    'Medium': 2, 
    'High': 3,
    'Very High': 4,
    'Extreme': 5
  };
  
  const baseComplexity = complexityMap[application.complexity] || 2;
  const materialComplexity = (application.materials?.length || 1) * 0.2;
  const processComplexity = (application.processes?.length || 1) * 0.2;
  const precisionFactor = precisionMap[application.precision] || 2;
  
  // Weight precision heavily for proper ordering
  const total = baseComplexity + materialComplexity + processComplexity + (precisionFactor * 0.8);
  
  return Math.min(5, total);
};

const generateApplicationGuide = (application) => {
  const complexity = calculateApplicationComplexity(application);
  
  return {
    applicationId: application.title.toLowerCase().replace(/\s+/g, '-'),
    title: application.title,
    industry: application.industry,
    difficulty: complexity > 3 ? 'Advanced' : complexity > 2 ? 'Intermediate' : 'Basic',
    estimatedTime: estimateProcessingTime(application),
    requiredEquipment: determineRequiredEquipment(application),
    safetyConsiderations: generateSafetyGuidelines(application),
    qualityStandards: application.requirements,
    stepByStepProcess: generateProcessSteps(application)
  };
};

const estimateProcessingTime = (application) => {
  const speedMap = {
    'Very Low': 0.5,
    'Low': 2,
    'Medium': 8,
    'High': 20,
    'Very High': 50
  };
  
  const baseSpeed = speedMap[application.volume] || 8;
  const complexityFactor = calculateApplicationComplexity(application) / 5;
  
  return Math.round(baseSpeed * (1 + complexityFactor));
};

const determineRequiredEquipment = (application) => {
  const equipment = ['Laser Cleaning System', 'Safety Equipment', 'Monitoring Tools'];
  
  if (application.precision === 'Very High' || application.precision === 'Extreme') {
    equipment.push('Precision Positioning System', 'Real-time Monitoring');
  }
  
  if (application.complexity === 'High' || application.complexity === 'Very High') {
    equipment.push('Advanced Control Software', 'Environmental Controls');
  }
  
  return equipment;
};

const generateSafetyGuidelines = (application) => {
  const guidelines = [
    'Wear appropriate laser safety eyewear',
    'Ensure proper ventilation for fume extraction',
    'Follow lockout/tagout procedures'
  ];
  
  if (application.materials.some(m => ['Titanium', 'Inconel'].includes(m))) {
    guidelines.push('Use specialized filters for exotic material particles');
  }
  
  if (application.industry === 'Cultural Heritage') {
    guidelines.push('Document all procedures for conservation records');
    guidelines.push('Use minimal power settings to preserve substrate');
  }
  
  return guidelines;
};

const generateProcessSteps = (application) => {
  const baseSteps = [
    'Surface inspection and documentation',
    'Material identification and testing',
    'Parameter selection and optimization',
    'Process execution and monitoring',
    'Quality verification and documentation'
  ];
  
  if (application.industry === 'Aerospace') {
    baseSteps.splice(1, 0, 'Aerospace quality system verification');
    baseSteps.push('Final inspection per aerospace standards');
  }
  
  if (application.category === 'Restoration') {
    baseSteps.unshift('Historical research and documentation');
    baseSteps.push('Conservation treatment documentation');
  }
  
  return baseSteps;
};

describe('Application-Specific System Tests', () => {
  
  describe('Application Data Validation', () => {
    it('should validate complete application data structure', () => {
      const automotive = mockApplicationData['automotive-surface-preparation'];
      
      expect(() => {
        validateApplicationRequirements(automotive);
      }).not.toThrow();
    });

    it('should require all mandatory fields', () => {
      const incompleteApplication = {
        title: 'Test Application',
        industry: 'Test Industry'
        // Missing other required fields
      };
      
      expect(() => {
        validateApplicationRequirements(incompleteApplication);
      }).toThrow('Missing required field: category');
    });

    it('should validate materials array', () => {
      const applicationWithoutMaterials = {
        title: 'Test Application',
        industry: 'Test Industry',
        category: 'Test Category',
        materials: [],
        processes: ['Test Process'],
        requirements: {}
      };
      
      expect(() => {
        validateApplicationRequirements(applicationWithoutMaterials);
      }).toThrow('Materials must be a non-empty array');
    });

    it('should validate processes array', () => {
      const applicationWithoutProcesses = {
        title: 'Test Application',
        industry: 'Test Industry',
        category: 'Test Category',
        materials: ['Test Material'],
        processes: [],
        requirements: {}
      };
      
      expect(() => {
        validateApplicationRequirements(applicationWithoutProcesses);
      }).toThrow('Processes must be a non-empty array');
    });
  });

  describe('Application Complexity Calculation', () => {
    it('should calculate complexity based on multiple factors', () => {
      const automotive = mockApplicationData['automotive-surface-preparation'];
      const complexity = calculateApplicationComplexity(automotive);
      
      expect(complexity).toBeGreaterThan(0);
      expect(complexity).toBeLessThanOrEqual(5);
    });

    it('should assign higher complexity to aerospace applications', () => {
      const aerospace = mockApplicationData['aerospace-component-cleaning'];
      const automotive = mockApplicationData['automotive-surface-preparation'];
      
      const aerospaceComplexity = calculateApplicationComplexity(aerospace);
      const automotiveComplexity = calculateApplicationComplexity(automotive);
      
      expect(aerospaceComplexity).toBeGreaterThan(automotiveComplexity);
    });

    it('should assign highest complexity to cultural heritage', () => {
      const heritage = mockApplicationData['cultural-heritage-restoration'];
      const aerospace = mockApplicationData['aerospace-component-cleaning'];
      
      const heritageComplexity = calculateApplicationComplexity(heritage);
      const aerospaceComplexity = calculateApplicationComplexity(aerospace);
      
      expect(heritageComplexity).toBeGreaterThanOrEqual(aerospaceComplexity);
    });

    it('should factor in material and process variety', () => {
      const simpleApp = {
        complexity: 'Low',
        precision: 'Low',
        materials: ['Steel'],
        processes: ['Cleaning']
      };
      
      const complexApp = {
        complexity: 'Low',
        precision: 'Low',
        materials: ['Steel', 'Aluminum', 'Titanium', 'Inconel'],
        processes: ['Cleaning', 'Preparation', 'Activation', 'Finishing']
      };
      
      const simpleComplexity = calculateApplicationComplexity(simpleApp);
      const complexComplexity = calculateApplicationComplexity(complexApp);
      
      expect(complexComplexity).toBeGreaterThan(simpleComplexity);
    });
  });

  describe('Application Guide Generation', () => {
    it('should generate comprehensive application guide', () => {
      const automotive = mockApplicationData['automotive-surface-preparation'];
      const guide = generateApplicationGuide(automotive);
      
      expect(guide).toHaveProperty('applicationId');
      expect(guide).toHaveProperty('title');
      expect(guide).toHaveProperty('industry');
      expect(guide).toHaveProperty('difficulty');
      expect(guide).toHaveProperty('estimatedTime');
      expect(guide).toHaveProperty('requiredEquipment');
      expect(guide).toHaveProperty('safetyConsiderations');
      expect(guide).toHaveProperty('qualityStandards');
      expect(guide).toHaveProperty('stepByStepProcess');
    });

    it('should assign appropriate difficulty levels', () => {
      const automotive = mockApplicationData['automotive-surface-preparation'];
      const aerospace = mockApplicationData['aerospace-component-cleaning'];
      const heritage = mockApplicationData['cultural-heritage-restoration'];
      
      const automotiveGuide = generateApplicationGuide(automotive);
      const aerospaceGuide = generateApplicationGuide(aerospace);
      const heritageGuide = generateApplicationGuide(heritage);
      
      expect(['Basic', 'Intermediate', 'Advanced']).toContain(automotiveGuide.difficulty);
      expect(['Intermediate', 'Advanced']).toContain(aerospaceGuide.difficulty);
      expect(heritageGuide.difficulty).toBe('Advanced');
    });

    it('should include industry-specific safety considerations', () => {
      const heritage = mockApplicationData['cultural-heritage-restoration'];
      const guide = generateApplicationGuide(heritage);
      
      expect(guide.safetyConsiderations).toContain('Document all procedures for conservation records');
      expect(guide.safetyConsiderations).toContain('Use minimal power settings to preserve substrate');
    });

    it('should determine appropriate equipment requirements', () => {
      const aerospace = mockApplicationData['aerospace-component-cleaning'];
      const guide = generateApplicationGuide(aerospace);
      
      expect(guide.requiredEquipment).toContain('Precision Positioning System');
      expect(guide.requiredEquipment).toContain('Real-time Monitoring');
    });
  });

  describe('Processing Time Estimation', () => {
    it('should estimate realistic processing times', () => {
      const automotive = mockApplicationData['automotive-surface-preparation'];
      const time = estimateProcessingTime(automotive);
      
      expect(time).toBeGreaterThan(0);
      expect(time).toBeLessThan(1000);
    });

    it('should scale time based on volume and complexity', () => {
      const highVolume = { volume: 'High', complexity: 'Low', materials: ['Steel'], processes: ['Cleaning'] };
      const lowVolume = { volume: 'Low', complexity: 'High', materials: ['Steel'], processes: ['Cleaning'] };
      
      const highVolumeTime = estimateProcessingTime(highVolume);
      const lowVolumeTime = estimateProcessingTime(lowVolume);
      
      expect(highVolumeTime).toBeGreaterThan(lowVolumeTime);
    });

    it('should factor in application complexity', () => {
      const simple = { volume: 'Medium', complexity: 'Low', precision: 'Low', materials: ['Steel'], processes: ['Cleaning'] };
      const complex = { volume: 'Medium', complexity: 'Very High', precision: 'Extreme', materials: ['Titanium', 'Inconel'], processes: ['Cleaning', 'Preparation', 'Activation'] };
      
      const simpleTime = estimateProcessingTime(simple);
      const complexTime = estimateProcessingTime(complex);
      
      expect(complexTime).toBeGreaterThan(simpleTime);
    });
  });

  describe('Equipment Requirements', () => {
    it('should include basic equipment for all applications', () => {
      const automotive = mockApplicationData['automotive-surface-preparation'];
      const equipment = determineRequiredEquipment(automotive);
      
      expect(equipment).toContain('Laser Cleaning System');
      expect(equipment).toContain('Safety Equipment');
      expect(equipment).toContain('Monitoring Tools');
    });

    it('should add precision equipment for high-precision applications', () => {
      const aerospace = mockApplicationData['aerospace-component-cleaning'];
      const equipment = determineRequiredEquipment(aerospace);
      
      expect(equipment).toContain('Precision Positioning System');
      expect(equipment).toContain('Real-time Monitoring');
    });

    it('should add advanced equipment for complex applications', () => {
      const heritage = mockApplicationData['cultural-heritage-restoration'];
      const equipment = determineRequiredEquipment(heritage);
      
      expect(equipment).toContain('Advanced Control Software');
      expect(equipment).toContain('Environmental Controls');
    });
  });

  describe('Safety Guidelines Generation', () => {
    it('should include standard safety guidelines', () => {
      const automotive = mockApplicationData['automotive-surface-preparation'];
      const guidelines = generateSafetyGuidelines(automotive);
      
      expect(guidelines).toContain('Wear appropriate laser safety eyewear');
      expect(guidelines).toContain('Ensure proper ventilation for fume extraction');
      expect(guidelines).toContain('Follow lockout/tagout procedures');
    });

    it('should add material-specific safety guidelines', () => {
      const aerospace = mockApplicationData['aerospace-component-cleaning'];
      const guidelines = generateSafetyGuidelines(aerospace);
      
      expect(guidelines).toContain('Use specialized filters for exotic material particles');
    });

    it('should include industry-specific guidelines', () => {
      const heritage = mockApplicationData['cultural-heritage-restoration'];
      const guidelines = generateSafetyGuidelines(heritage);
      
      expect(guidelines).toContain('Document all procedures for conservation records');
      expect(guidelines).toContain('Use minimal power settings to preserve substrate');
    });
  });

  describe('Process Steps Generation', () => {
    it('should include standard process steps', () => {
      const automotive = mockApplicationData['automotive-surface-preparation'];
      const steps = generateProcessSteps(automotive);
      
      expect(steps).toContain('Surface inspection and documentation');
      expect(steps).toContain('Material identification and testing');
      expect(steps).toContain('Parameter selection and optimization');
      expect(steps).toContain('Process execution and monitoring');
      expect(steps).toContain('Quality verification and documentation');
    });

    it('should add aerospace-specific steps', () => {
      const aerospace = mockApplicationData['aerospace-component-cleaning'];
      const steps = generateProcessSteps(aerospace);
      
      expect(steps).toContain('Aerospace quality system verification');
      expect(steps).toContain('Final inspection per aerospace standards');
    });

    it('should add restoration-specific steps', () => {
      const heritage = mockApplicationData['cultural-heritage-restoration'];
      const steps = generateProcessSteps(heritage);
      
      expect(steps).toContain('Historical research and documentation');
      expect(steps).toContain('Conservation treatment documentation');
    });
  });

  describe('Industry-Specific Requirements', () => {
    it('should handle automotive industry requirements', () => {
      const automotive = mockApplicationData['automotive-surface-preparation'];
      
      expect(automotive.industry).toBe('Automotive');
      expect(automotive.volume).toBe('High');
      expect(automotive.materials).toContain('Steel');
      expect(automotive.materials).toContain('Aluminum');
    });

    it('should handle aerospace industry requirements', () => {
      const aerospace = mockApplicationData['aerospace-component-cleaning'];
      
      expect(aerospace.industry).toBe('Aerospace');
      expect(aerospace.precision).toBe('Very High');
      expect(aerospace.materials).toContain('Titanium');
      expect(aerospace.materials).toContain('Inconel');
    });

    it('should handle cultural heritage requirements', () => {
      const heritage = mockApplicationData['cultural-heritage-restoration'];
      
      expect(heritage.industry).toBe('Cultural Heritage');
      expect(heritage.precision).toBe('Extreme');
      expect(heritage.materials).toContain('Stone');
      expect(heritage.materials).toContain('Bronze');
    });
  });

  describe('Quality Standards Validation', () => {
    it('should validate surface finish requirements', () => {
      const validateSurfaceFinish = (requirement) => {
        return requirement.includes('Ra') || requirement.includes('Preserve') || requirement.includes('μm');
      };
      
      Object.values(mockApplicationData).forEach(app => {
        expect(validateSurfaceFinish(app.requirements.surfaceFinish)).toBe(true);
      });
    });

    it('should validate contaminant removal percentages', () => {
      const validateContaminantRemoval = (requirement) => {
        const percentage = parseFloat(requirement.replace('%', ''));
        return percentage >= 90 && percentage <= 100;
      };
      
      Object.values(mockApplicationData).forEach(app => {
        expect(validateContaminantRemoval(app.requirements.contaminantRemoval)).toBe(true);
      });
    });

    it('should validate heat affected zone limits', () => {
      const validateHAZ = (requirement) => {
        const value = parseFloat(requirement.replace('<', '').replace('μm', ''));
        return value > 0 && value <= 100;
      };
      
      Object.values(mockApplicationData).forEach(app => {
        expect(validateHAZ(app.requirements.heatAffectedZone)).toBe(true);
      });
    });
  });

  describe('Application Comparison and Selection', () => {
    it('should compare applications by complexity', () => {
      const applications = Object.values(mockApplicationData);
      const complexities = applications.map(app => ({
        title: app.title,
        complexity: calculateApplicationComplexity(app)
      }));
      
      const sorted = complexities.sort((a, b) => b.complexity - a.complexity);
      
      expect(sorted[0].title).toContain('Cultural Heritage');
      expect(sorted[sorted.length - 1].title).toContain('Automotive');
    });

    it('should filter applications by industry', () => {
      const applications = Object.values(mockApplicationData);
      const automotiveApps = applications.filter(app => app.industry === 'Automotive');
      const aerospaceApps = applications.filter(app => app.industry === 'Aerospace');
      
      expect(automotiveApps).toHaveLength(1);
      expect(aerospaceApps).toHaveLength(1);
      expect(automotiveApps[0].title).toContain('Automotive');
    });

    it('should find applications by material compatibility', () => {
      const findApplicationsByMaterial = (material) => {
        return Object.values(mockApplicationData).filter(app => 
          app.materials.includes(material)
        );
      };
      
      const aluminumApps = findApplicationsByMaterial('Aluminum');
      const titaniumApps = findApplicationsByMaterial('Titanium');
      
      expect(aluminumApps).toHaveLength(2);
      expect(titaniumApps).toHaveLength(1);
    });
  });

  describe('Performance and Efficiency', () => {
    it('should efficiently process multiple applications', () => {
      const startTime = Date.now();
      
      const applications = Object.values(mockApplicationData);
      const guides = applications.map(generateApplicationGuide);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      expect(guides).toHaveLength(3);
      expect(processingTime).toBeLessThan(100);
    });

    it('should cache application calculations', () => {
      const cache = new Map();
      
      const getCachedComplexity = (application) => {
        const key = application.title;
        if (cache.has(key)) {
          return cache.get(key);
        }
        
        const complexity = calculateApplicationComplexity(application);
        cache.set(key, complexity);
        return complexity;
      };
      
      const automotive = mockApplicationData['automotive-surface-preparation'];
      
      const firstCall = getCachedComplexity(automotive);
      const secondCall = getCachedComplexity(automotive);
      
      expect(firstCall).toBe(secondCall);
      expect(cache.size).toBe(1);
    });

    it('should handle batch application processing', () => {
      const processBatch = (applications) => {
        return applications.map(app => {
          try {
            validateApplicationRequirements(app);
            return {
              success: true,
              application: app.title,
              guide: generateApplicationGuide(app)
            };
          } catch (error) {
            return {
              success: false,
              application: app.title || 'unknown',
              error: error.message
            };
          }
        });
      };
      
      const applications = Object.values(mockApplicationData);
      const results = processBatch(applications);
      
      expect(results).toHaveLength(3);
      expect(results.every(r => r.success)).toBe(true);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle incomplete application data', () => {
      const incompleteApp = {
        title: 'Incomplete Application',
        industry: 'Unknown'
      };
      
      expect(() => {
        validateApplicationRequirements(incompleteApp);
      }).toThrow();
    });

    it('should handle extreme complexity values', () => {
      const extremeApp = {
        complexity: 'Extreme',
        precision: 'Extreme',
        materials: Array(20).fill('Material'),
        processes: Array(15).fill('Process')
      };
      
      const complexity = calculateApplicationComplexity(extremeApp);
      expect(complexity).toBeLessThanOrEqual(5);
    });

    it('should provide fallbacks for missing data', () => {
      const getApplicationWithFallbacks = (app) => {
        return {
          title: app.title || 'Unknown Application',
          industry: app.industry || 'General',
          complexity: app.complexity || 'Medium',
          materials: app.materials || ['General'],
          processes: app.processes || ['General Cleaning']
        };
      };
      
      const incompleteApp = { title: 'Test' };
      const withFallbacks = getApplicationWithFallbacks(incompleteApp);
      
      expect(withFallbacks.industry).toBe('General');
      expect(withFallbacks.complexity).toBe('Medium');
    });
  });
});
