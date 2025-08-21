'use client';
// app/debug/content/page.tsx

import { DebugLayout } from '@/app/components/Debug/DebugLayout';
import { FrontmatterDebug } from '@/app/components/Debug/FrontmatterDebug';
import { FrontmatterNameChecker } from '@/app/components/Debug/FrontmatterNameChecker';
import { useState } from 'react';

export default function ContentDebugPage() {
  const [activeContentTab, setActiveContentTab] = useState('frontmatter');
  
  const contentTabs = [
    { id: 'frontmatter', label: 'Frontmatter Inspector' },
    { id: 'name-check', label: 'Name Validator' },
    { id: 'validator', label: 'YAML Validator' },
  ];
  
  const renderContentTab = () => {
    switch(activeContentTab) {
      case 'frontmatter':
        return <FrontmatterDebug />;
      case 'name-check':
        return <FrontmatterNameChecker />;
      case 'validator':
        return (
          <div className="p-4 bg-white rounded border">
            <h3 className="text-lg font-semibold mb-3">YAML Validator</h3>
            <p className="text-gray-600 mb-4">
              This tool helps validate YAML structure in markdown files without modifying them.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <p className="text-yellow-800">
                The YAML Validator is a terminal-based tool. Use the following commands to run it:
              </p>
              
              <div className="mt-3 bg-gray-800 text-gray-100 p-3 rounded font-mono text-sm overflow-x-auto">
                <div className="mb-2 text-gray-400"># Basic validation</div>
                <div>npm run yaml:check</div>
                
                <div className="mt-3 mb-2 text-gray-400"># Check with required fields</div>
                <div>npm run yaml:completeness</div>
                
                <div className="mt-3 mb-2 text-gray-400"># Check a specific file</div>
                <div>npm run yaml:check-file -- path/to/your/file.md</div>
              </div>
            </div>
          </div>
        );
      default:
        return <FrontmatterDebug />;
    }
  };
  
  return (
    <DebugLayout activeSection="content">
      <div className="mb-6">
        <div className="flex space-x-2 border-b border-gray-200">
          {contentTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveContentTab(tab.id)}
              className={`py-2 px-4 ${
                activeContentTab === tab.id 
                  ? 'border-b-2 border-blue-500 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {renderContentTab()}
    </DebugLayout>
  );
}
