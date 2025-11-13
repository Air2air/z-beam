import React from 'react';

interface IconProps {
  icon: 'package' | 'alert-triangle' | 'check-circle' | 'x-circle' | 'info' | 'settings' | 'wrench' | 'zap' | 'flame' | 'shield' |
        'file' | 'data' | 'document' | 'warning' | 'success' | 'error' | 'help' | 'config' | 'tool' | 'power' | 'fire' | 'security' | 'database';
  color?: string;
  bgColor?: string;
  showBackground?: boolean;
  className?: string;
}

// Semantic icon mapping - maps semantic names to actual icon implementations
const semanticIconMap: Record<string, string> = {
  'file': 'package',
  'data': 'package',
  'document': 'package',
  'warning': 'alert-triangle',
  'success': 'check-circle',
  'error': 'x-circle',
  'help': 'info',
  'config': 'settings',
  'tool': 'wrench',
  'power': 'zap',
  'fire': 'flame',
  'security': 'shield',
};

const iconPaths: Record<string, JSX.Element> = {
  package: (
    <>
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </>
  ),
  'alert-triangle': (
    <>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  ),
  'check-circle': (
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </>
  ),
  'x-circle': (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6m8.66-15.66l-4.24 4.24m-8.48 0L3.34 3.34m17.32 17.32l-4.24-4.24m-8.48 0l-4.24 4.24" />
    </>
  ),
  wrench: (
    <>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </>
  ),
  zap: (
    <>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </>
  ),
  flame: (
    <>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </>
  ),
};

const iconSize = 'w-4 h-4';
const containerSize = 'w-5 h-5';

export default function Icon({ 
  icon, 
  color = 'text-white', 
  bgColor = 'bg-blue-600',
  showBackground = true,
  className = ''
}: IconProps) {
  // Map semantic names to actual icon names
  const actualIcon = semanticIconMap[icon] || icon;
  const iconSvg = iconPaths[actualIcon];

  if (!iconSvg) {
    console.warn(`Icon "${icon}" (mapped to "${actualIcon}") not found`);
    return null;
  }

  const svgElement = (
    <svg
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${iconSize} ${color}`}
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
    >
      {iconSvg}
    </svg>
  );

  if (!showBackground) {
    return <div className={className}>{svgElement}</div>;
  }

  return (
    <div className={`${containerSize} ${bgColor} rounded-lg flex items-center justify-center ${className}`}>
      {svgElement}
    </div>
  );
}
