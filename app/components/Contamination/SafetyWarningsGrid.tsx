/**
 * @component SafetyWarningsGrid
 * @purpose Display color-coded safety warnings for contamination patterns
 * @extends Badge, SectionContainer, SectionTitle, SafetyWarning components
 */
'use client';

import { SectionContainer } from '../SectionContainer/SectionContainer';
import { SectionTitle } from '../SectionTitle/SectionTitle';
import { SafetyWarning } from '../SafetyWarning';
import { Badge } from '../Badge/Badge';

interface Warning {
  severity: 'critical' | 'high' | 'moderate';
  icon: string;
  message: string;
  ppe_required?: string;
  mitigation?: string;
  best_practice?: string;
}

interface Fume {
  compound: string;
  concentration: string;
  exposure_limit: string;
  hazard_class: string;
  exceeds_limit: boolean;
}

interface SafetyData {
  overall_hazard_level: string;
  critical_warnings: Warning[];
  high_priority_warnings: Warning[];
  moderate_warnings: Warning[];
  hazardous_fumes: Fume[];
}

interface SafetyWarningsGridProps {
  safetyData: SafetyData;
  materialName: string;
  warningText: string;
}

export function SafetyWarningsGrid({ safetyData, materialName, warningText }: SafetyWarningsGridProps) {
  return (
    <SectionContainer variant="default" className="py-12">
      <div className="container-custom px-4">
        <SectionTitle 
          title="Safety Information"
          subtitle="Critical Warnings & Hazardous Fumes"
          alignment="left"
          className="mb-8"
        />
        
        {/* Critical Warnings using color-coded cards */}
        <div className="space-y-4 mb-8">
          {safetyData.critical_warnings.map((warning, i) => (
            <div key={i} className="bg-red-900/20 border border-red-500 rounded-md p-4">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{warning.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="danger" size="sm">CRITICAL</Badge>
                    <h3 className="text-lg font-semibold text-red-300">{warning.message}</h3>
                  </div>
                  {warning.ppe_required && (
                    <p className="text-red-200 text-sm">
                      <strong>Required PPE:</strong> {warning.ppe_required}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {safetyData.high_priority_warnings.map((warning, i) => (
            <div key={i} className="bg-orange-900/20 border border-orange-500 rounded-md p-4">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{warning.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="warning" size="sm">HIGH</Badge>
                    <h3 className="text-lg font-semibold text-orange-300">{warning.message}</h3>
                  </div>
                  {warning.mitigation && (
                    <p className="text-orange-200 text-sm">
                      <strong>Mitigation:</strong> {warning.mitigation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {safetyData.moderate_warnings.map((warning, i) => (
            <div key={i} className="bg-yellow-900/20 border border-yellow-500 rounded-md p-4">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{warning.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="warning" size="sm">MODERATE</Badge>
                    <h3 className="text-lg font-semibold text-yellow-300">{warning.message}</h3>
                  </div>
                  {warning.best_practice && (
                    <p className="text-yellow-200 text-sm">
                      <strong>Best Practice:</strong> {warning.best_practice}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Hazardous Fumes Table */}
        <div className="bg-gray-800 rounded-md overflow-hidden mb-8">
          <div className="px-6 py-4 bg-gray-700 border-b border-gray-600">
            <h3 className="text-lg font-semibold text-white">Hazardous Fumes Generated</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Compound</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Concentration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Exposure Limit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Hazard Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {safetyData.hazardous_fumes.map((fume, i) => (
                  <tr key={i} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-sm font-medium text-white">{fume.compound}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{fume.concentration}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{fume.exposure_limit}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{fume.hazard_class}</td>
                    <td className="px-6 py-4 text-sm">
                      {fume.exceeds_limit ? (
                        <Badge variant="danger" size="sm">Exceeds Limit</Badge>
                      ) : (
                        <Badge variant="success" size="sm">Within Limit</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* SafetyWarning component */}
        <SafetyWarning 
          materialName={materialName}
          warningText={warningText}
        />
      </div>
    </SectionContainer>
  );
}
