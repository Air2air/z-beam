// app/components/ComparisonTable/ComparisonTable.tsx
'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Wrench, FileText, Info, Zap } from 'lucide-react';

export interface ComparisonMethod {
  method: string;
  description: string;
  key_differences: string;
  all_up_cost_for_100_sq_ft_usd: string;
  all_up_cost_explanation: string;
  surface_damage: string;
  base_hourly_rate_usd: string;
  extra_setup_cleanup_factors: string;
  adjusted_hourly_rate_usd: string;
  notes: string;
  cleaning_rate_sq_ft_per_hr: string;
  cleaning_rate_explanation: string;
  cost_per_sq_ft_usd: string;
  cost_per_sq_ft_explanation: string;
  avg_rate_explanation: string;
  initial_setup_cost_usd: string;
  consumables_cost_per_hour_usd: string;
}

export interface ComparisonTableProps {
  title?: string;
  subtitle?: string;
  methods: ComparisonMethod[];
  highlightMethod?: string; // Method name to highlight (e.g., "Laser Cleaning")
}

// Helper function to determine surface damage color
function getSurfaceDamageColor(damage: string): { bg: string; border: string; text: string } {
  const damageText = damage.toLowerCase();
  
  if (damageText.includes('minimal') || damageText.includes('none') || damageText.startsWith('low')) {
    return { 
      bg: 'bg-green-900/20', 
      border: 'border-l-2 border-green-500',
      text: 'text-green-400'
    };
  }
  
  if (damageText.includes('moderate')) {
    return { 
      bg: 'bg-yellow-900/20', 
      border: 'border-l-2 border-yellow-500',
      text: 'text-yellow-400'
    };
  }
  
  if (damageText.includes('high')) {
    return { 
      bg: 'bg-red-900/20', 
      border: 'border-l-2 border-red-500',
      text: 'text-red-400'
    };
  }
  
  return { bg: '', border: '', text: 'text-gray-300' };
}

// Helper function to determine cost color based on adjusted rate
function getCostColor(rate: string): string {
  // Extract the first number from the rate string
  const match = rate.match(/\$(\d+)/);
  if (!match) return 'text-gray-300';
  
  const startingRate = parseInt(match[1]);
  
  if (startingRate < 200) {
    return 'text-green-400';
  } else if (startingRate >= 200 && startingRate < 400) {
    return 'text-yellow-400';
  } else {
    return 'text-red-400';
  }
}

// Helper function to extract low price from range (e.g., "$120–$256" -> "$120")
function extractLowPrice(priceRange: string): string {
  const match = priceRange.match(/\$(\d+)/);
  return match ? `$${match[1]}` : priceRange;
}

// Helper function to extract high price from range (e.g., "$120–$256" -> "$256")
function extractHighPrice(priceRange: string): string {
  const matches = priceRange.match(/\$(\d+)/g);
  if (matches && matches.length >= 2) {
    return matches[matches.length - 1];
  }
  return matches ? matches[0] : priceRange;
}

// Unified color scaling function for all metrics
// Works for both higher/lower is better scenarios
function getRelativeValueColor(value: number, allValues: number[], higherIsBetter: boolean = false): React.CSSProperties {
  if (allValues.length === 0) return { backgroundColor: 'rgb(75, 85, 99)', color: '#ffffff' };
  
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min;
  
  if (range === 0) return { backgroundColor: 'rgb(249, 115, 22)', color: '#000000' };
  
  let position = (value - min) / range;
  
  // Invert position if higher is better (so high values get green, low values get red)
  if (higherIsBetter) {
    position = 1 - position;
  }
  
  let hue: number;
  let saturation = 75;
  let lightness = 60 - (position * 15);
  
  if (position <= 0.5) {
    hue = 120 - (position * 2 * 90);
  } else {
    hue = 30 - ((position - 0.5) * 2 * 30);
  }
  
  const textColor = lightness > 52 ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.85)';
  
  return { 
    backgroundColor: `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`,
    color: textColor
  };
}

