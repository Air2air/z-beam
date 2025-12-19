/**
 * @component TechnicalSpecsTable
 * @purpose Display machine settings for contamination removal
 * @extends SectionContainer, SectionTitle components
 * @similar MachineSettings component but simplified for contamination patterns
 */
'use client';

import { SectionContainer } from '../SectionContainer/SectionContainer';
import { SectionTitle } from '../SectionTitle/SectionTitle';

interface SettingValue {
  min: number;
  max: number;
  recommended: number;
  unit: string;
}

interface TechnicalSpecsTableProps {
  settings: Record<string, SettingValue>;
}

export function TechnicalSpecsTable({ settings }: TechnicalSpecsTableProps) {
  return (
    <SectionContainer variant="default" className="py-12">
      <div className="container-custom px-4">
        <SectionTitle 
          title="Technical Specifications"
          subtitle="Recommended machine settings for contamination removal"
          alignment="left"
          className="mb-8"
        />
        
        <div className="bg-gray-800 rounded-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Parameter</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-300">Minimum</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-300">Maximum</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-300">Recommended</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-300">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {Object.entries(settings).map(([key, value]) => (
                <tr key={key} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 text-sm font-medium text-white capitalize">
                    {key.replace(/_/g, ' ')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300 text-center">{value.min}</td>
                  <td className="px-6 py-4 text-sm text-gray-300 text-center">{value.max}</td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span className="bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full font-semibold">
                      {value.recommended}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400 text-center">{value.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionContainer>
  );
}
