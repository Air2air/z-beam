// app/(materials)/layout.tsx
import { Breadcrumbs } from 'app/components/breadcrumbs';

export const metadata = {
  title: 'Materials',
  description: 'Explore my materials and insights.',
};

export default function MaterialsRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // No extra divs or <main> here. This layout simply adds the Breadcrumbs
    // before its children, which will inherit the main wrapper from RootLayout.
    <>
      <Breadcrumbs />
      {children}
    </>
  );
}