import { SITE_CONFIG, GRID_GAP_RESPONSIVE } from '@/app/config/site';

type PricingVariant = 'simple' | 'detailed';

interface PricingProps {
  materialName?: string;
  materialSlug?: string;
  variant?: PricingVariant;
}

/**
 * Pricing component - equipment rental pricing card
 * Supports two variants:
 * - 'simple': Basic card without additional details
 * - 'detailed': Card with feature list (used for material-specific pages)
 */
export function Pricing({ 
  materialName = '', 
  variant = 'simple' 
}: PricingProps) {
  const { equipmentRental } = SITE_CONFIG.pricing;
  const isDetailed = variant === 'detailed';
  
  const features = [
    'Professional-grade equipment',
    'Delivered to your location',
    'Training & safety gear included',
    '24/7 technical support',
    'Flexible rental periods',
    '2-hour minimum rental',
  ];

  const PricingCard = ({ 
    title, 
    description, 
    price, 
    unit, 
    href, 
    ctaText, 
    color 
  }: {
    title: string;
    description: string;
    price: number;
    unit: string;
    href: string;
    ctaText: string;
    color: string;
    featureList?: string[];
  }) => (
    <div className={isDetailed ? 
      'bg-white rounded-md p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow' :
      'card-background rounded-md p-6 shadow-md border card-enhanced-hover transition-all duration-300 ease-out'
    }>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className={isDetailed ? 
            'text-lg font-semibold text-gray-900 mb-1' :
            'text-lg font-semibold text-gray-700 mb-1'
          }>
            {title}
          </h3>
          <p className={isDetailed ? 
            'text-sm text-gray-600' :
            'text-sm text-gray-500'
          }>
            {description}
          </p>
        </div>
        <div className="text-right">
          {!isDetailed && <div className="text-xs text-gray-400 mb-1">Starting at</div>}
          <div className={`text-3xl font-bold ${color}`}>
            ${price}
          </div>
          <div className={isDetailed ? 
            'text-sm text-gray-500' :
            'text-sm text-gray-400'
          }>
            per {unit}
          </div>
        </div>
      </div>
      
      {isDetailed && (
        <ul className="space-y-2 mb-6 text-sm text-gray-700">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              {feature}
            </li>
          ))}
        </ul>
      )}
      
      <a
        href={href}
        className={`block w-full text-center py-3 rounded-md font-medium transition-colors ${color.replace('text-', 'bg-').replace('-600', '-600 text-white hover:').replace('-700', '-700')}`}
      >
        {ctaText}
      </a>
    </div>
  );

  const containerClass = isDetailed ? 
    'bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 my-12 border border-gray-200' :
    'my-12 max-w-2xl mx-auto';

  return (
    <div className={containerClass}>
      {isDetailed && materialName && (
        <h2 className="text-2xl font-bold mb-6 text-gray-900 w-full">
          {materialName} Laser Cleaning Equipment Rental
        </h2>
      )}
      
      <PricingCard
        title="Equipment Rental"
        description={`Delivered to your location • ${equipmentRental.minimumHours || 2}-hour minimum`}
        price={typeof equipmentRental.hourlyRate === 'object' ? equipmentRental.hourlyRate.standard : equipmentRental.hourlyRate}
        unit={equipmentRental.unit}
        href="/rental"
        ctaText="Request Equipment Rental"
        color="text-green-600"
      />
      
      {isDetailed && (
        <div className="mt-6 text-center w-full">
          <p className="text-sm text-gray-600">
            Questions about equipment rental?{' '}
            <a href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact us for details and availability
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
