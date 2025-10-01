// app/components/Header/Header.example.tsx
// Usage examples for the Header component (Dark Mode Only)

import React from 'react';
import { Header } from './Header';

export function HeaderExamples() {
  return (
    <div className="space-y-8 p-6 bg-gray-900 min-h-screen">
      {/* Page Header Examples */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-white">Page Headers (H1)</h2>
        
        <Header 
          level="page" 
          title="Main Page Title" 
        />
        
        <Header 
          level="page" 
          title="Page with Subtitle"
          subtitle="This is a subtitle for the page" 
        />
        
        <Header 
          level="page" 
          title="Centered Page Title"
          alignment="center" 
        />
      </section>

      {/* Section Header Examples */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-white">Section Headers (H2)</h2>
        
        <Header 
          level="section" 
          title="Section Title" 
        />
        
        <Header 
          level="section" 
          title="Section with Description"
          subtitle="Section description or subtitle" 
        />
        
        <Header 
          level="section" 
          title="Right-aligned Section"
          alignment="right" 
        />
      </section>

      {/* Card Header Examples */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-white">Card Headers (H3)</h2>
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
          <Header 
            level="card" 
            title="Card Title" 
          />
          
          <Header 
            level="card" 
            title="Card with Description"
            subtitle="Card description or metadata" 
          />
          
          <Header 
            level="card" 
            title="Centered Card Title"
            alignment="center" 
          />
        </div>
      </section>

      {/* Custom Styling Examples */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-white">Custom Styling</h2>
        
        <Header 
          level="section" 
          title="Custom Styled Header"
          className="text-blue-400 border-b border-blue-500 pb-2" 
        />
        
        <Header 
          level="card" 
          title="Background Header"
          subtitle="With custom background"
          className="bg-gray-700 p-3 rounded-md" 
        />
      </section>

      {/* Semantic Hierarchy Example */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-white">Semantic Hierarchy Example</h2>
        
        <Header level="page" title="Main Page (H1)" />
        <div className="ml-4">
          <Header level="section" title="Major Section (H2)" />
          <div className="ml-4">
            <Header level="card" title="Sub-section (H3)" />
            <Header level="card" title="Another Sub-section (H3)" />
          </div>
          <Header level="section" title="Another Major Section (H2)" />
        </div>
      </section>

      {/* Default Level Example */}
      <section>
        <h2 className="text-lg font-semibold mb-4 text-white">Default Level (Section)</h2>
        
        <Header title="This uses default level='section'" />
      </section>
    </div>
  );
}

export default HeaderExamples;