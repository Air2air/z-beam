// app/components/Dataset/CategoryGrid.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FiBox, 
  FiFeather, 
  FiHexagon, 
  FiSquare,
  FiLayers,
  FiGrid,
  FiPackage,
  FiZap,
  FiCircle
} from 'react-icons/fi';
import type { CategoryGridProps } from '@/types/centralized';

const categoryIcons: Record<string, any> = {
  metal: FiBox,
  wood: FiFeather,
  stone: FiHexagon,
  glass: FiSquare,
  composite: FiLayers,
  ceramic: FiGrid,
  plastic: FiPackage,
  masonry: FiCircle,
  'rare-earth': FiZap,
  semiconductor: FiCircle
};

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  metal: { bg: 'bg-slate-50 dark:bg-slate-900/50', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700' },
  wood: { bg: 'bg-amber-50 dark:bg-amber-900/50', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-700' },
  stone: { bg: 'bg-gray-50 dark:bg-gray-900/50', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-700' },
  glass: { bg: 'bg-cyan-50 dark:bg-cyan-900/50', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-700' },
  composite: { bg: 'bg-purple-50 dark:bg-purple-900/50', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-700' },
  ceramic: { bg: 'bg-orange-50 dark:bg-orange-900/50', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-700' },
  plastic: { bg: 'bg-green-50 dark:bg-green-900/50', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-700' },
  masonry: { bg: 'bg-red-50 dark:bg-red-900/50', text: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-700' },
  'rare-earth': { bg: 'bg-violet-50 dark:bg-violet-900/50', text: 'text-violet-600 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-700' },
  semiconductor: { bg: 'bg-blue-50 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-700' }
};

export default function CategoryGrid({ categoryStats, materials }: CategoryGridProps) {
  const categories = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]);

  const formatCategoryName = (category: string) => {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {categories.map(([category, count]) => {
        const Icon = categoryIcons[category] || FiBox;
        const colors = categoryColors[category] || categoryColors.metal;
        
        return (
          <Link
            key={category}
            href={`/materials/${category}`}
            className={`${colors.bg} ${colors.border} border rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 group`}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`${colors.text} p-3 rounded-lg bg-white/50 dark:bg-black/20 group-hover:scale-110 transition-transform`}>
                <Icon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
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
