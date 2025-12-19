// app/utils/domainLinkageMapper.ts
// Utility to transform domain_linkages data to CardGridSSR-compatible format

import type { GridItemSSR, BadgeData } from '@/types';
import type { DomainLinkage, DomainType } from '@/types/domain-linkages';

/**
 * Transform domain linkage object to GridItemSSR format
 */
export function linkageToGridItem(linkage: DomainLinkage, domain: DomainType): GridItemSSR {
  return {
    slug: linkage.id,
    title: linkage.title,
    name: linkage.title,
    href: linkage.url,
    imageUrl: linkage.image,
    imageAlt: `${linkage.title} - ${domain}`,
    category: linkage.category || 'general',
    badge: buildBadgeFromDomainFields(linkage, domain),
    metadata: {
      domain,
      ...linkage,
    },
  };
}

/**
 * Build badge data from domain-specific fields
 */
function buildBadgeFromDomainFields(linkage: DomainLinkage, domain: DomainType): BadgeData | undefined {
  switch (domain) {
    case 'materials': {
      const materialLinkage = linkage as any;
      if (materialLinkage.frequency || materialLinkage.severity) {
        return {
          text: materialLinkage.frequency 
            ? formatFrequency(materialLinkage.frequency)
            : materialLinkage.severity 
              ? formatSeverity(materialLinkage.severity)
              : undefined,
          variant: getSeverityVariant(materialLinkage.severity),
          description: `${materialLinkage.frequency || ''} ${materialLinkage.severity || ''}`.trim(),
        };
      }
      break;
    }

    case 'contaminants': {
      const contaminantLinkage = linkage as any;
      if (contaminantLinkage.severity || contaminantLinkage.frequency) {
        return {
          text: contaminantLinkage.severity 
            ? formatSeverity(contaminantLinkage.severity)
            : contaminantLinkage.frequency
              ? formatFrequency(contaminantLinkage.frequency)
              : undefined,
          variant: getSeverityVariant(contaminantLinkage.severity),
          description: linkage.category || undefined,
        };
      }
      break;
    }

    case 'compounds': {
      const compoundLinkage = linkage as any;
      if (compoundLinkage.hazard_level) {
        return {
          text: formatSeverity(compoundLinkage.hazard_level),
          variant: getSeverityVariant(compoundLinkage.hazard_level),
          description: compoundLinkage.phase || undefined,
        };
      }
      break;
    }

    case 'settings': {
      const settingsLinkage = linkage as any;
      if (settingsLinkage.applicability || settingsLinkage.frequency) {
        return {
          text: settingsLinkage.applicability 
            ? formatApplicability(settingsLinkage.applicability)
            : settingsLinkage.frequency
              ? formatFrequency(settingsLinkage.frequency)
              : undefined,
          variant: 'primary',
          description: settingsLinkage.laser_type || undefined,
        };
      }
      break;
    }

    case 'regulatory': {
      const regulatoryLinkage = linkage as any;
      return {
        text: 'Required',
        variant: 'default',
        description: regulatoryLinkage.applicability || undefined,
      };
    }

    case 'ppe': {
      const ppeLinkage = linkage as any;
      return {
        text: ppeLinkage.required ? 'Required' : 'Recommended',
        variant: ppeLinkage.required ? 'danger' : 'warning',
        description: ppeLinkage.reason || undefined,
      };
    }

    default:
      return undefined;
  }

  return undefined;
}

/**
 * Format frequency values for display
 */
function formatFrequency(frequency: string): string {
  const map: Record<string, string> = {
    very_high: 'Very Common',
    high: 'Common',
    common: 'Common',
    moderate: 'Moderate',
    low: 'Rare',
    rare: 'Very Rare',
  };
  return map[frequency] || frequency;
}

/**
 * Format severity values for display
 */
function formatSeverity(severity: string): string {
  const map: Record<string, string> = {
    low: 'Low',
    moderate: 'Moderate',
    high: 'High',
    severe: 'Severe',
  };
  return map[severity] || severity;
}

/**
 * Format applicability values for display
 */
function formatApplicability(applicability: string): string {
  const map: Record<string, string> = {
    very_high: 'Ideal',
    high: 'Good',
    moderate: 'Suitable',
    low: 'Limited',
  };
  return map[applicability] || applicability;
}

/**
 * Get badge variant based on severity
 */
function getSeverityVariant(severity?: string): 'default' | 'primary' | 'success' | 'warning' | 'danger' {
  switch (severity) {
    case 'low':
      return 'success';
    case 'moderate':
      return 'warning';
    case 'high':
    case 'severe':
      return 'danger';
    default:
      return 'default';
  }
}

/**
 * Transform array of linkages to GridItemSSR array
 */
export function linkagesToGridItems(
  linkages: DomainLinkage[],
  domain: DomainType
): GridItemSSR[] {
  return linkages.map(linkage => linkageToGridItem(linkage, domain));
}
