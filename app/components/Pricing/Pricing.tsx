import { SITE_CONFIG } from '@/app/config/site';

interface PricingProps {
  materialName: string;
  materialSlug: string;
}

export function Pricing({ materialName: _materialName, materialSlug: _materialSlug }: PricingProps) {
  const { professionalCleaning, equipmentRental } = SITE_CONFIG.pricing;
  
  return (
    <div className="grid md:grid-cols-2 gap-6 my-12">
        {/* Professional Service Card */}
        <div className="card-background rounded-md p-6 shadow-md border card-enhanced-hover transition-all duration-300 ease-out">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">
                Professional Service
              </h3>
              <p className="text-sm text-gray-500">
                Expert technicians, on-site service
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-1">Starting at</div>
              <div className="text-3xl font-bold text-orange-600">
                ${professionalCleaning.hourlyRate}
              </div>
              <div className="text-sm text-gray-400">
                per {professionalCleaning.unit}
              </div>
            </div>
          </div>
          
          <a
            href="/contact"
            className="block w-full text-center bg-orange-600 text-white py-3 rounded-md font-medium hover:bg-orange-700 transition-colors"
          >
            Request Professional Service
          </a>
        </div>
        
        {/* Equipment Rental Card */}
        <div className="card-background rounded-md p-6 shadow-md border card-enhanced-hover transition-all duration-300 ease-out">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">
                Equipment Rental
              </h3>
              <p className="text-sm text-gray-500">
                Self-service with training & support
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-1">Starting at</div>
              <div className="text-3xl font-bold text-green-600">
                ${equipmentRental.hourlyRate}
              </div>
              <div className="text-sm text-gray-400">
                per {equipmentRental.unit}
              </div>
            </div>
          </div>
          
          <a
            href="/rental"
            className="block w-full text-center bg-green-600 text-white py-3 rounded-md font-medium hover:bg-green-700 transition-colors"
          >
            Rent Equipment
          </a>
        </div>
    </div>
  );
}
