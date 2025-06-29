// app/page.tsx
import { MaterialList } from 'app/components/MaterialList';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home | Z-Beam',
  description: 'Welcome to Z-Beam\'s portfolio showcasing projects and materials on web development, Vim, and more.',
};

export default function HomePage() {
  return (
    // Removed <section> here; the RootLayout provides the <main> tag.
    <>
      {/* Conformed H1: Used a larger, consistent page-level heading style */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Z-Beam
      </h1>
      <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
        {`I'm a Vim enthusiast and tab advocate, finding unmatched efficiency in
        Vim's keystroke commands and tabs' flexibility for personal viewing
        preferences. This extends to my support for static typing, where its
        early error detection ensures cleaner code, and my preference for dark
        mode, which eases long coding sessions by reducing eye strain.`}
      </p>
      <div className="my-8">
        {/* MaterialList might contain its own headings/structure, which is fine */}
        <MaterialList />
      </div>
    </>
  );
}