// Helper function to determine setup/cleanup complexity color
function getSetupComplexityColor(factors: string): string {
  const factorsText = factors.toLowerCase();
  
  if (factorsText.includes('low impact') || factorsText.includes('low:') || factorsText.includes('10%') || factorsText.includes('10–15%')) {
    return 'text-green-400';
  }
  
  if (factorsText.includes('moderate') || factorsText.includes('20–30%') || factorsText.includes('15–35%') || factorsText.includes('30–40%')) {
    return 'text-yellow-400';
  }
  
  if (factorsText.includes('amplified') || factorsText.includes('40–60%')) {
    return 'text-red-400';
  }
  
  return 'text-gray-300';
}

// Helper function to get row background tint based on damage level
function getRowTint(damage: string): string {
  const damageText = damage.toLowerCase();
  
  if (damageText.includes('minimal') || damageText.includes('none') || damageText.startsWith('low')) {
    return 'bg-green-900/5';
  }
  
  if (damageText.includes('moderate')) {
    return 'bg-yellow-900/5';
  }
  
  if (damageText.includes('high')) {
    return 'bg-red-900/5';
  }
  
  return '';
}

// Helper function to get damage badge with circular dot styling
function getDamageBadge(damage: string): { text: string; dotColor: string; label: string } {
  const damageText = damage.toLowerCase();
  
  if (damageText.includes('minimal') || damageText.startsWith('low')) {
    return { text: damage, dotColor: 'bg-green-600', label: 'Low' };
  }
  
  if (damageText.includes('none')) {
    return { text: damage, dotColor: 'bg-blue-600', label: 'None' };
  }
  
  if (damageText.includes('moderate')) {
    return { text: damage, dotColor: 'bg-orange-500', label: 'Med' };
  }
  
  // High damage or default
  return { text: damage, dotColor: 'bg-red-600', label: 'High' };
}

// Helper function to convert damage badge to inline styles with dynamic text color
function getDamageBadgeStyle(dotColor: string): React.CSSProperties {
  let backgroundColor: string;
  let lightness: number;
  
  switch (dotColor) {
    case 'bg-blue-600':
      backgroundColor = 'rgba(37, 99, 235, 0.8)'; // blue-600
      lightness = 45; // Darker
      break;
    case 'bg-green-600':
      backgroundColor = 'rgba(22, 163, 74, 0.8)'; // green-600
      lightness = 48; // Darker
      break;
    case 'bg-orange-500':
      backgroundColor = 'rgba(249, 115, 22, 0.8)'; // orange-500
      lightness = 55; // Lighter
      break;
    case 'bg-red-600':
      backgroundColor = 'rgba(220, 38, 38, 0.8)'; // red-600
      lightness = 45; // Darker
      break;
    default:
      backgroundColor = 'rgba(75, 85, 99, 0.8)'; // gray-600
      lightness = 45;
  }
  
  // Use same text color logic: black for lighter backgrounds (lightness > 52%), white for darker
  const textColor = lightness > 52 ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.85)';
  
  return {
    backgroundColor,
    color: textColor
  };
  
  if (damageText.includes('high')) {
    return { text: damage, dotColor: 'bg-red-600', label: 'High' };
  }
  
  return { text: damage, dotColor: 'bg-gray-600', label: 'N/A' };
}

// Helper function to calculate average from range string (e.g., "50 - 150" -> 100)
function calculateAverage(rangeStr: string): string {
  const match = rangeStr.match(/([\d.]+)\s*-\s*([\d.]+)/);
  if (match) {
    const low = parseFloat(match[1]);
    const high = parseFloat(match[2]);
    const avg = (low + high) / 2;
    return Math.round(avg).toString();
  }
  return rangeStr;
}

// Helper function to calculate average cost (e.g., "$0.52–$8.16" -> "$4.34")
function calculateAverageCost(costStr: string): string {
  const match = costStr.match(/\$([\d.]+)[–-]\$([\d.]+)/);
  if (match) {
    const low = parseFloat(match[1]);
    const high = parseFloat(match[2]);
    const avg = (low + high) / 2;
    return `$${avg.toFixed(2)}`;
  }
  return costStr;
}

// Reusable circle badge component
interface CircleBadgeProps {
  value: string | number;
  style?: React.CSSProperties;
  title?: string;
  label?: string;
}

