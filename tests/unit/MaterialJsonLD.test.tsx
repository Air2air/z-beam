/**
 * @jest-environment jsdom
 * 
 * Tests for MaterialJsonLD component
 * Verifies that the component dynamically generates comprehensive E-E-A-T optimized schemas
 * from frontmatter changes
 */

import React from 'react';
import { render } from '@testing-library/react';
import { MaterialJsonLD } from '../../app/components/JsonLD/JsonLD';

describe('MaterialJsonLD Component', () => {
  const baseArticle = {
    metadata: {
      title: 'Test Material Laser Processing',
      description: 'Test material description',
      category: 'metal',
      subcategory: 'alloy',
      name: 'Test Material',
      subtitle: 'Advanced laser processing properties',
      datePublished: '2025-10-15T00:00:00Z',
      dateModified: '2025-10-16T00:00:00Z',
      author: {
        id: 1,
        name: 'Dr. Test Scientist',
        title: 'Ph.D.',
        country: 'USA',
        expertise: 'Laser Materials Science',
        image: '/images/authors/test-scientist.jpg'
      },
      images: {
        hero: {
          url: '/images/test-material.jpg',
          alt: 'Test Material Microscopy'
        }
      },
      caption: {
        beforeText: 'Contaminated surface',
        afterText: 'Clean surface',
        description: 'Surface analysis shows improved cleanliness'
      },
      applications: [
        'Aerospace',
        'Medical Devices'
      ],
      materialProperties: {
        laser_material_interaction: {
          laserAbsorption: {
            value: 85.0,
            unit: '%',
            confidence: 92,
            description: 'High absorption in IR spectrum',
            min: 80.0,
            max: 90.0,
            source: 'Test Lab Database',
            notes: 'Measured at 1064nm',
            metadata: {
              last_verified: '2025-10-15T00:00:00Z',
              verification_source: 'Lab measurement'
            }
          }
        },
        material_characteristics: {
          thermalConductivity: {
            value: 200.0,
            unit: 'W/m·K',
            confidence: 95,
            description: 'Excellent thermal conductor',
            min: 190.0,
            max: 210.0,
            source: 'Materials Handbook',
            notes: 'At room temperature',
            metadata: {
              last_verified: '2025-10-15T00:00:00Z'
            }
          }
        }
      },
      machineSettings: {
        powerRange: {
          value: '50-100',
          unit: 'W',
          description: 'Optimal power range for surface cleaning'
        },
        wavelength: {
          value: '1064',
          unit: 'nm',
          description: 'Nd:YAG laser wavelength'
        },
        spotSize: {
          value: '50',
          unit: 'μm',
          description: 'Focused beam diameter'
        },
        scanSpeed: {
          value: '100',
          unit: 'mm/s',
          description: 'Linear scanning velocity'
        }
      },
      environmentalImpact: [
        {
          benefit: 'Zero Chemical Waste',
          description: 'Eliminates hazardous cleaning chemicals',
          quantifiedBenefits: 'Up to 100% reduction in chemical use'
        }
      ],
      outcomeMetrics: [
        {
          metric: 'Cleaning Efficiency',
          description: 'Percentage of contaminant removal',
          typicalRanges: '95-99.9%',
          measurementMethod: 'Surface profilometry and microscopy'
        }
      ],
      regulatoryStandards: [
        {
          name: 'FDA 21 CFR Part 820',
          description: 'Quality System Regulation for medical device manufacturing',
          issuingOrganization: 'FDA'
        }
      ]
    }
  };

  it('should render script tag with JSON-LD', () => {
    const { container } = render(
      <MaterialJsonLD article={baseArticle} slug="test-material" />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeTruthy();
  });

  it('should generate @graph structure with multiple schema types', () => {
    const { container } = render(
      <MaterialJsonLD article={baseArticle} slug="test-material" />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.textContent || '{}');

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@graph']).toBeDefined();
    expect(Array.isArray(jsonLd['@graph'])).toBe(true);
  });

  it('should include TechnicalArticle schema with author', () => {
    const { container } = render(
      <MaterialJsonLD article={baseArticle} slug="test-material" />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.textContent || '{}');
    const article = jsonLd['@graph']?.find((item: any) => item['@type'] === 'TechnicalArticle');

    expect(article).toBeDefined();
    expect(article.headline).toBe('Test Material Laser Processing');
    expect(article.author['@id']).toBe('https://z-beam.com#author-1');
  });

  it('should include Product schema with material properties', () => {
    const { container } = render(
      <MaterialJsonLD article={baseArticle} slug="test-material" />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.textContent || '{}');
    const product = jsonLd['@graph']?.find((item: any) => item['@type'] === 'Product');

    expect(product).toBeDefined();
    expect(product.name).toBe('Test Material');
    expect(product.category).toBe('metal - alloy');
    expect(product.additionalProperty).toBeDefined();
    expect(Array.isArray(product.additionalProperty)).toBe(true);
  });

  it('should include confidence scores in Product properties', () => {
    const { container } = render(
      <MaterialJsonLD article={baseArticle} slug="test-material" />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.textContent || '{}');
    const product = jsonLd['@graph']?.find((item: any) => item['@type'] === 'Product');

    const absorption = product.additionalProperty.find(
      (prop: any) => prop.name === 'laserAbsorption'
    );
    
    expect(absorption).toBeDefined();
    expect(absorption.value).toBe(85.0);
    expect(absorption.unitText).toBe('%');
    expect(absorption.additionalProperty.name).toBe('Confidence Score');
    expect(absorption.additionalProperty.value).toBe(92);
  });

  it('should include HowTo schema with machine settings', () => {
    const { container } = render(
      <MaterialJsonLD article={baseArticle} slug="test-material" />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.textContent || '{}');
    const howto = jsonLd['@graph']?.find((item: any) => item['@type'] === 'HowTo');

    expect(howto).toBeDefined();
    expect(howto.name).toContain('Test Material');
    expect(howto.step).toBeDefined();
    expect(Array.isArray(howto.step)).toBe(true);
    expect(howto.step.length).toBeGreaterThan(0);
  });

  it('should include Dataset schema with verification metadata', () => {
    const { container } = render(
      <MaterialJsonLD article={baseArticle} slug="test-material" />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.textContent || '{}');
    const dataset = jsonLd['@graph']?.find((item: any) => item['@type'] === 'Dataset');

    expect(dataset).toBeDefined();
    expect(dataset.name).toContain('Test Material');
    expect(dataset.variableMeasured).toBeDefined();
    expect(Array.isArray(dataset.variableMeasured)).toBe(true);
  });

  it('should include Person schema with author credentials', () => {
    const { container } = render(
      <MaterialJsonLD article={baseArticle} slug="test-material" />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.textContent || '{}');
    const person = jsonLd['@graph']?.find((item: any) => item['@type'] === 'Person');

    expect(person).toBeDefined();
    expect(person.name).toBe('Dr. Test Scientist');
    expect(person.jobTitle).toBe('Ph.D.');
    expect(person.knowsAbout).toBe('Laser Materials Science');
    expect(person.nationality).toBe('USA');
  });

  it('should include BreadcrumbList schema', () => {
    const { container } = render(
      <MaterialJsonLD article={baseArticle} slug="test-material" />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.textContent || '{}');
    const breadcrumb = jsonLd['@graph']?.find((item: any) => item['@type'] === 'BreadcrumbList');

    expect(breadcrumb).toBeDefined();
    expect(breadcrumb.itemListElement).toBeDefined();
    expect(Array.isArray(breadcrumb.itemListElement)).toBe(true);
  });

  it('should dynamically update when frontmatter changes', () => {
    const modifiedArticle = {
      ...baseArticle,
      metadata: {
        ...baseArticle.metadata,
        title: 'Updated Material Title',
        author: {
          ...baseArticle.metadata.author,
          name: 'Dr. New Scientist'
        },
        materialProperties: {
          ...baseArticle.metadata.materialProperties,
          laser_material_interaction: {
            laserAbsorption: {
              ...baseArticle.metadata.materialProperties.laser_material_interaction.laserAbsorption,
              value: 90.0, // Changed from 85.0
              confidence: 95 // Changed from 92
            }
          }
        }
      }
    };

    const { container } = render(
      <MaterialJsonLD article={modifiedArticle} slug="test-material" />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.textContent || '{}');
    
    // Verify title change
    const article = jsonLd['@graph']?.find((item: any) => item['@type'] === 'TechnicalArticle');
    expect(article.headline).toBe('Updated Material Title');
    
    // Verify author change
    const person = jsonLd['@graph']?.find((item: any) => item['@type'] === 'Person');
    expect(person.name).toBe('Dr. New Scientist');
    
    // Verify property change
    const product = jsonLd['@graph']?.find((item: any) => item['@type'] === 'Product');
    const absorption = product.additionalProperty.find(
      (prop: any) => prop.name === 'laserAbsorption'
    );
    expect(absorption.value).toBe(90.0);
    expect(absorption.additionalProperty.value).toBe(95);
  });

  it('should include environmental impact in Product schema', () => {
    const { container } = render(
      <MaterialJsonLD article={baseArticle} slug="test-material" />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.textContent || '{}');
    const product = jsonLd['@graph']?.find((item: any) => item['@type'] === 'Product');

    expect(product.sustainability).toBeDefined();
    expect(Array.isArray(product.sustainability)).toBe(true);
    expect(product.sustainability[0].name).toBe('Zero Chemical Waste');
  });

  it('should include outcome metrics in HowTo schema', () => {
    const { container } = render(
      <MaterialJsonLD article={baseArticle} slug="test-material" />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.textContent || '{}');
    const howto = jsonLd['@graph']?.find((item: any) => item['@type'] === 'HowTo');

    expect(howto.expectedOutput).toBeDefined();
    expect(Array.isArray(howto.expectedOutput)).toBe(true);
    expect(howto.expectedOutput[0].name).toBe('Cleaning Efficiency');
  });

  it('should include regulatory standards as Certification schema', () => {
    const { container } = render(
      <MaterialJsonLD article={baseArticle} slug="test-material" />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.textContent || '{}');
    const certification = jsonLd['@graph']?.find((item: any) => item['@type'] === 'Certification');

    expect(certification).toBeDefined();
    expect(certification.name).toContain('FDA 21 CFR Part 820');
  });

  it('should handle missing optional frontmatter fields gracefully', () => {
    const minimalArticle = {
      metadata: {
        title: 'Minimal Material',
        description: 'Basic description',
        category: 'stone',
        name: 'Minimal Material',
        datePublished: '2025-10-15T00:00:00Z',
        materialProperties: {
          laser_material_interaction: {
            laserAbsorption: {
              value: 80.0,
              unit: '%',
              confidence: 85,
              description: 'Basic absorption'
            }
          }
        }
      }
    };

    const { container } = render(
      <MaterialJsonLD article={minimalArticle} slug="minimal-material" />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeTruthy();
    
    // Should not throw error
    const jsonLd = JSON.parse(script?.textContent || '{}');
    expect(jsonLd['@graph']).toBeDefined();
  });

  it('should return null for invalid article data', () => {
    const { container } = render(
      <MaterialJsonLD article={null} slug="invalid" />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeNull();
  });
});
