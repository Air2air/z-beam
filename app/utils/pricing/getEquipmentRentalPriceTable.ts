import { EQUIPMENT_RENTAL_DISCOUNTS, getEquipmentRentalPackages } from '@/app/config/site';

type EquipmentRentalTierSku = 'ZB-EQUIP-RES' | 'ZB-EQUIP-IND';

interface PricingPeriodConfig {
  label: string;
  description: string;
  kind: 'block' | 'equivalent' | 'quote-equivalent';
  hours?: number;
  discountPercent?: number;
  appliedDiscountPercent?: number;
  bestFor: string;
}

interface EquipmentRentalTierMeta {
  title: string;
  audience: string;
}

export interface EquipmentRentalPriceTableRow {
  rentalPeriod: string;
  savings: string;
  description: string;
  residentialRate: string;
  commercialRate: string;
  callToActionHref?: string;
}

export interface EquipmentRentalPriceTable {
  columns: [string, string, string, string];
  rows: EquipmentRentalPriceTableRow[];
}

export interface EquipmentRentalPriceTableContent {
  title: string;
  lead: [string, string];
  tierSummaries: [string, string];
  table: EquipmentRentalPriceTable;
  notes: string[];
  closing: string;
}

const PRICE_TABLE_COLUMNS: [string, string, string, string] = [
  'Rental Period',
  'Savings',
  'Residential',
  'Commercial',
];

const PRICING_PERIODS: PricingPeriodConfig[] = [
  {
    label: 'Half-Day',
    description: 'Up to 4 hours',
    kind: 'block',
    hours: 4,
    discountPercent: EQUIPMENT_RENTAL_DISCOUNTS.discount_base,
    bestFor: 'Quick spot jobs, testing',
  },
  {
    label: 'Full-Day',
    description: 'Up to 8 hours',
    kind: 'block',
    hours: 8,
    discountPercent: EQUIPMENT_RENTAL_DISCOUNTS.discount_full_day,
    bestFor: 'Single-shift projects',
  },
  {
    label: 'Multi-Day',
    description: '2-4 days',
    kind: 'equivalent',
    discountPercent: EQUIPMENT_RENTAL_DISCOUNTS.discount_multi_day,
    bestFor: 'Phased facility or marine work',
  },
  {
    label: 'Weekend',
    description: '~3 days (Fri PM-Mon AM)',
    kind: 'block',
    hours: 24,
    appliedDiscountPercent: EQUIPMENT_RENTAL_DISCOUNTS.discount_weekend,
    bestFor: 'Weekend warriors, hull/marina jobs',
  },
  {
    label: 'Extended Rental',
    description: '5+ days (weekly rate)',
    kind: 'quote-equivalent',
    bestFor: 'Long-term facility maintenance',
  },
];

const TIER_METADATA: Record<EquipmentRentalTierSku, EquipmentRentalTierMeta> = {
  'ZB-EQUIP-RES': {
    title: 'Residential / Light-Duty',
    audience: 'homeowners, small projects',
  },
  'ZB-EQUIP-IND': {
    title: 'Commercial / Industrial',
    audience: 'facilities, marine, heavy-duty',
  },
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function formatSavings(config: PricingPeriodConfig): string {
  if (config.kind === 'quote-equivalent') {
    return 'Call';
  }

  const effectiveDiscount = config.appliedDiscountPercent ?? config.discountPercent ?? 0;

  if (!effectiveDiscount) {
    return 'N/A';
  }

  return `${effectiveDiscount}%`;
}

function formatRate(baseHourlyRate: number, config: PricingPeriodConfig): string {
  if (config.kind === 'equivalent') {
    const equivalentRate = baseHourlyRate * (1 - (config.discountPercent || 0) / 100);
    return `${formatCurrency(equivalentRate)}/hr`;
  }

  if (config.kind === 'quote-equivalent') {
    return 'Call';
  }

  const appliedDiscount = config.appliedDiscountPercent ?? config.discountPercent ?? 0;
  const hourlyRate = baseHourlyRate * (1 - appliedDiscount / 100);

  return `${formatCurrency(hourlyRate)}/hr`;
}

export function getEquipmentRentalPriceTable(): EquipmentRentalPriceTableContent {
  const packages = getEquipmentRentalPackages();
  const residentialPackage = packages.find((pkg) => pkg.sku === 'ZB-EQUIP-RES');
  const industrialPackage = packages.find((pkg) => pkg.sku === 'ZB-EQUIP-IND');

  if (!residentialPackage || !industrialPackage) {
    throw new Error('Equipment rental pricing table requires residential and industrial packages.');
  }

  const table: EquipmentRentalPriceTable = {
    columns: PRICE_TABLE_COLUMNS,
    rows: PRICING_PERIODS.map((period) => ({
      rentalPeriod: period.label,
      savings: formatSavings(period),
      description: period.description,
      residentialRate: formatRate(residentialPackage.hourlyRate, period),
      commercialRate: formatRate(industrialPackage.hourlyRate, period),
      ...(period.kind === 'quote-equivalent' ? { callToActionHref: '/contact' } : {}),
    })),
  };

  return {
    title: 'Laser Cleaning Machine Rental Rates',
    lead: [
      'Rent our high-power mobile laser system - precision cleaning without abrasives or chemicals.',
      'Rates based on calendar time out (no charge for non-operating hours). Usage tracked in 15-minute increments for any time beyond the agreed block, prorated at the tier\'s standard hourly rate.',
    ],
    tierSummaries: [
      `${TIER_METADATA['ZB-EQUIP-RES'].title} - ${formatCurrency(residentialPackage.hourlyRate)} per hour base (${TIER_METADATA['ZB-EQUIP-RES'].audience})`,
      `${TIER_METADATA['ZB-EQUIP-IND'].title} - ${formatCurrency(industrialPackage.hourlyRate)} per hour base (${TIER_METADATA['ZB-EQUIP-IND'].audience})`,
    ],
    table,
    notes: [
      'Weekend: Ideal for 3-day holds - pick up Friday afternoon, return Monday morning. Flat rate encourages full use.',
      'Overruns: Any time past the block is prorated in 15-minute increments at the tier\'s standard hourly rate (minimum 15 min). We document usage transparently.',
      'Includes: Basic training/handover, safety gear guidance. Media/consumables extra if needed.',
      'Delivery/pickup: Bay Area local (San Carlos base) - fees apply outside Peninsula.',
      'Book now or get a custom quote for your project scope.',
    ],
    closing: 'Questions? Hit us up - we\'re here to make your cleaning job easier.',
  };
}