function CircleBadge({ value, style, title, label }: CircleBadgeProps) {
  return (
    <div className="flex flex-col items-center">
      <div 
        className="w-12 h-12 flex items-center justify-center text-sm font-bold rounded-full shadow-lg"
        style={style}
        title={title}
      >
        {value}
      </div>
      {label && <div className="text-sm text-gray-500 mt-1">{label}</div>}
    </div>
  );
}

export function ComparisonTable({ 
  title,
  subtitle,
  methods,
  highlightMethod = "Laser Cleaning"
}: ComparisonTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };
  
  // Extract all low and high prices for relative color coding (as numbers)
  const allLowPrices = methods.map(m => {
    const match = extractLowPrice(m.base_hourly_rate_usd).match(/\$(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }).filter(v => v > 0);
  
  const allHighPrices = methods.map(m => {
    const match = extractHighPrice(m.adjusted_hourly_rate_usd).match(/\$(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }).filter(v => v > 0);
  
  // Extract all-up costs for relative color coding (lower is better)
  const allAllUpCosts = methods.map(m => {
    const match = m.all_up_cost_for_100_sq_ft_usd.match(/\$(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }).filter(v => v > 0);
  
  // Extract cleaning rates for relative color coding (higher is better)
  const allCleaningRates = methods.map(m => {
    const avg = calculateAverage(m.cleaning_rate_sq_ft_per_hr);
    return parseInt(avg);
  }).filter(v => v > 0);
  
  // Extract cost per sq ft for relative color coding (lower is better)
  const allCostPerSqFt = methods.map(m => {
    const avg = calculateAverageCost(m.cost_per_sq_ft_usd);
    const match = avg.match(/\$([\.\d]+)/);
    return match ? parseFloat(match[1]) : 0;
  }).filter(v => v > 0);
  
  return (
    <div className="w-full my-8">
      {/* Header */}
      {title && (
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
          {subtitle && (
            <p className="text-gray-400 text-lg">{subtitle}</p>
          )}
        </div>
      )}

      {/* Responsive Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Column Headers: Method Name, Total Costs, Surface Impact, Efficiency, Hourly Rates, Details Toggle */}
          <thead>
            <tr className="bg-gray-800">
              {/* Column 1: Cleaning Method Name */}
              <th className="px-4 py-3 text-left text-base font-medium text-gray-300 border-b border-gray-700 uppercase">
                Method
              </th>
              {/* Column 2: All-Up Cost Summary (for 100 sq ft) */}
              <th className="px-4 py-3 text-center text-base font-medium text-gray-300 border-b border-gray-700 uppercase">
                $/100 sq ft
              </th>
              {/* Column 3: Surface Damage Assessment */}
              <th className="px-4 py-3 text-center text-base font-medium text-gray-300 border-b border-gray-700 uppercase">
                surface impact
              </th>
              {/* Column 4: Cleaning Rate */}
              <th className="px-4 py-3 text-center text-base font-medium text-gray-300 border-b border-gray-700 uppercase">
                sq ft/hr
              </th>
              {/* Column 5: Cost per Square Foot */}
              <th className="px-4 py-3 text-center text-base font-medium text-gray-300 border-b border-gray-700 uppercase">
                $/sq ft
              </th>
              {/* Column 6: Average Hourly Rate */}
              <th className="px-4 py-3 text-center text-base font-medium text-gray-300 border-b border-gray-700 uppercase">
                Avg. Rate
              </th>
              {/* Column 7: Expand/Collapse Control */}
              <th className="px-4 py-3 text-center text-base font-medium text-gray-300 border-b border-gray-700 w-24 uppercase">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {methods.map((method, index) => {
              const isHighlighted = method.method === highlightMethod;
              const damageBadge = getDamageBadge(method.surface_damage);
              const costColor = getCostColor(method.adjusted_hourly_rate_usd);
              const setupColor = getSetupComplexityColor(method.extra_setup_cleanup_factors);
              const isExpanded = expandedRows.has(index);
              
              // Calculate individual colors for each metric
              const allUpCostValue = parseInt(method.all_up_cost_for_100_sq_ft_usd.match(/\$(\d+)/)?.[1] || '0');
              const allUpCostColor = getRelativeValueColor(allUpCostValue, allAllUpCosts, false);
              
              const cleaningRateValue = parseInt(calculateAverage(method.cleaning_rate_sq_ft_per_hr));
              const cleaningRateColor = getRelativeValueColor(cleaningRateValue, allCleaningRates, true);
              
              const costPerSqFtValue = parseFloat(calculateAverageCost(method.cost_per_sq_ft_usd).match(/\$([\.\d]+)/)?.[1] || '0');
              const costPerSqFtColor = getRelativeValueColor(costPerSqFtValue, allCostPerSqFt, false);
              
              const lowPriceValue = parseInt(extractLowPrice(method.base_hourly_rate_usd).match(/\$(\d+)/)?.[1] || '0');
              const lowPriceColor = getRelativeValueColor(lowPriceValue, allLowPrices, false);
              
              const highPriceValue = parseInt(extractHighPrice(method.adjusted_hourly_rate_usd).match(/\$(\d+)/)?.[1] || '0');
              const highPriceColor = getRelativeValueColor(highPriceValue, allHighPrices, false);
              
              return (
                <React.Fragment key={index}>
                  {/* Single Row: Stacked Primary Metrics + Supporting Details */}
                  <tr
                    onClick={() => toggleRow(index)}
                    className={`transition-colors cursor-pointer hover:bg-gray-800/40 ${
                      method.method !== 'Laser Cleaning' ? 'border-b-2 border-gray-700' : ''
                    } ${
                      isHighlighted ? 'border-l-4 border-orange-500' : ''
                    } ${index % 2 === 0 ? 'bg-gray-800/50' : 'bg-gray-900/50'}`}
                  >
                    {/* Cell: Method Name */}
                    <td className="px-4 py-4 text-base font-medium align-top">
                      <span className={isHighlighted ? 'text-orange-400 font-semibold' : 'text-white'}>
                        {method.method}
                      </span>
                    </td>
                    
                    {/* Cell: All-Up Cost Badge */}
                    <td className="px-4 py-3 text-center align-top">
                      <CircleBadge 
                        value={method.all_up_cost_for_100_sq_ft_usd}
                        style={allUpCostColor}
                        title="All-up cost for 100 sq ft"
                      />
                    </td>
                    
                    {/* Cell: Surface Damage Badge */}
                    <td className="px-4 py-3 align-top">
                      <div className="flex justify-center">
                        <CircleBadge
                          value={damageBadge.label.toUpperCase()}
                          style={getDamageBadgeStyle(damageBadge.dotColor)}
                          title={damageBadge.text}
                        />
                      </div>
                    </td>
                    
                    {/* Cell: Cleaning Rate */}
                    <td className="px-4 py-3 text-center align-top">
                      <CircleBadge
                        value={calculateAverage(method.cleaning_rate_sq_ft_per_hr)}
                        style={cleaningRateColor}
                        title={`${calculateAverage(method.cleaning_rate_sq_ft_per_hr)} sq ft/hr`}
                      />
                    </td>
                    
                    {/* Cell: Cost per Square Foot */}
                    <td className="px-4 py-3 text-center align-top">
                      <CircleBadge
                        value={calculateAverageCost(method.cost_per_sq_ft_usd)}
                        style={costPerSqFtColor}
                        title={`${calculateAverageCost(method.cost_per_sq_ft_usd)}/sq ft`}
                      />
                    </td>
                    
                    {/* Cell: Average Hourly Rate */}
                    <td className="px-4 py-3 align-top">
                      <div className="flex justify-center">
                        <CircleBadge
                          value={`$${Math.round((lowPriceValue + highPriceValue) / 2)}`}
                          style={getRelativeValueColor(Math.round((lowPriceValue + highPriceValue) / 2), allLowPrices.map((low, i) => Math.round((low + allHighPrices[i]) / 2)), false)}
                          title={`Average: $${Math.round((lowPriceValue + highPriceValue) / 2)}/hr`}
                        />
                      </div>
                    </td>
                    
                    {/* Cell: Expand/Collapse Toggle */}
                    <td className="px-4 py-4 text-center align-middle">
                      <div className="inline-flex items-center justify-center text-gray-300">
                        {isExpanded ? (
                          <ChevronUp className="w-6 h-6" />
                        ) : (
                          <ChevronDown className="w-6 h-6" />
                        )}
                      </div>
                    </td>
                  </tr>
                  
                  {/* Expandable Section: Detailed Method Information with Metric Comparisons */}
                  {isExpanded && (
                    <tr className="bg-gray-800/30">
                      <td colSpan={7} className="px-6 py-6 border-b-2 border-gray-700">
                        <div className="max-w-5xl animate-fadeIn space-y-4">
                          {/* Key Differences - No Title */}
                          <div className="text-base text-white leading-relaxed">
                            {method.key_differences}
                          </div>
                          
                          {/* Metric Comparisons with Colored Dots - Single Column */}
                          <div className="space-y-4 mt-6">
                            {/* All-Up Cost */}
                            <div className="flex gap-3">
                              <div className="flex-shrink-0">
                                <CircleBadge
                                  value={allUpCostValue.toString()}
                                  style={allUpCostColor}
                                  title={method.all_up_cost_for_100_sq_ft_usd}
                                />
                              </div>
                              <div className="flex-1">
                                <dt className="text-base font-semibold text-gray-400 uppercase mb-1">$/100 sq ft</dt>
                                <dd className="text-base text-white leading-relaxed">
                                  {method.all_up_cost_explanation}
                                </dd>
                              </div>
                            </div>
                            
                            {/* Surface Impact */}
                            <div className="flex gap-3">
                              <div className="flex-shrink-0">
                                <CircleBadge
                                  value={damageBadge.label.toUpperCase()}
                                  style={getDamageBadgeStyle(damageBadge.dotColor)}
                                  title={damageBadge.text}
                                />
                              </div>
                              <div className="flex-1">
                                <dt className="text-base font-semibold text-gray-400 uppercase mb-1">Surface Impact</dt>
                                <dd className="text-base text-white leading-relaxed">
                                  {method.surface_damage}
                                </dd>
                              </div>
                            </div>
                            
                            {/* Cleaning Rate */}
                            <div className="flex gap-3">
                              <div className="flex-shrink-0">
                                <CircleBadge
                                  value={calculateAverage(method.cleaning_rate_sq_ft_per_hr)}
                                  style={cleaningRateColor}
                                  title={`${calculateAverage(method.cleaning_rate_sq_ft_per_hr)} sq ft/hr`}
                                />
                              </div>
                              <div className="flex-1">
                                <dt className="text-base font-semibold text-gray-400 uppercase mb-1">Cleaning Rate</dt>
                                <dd className="text-base text-white leading-relaxed">
                                  {method.cleaning_rate_explanation}
                                </dd>
                              </div>
                            </div>
                            
                            {/* Cost per Square Foot */}
                            <div className="flex gap-3">
                              <div className="flex-shrink-0">
                                <CircleBadge
                                  value={calculateAverageCost(method.cost_per_sq_ft_usd)}
                                  style={costPerSqFtColor}
                                  title={`${calculateAverageCost(method.cost_per_sq_ft_usd)}/sq ft`}
                                />
                              </div>
                              <div className="flex-1">
                                <dt className="text-base font-semibold text-gray-400 uppercase mb-1">Cost per Sq Ft</dt>
                                <dd className="text-base text-white leading-relaxed">
                                  {method.cost_per_sq_ft_explanation}
                                </dd>
                              </div>
                            </div>
                            
                            {/* Average Hourly Rate */}
                            <div className="flex gap-3">
                              <div className="flex-shrink-0">
                                <CircleBadge
                                  value={`$${Math.round((lowPriceValue + highPriceValue) / 2)}`}
                                  style={getRelativeValueColor(Math.round((lowPriceValue + highPriceValue) / 2), allLowPrices.concat(allHighPrices), false)}
                                  title={`Average: $${Math.round((lowPriceValue + highPriceValue) / 2)}/hr`}
                                />
                              </div>
                              <div className="flex-1">
                                <dt className="text-base font-semibold text-gray-400 uppercase mb-1">Avg. Rate</dt>
                                <dd className="text-base text-white leading-relaxed">
                                  {method.avg_rate_explanation}
                                </dd>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>


    </div>
  );
}
