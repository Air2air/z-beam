// app/components/Header/Header.accessibility.example.tsx
// Comprehensive WCAG 2.1 AAA accessibility examples for the Header component

import React from 'react';
import { Header } from './Header';

export function AccessibilityHeaderExamples() {
  return (
    <div className="min-h-screen bg-gray-900 p-8 space-y-12">
      
      {/* WCAG 2.1 AAA Compliance Examples */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-white">WCAG 2.1 AAA Accessibility Features</h2>
        
        {/* Main page header with full accessibility features */}
        <Header 
          level="page" 
          title="Research Project Documentation" 
          subtitle="Comprehensive analysis and technical specifications"
          id="main-page-header"
          skipLink={true}
          landmark={true}
          priority="high"
          category="research"
          searchKeywords={["research", "documentation", "analysis", "technical"]}
          summary="Comprehensive project documentation with detailed technical analysis"
          context="Scientific research and technical documentation"
          aria-label="Main page title for research documentation"
          nextHeaderId="intro-section"
        />
        
        {/* Section header with navigation */}
        <Header 
          level="section" 
          title="Introduction and Overview" 
          id="intro-section"
          priority="high"
          category="content"
          searchKeywords={["introduction", "overview", "background"]}
          summary="Overview of project methodology and key concepts"
          prevHeaderId="main-page-header"
          nextHeaderId="materials-section"
          aria-describedby="intro-content"
        />
        <div id="intro-content" className="text-gray-300 mb-6">
          Supporting content for the introduction section...
        </div>
        
        {/* Materials section with enhanced metadata */}
        <Header 
          level="section" 
          title="Data and Analysis" 
          id="materials-section"
          priority="medium"
          category="technical"
          searchKeywords={["data", "analysis", "methodology", "results"]}
          summary="Detailed analysis of collected data and research findings"
          prevHeaderId="intro-section"
          nextHeaderId="results-card"
        />
        
        {/* Card level headers for detailed content */}
        <div className="ml-4 space-y-4">
          <Header 
            level="card" 
            title="Quantitative Results" 
            id="results-card"
            priority="medium"
            category="data"
            searchKeywords={["quantitative", "measurements", "statistics", "results"]}
            summary="Statistical analysis and quantitative findings"
            prevHeaderId="materials-section"
            nextHeaderId="qualitative-card"
          />
          
          <Header 
            level="card" 
            title="Qualitative Analysis" 
            id="qualitative-card"
            priority="medium"
            category="analysis"
            searchKeywords={["qualitative", "observations", "patterns", "insights"]}
            summary="Qualitative observations and analytical insights"
            prevHeaderId="results-card"
          />
        </div>
      </section>

      {/* Keyboard Navigation Examples */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-white">Keyboard Navigation Features</h2>
        <div className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300">
          <h3 className="font-semibold mb-2">Navigation Instructions:</h3>
          <ul className="space-y-1">
            <li>• <kbd className="bg-gray-700 px-1 rounded">Tab</kbd> - Navigate through headers</li>
            <li>• <kbd className="bg-gray-700 px-1 rounded">↓</kbd> or <kbd className="bg-gray-700 px-1 rounded">J</kbd> - Next header</li>
            <li>• <kbd className="bg-gray-700 px-1 rounded">↑</kbd> or <kbd className="bg-gray-700 px-1 rounded">K</kbd> - Previous header</li>
            <li>• <kbd className="bg-gray-700 px-1 rounded">Home</kbd> - First header of same level</li>
            <li>• <kbd className="bg-gray-700 px-1 rounded">End</kbd> - Last header of same level</li>
          </ul>
        </div>
      </section>

      {/* ARIA Landmarks and Roles */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-white">ARIA Landmarks & Roles</h2>
        
        <Header 
          level="section" 
          title="Technical Specifications" 
          landmark={true}
          role="banner"
          aria-label="Technical specifications section"
          searchKeywords={["specifications", "technical", "requirements"]}
          priority="high"
        />
        
        <Header 
          level="card" 
          title="System Parameters" 
          role="complementary"
          aria-describedby="system-params-desc"
          searchKeywords={["system", "parameters", "configuration"]}
        />
        <div id="system-params-desc" className="sr-only">
          Detailed system parameter configurations for optimal performance
        </div>
      </section>

      {/* Search Enhancement Examples */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-white">Enhanced Search Capabilities</h2>
        
        <Header 
          level="section" 
          title="Research Methodology" 
          searchKeywords={["methodology", "research", "experimental", "approach"]}
          category="scientific"
          priority="high"
          summary="Comprehensive research methodology for experimental studies"
          context="Academic research and empirical validation"
        />
        
        <Header 
          level="card" 
          title="Data Collection Procedures" 
          searchKeywords={["data collection", "procedures", "measurements", "protocols"]}
          category="methodology"
          priority="medium"
          summary="Standardized procedures for collecting experimental data"
        />
      </section>

      {/* Custom Event Handlers */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-white">Interactive Features</h2>
        
        <Header 
          level="section" 
          title="Interactive Data Dashboard" 
          onFocus={(e) => console.log('Header focused:', e.target)}
          onBlur={(e) => console.log('Header blurred:', e.target)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              console.log('Header activated via keyboard');
            }
          }}
          searchKeywords={["dashboard", "interactive", "data", "visualization"]}
          tabIndex={0}
        />
      </section>

      {/* Priority and Category Examples */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-white">Content Prioritization</h2>
        
        <div className="space-y-4">
          <Header level="card" title="Critical Safety Information" priority="high" category="safety" />
          <Header level="card" title="Standard Operating Procedures" priority="medium" category="procedures" />
          <Header level="card" title="Additional Resources" priority="low" category="resources" />
        </div>
      </section>

      {/* Alignment and Styling */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-white">Visual Customization</h2>
        
        <div className="space-y-4">
          <Header level="section" title="Left Aligned (Default)" alignment="left" />
          <Header level="section" title="Center Aligned" alignment="center" />
          <Header level="section" title="Right Aligned" alignment="right" />
          
          <Header 
            level="card" 
            title="Custom Styled Header" 
            className="text-blue-400 border-l-4 border-blue-400 pl-4"
          />
        </div>
      </section>

    </div>
  );
}

export default AccessibilityHeaderExamples;