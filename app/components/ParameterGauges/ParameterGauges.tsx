// app/components/ParameterGauges/ParameterGauges.tsx
'use client';

import React from 'react';

interface GaugeData {
  name: string;
  value: number;
  min: number;
  max: number;
  optimal_min: number;
  optimal_max: number;
  unit: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
}

interface ParameterGaugesProps {
  parameters: GaugeData[];
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

/**
 * Circular gauge visualization showing parameter safety zones
 * Green zone = optimal range, Yellow = caution, Red = danger
 */
export const ParameterGauges: React.FC<ParameterGaugesProps> = ({ 
  parameters,
  columns = { mobile: 2, tablet: 3, desktop: 4 }
}) => {
  const gridCols = {
    mobile: `grid-cols-${columns.mobile || 2}`,
    tablet: `md:grid-cols-${columns.tablet || 3}`,
    desktop: `lg:grid-cols-${columns.desktop || 4}`,
  };

  return (
    <div className={`grid ${gridCols.mobile} ${gridCols.tablet} ${gridCols.desktop} gap-4`}>
      {parameters.map((param, index) => (
        <ParameterGauge key={index} {...param} />
      ))}
    </div>
  );
};

const ParameterGauge: React.FC<GaugeData> = ({
  name,
  value,
  min,
  max,
  optimal_min,
  optimal_max,
  unit,
  criticality,
}) => {
  // Calculate percentages
  const range = max - min;
  const valuePercent = ((value - min) / range) * 100;
  const optimalStartPercent = ((optimal_min - min) / range) * 100;
  const optimalEndPercent = ((optimal_max - min) / range) * 100;

  // Determine safety status
  const isInOptimalRange = value >= optimal_min && value <= optimal_max;
  const isNearMin = value < optimal_min && value >= min + range * 0.1;
  const isNearMax = value > optimal_max && value <= max - range * 0.1;
  const isDanger = value < min + range * 0.1 || value > max - range * 0.1;

  const statusColor = isDanger
    ? 'text-red-400'
    : isInOptimalRange
    ? 'text-green-400'
    : 'text-yellow-400';

  const statusText = isDanger
    ? 'DANGER'
    : isInOptimalRange
    ? 'OPTIMAL'
    : 'CAUTION';

  const criticalityColors = {
    critical: 'border-red-500/50',
    high: 'border-orange-500/50',
    medium: 'border-yellow-500/50',
    low: 'border-blue-500/50',
  };

  // SVG gauge parameters
  const size = 120;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Arc for optimal range (120 degrees centered at top)
  const startAngle = 150; // Start at 150 degrees
  const endAngle = 390; // End at 390 degrees (240 degree arc)
  const totalDegrees = endAngle - startAngle;

  const valueAngle = startAngle + (valuePercent / 100) * totalDegrees;
  const optimalStartAngle = startAngle + (optimalStartPercent / 100) * totalDegrees;
  const optimalEndAngle = startAngle + (optimalEndPercent / 100) * totalDegrees;

  const polarToCartesian = (angle: number, r: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: center + r * Math.cos(rad),
      y: center + r * Math.sin(rad),
    };
  };

  const describeArc = (startAngle: number, endAngle: number, radius: number) => {
    const start = polarToCartesian(startAngle, radius);
    const end = polarToCartesian(endAngle, radius);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  // Needle position
  const needleEnd = polarToCartesian(valueAngle, radius - 5);

  return (
    <div className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 border ${criticalityColors[criticality]}`}>
      {/* Header */}
      <div className="text-center mb-2">
        <h3 className="text-sm font-semibold text-white truncate" title={name}>
          {name}
        </h3>
        <div className={`text-xs font-bold ${statusColor} uppercase tracking-wider`}>
          {statusText}
        </div>
      </div>

      {/* SVG Gauge */}
      <div className="flex justify-center">
        <svg width={size} height={size * 0.75} viewBox={`0 0 ${size} ${size * 0.75}`}>
          {/* Background arc (full range) */}
          <path
            d={describeArc(startAngle, endAngle, radius)}
            fill="none"
            stroke="#374151"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Danger zones (red) */}
          <path
            d={describeArc(startAngle, optimalStartAngle, radius)}
            fill="none"
            stroke="#DC2626"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d={describeArc(optimalEndAngle, endAngle, radius)}
            fill="none"
            stroke="#DC2626"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Caution zones (yellow) */}
          <path
            d={describeArc(
              optimalStartAngle - totalDegrees * 0.05,
              optimalStartAngle,
              radius
            )}
            fill="none"
            stroke="#FBBF24"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d={describeArc(
              optimalEndAngle,
              optimalEndAngle + totalDegrees * 0.05,
              radius
            )}
            fill="none"
            stroke="#FBBF24"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Optimal range (green) */}
          <path
            d={describeArc(optimalStartAngle, optimalEndAngle, radius)}
            fill="none"
            stroke="#10B981"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Center dot */}
          <circle cx={center} cy={center} r={3} fill="#9CA3AF" />

          {/* Needle */}
          <line
            x1={center}
            y1={center}
            x2={needleEnd.x}
            y2={needleEnd.y}
            stroke={isDanger ? '#EF4444' : isInOptimalRange ? '#10B981' : '#FBBF24'}
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* Needle tip */}
          <circle
            cx={needleEnd.x}
            cy={needleEnd.y}
            r={4}
            fill={isDanger ? '#EF4444' : isInOptimalRange ? '#10B981' : '#FBBF24'}
            className={isDanger ? 'animate-pulse' : ''}
          />
        </svg>
      </div>

      {/* Value display */}
      <div className="text-center mt-2">
        <div className={`text-xl font-bold ${statusColor}`}>
          {value}
          <span className="text-sm ml-1 text-gray-400">{unit}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Range: {min}-{max} {unit}
        </div>
        <div className="text-xs text-green-400 font-medium">
          Optimal: {optimal_min}-{optimal_max}
        </div>
      </div>

      {/* Criticality indicator */}
      <div className="mt-2 text-center">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            criticality === 'critical'
              ? 'bg-red-900/30 text-red-300'
              : criticality === 'high'
              ? 'bg-orange-900/30 text-orange-300'
              : criticality === 'medium'
              ? 'bg-yellow-900/30 text-yellow-300'
              : 'bg-blue-900/30 text-blue-300'
          }`}
        >
          {criticality === 'critical' && '🔴'}
          {criticality === 'high' && '🟠'}
          {criticality === 'medium' && '🟡'}
          {criticality === 'low' && '🔵'}
          <span className="ml-1 capitalize">{criticality} Priority</span>
        </span>
      </div>
    </div>
  );
};
