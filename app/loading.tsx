// app/loading.tsx
// Root-level loading fallback for all routes

import { LoadingState } from '@/app/components/LoadingState';

export default function RootLoading() {
  return <LoadingState minHeightClass="min-h-screen" size="lg" />;
}
