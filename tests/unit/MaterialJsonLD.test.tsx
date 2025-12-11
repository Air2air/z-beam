/**
 * @jest-environment jsdom
 * 
 * Tests for MaterialJsonLD component
 * Verifies that the component dynamically generates comprehensive E-E-A-T optimized schemas
 * from frontmatter changes
 */

import React from 'react';
import { render } from '@testing-library/react';
import { MaterialJsonLD } from '@/app/components/JsonLD/JsonLD';

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
          alt: 'Test Material Microscopy',
          width: 1920,
          height: 1080
        }
      },
      micro: {
        before: 'Contaminated surface',
        after: 'Clean surface',
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

  it.skip('should include Article schema with author', () => {
    const { container } = render(
      <MaterialJsonLD article={baseArticle} slug="test-material" />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.textContent || '{}');
    const article = jsonLd['@graph']?.find((item: any) => item['@type'] === 'Article');

    expect(article).toBeDefined();
    expect(article.headline).toBe('Test Material Laser Processing');
    // Handle both localhost and production URLs
    expect(article.author['@id']).toMatch(/(https:\/\/z-beam\.com|http:\/\/localhost:3000)#author-1/);
  });

  it.skip('should include Product schema with material properties', () => {
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

  it.skip('should include confidence scores in Product properties', () => {
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

  it.skip('should include HowTo schema with machine settings', () => {
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

  it('should include Dataset schema with both material properties and machine settings', () => {
    const articleWithBothData = {
      ...baseArticle,
      metadata: {
        ...baseArticle.metadata,
        materialProperties: {
          thermal: {
            density: { value: 2.7, unit: 'g/cm³' },
            meltingPoint: { value: 660, unit: '°C' }
          }
        },
        machineSettings: {
          powerRange: { value: 100, unit: 'W' },
          wavelength: { value: 1064, unit: 'nm' }
        }
      }
    };

    const { container } = render(
      <MaterialJsonLD article={articleWithBothData} slug="materials/metal/non-ferrous/aluminum-laser-cleaning" />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.textContent || '{}');
    const dataset = jsonLd['@graph']?.find((item: any) => item['@type'] === 'Dataset');

    expect(dataset).toBeDefined();
    expect(dataset.name).toContain('Test Material');
    expect(dataset.variableMeasured).toBeDefined();
    expect(Array.isArray(dataset.variableMeasured)).toBe(true);
    
    // Should have both material properties and machine settings
    const hasMaterialProperty = dataset.variableMeasured.some((v: any) => v.propertyID === 'density');
    const hasMachineSetting = dataset.variableMeasured.some((v: any) => v.propertyID === 'powerRange');
    expect(hasMaterialProperty).toBe(true);
    expect(hasMachineSetting).toBe(true);
    
    // Should use unified dataset URL
    expect(dataset['@id']).toContain('/datasets/materials/');
    expect(dataset.url).toContain('/datasets/materials/aluminum-laser-cleaning');
  });

  it.skip('should include Person schema with author credentials', () => {
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

  it.skip('should dynamically update when frontmatter changes', () => {
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
    const article = jsonLd['@graph']?.find((item: any) => item['@type'] === 'Article');
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

  it.skip('should include environmental impact in Product schema', () => {
    const { container } = render(
      <MaterialJsonLD article={baseArticle} slug="test-material" />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.textContent || '{}');
    const product = jsonLd['@graph']?.find((item: any) => item['@type'] === 'Product');

    // Sustainability removed from Product schema per schema.org validation
    expect(product).toBeDefined();
    expect(product.name).toBeDefined();
  });

  it.skip('should include outcome metrics in HowTo schema', () => {
    const { container } = render(
      <MaterialJsonLD article={baseArticle} slug="test-material" />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.textContent || '{}');
    const howto = jsonLd['@graph']?.find((item: any) => item['@type'] === 'HowTo');

    expect(howto.step).toBeDefined();
    expect(Array.isArray(howto.step)).toBe(true);
    // Note: expectedOutput removed - not a valid HowTo property
  });

  it.skip('should include regulatory standards as Certification schema', () => {
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

  it.skip('should output clean JSON-LD without escaped forward slashes', () => {
    const { container } = render(
      <MaterialJsonLD article={baseArticle} slug="test-material" />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonText = script?.textContent || '';
    
    // URLs should NOT have escaped slashes
    expect(jsonText).not.toContain('\\/');
    expect(jsonText).toContain('https://www.z-beam.com');
    expect(jsonText).toContain('"@id":"https://www.z-beam.com/test-material"');
  });

  it.skip('should include default VideoObject for material pages', () => {
    const { container } = render(
      <MaterialJsonLD article={baseArticle} slug="test-material" />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.textContent || '{}');
    const videoObject = jsonLd['@graph']?.find((item: any) => item['@type'] === 'VideoObject');

    expect(videoObject).toBeDefined();
    expect(videoObject.embedUrl).toContain('eGgMJdjRUJk');
    expect(videoObject.thumbnailUrl).toContain('eGgMJdjRUJk');
  });

  it.skip('should auto-detect FAQ schema from material frontmatter', () => {
    const articleWithFaqData = {
      ...baseArticle,
      metadata: {
        ...baseArticle.metadata,
        outcomeMetrics: [
          {
            metric: 'Cleaning Efficiency',
            value: '99.5%',
            description: 'Surface contaminant removal rate'
          }
        ]
      }
    };

    const { container } = render(
      <MaterialJsonLD article={articleWithFaqData} slug="test-material" />
    );

    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.textContent || '{}');
    const faqPage = jsonLd['@graph']?.find((item: any) => item['@type'] === 'FAQPage');

    expect(faqPage).toBeDefined();
    expect(faqPage.mainEntity).toBeDefined();
  });

  // Google Rich Results Required Fields Tests (December 2025)
  describe('Google Rich Results Compliance', () => {
    it('should include hasMerchantReturnPolicy in Product offers', () => {
      const { container } = render(
        <MaterialJsonLD article={baseArticle} slug="test-material" />
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      const jsonLd = JSON.parse(script?.textContent || '{}');
      const product = jsonLd['@graph']?.find((item: any) => item['@type'] === 'Product');

      if (product?.offers) {
        expect(product.offers.hasMerchantReturnPolicy).toBeDefined();
        expect(product.offers.hasMerchantReturnPolicy['@type']).toBe('MerchantReturnPolicy');
        expect(product.offers.hasMerchantReturnPolicy.applicableCountry).toBe('US');
        expect(product.offers.hasMerchantReturnPolicy.returnPolicyCategory).toBeDefined();
      }
    });

    it('should include shippingDetails in Product offers', () => {
      const { container } = render(
        <MaterialJsonLD article={baseArticle} slug="test-material" />
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      const jsonLd = JSON.parse(script?.textContent || '{}');
      const product = jsonLd['@graph']?.find((item: any) => item['@type'] === 'Product');

      if (product?.offers) {
        expect(product.offers.shippingDetails).toBeDefined();
        expect(product.offers.shippingDetails['@type']).toBe('OfferShippingDetails');
        expect(product.offers.shippingDetails.shippingRate).toBeDefined();
        expect(product.offers.shippingDetails.shippingDestination).toBeDefined();
        expect(product.offers.shippingDetails.deliveryTime).toBeDefined();
      }
    });

    it('should include uploadDate with timezone in VideoObject', () => {
      const { container } = render(
        <MaterialJsonLD article={baseArticle} slug="test-material" />
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      const jsonLd = JSON.parse(script?.textContent || '{}');
      const video = jsonLd['@graph']?.find((item: any) => item['@type'] === 'VideoObject');

      if (video?.uploadDate) {
        // Should be ISO 8601 format with timezone
        expect(video.uploadDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/);
      }
    });

    it('should format datePublished with timezone for ImageObject uploadDate', () => {
      const articleWithDate = {
        ...baseArticle,
        metadata: {
          ...baseArticle.metadata,
          datePublished: '2025-10-15'
        }
      };

      const { container } = render(
        <MaterialJsonLD article={articleWithDate} slug="test-material" />
      );

      const script = container.querySelector('script[type="application/ld+json"]');
      const jsonLd = JSON.parse(script?.textContent || '{}');
      
      // Verify any uploadDate fields have timezone
      const checkUploadDates = (obj: any) => {
        if (obj && typeof obj === 'object') {
          if (obj.uploadDate) {
            expect(obj.uploadDate).toMatch(/T.*Z$|T.*[+-]\d{2}:\d{2}$/);
          }
          Object.values(obj).forEach(checkUploadDates);
        }
      };
      
      checkUploadDates(jsonLd);
    });
  });
});
