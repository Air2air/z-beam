// app/articles/layout.tsx
import { Breadcrumbs } from 'app/components/breadcrumbs'; // Import the new component

export const metadata = {
  title: 'Articles',
  description: 'Explore my articles and insights.',
};

export default function ArticlesRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Breadcrumbs /> {/* Add the breadcrumbs here */}
      {children}
    </>
  );
}