// tests/components/Typography.test.tsx
// Comprehensive tests for Typography component system

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  H1, H2, H3, H4, H5, H6,
  P, A, Strong, Em,
  UL, OL, LI,
  Code, Pre, Blockquote
} from '../../app/components/Typography';

describe('Typography Components', () => {
  // ==========================================
  // HEADING COMPONENTS (H1-H6)
  // ==========================================
  
  describe('H1', () => {
    it('renders with children text', () => {
      render(<H1>Main Heading</H1>);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Main Heading');
    });

    it('renders with correct HTML tag', () => {
      const { container } = render(<H1>Test</H1>);
      expect(container.querySelector('h1')).toBeInTheDocument();
    });

    it('merges custom className with default styles', () => {
      const { container } = render(<H1 className="custom-class">Test</H1>);
      const element = container.querySelector('h1');
      expect(element).toHaveClass('custom-class');
      // Should also have default Tailwind classes
      expect(element?.className).toContain('text-');
      expect(element?.className).toContain('tracking-tight');
    });

    it('handles empty children gracefully', () => {
      const { container } = render(<H1></H1>);
      expect(container.querySelector('h1')).toBeInTheDocument();
    });
  });

  describe('H2', () => {
    it('renders with children text', () => {
      render(<H2>Second Heading</H2>);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Second Heading');
    });

    it('renders with correct HTML tag', () => {
      const { container } = render(<H2>Test</H2>);
      expect(container.querySelector('h2')).toBeInTheDocument();
    });

    it('merges custom className', () => {
      const { container } = render(<H2 className="my-custom-h2">Test</H2>);
      const element = container.querySelector('h2');
      expect(element).toHaveClass('my-custom-h2');
    });
  });

  describe('H3', () => {
    it('renders with children text', () => {
      render(<H3>Third Heading</H3>);
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Third Heading');
    });

    it('renders with correct HTML tag', () => {
      const { container } = render(<H3>Test</H3>);
      expect(container.querySelector('h3')).toBeInTheDocument();
    });

    it('merges custom className', () => {
      const { container } = render(<H3 className="section-title">Test</H3>);
      expect(container.querySelector('h3')).toHaveClass('section-title');
    });
  });

  describe('H4', () => {
    it('renders with children text', () => {
      render(<H4>Fourth Heading</H4>);
      expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Fourth Heading');
    });

    it('renders with correct HTML tag', () => {
      const { container } = render(<H4>Test</H4>);
      expect(container.querySelector('h4')).toBeInTheDocument();
    });
  });

  describe('H5', () => {
    it('renders with children text', () => {
      render(<H5>Fifth Heading</H5>);
      expect(screen.getByRole('heading', { level: 5 })).toHaveTextContent('Fifth Heading');
    });

    it('renders with correct HTML tag', () => {
      const { container } = render(<H5>Test</H5>);
      expect(container.querySelector('h5')).toBeInTheDocument();
    });
  });

  describe('H6', () => {
    it('renders with children text', () => {
      render(<H6>Sixth Heading</H6>);
      expect(screen.getByRole('heading', { level: 6 })).toHaveTextContent('Sixth Heading');
    });

    it('renders with correct HTML tag', () => {
      const { container } = render(<H6>Test</H6>);
      expect(container.querySelector('h6')).toBeInTheDocument();
    });
  });

  // ==========================================
  // TEXT COMPONENTS
  // ==========================================

  describe('P (Paragraph)', () => {
    it('renders paragraph with text', () => {
      render(<P>This is a paragraph of text.</P>);
      expect(screen.getByText('This is a paragraph of text.')).toBeInTheDocument();
    });

    it('renders with correct HTML tag', () => {
      const { container } = render(<P>Test</P>);
      expect(container.querySelector('p')).toBeInTheDocument();
    });

    it('merges custom className', () => {
      const { container } = render(<P className="lead-text">Test</P>);
      expect(container.querySelector('p')).toHaveClass('lead-text');
    });

    it('handles complex children with nested elements', () => {
      render(
        <P>
          Text with <Strong>bold</Strong> and <Em>italic</Em>
        </P>
      );
      expect(screen.getByText(/Text with/)).toBeInTheDocument();
      expect(screen.getByText('bold')).toBeInTheDocument();
      expect(screen.getByText('italic')).toBeInTheDocument();
    });
  });

  describe('A (Anchor/Link)', () => {
    it('renders link with text', () => {
      render(<A href="/test">Click here</A>);
      expect(screen.getByText('Click here')).toBeInTheDocument();
    });

    it('renders with correct HTML tag and href', () => {
      render(<A href="/about">About</A>);
      const link = screen.getByRole('link', { name: 'About' });
      expect(link).toHaveAttribute('href', '/about');
    });

    it('handles external URLs', () => {
      render(<A href="https://example.com">External</A>);
      const link = screen.getByRole('link', { name: 'External' });
      expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('merges custom className', () => {
      const { container } = render(<A href="/" className="nav-link">Link</A>);
      expect(container.querySelector('a')).toHaveClass('nav-link');
    });

    it('handles missing href gracefully', () => {
      // @ts-ignore - testing edge case
      const { container } = render(<A>No href</A>);
      expect(container.querySelector('a')).toBeInTheDocument();
    });
  });

  describe('Strong (Bold)', () => {
    it('renders bold text', () => {
      render(<Strong>Bold text</Strong>);
      expect(screen.getByText('Bold text')).toBeInTheDocument();
    });

    it('renders with correct HTML tag', () => {
      const { container } = render(<Strong>Test</Strong>);
      expect(container.querySelector('strong')).toBeInTheDocument();
    });

    it('merges custom className', () => {
      const { container } = render(<Strong className="important">Test</Strong>);
      expect(container.querySelector('strong')).toHaveClass('important');
    });
  });

  describe('Em (Italic/Emphasis)', () => {
    it('renders emphasized text', () => {
      render(<Em>Emphasized text</Em>);
      expect(screen.getByText('Emphasized text')).toBeInTheDocument();
    });

    it('renders with correct HTML tag', () => {
      const { container } = render(<Em>Test</Em>);
      expect(container.querySelector('em')).toBeInTheDocument();
    });

    it('merges custom className', () => {
      const { container } = render(<Em className="subtle">Test</Em>);
      expect(container.querySelector('em')).toHaveClass('subtle');
    });
  });

  // ==========================================
  // LIST COMPONENTS
  // ==========================================

  describe('UL (Unordered List)', () => {
    it('renders unordered list', () => {
      const { container } = render(
        <UL>
          <LI>Item 1</LI>
          <LI>Item 2</LI>
        </UL>
      );
      expect(container.querySelector('ul')).toBeInTheDocument();
    });

    it('renders with list items', () => {
      render(
        <UL>
          <LI>First</LI>
          <LI>Second</LI>
        </UL>
      );
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });

    it('merges custom className', () => {
      const { container } = render(<UL className="feature-list">test</UL>);
      expect(container.querySelector('ul')).toHaveClass('feature-list');
    });
  });

  describe('OL (Ordered List)', () => {
    it('renders ordered list', () => {
      const { container } = render(
        <OL>
          <LI>Step 1</LI>
          <LI>Step 2</LI>
        </OL>
      );
      expect(container.querySelector('ol')).toBeInTheDocument();
    });

    it('renders with list items', () => {
      render(
        <OL>
          <LI>First step</LI>
          <LI>Second step</LI>
        </OL>
      );
      expect(screen.getByText('First step')).toBeInTheDocument();
      expect(screen.getByText('Second step')).toBeInTheDocument();
    });

    it('merges custom className', () => {
      const { container } = render(<OL className="instructions">test</OL>);
      expect(container.querySelector('ol')).toHaveClass('instructions');
    });
  });

  describe('LI (List Item)', () => {
    it('renders list item', () => {
      render(<LI>List item</LI>);
      expect(screen.getByText('List item')).toBeInTheDocument();
    });

    it('renders with correct HTML tag', () => {
      const { container } = render(<LI>Test</LI>);
      expect(container.querySelector('li')).toBeInTheDocument();
    });

    it('merges custom className', () => {
      const { container } = render(<LI className="active">Test</LI>);
      expect(container.querySelector('li')).toHaveClass('active');
    });

    it('works within UL', () => {
      render(
        <UL>
          <LI>Item in UL</LI>
        </UL>
      );
      expect(screen.getByText('Item in UL')).toBeInTheDocument();
    });

    it('works within OL', () => {
      render(
        <OL>
          <LI>Item in OL</LI>
        </OL>
      );
      expect(screen.getByText('Item in OL')).toBeInTheDocument();
    });
  });

  // ==========================================
  // CODE COMPONENTS
  // ==========================================

  describe('Code (Inline Code)', () => {
    it('renders inline code', () => {
      render(<Code>const x = 5;</Code>);
      expect(screen.getByText('const x = 5;')).toBeInTheDocument();
    });

    it('renders with correct HTML tag', () => {
      const { container } = render(<Code>code</Code>);
      expect(container.querySelector('code')).toBeInTheDocument();
    });

    it('merges custom className', () => {
      const { container } = render(<Code className="language-js">test</Code>);
      expect(container.querySelector('code')).toHaveClass('language-js');
    });

    it('handles special characters', () => {
      render(<Code>{'<div>'}</Code>);
      expect(screen.getByText('<div>')).toBeInTheDocument();
    });
  });

  describe('Pre (Preformatted Block)', () => {
    it('renders preformatted block', () => {
      const { container } = render(
        <Pre>
          function hello() {'{'}
            console.log("Hello");
          {'}'}
        </Pre>
      );
      expect(container.querySelector('pre')).toBeInTheDocument();
    });

    it('preserves whitespace and formatting', () => {
      const code = `function test() {
  return true;
}`;
      render(<Pre>{code}</Pre>);
      const pre = screen.getByText(/function test/);
      expect(pre).toBeInTheDocument();
    });

    it('merges custom className', () => {
      const { container } = render(<Pre className="code-block">test</Pre>);
      expect(container.querySelector('pre')).toHaveClass('code-block');
    });

    it('works with nested Code component', () => {
      render(
        <Pre>
          <Code>const value = 42;</Code>
        </Pre>
      );
      expect(screen.getByText('const value = 42;')).toBeInTheDocument();
    });
  });

  // ==========================================
  // BLOCKQUOTE COMPONENT
  // ==========================================

  describe('Blockquote', () => {
    it('renders blockquote', () => {
      render(<Blockquote>This is a quote</Blockquote>);
      expect(screen.getByText('This is a quote')).toBeInTheDocument();
    });

    it('renders with correct HTML tag', () => {
      const { container } = render(<Blockquote>Quote</Blockquote>);
      expect(container.querySelector('blockquote')).toBeInTheDocument();
    });

    it('merges custom className', () => {
      const { container } = render(<Blockquote className="testimonial">Test</Blockquote>);
      expect(container.querySelector('blockquote')).toHaveClass('testimonial');
    });

    it('handles multi-paragraph quotes', () => {
      render(
        <Blockquote>
          <P>First paragraph of quote.</P>
          <P>Second paragraph of quote.</P>
        </Blockquote>
      );
      expect(screen.getByText('First paragraph of quote.')).toBeInTheDocument();
      expect(screen.getByText('Second paragraph of quote.')).toBeInTheDocument();
    });
  });

  // ==========================================
  // INTEGRATION TESTS
  // ==========================================

  describe('Integration: Complex Document Structure', () => {
    it('renders complex nested structure correctly', () => {
      render(
        <div>
          <H1>Main Title</H1>
          <P>Introduction paragraph with <Strong>bold</Strong> and <Em>italic</Em> text.</P>
          <H2>Section Title</H2>
          <UL>
            <LI>First item</LI>
            <LI>Second item with <A href="/link">a link</A></LI>
          </UL>
          <Blockquote>
            <P>A meaningful quote.</P>
          </Blockquote>
        </div>
      );

      expect(screen.getByRole('heading', { level: 1, name: 'Main Title' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Section Title' })).toBeInTheDocument();
      expect(screen.getByText('bold')).toBeInTheDocument();
      expect(screen.getByText('italic')).toBeInTheDocument();
      expect(screen.getByText('First item')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'a link' })).toBeInTheDocument();
      expect(screen.getByText('A meaningful quote.')).toBeInTheDocument();
    });

    it('renders all heading levels in hierarchy', () => {
      render(
        <div>
          <H1>Level 1</H1>
          <H2>Level 2</H2>
          <H3>Level 3</H3>
          <H4>Level 4</H4>
          <H5>Level 5</H5>
          <H6>Level 6</H6>
        </div>
      );

      for (let level = 1; level <= 6; level++) {
        expect(screen.getByRole('heading', { level, name: `Level ${level}` })).toBeInTheDocument();
      }
    });

    it('handles mixed list types', () => {
      render(
        <div>
          <H3>Features</H3>
          <UL>
            <LI>Unordered item 1</LI>
            <LI>Unordered item 2</LI>
          </UL>
          <H3>Steps</H3>
          <OL>
            <LI>Step 1</LI>
            <LI>Step 2</LI>
          </OL>
        </div>
      );

      expect(screen.getByText('Unordered item 1')).toBeInTheDocument();
      expect(screen.getByText('Step 1')).toBeInTheDocument();
    });
  });

  // ==========================================
  // ACCESSIBILITY TESTS
  // ==========================================

  describe('Accessibility', () => {
    it('all headings have correct ARIA roles', () => {
      render(
        <div>
          <H1>H1 Title</H1>
          <H2>H2 Title</H2>
          <H3>H3 Title</H3>
        </div>
      );

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('H1 Title');
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('H2 Title');
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('H3 Title');
    });

    it('links have correct ARIA role', () => {
      render(<A href="/test">Test Link</A>);
      expect(screen.getByRole('link')).toHaveTextContent('Test Link');
    });

    it('lists have correct structure', () => {
      const { container } = render(
        <UL>
          <LI>Item</LI>
        </UL>
      );
      
      const ul = container.querySelector('ul');
      const li = container.querySelector('li');
      
      expect(ul).toBeInTheDocument();
      expect(li).toBeInTheDocument();
      expect(ul).toContainElement(li);
    });
  });

  // ==========================================
  // EDGE CASES
  // ==========================================

  describe('Edge Cases', () => {
    it('handles undefined className', () => {
      const { container } = render(<H1>Test</H1>);
      expect(container.querySelector('h1')).toBeInTheDocument();
    });

    it('handles null children', () => {
      const { container } = render(<P>{null}</P>);
      expect(container.querySelector('p')).toBeInTheDocument();
    });

    it('handles undefined children', () => {
      const { container } = render(<P>{undefined}</P>);
      expect(container.querySelector('p')).toBeInTheDocument();
    });

    it('handles number children', () => {
      render(<P>{42}</P>);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('handles boolean children (should not render)', () => {
      const { container } = render(<P>{true}{false}</P>);
      expect(container.querySelector('p')).toBeInTheDocument();
      expect(container.querySelector('p')?.textContent).toBe('');
    });

    it('handles array of children', () => {
      render(
        <UL>
          {['First', 'Second', 'Third'].map((item, i) => (
            <LI key={i}>{item}</LI>
          ))}
        </UL>
      );
      
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
      expect(screen.getByText('Third')).toBeInTheDocument();
    });
  });
});
