// app/(materials)/page.tsx

import { MaterialList } from '../components/MaterialList'; 

export default function MaterialsIndexPage() {
  return (
    <main className="container mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 text-center">
        All Materials
      </h1>
      <MaterialList />
    </main>
  );
}

// Optional: Add metadata for this page
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Materials - Z-Beam', // Adjust your site name
  description: 'Browse all materials from Z-Beam on laser cleaning, materials, and technology.',
};