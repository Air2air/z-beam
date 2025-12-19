/**
 * @component HazardousFumesTable
 * @purpose Display hazardous fumes generated during laser removal with exposure limits
 * @dependencies lucide-react icons
 */
'use client';

interface FumeData {
  compound: string;
  concentration_mg_m3: number;
  exposure_limit_mg_m3: number;
  hazard_class: string;
}

interface HazardousFumesTableProps {
  fumesGenerated: FumeData[];
  className?: string;
}

export function HazardousFumesTable({ fumesGenerated, className = '' }: HazardousFumesTableProps) {
  if (!fumesGenerated || fumesGenerated.length === 0) return null;

  return (
    <div className={`bg-gray-800 rounded-lg overflow-hidden ${className}`}>
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
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {fumesGenerated.map((fume, i) => {
              const exceedsLimit = fume.concentration_mg_m3 > fume.exposure_limit_mg_m3;
              return (
                <tr key={i} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 text-sm font-medium text-white">{fume.compound}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{fume.concentration_mg_m3} mg/m³</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{fume.exposure_limit_mg_m3} mg/m³</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      fume.hazard_class === 'carcinogenic' ? 'bg-red-900/30 text-red-300' :
                      fume.hazard_class === 'toxic' ? 'bg-orange-900/30 text-orange-300' :
                      'bg-yellow-900/30 text-yellow-300'
                    }`}>
                      {fume.hazard_class}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    {exceedsLimit ? (
                      <span className="px-3 py-1 bg-red-900/30 text-red-300 rounded-full text-xs font-semibold">
                        ⚠️ Exceeds Limit
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-green-900/30 text-green-300 rounded-full text-xs font-semibold">
                        ✓ Within Limit
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HazardousFumesTable;
