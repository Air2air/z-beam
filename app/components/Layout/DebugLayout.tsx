'use client';
// app/components/Debug/DebugLayout.tsx
import { ReactNode, useState } from 'react';
import { CONTAINER_STYLES } from '../../utils/containerStyles';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DebugSection {
  id: string;
  title: string;
  icon: string;
  description: string;
}

interface DebugLayoutProps {
  children: ReactNode;
  activeSection?: string;
  sections?: DebugSection[];
}

export function DebugLayout({
  children,
  activeSection,
  sections = []
}: DebugLayoutProps) {
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);
  
  // Default sections if none provided
  const defaultSections: DebugSection[] = [
    { 
      id: 'overview', 
      title: 'Debug Overview',
      icon: '📊',
      description: 'General system diagnostic information'
    },
    { 
      id: 'tags', 
      title: 'Tag System',
      icon: '🏷️',
      description: 'Tag system diagnostics and validation'
    },
    { 
      id: 'content', 
      title: 'Content Debug',
      icon: '📄',
      description: 'Content structure and frontmatter validation'
    },
    { 
      id: 'components', 
      title: 'Component Debug',
      icon: '🧩',
      description: 'Component rendering and structure testing'
    },
    { 
      id: 'images', 
      title: 'Image Debug',
      icon: '🖼️',
      description: 'Image loading and optimization diagnostics'
    },
    { 
      id: 'performance', 
      title: 'Performance',
      icon: '⚡',
      description: 'Performance metrics and diagnostics'
    }
  ];
  
  const debugSections = sections.length > 0 ? sections : defaultSections;
  
  // Determine active section from URL if not provided
  let currentSection = activeSection;
  if (!currentSection && pathname) {
    const pathParts = pathname.split('/');
    currentSection = pathParts[pathParts.length - 1];
  }
  
  // Fallback to overview if section not found
  if (!debugSections.find(s => s.id === currentSection)) {
    currentSection = 'overview';
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className={CONTAINER_STYLES.standard}>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 flex items-center">
              <span className="mr-2">🛠️</span> Z-Beam Debug Console
            </h1>
            
            <div className="md:hidden">
              <button 
                type="button"
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-md text-gray-500 focus:outline-none"
                aria-label={showMenu ? "Close menu" : "Open menu"}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showMenu ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
                </svg>
              </button>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/" className="text-gray-600 flex items-center">
                <span>Home</span>
              </Link>
              <Link href="/api/debug" target="_blank" className="text-gray-600 flex items-center">
                <span>API</span>
              </Link>
              <Link 
                href="#" 
                onClick={() => window.location.reload()}
                className="text-gray-600 flex items-center"
              >
                <span>Refresh</span>
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <div className={`md:hidden bg-white shadow-md ${showMenu ? 'max-h-screen' : 'max-h-0 overflow-hidden'}`}>
        <nav className={CONTAINER_STYLES.standard.replace('py-8', 'py-2')}>
          <ul className="space-y-2">
            {debugSections.map((section) => (
              <li key={section.id}>
                <Link 
                  href={`/debug/${section.id !== 'overview' ? section.id : ''}`}
                  className={`block px-3 py-2 rounded-md ${currentSection === section.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                  onClick={() => setShowMenu(false)}
                >
                  <div className="flex items-center">
                    <span className="mr-2">{section.icon}</span>
                    <span>{section.title}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link href="/" className="block px-3 py-2 text-gray-700 rounded-md">
              Home
            </Link>
            <Link href="/api/debug" target="_blank" className="block px-3 py-2 text-gray-700 rounded-md">
              API
            </Link>
            <Link 
              href="#" 
              onClick={() => window.location.reload()}
              className="block px-3 py-2 text-gray-700 rounded-md"
            >
              Refresh
            </Link>
          </div>
        </nav>
      </div>
      
      <div className={CONTAINER_STYLES.standard.replace('py-8', 'py-6')}>
        <div className="flex flex-col md:flex-row">
          <div className="hidden md:block w-full md:w-64 flex-shrink-0 mr-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="font-medium text-gray-700 mb-3">Debug Tools</h2>
              
              <nav>
                <ul className="space-y-1">
                  {debugSections.map((section) => (
                    <li key={section.id}>
                      <Link 
                        href={`/debug/${section.id !== 'overview' ? section.id : ''}`}
                        className={`flex items-center px-3 py-2 rounded-md text-sm ${
                          currentSection === section.id 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'text-gray-700'
                        }`}
                      >
                        <span className="mr-2">{section.icon}</span>
                        <span>{section.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Actions
                </h3>
                
                <ul className="space-y-1">
                  <li>
                    <Link 
                      href="#" 
                      onClick={() => window.location.reload()}
                      className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-md"
                    >
                      <span className="mr-2">🔄</span>
                      <span>Refresh</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/api/debug" 
                      target="_blank"
                      className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-md"
                    >
                      <span className="mr-2">🔌</span>
                      <span>API Endpoint</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/" 
                      className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-md"
                    >
                      <span className="mr-2">🏠</span>
                      <span>Return to Site</span>
                    </Link>
                  </li>
                </ul>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="bg-gray-50 rounded p-3 text-xs text-gray-500">
                  <p className="font-medium mb-1">Environment</p>
                  <p>Mode: {process.env.NODE_ENV || 'development'}</p>
                  <p>Time: {new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="w-full mt-4 md:mt-0">
            {/* Content Header */}
            <div className="mb-4">
              {debugSections.map((section) => {
                if (section.id === currentSection) {
                  return (
                    <div key={section.id}>
                      <h2 className="text-xl font-bold text-gray-900 flex items-center">
                        <span className="mr-2">{section.icon}</span> {section.title}
                      </h2>
                      <p className="mt-1 text-gray-600">{section.description}</p>
                    </div>
                  );
                }
                return null;
              })}
            </div>
            
            {/* Content Body */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              {children}
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-white mt-6 border-t border-gray-200">
        <div className={CONTAINER_STYLES.standard.replace('py-8', 'py-3')}>
          <p className="text-center text-sm text-gray-500">
            Z-Beam Debug Console • {new Date().toLocaleDateString()}
          </p>
        </div>
      </footer>
    </div>
  );
}
