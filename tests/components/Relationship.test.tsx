/**
 * Relationship Component Tests
 * 
 * Tests the universal Relationship component that encapsulates
 * the GridSection + DataGrid pattern for rendering linkage sections.
 * 
 * Created: December 17, 2025
 * Related: MAXIMUM_REUSABILITY_ACHIEVED.md
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Relationship } from '@/app/components/Relationship/Relationship';
import { 
  mapContaminantToGrid, 
  mapMaterialToGrid, 
  mapSettingToGrid,
  type RelatedContaminant,
  type RelatedMaterial,
  type RelatedSetting
} from '@/app/utils/gridMappers';
import { sortAlphabetically, sortBySeverity } from '@/app/utils/gridSorters';

// Mock CardGrid component
jest.mock('@/app/components/CardGrid/CardGrid', () => ({
  CardGrid: ({ items }: { items: any[] }) => (
    <div data-testid="card-grid">
      {items?.map((item, index) => (
        <div key={index} data-testid="grid-item">
          <a href={item.href}>{item.frontmatter?.title || 'No title'}</a>
          {item.frontmatter?.subject && <p>{item.frontmatter.subject}</p>}
        </div>
      ))}
    </div>
  ),
}));

describe('Relationship Component', () => {
  describe('Conditional Rendering', () => {
    it('should return null when data is undefined', () => {
      const { container } = render(
        <Relationship
          data={undefined}
          title="Test Section"
          mapper={mapMaterialToGrid}
        />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('should return null when data is empty array', () => {
      const { container } = render(
        <Relationship
          data={[]}
          title="Test Section"
          mapper={mapMaterialToGrid}
        />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('should render section when data exists', () => {
      const mockData: RelatedMaterial[] = [{
        title: 'Test Material',
        url: '/materials/test',
        material_type: 'Metal',
        micro: 'Test micro content'
      }];

      render(
        <Relationship
          data={mockData}
          title="Test Section"
          mapper={mapMaterialToGrid}
        />
      );
      
      expect(screen.getByText('Test Section')).toBeInTheDocument();
    });
  });

  describe('Type Safety with Generics', () => {
    it('should work with RelatedContaminant type', () => {
      const mockData: RelatedContaminant[] = [{
        title: 'Test Contaminant',
        url: '/contaminants/test',
        contaminant_category: 'Organic',
        micro: 'Test micro content'
      }];

      render(
        <Relationship
          data={mockData}
          title="Related Contaminants"
          mapper={mapContaminantToGrid}
        />
      );
      
      expect(screen.getByText('Related Contaminants')).toBeInTheDocument();
    });

    it('should work with RelatedMaterial type', () => {
      const mockData: RelatedMaterial[] = [{
        title: 'Test Material',
        url: '/materials/test',
        material_type: 'Metal',
        micro: 'Test micro content'
      }];

      render(
        <Relationship
          data={mockData}
          title="Related Materials"
          mapper={mapMaterialToGrid}
        />
      );
      
      expect(screen.getByText('Related Materials')).toBeInTheDocument();
    });

    it('should work with RelatedSetting type', () => {
      const mockData: RelatedSetting[] = [{
        title: 'Test Setting',
        url: '/settings/test',
        setting_category: 'Precision',
        micro: 'Test micro content'
      }];

      render(
        <Relationship
          data={mockData}
          title="Related Settings"
          mapper={mapSettingToGrid}
        />
      );
      
      expect(screen.getByText('Related Settings')).toBeInTheDocument();
    });
  });

  describe('Mapper Integration', () => {
    it('should apply mapper function to transform data', () => {
      const mockData: RelatedMaterial[] = [{
        title: 'Aluminum',
        url: '/materials/aluminum',
        material_type: 'Metal',
        micro: 'Lightweight metal for aerospace'
      }];

      render(
        <Relationship
          data={mockData}
          title="Materials"
          mapper={mapMaterialToGrid}
        />
      );
      
      // Verify transformed data is rendered
      expect(screen.getByText('Aluminum')).toBeInTheDocument();
      expect(screen.getByText('Lightweight metal for aerospace')).toBeInTheDocument();
    });

    it('should handle multiple items with mapper', () => {
      const mockData: RelatedMaterial[] = [
        {
          title: 'Aluminum',
          url: '/materials/aluminum',
          material_type: 'Metal',
          micro: 'Lightweight metal'
        },
        {
          title: 'Steel',
          url: '/materials/steel',
          material_type: 'Metal',
          micro: 'Strong alloy'
        }
      ];

      render(
        <Relationship
          data={mockData}
          title="Materials"
          mapper={mapMaterialToGrid}
        />
      );
      
      expect(screen.getByText('Aluminum')).toBeInTheDocument();
      expect(screen.getByText('Steel')).toBeInTheDocument();
    });
  });

  describe('Sorter Integration', () => {
    it('should apply sorter function to order data', () => {
      const mockData: RelatedMaterial[] = [
        {
          title: 'Zinc',
          url: '/materials/zinc',
          material_type: 'Metal',
          micro: 'Protective coating'
        },
        {
          title: 'Aluminum',
          url: '/materials/aluminum',
          material_type: 'Metal',
          micro: 'Lightweight metal'
        }
      ];

      const { container } = render(
        <Relationship
          data={mockData}
          title="Materials"
          mapper={mapMaterialToGrid}
          sorter={sortAlphabetically}
        />
      );
      
      // After sorting by title, Aluminum should come before Zinc
      const links = container.querySelectorAll('[data-testid="grid-item"] a');
      expect(links[0]).toHaveTextContent('Aluminum');
      expect(links[1]).toHaveTextContent('Zinc');
    });
  });

  describe('Description Prop', () => {
    it('should render description when provided', () => {
      const mockData: RelatedMaterial[] = [{
        title: 'Test Material',
        url: '/materials/test',
        material_type: 'Metal',
        micro: 'Test micro'
      }];

      render(
        <Relationship
          data={mockData}
          title="Test Section"
          description="This is a test description"
          mapper={mapMaterialToGrid}
        />
      );
      
      expect(screen.getByText('This is a test description')).toBeInTheDocument();
    });

    it('should not render description when omitted', () => {
      const mockData: RelatedMaterial[] = [{
        title: 'Test Material',
        url: '/materials/test',
        material_type: 'Metal',
        micro: 'Test micro'
      }];

      const { container } = render(
        <Relationship
          data={mockData}
          title="Test Section"
          mapper={mapMaterialToGrid}
        />
      );
      
      // Should not have description element
      const description = container.querySelector('.section-description');
      expect(description).toBeNull();
    });
  });

  describe('Variant and Columns Props', () => {
    it('should render with data when no variant specified', () => {
      const mockData: RelatedMaterial[] = [{
        title: 'Test Material',
        url: '/materials/test',
        material_type: 'Metal',
        micro: 'Test micro'
      }];

      const { container } = render(
        <Relationship
          data={mockData}
          title="Test Section"
          mapper={mapMaterialToGrid}
        />
      );
      
      // Verify grid is rendered with data
      const grid = container.querySelector('[data-testid="card-grid"]');
      expect(grid).toBeInTheDocument();
      expect(screen.getByText('Test Material')).toBeInTheDocument();
    });

    it('should apply relationship variant when specified', () => {
      const mockData: RelatedMaterial[] = [{
        title: 'Test Material',
        url: '/materials/test',
        material_type: 'Metal',
        micro: 'Test micro'
      }];

      render(
        <Relationship
          data={mockData}
          title="Test Section"
          mapper={mapMaterialToGrid}
          variant="relationship"
        />
      );
      
      // Variant should be passed to DataGrid
      expect(screen.getByText('Test Section')).toBeInTheDocument();
    });

    it('should apply custom columns when specified', () => {
      const mockData: RelatedMaterial[] = [{
        title: 'Test Material',
        url: '/materials/test',
        material_type: 'Metal',
        micro: 'Test micro'
      }];

      render(
        <Relationship
          data={mockData}
          title="Test Section"
          mapper={mapMaterialToGrid}
          columns={4}
        />
      );
      
      // Columns should be passed to DataGrid
      expect(screen.getByText('Test Section')).toBeInTheDocument();
    });
  });

  describe('Real-World Usage Patterns', () => {
    it('should match ContaminantsLayout usage pattern', () => {
      const mockData: RelatedMaterial[] = [{
        title: 'Aluminum',
        url: '/materials/aluminum',
        material_type: 'Metal',
        micro: 'Lightweight metal'
      }];

      render(
        <Relationship
          data={mockData}
          title="Related Materials"
          description="Materials commonly associated with this contamination"
          mapper={mapMaterialToGrid}
          sorter={sortBySeverity}
          variant="relationship"
        />
      );
      
      expect(screen.getByText('Related Materials')).toBeInTheDocument();
      expect(screen.getByText('Materials commonly associated with this contamination')).toBeInTheDocument();
    });

    it('should match MaterialsLayout usage pattern', () => {
      const mockData: RelatedContaminant[] = [{
        title: 'Rust',
        url: '/contaminants/rust',
        contaminant_category: 'Corrosion',
        micro: 'Iron oxide formation'
      }];

      render(
        <Relationship
          data={mockData}
          title="Removes Contaminants"
          description="Contaminants effectively removed by this material"
          mapper={mapContaminantToGrid}
          sorter={sortAlphabetically}
          variant="relationship"
        />
      );
      
      expect(screen.getByText('Removes Contaminants')).toBeInTheDocument();
      expect(screen.getByText('Contaminants effectively removed by this material')).toBeInTheDocument();
    });

    it('should match SettingsLayout usage pattern', () => {
      const mockData: RelatedMaterial[] = [{
        title: 'Steel',
        url: '/materials/steel',
        material_type: 'Metal',
        micro: 'Strong alloy'
      }];

      render(
        <Relationship
          data={mockData}
          title="Related Materials"
          description="Materials that work well with these settings"
          mapper={mapMaterialToGrid}
          sorter={sortAlphabetically}
          variant="relationship"
        />
      );
      
      expect(screen.getByText('Related Materials')).toBeInTheDocument();
      expect(screen.getByText('Materials that work well with these settings')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle data with missing optional fields', () => {
      const mockData: RelatedMaterial[] = [{
        title: 'Test Material',
        url: '/materials/test',
        material_type: 'Metal'
        // micro is optional and omitted
      }];

      render(
        <Relationship
          data={mockData}
          title="Materials"
          mapper={mapMaterialToGrid}
        />
      );
      
      expect(screen.getByText('Test Material')).toBeInTheDocument();
    });

    it('should handle large datasets', () => {
      const mockData: RelatedMaterial[] = Array.from({ length: 30 }, (_, i) => ({
        title: `Material ${i}`,
        url: `/materials/material-${i}`,
        material_type: 'Metal',
        micro: `Description ${i}`
      }));

      render(
        <Relationship
          data={mockData}
          title="Materials"
          mapper={mapMaterialToGrid}
        />
      );
      
      expect(screen.getByText('Material 0')).toBeInTheDocument();
      expect(screen.getByText('Material 29')).toBeInTheDocument();
    });
  });
});
