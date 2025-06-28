///app/articles/layout.tsx

export const metadata = {
  title: "Articles",
  description: "Explore my articles and insights.",
};

export default function ArticlesRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
