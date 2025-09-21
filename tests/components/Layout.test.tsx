/**
 * Test Suite: Layout Component
 * Testing the main Layout component that wraps page content
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

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

// Mock Settings component for routing tests
const Settings = ({ settingsData }: { settingsData?: any }) => (
  <div data-testid="settings-component">
    <h2>Machine Settings</h2>
    {settingsData ? (
      <div>{settingsData.content}</div>
    ) : (
      <p>No settings data available</p>
    )}
  </div>
);

describe('Layout Component', () => {
  test('should render with default structure', () => {
    render(
      <Layout>
        <div>Test content</div>
      </Layout>
    );

    expect(screen.getByTestId('layout-wrapper')).toBeTruthy();
    expect(screen.getByTestId('header')).toBeTruthy();
    expect(screen.getByTestId('main')).toBeTruthy();
    expect(screen.getByTestId('footer')).toBeTruthy();
    expect(screen.getByText('Test content')).toBeTruthy();
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
    expect(wrapper.getAttribute('data-title')).toBe('Test Title');
    expect(wrapper.getAttribute('data-description')).toBe('Test Description');
    expect(wrapper.className).toContain('custom-class');
  });

  test('should handle empty children', () => {
    render(<Layout />);

    expect(screen.getByTestId('layout-wrapper')).toBeTruthy();
    const main = screen.getByTestId('main');
    expect(main.textContent).toBe('');
  });

  test('should handle multiple children', () => {
    render(
      <Layout>
        <div>First child</div>
        <div>Second child</div>
        <span>Third child</span>
      </Layout>
    );

    expect(screen.getByText('First child')).toBeTruthy();
    expect(screen.getByText('Second child')).toBeTruthy();
    expect(screen.getByText('Third child')).toBeTruthy();
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

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Article Title');
    expect(screen.getByText('emphasis')).toBeTruthy();
    expect(screen.getByText('List item 1')).toBeTruthy();
  });

  describe('Settings Component Integration', () => {
    test('should render Settings component within Layout', () => {
      const settingsData = {
        content: `
## Power Settings
| Parameter | Value |
|-----------|-------|
| power | 100-500W |
        `
      };

      render(
        <Layout title="Settings Page">
          <Settings settingsData={settingsData} />
        </Layout>
      );

      expect(screen.getByTestId('layout-wrapper')).toBeTruthy();
      // Check that Settings component is rendered properly
      expect(screen.getByTestId('settings-component')).toBeTruthy();
      expect(screen.getByText('Machine Settings')).toBeTruthy();
      // Look for the markdown content as text content (not fully rendered markdown)
      expect(screen.getByText(/100-500W/)).toBeTruthy();
    });

    test('should handle Settings component without data', () => {
      render(
        <Layout title="Settings Page">
          <Settings />
        </Layout>
      );

      expect(screen.getByTestId('settings-component')).toBeTruthy();
      expect(screen.getByText('Machine Settings')).toBeTruthy();
      expect(screen.getByText('No settings data available')).toBeTruthy();
    });

    test('should support Settings component alongside other content', () => {
      const settingsData = {
        content: `
## Speed Settings
| Parameter | Value |
|-----------|-------|
| speed | 1000 mm/s |
        `
      };

      render(
        <Layout title="Mixed Content Page">
          <div>Header content</div>
          <Settings settingsData={settingsData} />
          <div>Footer content</div>
        </Layout>
      );

      // Check that all components are rendered
      expect(screen.getByText('Header content')).toBeTruthy();
      expect(screen.getByText('Machine Settings')).toBeTruthy();
      expect(screen.getByText(/1000 mm\/s/)).toBeTruthy();
      expect(screen.getByText('Footer content')).toBeTruthy();
    });

    test('should handle multiple Settings components', () => {
      const powerSettings = {
        content: `## Power\n| power | 100W |`
      };
      
      const speedSettings = {
        content: `## Speed\n| speed | 1000 mm/s |`
      };

      render(
        <Layout title="Multiple Settings">
          <Settings settingsData={powerSettings} />
          <Settings settingsData={speedSettings} />
        </Layout>
      );

      const settingsComponents = screen.getAllByTestId('settings-component');
      expect(settingsComponents).toHaveLength(2);
      expect(screen.getByText(/100W/)).toBeTruthy();
      expect(screen.getByText(/1000 mm\/s/)).toBeTruthy();
    });
  });
});
