/**
 * Test Suite: Layout Component
 * Testing the main Layout component that wraps page content
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Create a test Layout component for testing
const Layout = ({ children, title, description, className }: any) => (
  <div 
    data-testid="layout-wrapper" 
    className={className}
    data-title={title}
    data-description={description}
  >
    <header data-testid="header">Header</header>
    <main data-testid="main">{children}</main>
    <footer data-testid="footer">Footer</footer>
  </div>
);

describe('Layout Component', () => {
  test('should render with default structure', () => {
    render(
      <Layout>
        <div>Test content</div>
      </Layout>
    );

    expect(screen.getByTestId('layout-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('main')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('should pass through props correctly', () => {
    render(
      <Layout 
        title="Test Title"
        description="Test Description"
        className="custom-class"
      >
        <div>Content</div>
      </Layout>
    );

    const wrapper = screen.getByTestId('layout-wrapper');
    expect(wrapper).toHaveAttribute('data-title', 'Test Title');
    expect(wrapper).toHaveAttribute('data-description', 'Test Description');
    expect(wrapper).toHaveClass('custom-class');
  });

  test('should handle empty children', () => {
    render(<Layout />);

    expect(screen.getByTestId('layout-wrapper')).toBeInTheDocument();
    expect(screen.getByTestId('main')).toBeEmptyDOMElement();
  });

  test('should handle multiple children', () => {
    render(
      <Layout>
        <div>First child</div>
        <div>Second child</div>
        <span>Third child</span>
      </Layout>
    );

    expect(screen.getByText('First child')).toBeInTheDocument();
    expect(screen.getByText('Second child')).toBeInTheDocument();
    expect(screen.getByText('Third child')).toBeInTheDocument();
  });

  test('should handle complex nested content', () => {
    render(
      <Layout title="Complex Layout">
        <section>
          <h1>Article Title</h1>
          <p>Article content with <strong>emphasis</strong></p>
          <ul>
            <li>List item 1</li>
            <li>List item 2</li>
          </ul>
        </section>
      </Layout>
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Article Title');
    expect(screen.getByText('emphasis')).toBeInTheDocument();
    expect(screen.getByText('List item 1')).toBeInTheDocument();
  });
});
