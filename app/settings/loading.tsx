// app/settings/loading.tsx
// Loading state for settings listing page

import CardGridSkeleton from '@/app/components/CardGrid/CardGridSkeleton';

export default function SettingsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <CardGridSkeleton count={9} showTitle={true} titleText="Settings" />
    </div>
  );
}
