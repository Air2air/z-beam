// app/components/Dataset/DatasetHero.tsx
'use client';

import React from 'react';
import { FiDatabase, FiLayers, FiDownload } from 'react-icons/fi';
import type { DatasetHeroProps } from '@/types/centralized';

export default function DatasetHero({ totalMaterials, categoryCount }: DatasetHeroProps) {
  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-5 lg:px-8">
          <div className="text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <FiDatabase className="w-4 h-4" />
            <span className="text-sm font-medium">Open Dataset</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Materials Database
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Comprehensive laser cleaning parameters for {totalMaterials}+ materials
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6">
              <div className="text-3xl md:text-4xl font-bold mb-1">{totalMaterials}</div>
              <div className="text-sm md:text-base text-blue-100">Materials</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6">
              <div className="text-3xl md:text-4xl font-bold mb-1">{categoryCount}</div>
              <div className="text-sm md:text-base text-blue-100">Categories</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6">
              <div className="text-3xl md:text-4xl font-bold mb-1">3</div>
              <div className="text-sm md:text-base text-blue-100">Formats</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6">
              <div className="text-3xl md:text-4xl font-bold mb-1">100%</div>
              <div className="text-sm md:text-base text-blue-100">Free</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#materials"
              className="inline-flex items-center space-x-2 bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg"
            >
              <FiLayers className="w-5 h-5" />
              <span>Browse Materials</span>
            </a>
            <a
              href="#bulk-downloads"
              className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              <FiDownload className="w-5 h-5" />
              <span>Bulk Download</span>
            </a>
          </div>

          {/* License Badge */}
          <div className="mt-8 inline-flex items-center space-x-2 text-sm text-blue-100">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
            </svg>
            <span>Licensed under CC BY 4.0 • Free to use with attribution</span>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
