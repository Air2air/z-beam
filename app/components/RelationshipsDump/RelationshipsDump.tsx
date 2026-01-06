// app/components/RelationshipsDump/RelationshipsDump.tsx
// Temporary component to display ALL relationships from frontmatter for analysis

import React from 'react';

interface RelationshipsDumpProps {
  relationships: Record<string, any>;
  entityName: string;
}

// Helper to render complex nested objects
function renderNestedObject(obj: any, depth: number = 0): React.ReactNode {
  if (obj === null || obj === undefined) return null;
  
  if (typeof obj !== 'object') {
    return <span className="text-gray-700">{String(obj)}</span>;
  }
  
  if (Array.isArray(obj)) {
    return (
      <ul className="space-y-1 ml-4">
        {obj.map((item, idx) => (
          <li key={idx} className="text-sm">
            {typeof item === 'object' ? renderNestedObject(item, depth + 1) : String(item)}
          </li>
        ))}
      </ul>
    );
  }
  
  return (
    <div className={`space-y-2 ${depth > 0 ? 'ml-4 pl-3 border-l border-gray-300' : ''}`}>
      {Object.entries(obj).map(([key, value]) => (
        <div key={key} className="text-sm">
          <span className="font-medium text-gray-800">{key}: </span>
          {typeof value === 'object' ? (
            <div className="mt-1">{renderNestedObject(value, depth + 1)}</div>
          ) : (
            <span className="text-gray-700">{String(value)}</span>
          )}
        </div>
      ))}
    </div>
  );
}

export function RelationshipsDump({ relationships, entityName }: RelationshipsDumpProps) {
  if (!relationships || Object.keys(relationships).length === 0) {
    return (
      <div className="bg-gray-100 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Relationships</h2>
        <p className="text-gray-600">No relationships defined for {entityName}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        All Relationships for {entityName}
      </h2>
      
      {Object.entries(relationships).map(([key, value]) => (
        <div key={key} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-semibold text-gray-800">
              {key}
            </h3>
            {value?.presentation && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {value.presentation}
              </span>
            )}
          </div>
          
          {/* Section metadata */}
          {value?._section && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm font-bold text-yellow-900 mb-1">📋 Section Metadata</p>
              <p className="text-base font-semibold text-gray-800">{value._section.title}</p>
              {value._section.sectionDescription && (
                <p className="text-sm text-gray-600 mt-1">{value._section.sectionDescription}</p>
              )}
              {value._section.order !== undefined && (
                <p className="text-xs text-gray-500 mt-1">Order: {value._section.order}</p>
              )}
              {value._section.variant && (
                <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                  {value._section.variant}
                </span>
              )}
              {value._section.icon && (
                <span className="inline-block mt-2 ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                  Icon: {value._section.icon}
                </span>
              )}
            </div>
          )}
          
          {/* Items list */}
          {Array.isArray(value?.items) && value.items.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 font-medium">
                {value.items.length} item{value.items.length !== 1 ? 's' : ''}
              </p>
              <ul className="space-y-3">
                {value.items.map((item: any, idx: number) => (
                  <li key={idx} className="pl-4 border-l-2 border-blue-300 bg-gray-50 p-3 rounded">
                    <div className="text-sm mb-2">
                      {item.id && (
                        <span className="font-mono text-blue-700 font-semibold">{item.id}</span>
                      )}
                      {item.type && (
                        <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">
                          {item.type}
                        </span>
                      )}
                      {item.frequency && (
                        <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
                          {item.frequency}
                        </span>
                      )}
                      {item.severity && (
                        <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">
                          {item.severity}
                        </span>
                      )}
                      {item.effectiveness && (
                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                          {item.effectiveness}
                        </span>
                      )}
                      {item.intensity && (
                        <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded">
                          {item.intensity}
                        </span>
                      )}
                    </div>
                    {item.typical_context && (
                      <p className="text-xs text-gray-600 mb-2 italic">{item.typical_context}</p>
                    )}
                    {item.description && (
                      <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                    )}
                    {/* Render any other nested properties */}
                    {Object.entries(item).filter(([k]) => 
                      !['id', 'type', 'frequency', 'severity', 'effectiveness', 'intensity', 'typical_context', 'description'].includes(k)
                    ).length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        {renderNestedObject(
                          Object.fromEntries(
                            Object.entries(item).filter(([k]) => 
                              !['id', 'type', 'frequency', 'severity', 'effectiveness', 'intensity', 'typical_context', 'description'].includes(k)
                            )
                          )
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : Array.isArray(value) ? (
            // Old format - direct array
            <div className="space-y-2">
              <p className="text-sm text-gray-600 font-medium">
                {value.length} item{value.length !== 1 ? 's' : ''} (old format)
              </p>
              <ul className="space-y-2">
                {value.map((item: any, idx: number) => (
                  <li key={idx} className="pl-4 border-l-2 border-gray-300">
                    <code className="text-sm text-gray-700">
                      {typeof item === 'string' ? item : JSON.stringify(item, null, 2)}
                    </code>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              <pre className="bg-gray-50 p-3 rounded overflow-x-auto text-xs">
                {JSON.stringify(value, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
