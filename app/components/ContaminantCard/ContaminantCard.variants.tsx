/**
 * @file ContaminantCard Design Variants
 * @purpose Multiple design alternatives for contaminant card displays
 * @aiContext Reference designs for different visual approaches to category/context display
 */
"use client";

import Link from "next/link";
import { CardProps } from "@/types";
import { getCardVariant } from "@/app/config/card-variants";

export interface ContaminantCardProps extends Omit<CardProps, 'variant'> {
  showCategory?: boolean;
  showContext?: boolean;
  designVariant?: 'default' | 'stacked' | 'badge' | 'minimal' | 'split' | 'gradient' | 'icon-based';
}

// ================================
// VARIANT 1: DEFAULT (Two-Column)
// Clean side-by-side layout with labels and values
// ================================
export function ContaminantCardDefault({ frontmatter, href, className = "" }: ContaminantCardProps) {
  const config = getCardVariant('relationship');
  const category = frontmatter?.category?.replace(/_/g, ' ').replace(/-/g, ' ');
  const description = frontmatter?.description;
  
  return (
    <Link href={href} className={`group card-base ${config.cardHeight} ${className} ${config.hoverEffect}`}>
      <div className="relative w-full h-full bg-tertiary">
        <div className="absolute-inset flex flex-col justify-center p-4">
          <div className="space-y-3">
            {/* Category */}
            <div className="flex justify-between items-center border-b border-primary/10 pb-2">
              <span className="text-xs text-primary/70 font-medium uppercase tracking-wide">Category</span>
              <span className="text-sm text-primary font-semibold">{category}</span>
            </div>
            {/* Context */}
            <div className="flex justify-between items-start border-b border-primary/10 pb-2">
              <span className="text-xs text-primary/70 font-medium uppercase tracking-wide pr-3">Context</span>
              <span className="text-sm text-primary font-semibold text-right">{description}</span>
            </div>
          </div>
        </div>
        <div className={`${config.titleBarClass} ${config.padding}`}>
          <h3 className={config.titleClass}>{frontmatter?.subject || frontmatter?.title}</h3>
        </div>
      </div>
    </Link>
  );
}

// ================================
// VARIANT 2: STACKED (Vertical Layout)
// Clean vertical stacking with prominent labels
// ================================
export function ContaminantCardStacked({ frontmatter, href, className = "" }: ContaminantCardProps) {
  const config = getCardVariant('relationship');
  const category = (frontmatter?.category || '').replace(/_/g, ' ').replace(/-/g, ' ') || '';
  const description = frontmatter?.description || '';
  
  return (
    <Link href={href} className={`group card-base ${config.cardHeight} ${className} ${config.hoverEffect}`}>
      <div className="relative w-full h-full bg-tertiary">
        <div className="absolute-inset flex flex-col justify-center p-4 space-y-4">
          {/* Category Section */}
          <div className="space-y-1">
            <div className="text-xs text-primary/50 font-medium uppercase tracking-wider">Category</div>
            <div className="text-lg text-primary font-bold">{category}</div>
          </div>
          {/* Context Section */}
          <div className="space-y-1 border-t border-primary/10 pt-3">
            <div className="text-xs text-primary/50 font-medium uppercase tracking-wider">Context</div>
            <div className="text-xs text-primary/90 leading-relaxed">{description}</div>
          </div>
        </div>
        <div className={`${config.titleBarClass} ${config.padding}`}>
          <h3 className={config.titleClass}>{frontmatter?.subject || frontmatter?.title}</h3>
        </div>
      </div>
    </Link>
  );
}

// ================================
// VARIANT 3: BADGE STYLE
// Category as prominent badge, context as supporting text
// ================================
export function ContaminantCardBadge({ frontmatter, href, className = "" }: ContaminantCardProps) {
  const config = getCardVariant('relationship');
  const category = (frontmatter?.category || '').replace(/_/g, ' ').replace(/-/g, ' ') || '';
  const description = frontmatter?.description || '';
  
  return (
    <Link href={href} className={`group card-base ${config.cardHeight} ${className} ${config.hoverEffect}`}>
      <div className="relative w-full h-full bg-gradient-to-br from-tertiary to-secondary/80">
        <div className="absolute-inset flex flex-col justify-center items-center p-4 text-center space-y-4">
          {/* Category Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/20 border-2 border-primary/30">
            <span className="text-sm text-primary font-bold uppercase tracking-wide">{category}</span>
          </div>
          {/* Context Text */}
          <p className="text-xs text-primary/80 leading-relaxed px-2">{description}</p>
        </div>
        <div className={`${config.titleBarClass} ${config.padding}`}>
          <h3 className={config.titleClass}>{frontmatter?.subject || frontmatter?.title}</h3>
        </div>
      </div>
    </Link>
  );
}

