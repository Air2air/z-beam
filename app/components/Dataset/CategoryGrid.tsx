// app/components/Dataset/CategoryGrid.tsx
// Server Component - no client-side interactivity

import React from 'react';
import Link from 'next/link';
import { 
  PackageIcon, 
  FileIcon, 
  LayersIcon, 
  ZapIcon,
  InfoIcon
} from '@/app/components/Buttons';
import { capitalizeWords } from '@/app/utils/formatting';
import type { CategoryGridProps } from '@/types/centralized';

const categoryIcons: Record<string, any> = {
  metal: PackageIcon,
  wood: FileIcon,
  stone: LayersIcon,
  glass: FileIcon,
  composite: LayersIcon,
  ceramic: LayersIcon,
  plastic: PackageIcon,
  masonry: InfoIcon,
  'rare-earth': ZapIcon,
  semiconductor: InfoIcon
};

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  metal: { bg: 'bg-slate-900/50', text: 'text-slate-400', border: '' },
  wood: { bg: 'bg-amber-50', text: 'text-amber-400', border: 'border-amber-700' },
  stone: { bg: 'bg-tertiary', text: 'text-muted', border: '' },
  glass: { bg: 'bg-cyan-50', text: 'text-cyan-400', border: 'border-cyan-700' },
  composite: { bg: 'bg-purple-900/50', text: 'text-purple-400', border: 'border-purple-700' },
  ceramic: { bg: 'bg-orange-900/50', text: 'text-orange-400', border: 'border-orange-700' },
  plastic: { bg: 'bg-green-50', text: 'text-green-400', border: 'border-green-700' },
  masonry: { bg: 'bg-red-900/50', text: 'text-red-400', border: 'border-red-700' },
  'rare-earth': { bg: 'bg-violet-900/50', text: 'text-violet-400', border: 'border-violet-700' },
  semiconductor: { bg: 'bg-blue-50', text: 'text-blue-400', border: 'border-blue-700' }
};

export default function CategoryGrid({ categoryStats, materials }: CategoryGridProps) {
  const categories = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]);

  const formatCategoryName = (category: string) => {
    return capitalizeWords(category.replace(/-/g, ' '));
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {categories.map(([category, count]) => {
        const Icon = categoryIcons[category] || PackageIcon;
        const colors = categoryColors[category] || categoryColors.metal;
        
        return (
          <Link
            key={category}
            href={`/materials/${category}`}
            className={`${colors.bg} ${colors.border} border rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 group`}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`${colors.text} p-3 rounded-lg bg-black/20 group-hover:scale-110 transition-transform`}>
                <Icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-semibold text-secondary mb-1">
                  {formatCategoryName(category)}
                </h3>
                <p className={`text-sm ${colors.text}`}>
                  {count} material{count !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
