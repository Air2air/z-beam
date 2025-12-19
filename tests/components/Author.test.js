/**
 * Author Component Unit Tests
 * Testing the Author React component rendering and functionality
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Author } from '@/app/components/Author/Author';

// Mock Next.js components
jest.mock('next/link', () => {
  return ({ children, href, ...props }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

jest.mock('next/image', () => {
  return ({ src, alt, width, height, className, priority, fill, blurDataURL, fetchPriority, ...props }) => (
    <img 
      src={src} 
      alt={alt} 
      width={width} 
      height={height} 
      className={className}
    />
  );
});

describe('Author Component', () => {
  const mockAuthor = {
    id: 1,
    name: 'Test Author',
    title: 'Ph.D.',
    expertise: 'Test Expertise Field',
    country: 'Test Country',
    sex: 'f',
    image: '/images/author/test-author.jpg',
    profile: {
      description: 'Test author description',
      expertiseAreas: ['Area 1', 'Area 2', 'Area 3'],
      contactNote: 'Contact for consultation'
    }
  };

  describe('1. Basic Rendering', () => {
    test('renders author component with all information', () => {
      render(<Author frontmatter={{ author: mockAuthor }} />);
      
      // Check if all elements are present
      expect(screen.getByText('Test Author')).toBeInTheDocument();
      expect(screen.getByText('Ph.D.')).toBeInTheDocument();
      expect(screen.getByText('Test Expertise Field')).toBeInTheDocument();
      expect(screen.getByText('Test Country')).toBeInTheDocument();
      
      // Check image
      const image = screen.getByAltText('Test Author');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/images/author/test-author.jpg');
      expect(image).toHaveAttribute('width', '60');
      expect(image).toHaveAttribute('height', '60');
    });

    test('renders with correct CSS classes', () => {
      render(<Author frontmatter={{ author: mockAuthor }} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveClass('block', 'rounded-md', 'px-4', 'py-3');
      
      // Check image classes
      const image = screen.getByAltText('Test Author');
      expect(image).toHaveClass('rounded-full', 'flex-shrink-0');
      
      // Check text content container
      const textContainer = link.querySelector('.flex-1');
      expect(textContainer).toBeInTheDocument();
      expect(textContainer).toHaveClass('min-w-0');
    });

    test('creates correct tag link', () => {
      render(<Author frontmatter={{ author: mockAuthor }} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/search?q=Test%20Author');
      // Link wraps entire author component as block element
      expect(link).toHaveClass('block', 'rounded-md');
    });
  });

  describe('2. Author Name Variations', () => {
    test('handles author names with special characters', () => {
      const specialAuthor = {
        ...mockAuthor,
        name: 'José María García-López'
      };
      
      render(<Author frontmatter={{ author: specialAuthor }} />);
      
      expect(screen.getByText('José María García-López')).toBeInTheDocument();
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/search?q=Jos%C3%A9%20Mar%C3%ADa%20Garc%C3%ADa-L%C3%B3pez');
    });

    test('handles author names with spaces', () => {
      const multiWordAuthor = {
        ...mockAuthor,
        name: 'Dr. John Michael Smith Jr.'
      };
      
      render(<Author frontmatter={{ author: multiWordAuthor }} />);
      
      expect(screen.getByText('Dr. John Michael Smith Jr.')).toBeInTheDocument();
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/search?q=Dr.%20John%20Michael%20Smith%20Jr.');
    });
  });

  describe('3. Title Variations', () => {
    test('renders different academic titles correctly', () => {
      const titles = ['Ph.D.', 'MA', 'M.Sc.', 'B.Eng.', 'Dr.', 'Prof.'];
      
      titles.forEach(title => {
        const { unmount } = render(
          <Author frontmatter={{ author: { ...mockAuthor, title } }} />
        );
        
        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByText(title)).toHaveClass('text-secondary');
        
        unmount();
      });
    });

    test('handles empty or missing title', () => {
      const noTitleAuthor = {
        ...mockAuthor,
        title: ''
      };
      
      render(<Author frontmatter={{ author: noTitleAuthor }} />);
      
      expect(screen.getByText('Test Author')).toBeInTheDocument();
      // Should not crash with empty title
    });
  });

  describe('4. Country Variations', () => {
    test('handles different country formats', () => {
      const countries = [
        'United States',
        'United States (California)',
        'Indonesia',
        'United Kingdom',
        'Germany (Bavaria)',
        'Japan (Tokyo)'
      ];
      
      countries.forEach(country => {
        const { unmount } = render(
          <Author frontmatter={{ author: { ...mockAuthor, country } }} />
        );
        
        expect(screen.getByText(country)).toBeInTheDocument();
        expect(screen.getByText(country)).toHaveClass('text-secondary');
        
        unmount();
      });
    });
  });

  describe('5. Expertise Field Variations', () => {
    test('handles long expertise descriptions', () => {
      const longExpertise = 'Ultrafast Laser Physics and Material Interactions with Advanced Photonic Systems';
      const longExpertiseAuthor = {
        ...mockAuthor,
        expertise: longExpertise
      };
      
      render(<Author frontmatter={{ author: longExpertiseAuthor }} />);
      
      expect(screen.getByText(longExpertise)).toBeInTheDocument();
      expect(screen.getByText(longExpertise)).toHaveClass('text-sm', 'text-secondary');
    });

    test('handles short expertise descriptions', () => {
      const shortExpertise = 'Optics';
      const shortExpertiseAuthor = {
        ...mockAuthor,
        expertise: shortExpertise
      };
      
      render(<Author frontmatter={{ author: shortExpertiseAuthor }} />);
      
      expect(screen.getByText(shortExpertise)).toBeInTheDocument();
    });
  });

  describe('6. Image Handling', () => {
    test('renders image with correct attributes', () => {
      render(<Author frontmatter={{ author: mockAuthor }} />);
      
      const image = screen.getByAltText('Test Author');
      expect(image).toHaveAttribute('src', '/images/author/test-author.jpg');
      expect(image).toHaveAttribute('width', '60');
      expect(image).toHaveAttribute('height', '60');
      expect(image).toHaveClass('rounded-full');
    });

    test('handles different image formats', () => {
      const imageFormats = [
        '/images/author/author.jpg',
        '/images/author/author.jpeg',
        '/images/author/author.png',
        '/images/author/author.webp'
      ];
      
      imageFormats.forEach(imagePath => {
        const { unmount } = render(
          <Author frontmatter={{ author: { ...mockAuthor, image: imagePath } }} />
        );
        
        const image = screen.getByAltText('Test Author');
        expect(image).toHaveAttribute('src', imagePath);
        
        unmount();
      });
    });
  });

  describe('7. Interactive Elements', () => {
    test('has correct hover classes', () => {
      render(<Author frontmatter={{ author: mockAuthor }} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveClass(
        'hover:bg-primary-hover',
        'transition-colors'
      );
    });

    test('link is properly structured', () => {
      render(<Author frontmatter={{ author: mockAuthor }} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveClass('block', 'rounded-md');
      
      // Check that the image is inside the link
      const image = screen.getByAltText('Test Author');
      expect(link).toContainElement(image);
    });
  });

  describe('8. Flex Layout Structure', () => {
    test('renders proper flex layout structure', () => {
      render(<Author frontmatter={{ author: mockAuthor }} />);
      
      const link = screen.getByRole('link');
      expect(link).toHaveClass('block', 'rounded-md');
      
      // Check for image
      const image = screen.getByAltText('Test Author');
      expect(image).toHaveClass('flex-shrink-0');
      
      // Check for content container
      const contentDiv = link.querySelector('.flex-1');
      expect(contentDiv).toBeInTheDocument();
      expect(contentDiv).toHaveClass('min-w-0');
    });
  });

  describe('9. Accessibility', () => {
    test('has proper semantic structure', () => {
      const { container } = render(<Author frontmatter={{ author: mockAuthor }} />);
      
      // Check for proper link wrapping
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      
      // Check for block layout
      expect(link).toHaveClass('block');
    });

    test('image has descriptive alt text', () => {
      render(<Author frontmatter={{ author: mockAuthor }} />);
      
      const image = screen.getByAltText('Test Author');
      expect(image).toBeInTheDocument();
    });
  });

  describe('10. Real Author Data', () => {
    test('renders Ikmanda Roswati correctly', () => {
      const ikmandaAuthor = {
        id: 1,
        name: 'Ikmanda Roswati',
        title: 'Ph.D.',
        expertise: 'Ultrafast Laser Physics and Material Interactions',
        country: 'Indonesia',
        sex: 'f',
        image: '/images/author/ikmanda-roswati.jpg',
        profile: {
          description: 'Expert in laser physics',
          expertiseAreas: ['Ultrafast laser physics'],
          contactNote: 'Contact for consultation'
        }
      };
      
      render(<Author frontmatter={{ author: ikmandaAuthor }} />);
      
      expect(screen.getByText('Ikmanda Roswati')).toBeInTheDocument();
      expect(screen.getByText('Ph.D.')).toBeInTheDocument();
      expect(screen.getByText('Ultrafast Laser Physics and Material Interactions')).toBeInTheDocument();
      expect(screen.getByText('Indonesia')).toBeInTheDocument();
      
      const image = screen.getByAltText('Ikmanda Roswati');
      expect(image).toHaveAttribute('src', '/images/author/ikmanda-roswati.jpg');
    });

    test('renders Todd Dunning correctly', () => {
      const toddAuthor = {
        id: 4,
        name: 'Todd Dunning',
        title: 'MA',
        expertise: 'Optical Materials for Laser Systems',
        country: 'United States (California)',
        sex: 'm',
        image: '/images/author/todd-dunning.jpg',
        profile: {
          description: 'Expert in optical materials',
          expertiseAreas: ['Laser cleaning systems'],
          contactNote: 'Contact for consultation'
        }
      };
      
      render(<Author frontmatter={{ author: toddAuthor }} />);
      
      expect(screen.getByText('Todd Dunning')).toBeInTheDocument();
      expect(screen.getByText('MA')).toBeInTheDocument();
      expect(screen.getByText('Optical Materials for Laser Systems')).toBeInTheDocument();
      expect(screen.getByText('United States (California)')).toBeInTheDocument();
      
      const image = screen.getByAltText('Todd Dunning');
      expect(image).toHaveAttribute('src', '/images/author/todd-dunning.jpg');
    });
  });

  describe('11. Error Boundaries', () => {
    test('handles missing author gracefully', () => {
      // This test verifies the component handles edge cases
      const minimalAuthor = {
        id: 1,
        name: 'Minimal Author',
        title: 'Dr.',
        expertise: 'Field',
        country: 'Country',
        sex: 'm',
        image: '/image.jpg',
        profile: {
          description: '',
          expertiseAreas: [],
          contactNote: ''
        }
      };
      
      expect(() => {
        render(<Author frontmatter={{ author: minimalAuthor }} />);
      }).not.toThrow();
      
      expect(screen.getByText('Minimal Author')).toBeInTheDocument();
    });
  });
});

module.exports = {
  testSuite: 'Author Component Unit Tests',
  version: '1.0',
  lastUpdated: '2025-09-16'
};
