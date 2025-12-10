/**
 * @component ScheduleCardImage
 * @purpose Custom image for Schedule Consultation card with gradient background and Zoom logo
 */
import React from 'react';

export function ScheduleCardImage() {
  return (
    <div className="relative w-full h-full min-h-[200px] bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 flex items-center justify-center">
      {/* Zoom Logo SVG */}
      <svg 
        className="w-32 h-32 opacity-90"
        viewBox="0 0 120 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Zoom Camera Icon */}
        <g filter="url(#shadow)">
          {/* Main camera body */}
          <rect 
            x="20" 
            y="35" 
            width="70" 
            height="50" 
            rx="8" 
            fill="white"
            opacity="0.95"
          />
          
          {/* Lens */}
          <circle 
            cx="55" 
            cy="60" 
            r="18" 
            fill="#2D8CFF"
            opacity="0.9"
          />
          
          {/* Inner lens highlight */}
          <circle 
            cx="55" 
            cy="60" 
            r="12" 
            fill="white"
            opacity="0.3"
          />
          
          {/* Camera viewfinder */}
          <rect 
            x="90" 
            y="45" 
            width="15" 
            height="30" 
            rx="3" 
            fill="white"
            opacity="0.95"
          />
          
          {/* Recording indicator */}
          <circle 
            cx="97.5" 
            cy="42" 
            r="3" 
            fill="#FF3B30"
          />
        </g>
        
        {/* Shadow filter definition */}
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
      
      {/* Optional subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />
    </div>
  );
}
