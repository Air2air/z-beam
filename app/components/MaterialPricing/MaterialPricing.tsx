import { SITE_CONFIG } from '@/app/config/site';

interface MaterialPricingProps {
  materialName: string;
  materialSlug: string;
}

export function MaterialPricing({ materialName, materialSlug }: MaterialPricingProps) {
  const { professionalCleaning, equipmentRental } = SITE_CONFIG.pricing;
  
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 my-12 border border-gray-200">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        {materialName} Laser Cleaning Services
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Professional Service Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Professional Service
              </h3>
              <p className="text-sm text-gray-600">
                Expert technicians, on-site service
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                ${professionalCleaning.hourlyRate}
              </div>
              <div className="text-sm text-gray-500">
                per {professionalCleaning.unit}
              </div>
            </div>
          </div>
          
          <ul className="space-y-2 mb-6 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Experienced technicians
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              All equipment provided
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Guaranteed results
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Safety compliance included
            </li>
          </ul>
          
          <a
            href="/contact"
            className="block w-full text-center bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Request Professional Service
          </a>
        </div>
        
        {/* Equipment Rental Card */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Equipment Rental
              </h3>
              <p className="text-sm text-gray-600">
                Self-service with training & support
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                ${equipmentRental.hourlyRate}
              </div>
              <div className="text-sm text-gray-500">
                per {equipmentRental.unit}
              </div>
            </div>
          </div>
          
          <ul className="space-y-2 mb-6 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Professional-grade equipment
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Training & safety gear included
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Technical support available
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              Flexible rental periods
            </li>
          </ul>
          
          <a
            href="/rental"
            className="block w-full text-center bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Rent Equipment
          </a>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Not sure which option is right for you?{' '}
          <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
            Contact us for a free consultation
          </a>
        </p>
      </div>
    </div>
  );
}
