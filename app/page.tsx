// app/page.tsx
// This is the Page Component for your application's root route (`/`).
// It contains the specific content and structure for your homepage.

import { ArticlePosts } from 'app/components/articleList'; // Import your component to display recent articles
import type { Metadata } from 'next'; // Import Metadata type for type safety

// --- Page-Specific Metadata ---
// This metadata applies only to the homepage and will merge with/override
// any conflicting properties defined in the root layout's metadata.
export const metadata: Metadata = {
  title: 'Home | Z-Beam', // Specific title for the homepage
  description: 'Welcome to Z-Beam\'s portfolio showcasing projects and articles on web development, Vim, and more.', // Specific description for the homepage
};

// --- Homepage Component ---
// This component renders the unique content for the landing page.
// It does not concern itself with global elements like the Navbar or Footer,
// as those are handled by the `app/layout.tsx`.
export default function HomePage() {
  return (
    <section>
      {/* Homepage H1: Direct Tailwind classes are appropriate here */}
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Z-Beam
      </h1>
      <p className="mb-4">
        {`I'm a Vim enthusiast and tab advocate, finding unmatched efficiency in
        Vim's keystroke commands and tabs' flexibility for personal viewing
        preferences. This extends to my support for static typing, where its
        early error detection ensures cleaner code, and my preference for dark
        mode, which eases long coding sessions by reducing eye strain.`}
      </p>
      <div className="my-8">
        <ArticlePosts />
      </div>
    </section>
  );
}