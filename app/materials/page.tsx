// app/materials/page.tsx
import { redirect } from 'next/navigation';

export default function MaterialsIndexPage() {
  // Redirect from the old /materials route to the new /articles route
  redirect('/articles');
  return null;
}
