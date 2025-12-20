// app/components/RiskCard/RiskCard.tsx
// Reusable risk/severity card with icon, label, and color-coded styling

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { getRiskColor } from '@/app/utils/layoutHelpers';

export interface RiskCardProps {
  icon: LucideIcon;
  label: string;
  severity: string;  // critical | high | moderate | medium | low | none
  className?: string;
}

/**
 * RiskCard - Standardized card component for displaying risk levels
 * 
 * Features:
 * - Color-coded borders and backgrounds based on severity
 * - Supports schema-defined levels: critical, high, moderate, medium, low, none
 * - Icon + label + severity display
 * - Consistent styling across SafetyOverview and SafetyDataPanel
 * 
 * @see docs/specs/SAFETY_RISK_SEVERITY_SCHEMA.md
 * 
 * @example
 * <RiskCard 
 *   icon={Flame} 
 *   label="Fire/Explosion Risk" 
 *   severity="moderate"
 * />
 */
export function RiskCard({ icon: Icon, label, severity, className = '' }: RiskCardProps) {
  return (
    <div className={`rounded-md border p-4 ${getRiskColor(severity)} ${className}`}>
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-6 h-6" aria-hidden="true" />
        <div>
          <div className="text-sm text-gray-400">{label}</div>
          <div className="text-xl font-semibold capitalize">{severity}</div>
        </div>
      </div>
    </div>
  );
}

export default RiskCard;
