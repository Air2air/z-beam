// app/pages/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { PageProps } from '../../../types';

export default function Page({ params }: PageProps) {
  // TODO: Implement pages functionality
  return notFound();
}