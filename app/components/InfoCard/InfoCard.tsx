// app/components/InfoCard/InfoCard.tsx
// Reusable information card for non-risk safety data (PPE, ventilation, etc.)

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface InfoCardProps {
  icon: LucideIcon;
  title: string;
  data: Array<{ label: string; value: string | number }>;
  className?: string;
}

/**
 * InfoCard - Standardized card component for displaying safety information
 * 
 * Features:
 * - Consistent styling with RiskCard components
 * - Icon + title header
 * - Multiple data fields with label/value pairs
 * - Designed to integrate seamlessly into unified safety grids
 * - Supports PPE, ventilation, and particulate generation data
 * 
 * @see docs/specs/SAFETY_RISK_SEVERITY_SCHEMA.md
 * 
 * @example
 * <InfoCard 
 *   icon={Shield} 
 *   title="PPE Requirements" 
 *   data={[
 *     { label: 'Respiratory Protection', value: 'P100 Respirator' },
 *     { label: 'Eye Protection', value: 'Safety Goggles' },
 *     { label: 'Skin Protection', value: 'Leather Gloves' }
 *   ]}
 * />
 */
export function InfoCard({ icon: Icon, title, data, className = '' }: InfoCardProps) {
  return (
    <div className={`bg-gray-800/50 rounded-md border border-gray-700 p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5 text-blue-400" aria-hidden="true" />
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={i}>
            <div className="text-xs text-gray-400">{item.label}</div>
            <div className="text-white text-base font-medium">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InfoCard;
