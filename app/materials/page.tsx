// app/materials/page.tsx
import { MaterialList } from '../components/MaterialList'; // Make sure this path is correct

export default function MaterialsIndexPage() {
  return (
    // Removed <main> and container classes; RootLayout handles the main wrapper and global padding
    <>
      {/* Conformed H1: Used a consistent page-level heading style */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
        All Materials
      </h1>
      <MaterialList />
    </>
  );
}

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'All Materials - Z-Beam',
  description: 'Browse all materials from Z-Beam on laser cleaning, materials, and technology.',
};