// ================================
// VARIANT 4: MINIMAL (Text-Only)
// Simple, clean typography-focused design
// ================================
export function ContaminantCardMinimal({ frontmatter, href, className = "" }: ContaminantCardProps) {
  const config = getCardVariant('relationship');
  const category = (frontmatter?.category || '').replace(/_/g, ' ').replace(/-/g, ' ') || '';
  const description = frontmatter?.description || '';
  
  return (
    <Link href={href} className={`group card-base ${config.cardHeight} ${className} ${config.hoverEffect}`}>
      <div className="relative w-full h-full bg-tertiary">
        <div className="absolute-inset flex flex-col justify-center p-5 space-y-2">
          {/* Minimal layout */}
          <div className="text-2xl text-primary font-bold">{category}</div>
          <div className="text-xs text-primary/70 leading-relaxed">{description}</div>
        </div>
        <div className={`${config.titleBarClass} ${config.padding}`}>
          <h3 className={config.titleClass}>{frontmatter?.subject || frontmatter?.title}</h3>
        </div>
      </div>
    </Link>
  );
}

// ================================
// VARIANT 5: SPLIT DESIGN
// Card divided into two distinct sections
// ================================
export function ContaminantCardSplit({ frontmatter, href, className = "" }: ContaminantCardProps) {
  const config = getCardVariant('relationship');
  const category = (frontmatter?.category || '').replace(/_/g, ' ').replace(/-/g, ' ') || '';
  const description = frontmatter?.description || '';
  
  return (
    <Link href={href} className={`group card-base ${config.cardHeight} ${className} ${config.hoverEffect}`}>
      <div className="relative w-full h-full flex flex-col">
        {/* Top Section: Category */}
        <div className="flex-1 bg-secondary flex flex-col justify-center items-center p-3 border-b-2 border-primary/20">
          <div className="text-[10px] text-primary/50 uppercase tracking-widest mb-1">Category</div>
          <div className="text-base text-primary font-bold text-center">{category}</div>
        </div>
        {/* Bottom Section: Context */}
        <div className="flex-1 bg-tertiary flex flex-col justify-center p-3">
          <div className="text-[10px] text-primary/50 uppercase tracking-widest mb-1">Context</div>
          <div className="text-xs text-primary/90 leading-tight line-clamp-3">{description}</div>
        </div>
        <div className={`absolute bottom-0 left-0 right-0 bg-tertiary/95 ${config.padding}`}>
          <h3 className={`${config.titleClass} text-xs`}>{frontmatter?.subject || frontmatter?.title}</h3>
        </div>
      </div>
    </Link>
  );
}

// ================================
// VARIANT 6: GRADIENT OVERLAY
// Visual hierarchy with gradient backgrounds
// ================================
export function ContaminantCardGradient({ frontmatter, href, className = "" }: ContaminantCardProps) {
  const config = getCardVariant('relationship');
  const category = (frontmatter?.category || '').replace(/_/g, ' ').replace(/-/g, ' ') || '';
  const description = frontmatter?.description || '';
  
  return (
    <Link href={href} className={`group card-base ${config.cardHeight} ${className} ${config.hoverEffect}`}>
      <div className="relative w-full h-full bg-gradient-to-b from-secondary via-tertiary to-secondary">
        <div className="absolute-inset flex flex-col justify-center p-4">
          {/* Category with gradient background */}
          <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary/50">
            <div className="text-[10px] text-primary/60 uppercase tracking-wide mb-1">Category</div>
            <div className="text-sm text-primary font-bold">{category}</div>
          </div>
          {/* Context */}
          <div className="p-3 rounded-lg bg-gradient-to-r from-transparent to-primary/5">
            <div className="text-[10px] text-primary/60 uppercase tracking-wide mb-1">Context</div>
            <div className="text-xs text-primary/90 leading-relaxed">{description}</div>
          </div>
        </div>
        <div className={`${config.titleBarClass} ${config.padding}`}>
          <h3 className={config.titleClass}>{frontmatter?.subject || frontmatter?.title}</h3>
        </div>
      </div>
    </Link>
  );
}

// ================================
// VARIANT 7: ICON-BASED
// Visual icons representing category types
// ================================
export function ContaminantCardIconBased({ frontmatter, href, className = "" }: ContaminantCardProps) {
  const config = getCardVariant('relationship');
  const category = (frontmatter?.category || '').replace(/_/g, ' ').replace(/-/g, ' ') || '';
  const description = frontmatter?.description || '';
  
  // Simple icon placeholder based on category
  const getCategoryIcon = (cat: string) => {
    if (!cat) return '⚠️';
    const lower = cat.toLowerCase();
    if (lower.includes('organic')) return '🧪';
    if (lower.includes('metal')) return '⚙️';
    if (lower.includes('dust')) return '💨';
    if (lower.includes('chemical')) return '🔬';
    return '⚠️';
  };
  
  return (
    <Link href={href} className={`group card-base ${config.cardHeight} ${className} ${config.hoverEffect}`}>
      <div className="relative w-full h-full bg-tertiary">
        <div className="absolute-inset flex flex-col justify-center items-center p-4">
          {/* Large icon at top */}
          <div className="text-5xl mb-3 opacity-80 group-hover:scale-110 transition-transform">
            {getCategoryIcon(category)}
          </div>
          {/* Category name */}
          <div className="text-sm text-primary font-bold text-center mb-3">{category}</div>
          {/* Context as subtitle */}
          <div className="text-xs text-primary/70 text-center leading-relaxed line-clamp-2">
            {description}
          </div>
        </div>
        <div className={`${config.titleBarClass} ${config.padding}`}>
          <h3 className={config.titleClass}>{frontmatter?.subject || frontmatter?.title}</h3>
        </div>
      </div>
    </Link>
  );
}
