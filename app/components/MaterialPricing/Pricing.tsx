// Re-export the consolidated Pricing component with 'detailed' variant as default
import { Pricing as BasePricing } from '@/app/components/Pricing/Pricing';

interface PricingProps {
  materialName: string;
  materialSlug?: string;
}

export function Pricing({ materialName, materialSlug }: PricingProps) {
  return <BasePricing materialName={materialName} materialSlug={materialSlug} variant="detailed" />;
}
