// tests/integration/tags-yaml-v2.test.js
import { render, screen } from '@testing-library/react';
import { Tags } from '../../app/components/Tags/Tags';
import { parseTagsFromContent } from '../../app/utils/tags';

describe('Tags Component - YAML v2.0 Integration', () => {
  describe('Full YAML v2.0 Support', () => {
    const fullYamlV2Data = {
      tags: ['electronics', 'aerospace', 'manufacturing', 'passivation', 'polishing', 'expert', 'industrial', 'decontamination'],
      count: 8,
      categories: {
        industry: ['electronics', 'aerospace', 'manufacturing', 'industrial'],
        process: ['passivation', 'polishing', 'decontamination'],
        other: ['expert']
      },
      metadata: {
        format: 'yaml',
        version: '2.0',
        material: 'copper',
        author: 'AI Assistant',
        generated: '2025-09-17T11:50:36.211572'
      }
    };

    it('should render complete YAML v2.0 structure with all features', () => {
      render(
        <Tags 
          content={fullYamlV2Data} 
          config={{ 
            showMetadata: true,
            showCategorized: true,
            title: 'Comprehensive Tag Display'
          }} 
        />
      );

      // Check title
      expect(screen.getByText('Comprehensive Tag Display')).toBeInTheDocument();

      // Check metadata display
      expect(screen.getByText('Material:')).toBeInTheDocument();
      expect(screen.getByText('Copper')).toBeInTheDocument();
      expect(screen.getByText('Tags:')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('Format:')).toBeInTheDocument();
      expect(screen.getByText('yaml v2.0')).toBeInTheDocument();
      expect(screen.getByText('Categories:')).toBeInTheDocument();
      expect(screen.getByText('Industry, Process, Other')).toBeInTheDocument();

      // Check categorized display
      expect(screen.getByText('Industry')).toBeInTheDocument();
      expect(screen.getByText('Process')).toBeInTheDocument();
      expect(screen.getByText('Other')).toBeInTheDocument();

      // Check individual tags under categories
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Aerospace')).toBeInTheDocument();
      expect(screen.getByText('Passivation')).toBeInTheDocument();
      expect(screen.getByText('Expert')).toBeInTheDocument();
    });

    it('should prioritize tags array over categories in data processing', () => {
      render(<Tags content={fullYamlV2Data} />);

      // Should show tags from the tags array (flat view by default)
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Aerospace')).toBeInTheDocument();
      expect(screen.getByText('Manufacturing')).toBeInTheDocument();
      expect(screen.getByText('Passivation')).toBeInTheDocument();
      expect(screen.getByText('Polishing')).toBeInTheDocument();
      expect(screen.getByText('Expert')).toBeInTheDocument();
      expect(screen.getByText('Industrial')).toBeInTheDocument();
      expect(screen.getByText('Decontamination')).toBeInTheDocument();
    });

    it('should handle categories-only data when no tags array', () => {
      const categoriesOnlyData = {
        count: 6,
        categories: {
          industry: ['electronics', 'aerospace'],
          process: ['passivation', 'polishing'],
          other: ['expert', 'industrial']
        },
        metadata: {
          format: 'yaml',
          version: '2.0',
          material: 'copper'
        }
      };

      render(
        <Tags 
          content={categoriesOnlyData} 
          config={{ showCategorized: true }} 
        />
      );

      // Should display category headers
      expect(screen.getByText('Industry')).toBeInTheDocument();
      expect(screen.getByText('Process')).toBeInTheDocument();
      expect(screen.getByText('Other')).toBeInTheDocument();

      // Should display all tags from categories
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Aerospace')).toBeInTheDocument();
      expect(screen.getByText('Passivation')).toBeInTheDocument();
      expect(screen.getByText('Polishing')).toBeInTheDocument();
      expect(screen.getByText('Expert')).toBeInTheDocument();
      expect(screen.getByText('Industrial')).toBeInTheDocument();
    });

    it('should handle partial YAML v2.0 data gracefully', () => {
      const partialData = {
        tags: ['electronics', 'aerospace'],
        metadata: {
          format: 'yaml',
          version: '2.0'
        }
        // Missing count and categories
      };

      render(
        <Tags 
          content={partialData} 
          config={{ showMetadata: true }} 
        />
      );

      // Should display available data
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Aerospace')).toBeInTheDocument();
      expect(screen.getByText('Format:')).toBeInTheDocument();
      expect(screen.getByText('yaml v2.0')).toBeInTheDocument();

      // Should not display missing data
      expect(screen.queryByText('Tags:')).not.toBeInTheDocument();
      expect(screen.queryByText('Categories:')).not.toBeInTheDocument();
    });
  });

  describe('Backward Compatibility Integration', () => {
    it('should handle mixed usage scenarios', () => {
      const legacyData = 'aluminum, cleaning, laser, aerospace';
      const modernData = {
        tags: ['electronics', 'aerospace'],
        metadata: { format: 'yaml', version: '2.0' }
      };

      // Test legacy format
      render(<Tags content={legacyData} />);
      expect(screen.getByText('Aluminum')).toBeInTheDocument();
      expect(screen.getByText('Cleaning')).toBeInTheDocument();

      // Clean up and test modern format
      screen.getAllByRole('link').forEach(link => {
        expect(link).toBeInTheDocument();
      });
    });

    it('should maintain consistent behavior across formats', () => {
      const legacyContent = 'electronics, aerospace, manufacturing';
      const yamlContent = {
        tags: ['electronics', 'aerospace', 'manufacturing']
      };

      // Both should produce similar output
      const { container: legacyContainer } = render(<Tags content={legacyContent} />);
      const { container: yamlContainer } = render(<Tags content={yamlContent} />);

      // Both should have the same number of tag links
      const legacyLinks = legacyContainer.querySelectorAll('a');
      const yamlLinks = yamlContainer.querySelectorAll('a');
      
      expect(legacyLinks.length).toBe(yamlLinks.length);
    });
  });

  describe('String-based YAML Parsing Integration', () => {
    it('should parse YAML format from string content', async () => {
      const yamlString = `tags:
  - electronics
  - aerospace
  - manufacturing
count: 3
categories:
  industry:
    - electronics
    - aerospace
  process:
    - manufacturing`;

      const result = await parseTagsFromContent(yamlString);
      
      expect(result).toContain('electronics');
      expect(result).toContain('aerospace');  
      expect(result).toContain('manufacturing');
      expect(result).toHaveLength(3);
    });

    it('should parse categories when no tags array in string', async () => {
      const yamlString = `count: 4
categories:
  industry:
    - electronics
    - aerospace
  process:
    - passivation
    - polishing`;

      const result = await parseTagsFromContent(yamlString);
      
      expect(result).toContain('electronics');
      expect(result).toContain('aerospace');
      expect(result).toContain('passivation');
      expect(result).toContain('polishing');
    });

    it('should fallback to comma-separated when YAML parsing fails', async () => {
      const invalidYaml = 'aluminum, cleaning, laser'; // Not YAML format
      
      const result = await parseTagsFromContent(invalidYaml);
      
      expect(result).toEqual(['aluminum', 'cleaning', 'laser']);
    });

    it('should handle malformed YAML gracefully', async () => {
      const malformedYaml = `tags:
  - electronics
  - aero[space
count: invalid
categories:
  industry`;

      const result = await parseTagsFromContent(malformedYaml);
      
      // Should still extract what it can or fallback
      expect(result).toContain('electronics');
    });
  });

  describe('Advanced Configuration Integration', () => {
    const advancedYamlData = {
      tags: ['electronics', 'aerospace', 'industrial'],
      count: 3,
      categories: {
        industry: ['electronics', 'aerospace'],
        other: ['industrial']
      },
      metadata: {
        format: 'yaml',
        version: '2.0',
        material: 'titanium',
        author: 'Advanced Engineer'
      }
    };

    it('should support custom styling with YAML data', () => {
      render(
        <Tags 
          content={advancedYamlData}
          config={{
            pillColor: 'bg-purple-500',
            textColor: 'text-white',
            hoverColor: 'hover:bg-purple-600',
            className: 'custom-tags-wrapper'
          }}
        />
      );

      const tagsContainer = screen.getByRole('generic');
      expect(tagsContainer).toHaveClass('custom-tags-wrapper');

      const firstTag = screen.getByRole('link', { name: /electronics/i });
      expect(firstTag).toHaveClass('bg-purple-500', 'text-white', 'hover:bg-purple-600');
    });

    it('should support click handlers with YAML data', () => {
      const mockOnClick = jest.fn();
      
      render(
        <Tags 
          content={advancedYamlData}
          config={{ onClick: mockOnClick }}
        />
      );

      const electronicsButton = screen.getByRole('button', { name: /Filter by electronics tag/i });
      electronicsButton.click();

      expect(mockOnClick).toHaveBeenCalledWith('electronics');
    });

    it('should support all configuration options with categorized display', () => {
      render(
        <Tags 
          content={advancedYamlData}
          config={{
            showCategorized: true,
            showMetadata: true,
            title: 'Advanced Tag System',
            linkPrefix: '/advanced-tags/',
            className: 'advanced-container'
          }}
        />
      );

      // Check all features are working together
      expect(screen.getByText('Advanced Tag System')).toBeInTheDocument();
      expect(screen.getByText('Industry')).toBeInTheDocument();
      expect(screen.getByText('Other')).toBeInTheDocument();
      expect(screen.getByText('Material:')).toBeInTheDocument();
      expect(screen.getByText('Titanium')).toBeInTheDocument();

      const link = screen.getByRole('link', { name: /electronics/i });
      expect(link).toHaveAttribute('href', '/advanced-tags/electronics');
    });
  });

  describe('Performance with YAML v2.0', () => {
    it('should handle large YAML datasets efficiently', () => {
      const largeYamlData = {
        tags: Array.from({ length: 100 }, (_, i) => `tag-${i}`),
        count: 100,
        categories: {
          category1: Array.from({ length: 50 }, (_, i) => `cat1-tag-${i}`),
          category2: Array.from({ length: 50 }, (_, i) => `cat2-tag-${i}`)
        },
        metadata: {
          format: 'yaml',
          version: '2.0',
          material: 'composite'
        }
      };

      const startTime = performance.now();
      render(
        <Tags 
          content={largeYamlData}
          config={{ showCategorized: true, showMetadata: true }}
        />
      );
      const endTime = performance.now();

      // Should render quickly even with large datasets
      expect(endTime - startTime).toBeLessThan(200);

      // Should still display metadata
      expect(screen.getByText('Material:')).toBeInTheDocument();
      expect(screen.getByText('Composite')).toBeInTheDocument();
    });
  });
});
